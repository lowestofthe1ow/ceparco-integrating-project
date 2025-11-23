import { memory, registersInt, setRegValue, getRegValue } from '$lib/riscv/state.svelte.js';
import { IDInstruction, EXInstruction, MEMInstruction, WBInstruction, getDependencies, getRD, isBranch } from '$lib/riscv/instructions.js'


export const isMemory = (instruction) => {
    const b6_0 = instruction & 0b1111111
    return b6_0 == 0b0000011 || b6_0 == 0b100011
}

/**
 * Checks if any dependencies exist between a stage and a set of possible
 * staller stages e.g. checkDependencies(IF/ID, [ID/EX, EX/MEM]) will check if
 * IF/ID is depended on the outputs of the previous instructions currently in
 * ID/EX and EX/MEM
 */
const checkDependencies = (stalledStage, stallers) => {
    let foundStallingDependency = false

    for (const staller of stallers) {


        if (staller) {
            const staller_b6_0 = staller.IR & 0b1111111
            const stalled_b6_0 = stalledStage.IR & 0b1111111

            // TODO: Wow this is awful
            // Staller is SW, stalled is LW
            if (stalled_b6_0 == 0b0000011 && staller_b6_0 == 0b100011) {

                let staller_binaryRep = staller.IR.toString(2).padStart(32, '0')
                let staller_a = getRegValue(parseInt(staller_binaryRep.slice(12, 17), 2))
                let staller_imm = parseInt(staller_binaryRep.slice(0, 7) + staller_binaryRep.slice(20, 25), 2)

                let stalled_binaryRep = stalledStage.IR.toString(2).padStart(32, '0')
                let stalled_a = getRegValue(parseInt(stalled_binaryRep.slice(12, 17), 2))
                let stalled_imm = parseInt(stalled_binaryRep.slice(0, 12), 2)

                console.log("staller: " + (staller_a + staller_imm))
                console.log("stalled: " + (stalled_a + stalled_imm))

                if (staller_a + staller_imm == stalled_a + stalled_imm) {
                    console.log("Dependency found. Stalling execution...")
                    foundStallingDependency = true
                    break
                }
            } else {
                let dependencies = getDependencies(stalledStage.IR);
                if (dependencies.includes(getRD(staller.IR))) {
                    console.log("Dependency found. Stalling execution...")
                    foundStallingDependency = true
                    break
                }
            }




        }
    }

    stalledStage.stalled = foundStallingDependency
}



export class Pipeline {
    // Set up reactive states
    IF_ID = $state({});
    ID_EX = $state({});
    EX_MEM = $state({});
    MEM_WB = $state({});
    WB = $state({});
    cycle = $state(1);
    stageCycles = $state([{}]);
    cutOffBranch = false;
    rowCount = 0;

    addToCycleMap(stage, instruction) {
        const row = this.stageCycles.find(x => {
            return x.stage === stage && x.instruction === instruction;
        })

        if (row) {
            row.stage += 1
            row.cycles.push(this.cycle)

            console.log(row)
        }

    }

    constructor() {
        this.initialize();
    }

    initialize() {
        this.IF_ID = {
            IR: NaN,
            PC: 0x80,
            NPC: NaN,
            stalled: false
        };

        this.ID_EX = {
            IR: NaN,
            A: NaN,
            B: NaN,
            IMM: NaN,
            NPC: NaN,
            stalled: false
        };

        this.EX_MEM = {
            IR: NaN,
            ALUOUT: NaN,
            B: NaN,
            COND: NaN,
            stalled: false
        }

        this.MEM_WB = {
            IR: NaN,
            LMD: NaN,
            ALUOUT: NaN,
            MEMORY: NaN,
            stalled: false
        }

        this.WB = {
            IR: NaN,
            REGISTER: NaN,
            stalled: false
        }

        this.cycle = 1;

        this.stageCycles = [{}];
    }

