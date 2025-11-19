// If you need access to memory and registers, include this import
import { memory, registersInt } from '$lib/riscv/state.svelte.js'

// Follow this pattern for all other instructions

/**
 * Executes an slli instruction.
 * rd = rs1 << imm[0:4]
 *
 * @param bin The binary (31:0) representation of the instruction.
 */
export const slliExecute = (bin) => {
    let binaryRep = bin.toString(2).padStart(32, '0')
    let imm0to4 = parseInt(binaryRep.slice(12, 17), 2)
    let rs1 = parseInt(binaryRep.slice(7, 12), 2)
    let rd = parseInt(binaryRep.slice(20, 25), 2)
    
    shiftedVal = registersInt.get(rs1) << imm0to4
    registersInt.set(rd, shiftedVal)
}

/**
 * Packs an SLLI instruction into a 32-bit binary value.
 * slli rd, rs1, imm
 */
export const slliPack = (rd, rs1, imm) => {
    let immSignExtended = (imm >>> 0).toString(2).padStart(12, '0').slice(-12);

    let bin = immSignExtended.toString(2) +  rs1.toString(2).padStart(5,'0') + "001" + rd.toString(2).padStart(5,'0') + "0010011"

    return parseInt(bin, 2)
}
