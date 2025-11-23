import { lwExecute, lwDecode, lwMem, lwWB } from '$lib/riscv/instructions/lw.js'
import { swExecute } from '$lib/riscv/instructions/sw.js'
import { sltExecute, sltDecode } from '$lib/riscv/instructions/slt.js'
import { sllExecute, sllDecode } from '$lib/riscv/instructions/sll.js'
import { slliExecute, slliDecode } from '$lib/riscv/instructions/slli.js'
import { beqExecute, beqDecode } from '$lib/riscv/instructions/beq.js'
import { bltExecute, bltDecode } from '$lib/riscv/instructions/blt.js'

/* -----------------------------------------------------------------------------
We're assigned LW, SW, SLT, SLL, SLLI, BEQ, BLT
This is how we decode the instruction
We don't care about 31:25 because 14:12 and 6:0 are enough

Bits    31:25       14:12       6:0
LW                  010         0000011
SW                  010         0100011
SLT     0000000     010         0110011
SLL     0000000     001         0110011
SLLI    0000000     001         0010011
BEQ                 000         1100011
BLT                 100         1100011
----------------------------------------------------------------------------- */

export const pipeline2Branch = (instruction) => {
    const binaryRep = instruction.toString(2).padStart(32, '0')

    // Mask bits
    const b14_12 = (instruction >> 12) & 0b111
    const b6_0 = instruction & 0b1111111

    let imm = binaryRep[0] + binaryRep[24] + binaryRep.slice(1, 7) + binaryRep.slice(20, 24)

    imm = imm.padStart(32, imm[0])
    imm = parseInt(imm, 2)

    if (b14_12 == 0b000 && b6_0 == 0b1100011) {
        //beqDecode(instruction);
    } else if (b14_12 == 0b100 && b6_0 == 0b1100011) {
        //bltDecode(instruction);
    }
}


export const isBranch = (instruction) => {
    const b6_0 = instruction & 0b1111111
    return b6_0 == 0b1100011
}

export const getRD = (instruction) => {
    // Mask bits
    const b11_7 = (instruction >> 7) & 0b11111
    const b6_0 = instruction & 0b1111111

    // lmfao
    if (b6_0 == 0b0000011    // LW
     || b6_0 == 0b0110011    // SLT / SLL
     || b6_0 == 0b0010011) { // SLLI
        return b11_7
    } else {
        return null
    }
}

export const getDependencies = (instruction) => {
    // Mask bits
    const b24_20 = (instruction >> 20) & 0b11111 // rs2
    const b19_15 = (instruction >> 15) & 0b11111 // rs1
    const b11_7 = (instruction >> 7) & 0b11111
    const b6_0 = instruction & 0b1111111

    // lmfao
    if (b6_0 == 0b0000011    // LW
        || b6_0 == 0b0010011) { // SLLI
            return [b19_15] // these instructions have rs1
        } else {
            return [b19_15, b24_20] // these instructions have rs1 and rs2
        }
}

/**
 * Executes an instruction and modifies EX/MEM.ALUOUT and EX/MEM.COND
 *
 * @param instruction The binary (31:0) representation of the instruction.
 */
export const IDInstruction = (instruction) => {
    const binaryRep = instruction.toString(2).padStart(32, '0')

    // Mask bits
    const b14_12 = (instruction >> 12) & 0b111
    const b6_0 = instruction & 0b1111111

    // yanderedev ass ifelse tower
    if (b14_12 == 0b010 && b6_0 == 0b0000011) {
        lwDecode(instruction);
    } else if (b14_12 == 0b010 && b6_0 == 0b0100011) {
        //swDecode(instruction);
    } else if (b14_12 == 0b010 && b6_0 == 0b0110011) {
        sltDecode(instruction);
    } else if (b14_12 == 0b001 && b6_0 == 0b0110011) {
        sllDecode(instruction);
    } else if (b14_12 == 0b001 && b6_0 == 0b0010011) {
        slliDecode(instruction);
    } else if (b14_12 == 0b000 && b6_0 == 0b1100011) {
        beqDecode(instruction);
    } else if (b14_12 == 0b100 && b6_0 == 0b1100011) {
        bltDecode(instruction);
    }
}

/**
 * Executes an instruction and modifies EX/MEM.ALUOUT and EX/MEM.COND
 *
 * @param instruction The binary (31:0) representation of the instruction.
 */
export const EXInstruction = (instruction) => {
    const binaryRep = instruction.toString(2).padStart(32, '0')

    // Mask bits
    const b14_12 = (instruction >> 12) & 0b111
    const b6_0 = instruction & 0b1111111

    // yanderedev ass ifelse tower
    if (b14_12 == 0b010 && b6_0 == 0b0000011) {
        lwExecute(instruction);
    } else if (b14_12 == 0b010 && b6_0 == 0b0100011) {
        swExecute(instruction);
    } else if (b14_12 == 0b010 && b6_0 == 0b0110011) {
        sltExecute(instruction);
    } else if (b14_12 == 0b001 && b6_0 == 0b0110011) {
        sllExecute(instruction);
    } else if (b14_12 == 0b001 && b6_0 == 0b0010011) {
        slliExecute(instruction);
    } else if (b14_12 == 0b000 && b6_0 == 0b1100011) {
        beqExecute(instruction);
    } else if (b14_12 == 0b100 && b6_0 == 0b1100011) {
        bltExecute(instruction);
    }
}

/**
 * Executes an instruction and modifies EX/MEM.ALUOUT and EX/MEM.COND
 *
 * @param instruction The binary (31:0) representation of the instruction.
 */
export const MEMInstruction = (instruction) => {
    const binaryRep = instruction.toString(2).padStart(32, '0')

    // Mask bits
    const b14_12 = (instruction >> 12) & 0b111
    const b6_0 = instruction & 0b1111111

    // yanderedev ass ifelse tower
    if (b14_12 == 0b010 && b6_0 == 0b0000011) {
        lwMem(instruction);
    } else if (b14_12 == 0b010 && b6_0 == 0b0100011) {
    } else if (b14_12 == 0b010 && b6_0 == 0b0110011) {
    } else if (b14_12 == 0b001 && b6_0 == 0b0110011) {
    } else if (b14_12 == 0b001 && b6_0 == 0b0010011) {
    } else if (b14_12 == 0b000 && b6_0 == 0b1100011) {
    } else if (b14_12 == 0b100 && b6_0 == 0b1100011) {
    }
}

/**
 * Executes an instruction and modifies EX/MEM.ALUOUT and EX/MEM.COND
 *
 * @param instruction The binary (31:0) representation of the instruction.
 */
export const WBInstruction = (instruction) => {
    const binaryRep = instruction.toString(2).padStart(32, '0')

    // Mask bits
    const b14_12 = (instruction >> 12) & 0b111
    const b6_0 = instruction & 0b1111111

    // yanderedev ass ifelse tower
    if (b14_12 == 0b010 && b6_0 == 0b0000011) {
        lwWB(instruction);
    } else if (b14_12 == 0b010 && b6_0 == 0b0100011) {
    } else if (b14_12 == 0b010 && b6_0 == 0b0110011) {
    } else if (b14_12 == 0b001 && b6_0 == 0b0110011) {
    } else if (b14_12 == 0b001 && b6_0 == 0b0010011) {
    } else if (b14_12 == 0b000 && b6_0 == 0b1100011) {
    } else if (b14_12 == 0b100 && b6_0 == 0b1100011) {
        bltExecute(instruction);
    }
}
