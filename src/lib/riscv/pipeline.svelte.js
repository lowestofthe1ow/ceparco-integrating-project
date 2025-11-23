import { memory, registersInt } from '$lib/riscv/state.svelte.js';
import { EXInstruction, getDependencies, getRD, isBranch } from '$lib/riscv/instructions.js'

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
            console.log(dependencies)
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

        // MEM stage
        this.MEM_WB.IR = this.EX_MEM.IR;
        this.stageCycles[this.MEM_WB.IR]?.push(this.cycle)

        // EX stage
        this.EX_MEM.IR = this.ID_EX.IR;
        this.stageCycles[this.EX_MEM.IR]?.push(this.cycle)

        // ID stage
        if (this.IF_ID.stalled) {
            this.ID_EX.IR = NaN
        } else {
            this.ID_EX.IR = this.IF_ID.IR;
            this.stageCycles[this.ID_EX.IR]?.push(this.cycle)
            // this.ID_EX.NPC = this.IF_ID.PC;

            // IF stage
            this.IF_ID.IR = memory.readInteger(this.IF_ID.PC, 4);
            this.IF_ID.NPC = this.IF_ID.PC
            this.IF_ID.PC += 4; // TODO: Handle branch

            if (this.IF_ID.IR) {
                this.stageCycles[this.IF_ID.IR] = []}
            this.stageCycles[this.IF_ID.IR]?.push(this.cycle)
        }

        this.cycle += 1;
    }
}

