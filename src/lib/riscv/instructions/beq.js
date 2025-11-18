// If you need access to memory and registers, include this import
import { programCounter,  memory, registersInt } from '$lib/riscv/state.svelte.js'

// Follow this pattern for all other instructions

/**
 * Executes an beq instruction.
 * if(rs1 == rs2) PC += imm
 *
 * @param bin The binary (31:0) representation of the instruction.
 */
export const beqExecute = (bin) => {
    let binaryRep = bin.toString(2).padStart(32, '0')
    let rs1 = parseInt(binaryRep.slice(12, 17), 2)
    let rs2 = parseInt(binaryRep.slice(7, 12), 2)
    let imm = parseInt(binaryRep[0] + binaryRep[24] + binaryRep.slice(1, 7) + binaryRep.slice(20, 24), 2) << 1

    if(rs1 == rs2){programCounter += imm}
}

/**
 * Packs an BEQ instruction into a 32-bit binary value.
 * beq rs1, rs2, imm
 */
export const beqPack = (imm, rs1, rs2) => {
    let immSignExtended = (imm >>> 0).toString(2).padStart(13, '0').slice(-13);
    let imm1to4 = immSignExtended.substring(8, 12)
    let imm5to10 = immSignExtended.substring(2, 8)

    let bin = immSignExtended.toString(2)[0] + imm5to10 + rs2.toString(2).padStart(5,'0') +  rs1.toString(2).padStart(5,'0') + "000" + imm1to4 + immSignExtended.toString(2)[1] + "1100011"

    return parseInt(bin, 2)
}
