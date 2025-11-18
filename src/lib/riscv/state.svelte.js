import { SvelteMap } from 'svelte/reactivity';
import { Memory } from '$lib/riscv/memory.svelte.js'
import { Pipeline } from '$lib/riscv/pipeline.svelte.js';

export const pipeline = new Pipeline();

/** Program counter */
export const programCounter = $state(0);

/** Loaded program */
export const program = $state({data: null});

/** 2^16 memory locations from 0x0000 to 0xFFFF */
export const memory = new Memory();

/** Integer registers x0-x31 */
export const registersInt = $state(new SvelteMap([
    ['zero', 0],
    ['ra', 0],
    ['sp', 0],
    ['gp', 0],
    ['tp', 0],
    ['t0', 0],

    // Temporaries
    ['t1', 0],
    ['t2', 0],

    ['s0', 0], // fp (?)
    ['s1', 0],

    // Function arguments / return values
    ['a0', 0],
    ['a1', 0],

    // Function arguments
    ['a2', 0],
    ['a3', 0],
    ['a4', 0],
    ['a5', 0],
    ['a6', 0],
    ['a7', 0],

    // Saved registers
    ['s2', 0],
    ['s3', 0],
    ['s4', 0],
    ['s5', 0],
    ['s6', 0],
    ['s7', 0],
    ['s8', 0],
    ['s9', 0],
    ['s10', 0],
    ['s11', 0],

    // Temporaries
    ['t3', 0],
    ['t4', 0],
    ['t5', 0],
    ['t6', 0],
]));
