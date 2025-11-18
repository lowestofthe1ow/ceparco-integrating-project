import { memory, registersInt } from '$lib/riscv/state.svelte.js';

export class Pipeline {
    PC = 0x80;

    IF_ID = {
        IR: 0,
        NPC: 0,
        PC: 0
    };

    ID_EX = {
        IR: 0,
        A: 0,
        B: 0,
        IMM: 0,
        NPC: 0
    };

    EX_MEM = {
        IR: 0,
        ALUOUT: 0,
        B: 0,
        COND: 0
    }

    MEM_WB = {
        IR: 0,
        LMD: 0,
        ALUOUT: 0,
        MEMORY: 0
    }

    WB {
        IR: 0,
        REGISTER: 0
    }

    step() {
        // IF stage
        this.IF_ID.IR = memory.readInteger(this.PC, 4);
        this.IF_ID.NPC = this.PC
        this.PC += 4; // TODO: Handle branch
    }
}

