/** 2^16 memory locations from 0x0000 to 0xFFFF */
export const memory = $state(new Array(65536));

/** Integer registers x0-x31 */
export const registersInt = $state(new Map([
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

/** Floating-point registers f0-f31 */
export const registersFloat = $state(new Map([
    // Temporaries
    ['ft0', 0],
    ['ft1', 0],
    ['ft2', 0],
    ['ft3', 0],
    ['ft4', 0],
    ['ft5', 0],
    ['ft6', 0],
    ['ft7', 0],

    // Saved registers
    ['fs0', 0],
    ['fs1', 0],

    // Function arguments / return values
    ['fa0', 0],
    ['fa1', 0],

    // Function arguments
    ['fa2', 0],
    ['fa3', 0],
    ['fa4', 0],
    ['fa5', 0],
    ['fa6', 0],
    ['fa7', 0],

    // Saved registers
    ['fs2', 0],
    ['fs3', 0],
    ['fs4', 0],
    ['fs5', 0],
    ['fs6', 0],
    ['fs7', 0],
    ['fs8', 0],
    ['fs9', 0],
    ['fs10', 0],
    ['fs11', 0],

    // Temporaries
    ['ft8', 0],
    ['ft9', 0],
    ['ft10', 0],
    ['ft11', 0],
]))