    step() {
        if (this.cycle > 1 && isNaN(this.WB.IR) && isNaN(this.MEM_WB.IR) && isNaN(this.EX_MEM.IR) && isNaN(this.ID_EX.IR) && isNaN(this.IF_ID.IR)) {
            return false;
        }


        if (this.cutOffBranch) {
            this.IF_ID.IR = NaN
            this.ID_EX.IR = NaN
            this.cutOffBranch = false;
        }

        // If ID/EX.IR or EX/MEM.IR modifies an operand of IF/ID.IR, then stall
        // Otherwise, then that means all dependencies are at least at MEM/WB
        // ...which means IF/ID can stop stalling in the next cycle
        checkDependencies(this.IF_ID, [this.ID_EX, this.EX_MEM])

        // WB stage
        this.WB.IR = this.MEM_WB.IR;
        this.addToCycleMap(4, this.WB.IR);
        WBInstruction(this.WB.IR);

        // MEM stage
        this.MEM_WB.IR = this.EX_MEM.IR;
        this.addToCycleMap(3, this.MEM_WB.IR)
        MEMInstruction(this.MEM_WB.IR);

        if (isNaN(this.MEM_WB.IR)) {
            this.MEM_WB.LMD = NaN
            this.MEM_WB.ALUOUT = NaN
            this.MEM_WB.MEMORY = NaN
        }

        // EX stage
        this.EX_MEM.IR = this.ID_EX.IR;
        this.addToCycleMap(2, this.EX_MEM.IR)

        // Execute the instruction in the EX/MEM stage
        EXInstruction(this.EX_MEM.IR)

        if (isNaN(this.EX_MEM.IR)) {
            this.EX_MEM.ALUOUT = NaN
            this.EX_MEM.B = NaN
            this.EX_MEM.COND = NaN
        }

        // ID stage
        // We check here if stalled by any dependencies
        if (this.IF_ID.stalled) {
            this.ID_EX.IR = NaN
            this.ID_EX.A = NaN
            this.ID_EX.B = NaN
            this.ID_EX.IMM = NaN
            this.ID_EX.NPC = NaN
        } else {
            this.ID_EX.NPC = this.IF_ID.NPC; // Copy the NPC
            this.ID_EX.IR = this.IF_ID.IR;

            // Decode the instruction in the ID/EX stage
            IDInstruction(this.ID_EX.IR)

            if (isNaN(this.ID_EX.IR)) {
                this.ID_EX.A = NaN
                this.ID_EX.B = NaN
                this.ID_EX.IMM = NaN
                this.ID_EX.NPC = NaN
            }

            this.addToCycleMap(1, this.ID_EX.IR)

            // IF stage
            this.IF_ID.IR = memory.readInteger(this.IF_ID.PC, 4);

            if (this.IF_ID.IR == 0) {
                this.IF_ID.IR = NaN;
            }

            this.IF_ID.NPC = this.IF_ID.PC

            if (this.IF_ID.IR) {
                // For newly fetched instructions, make a new array for stages
                let newRow = {
                    stage: 0, // Start at IF
                    cycles: [],
                    instruction: this.IF_ID.IR
                }
                this.stageCycles.push(newRow)
            }

            // For pipeline #2, we check for branch in the IF stage
            if (isBranch(this.ID_EX.IR)) {
                // When a branch instruction is decoded, perform the jump
                EXInstruction(this.ID_EX.IR)
            } else {
                this.IF_ID.PC += 4; // TODO: Handle branch
            }


            this.addToCycleMap(0, this.IF_ID.IR)
        }

        if (this.cycle > 1 && isNaN(this.WB.IR) && isNaN(this.MEM_WB.IR) && isNaN(this.EX_MEM.IR) && isNaN(this.ID_EX.IR) && isNaN(this.IF_ID.IR)) {
            return true;
        }

        this.cycle += 1;

        return true;
    }
}

