import { memory, registersInt } from '$lib/riscv/state.svelte.js';

export class Pipeline {
    IF_ID = $state({
        IR: 0,
        PC: 0x80,
        NPC: 0,
    });

    ID_EX = $state({
        IR: 0,
        A: 0,
        B: 0,
        IMM: 0,
        NPC: 0
    });

    EX_MEM = $state({
        IR: 0,
        ALUOUT: 0,
        B: 0,
        COND: 0
    })

    MEM_WB = $state({
        IR: 0,
        LMD: 0,
        ALUOUT: 0,
        MEMORY: 0
    })

    WB = $state({
        IR: 0,
        REGISTER: 0
    })

    step() {
        // WB stage
        this.WB.IR = this.MEM_WB.IR;

        // MEM stage
        this.MEM_WB.IR = this.EX_MEM.IR;

        // EX stage
        this.EX_MEM.IR = this.ID_EX.IR;

        // ID stage
        this.ID_EX.IR = this.IF_ID.IR;
        this.ID_EX.NPC = this.IF_ID.PC; // Match NPC of IF/ID

        // IF stage
        this.IF_ID.IR = memory.readInteger(this.IF_ID.PC, 4);
        this.IF_ID.NPC = this.IF_ID.PC
        this.IF_ID.PC += 4; // TODO: Handle branch
    }
}

