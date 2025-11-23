import { memory, registersInt, setRegValue, getRegValue } from '$lib/riscv/state.svelte.js';
import { IDInstruction, EXInstruction, MEMInstruction, WBInstruction, getDependencies, getRD, isBranch } from '$lib/riscv/instructions.js'

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
            let dependencies = getDependencies(stalledStage.IR);
            if (dependencies.includes(getRD(staller.IR))) {
                console.log("Dependency found. Stalling execution...")
                foundStallingDependency = true
                break
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
    stageCycles = $state({});

    constructor() {
        this.initialize();
    }

    initialize() {
        this.IF_ID = {
            IR: 0,
            PC: 0x80,
            NPC: 0,
            stalled: false
        };

        this.ID_EX = {
            IR: 0,
            A: 0,
            B: 0,
            IMM: 0,
            NPC: 0,
            stalled: false
        };

        this.EX_MEM = {
            IR: 0,
            ALUOUT: 0,
            B: 0,
            COND: 0,
            stalled: false
        }

        this.MEM_WB = {
            IR: 0,
            LMD: 0,
            ALUOUT: 0,
            MEMORY: 0,
            stalled: false
        }

        this.WB = {
            IR: 0,
            REGISTER: 0,
            stalled: false
        }

        this.cycle = 1;
    }

    step() {
        // If ID/EX.IR or EX/MEM.IR modifies an operand of IF/ID.IR, then stall
        // Otherwise, then that means all dependencies are at least at MEM/WB
        // ...which means IF/ID can stop stalling in the next cycle
        checkDependencies(this.IF_ID, [this.ID_EX, this.EX_MEM])

        // WB stage
        this.WB.IR = this.MEM_WB.IR;
        this.stageCycles[this.WB.IR]?.push(this.cycle)
        WBInstruction(this.WB.IR)

        // MEM stage
        this.MEM_WB.IR = this.EX_MEM.IR;
        this.stageCycles[this.MEM_WB.IR]?.push(this.cycle)
        MEMInstruction(this.MEM_WB.IR);

        // EX stage
        this.EX_MEM.IR = this.ID_EX.IR;
        this.stageCycles[this.EX_MEM.IR]?.push(this.cycle)

        // Execute the instruction in the EX/MEM stage
        EXInstruction(this.EX_MEM.IR)

        // ID stage
        // We check here if stalled by any dependencies
        if (this.IF_ID.stalled) {
            this.ID_EX.IR = NaN
        } else {
            this.ID_EX.NPC = this.IF_ID.NPC; // Copy the NPC
            this.ID_EX.IR = this.IF_ID.IR;

            // Decode the instruction in the ID/EX stage
            IDInstruction(this.ID_EX.IR)
            this.stageCycles[this.ID_EX.IR]?.push(this.cycle)

            // IF stage
            this.IF_ID.IR = memory.readInteger(this.IF_ID.PC, 4);
            this.IF_ID.NPC = this.IF_ID.PC

            // For pipeline #2, we check for branch in the IF stage
            if (isBranch(this.ID_EX.IR)) {
                // When a branch instruction is decoded, perform the jump
                EXInstruction(this.ID_EX.IR)
            } else {
                this.IF_ID.PC += 4; // TODO: Handle branch
            }

            if (this.IF_ID.IR) {
                // For newly fetched instructions, make a new array for stages
                this.stageCycles[this.IF_ID.IR] = []
            }
            this.stageCycles[this.IF_ID.IR]?.push(this.cycle)
        }

        this.cycle += 1;
    }
}

