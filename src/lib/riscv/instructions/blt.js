// If you need access to memory and registers, include this import
import { memory, registersInt } from '$lib/riscv/state.svelte.js'

// Follow this pattern for all other instructions

/**
 * Executes an blt instruction.
 * if(rs1 < rs2) PC += imm
 *
 * @param bin The binary (31:0) representation of the instruction.
 */
export const bltExecute = (bin) => {

}

/**
 * Packs an BLT instruction into a 32-bit binary value.
 * blt rs1, rs2, imm
 */
export const bltPack = (imm, rs1, rs2) => {
    let immSignExtended = (imm >>> 0).toString(2).padStart(13, '0').slice(-13);
    let imm1to4 = immSignExtended.substring(8, 12)
    let imm5to10 = immSignExtended.substring(2, 8)
    
    let bin = immSignExtended.toString(2)[0] + imm5to10 + rs2.toString(2).padStart(5,'0') +  rs1.toString(2).padStart(5,'0') + "100" + imm1to4 + immSignExtended.toString(2)[1] + "1100011"

    return parseInt(bin, 2)
}
