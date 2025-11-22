// If you need access to memory and registers, include this import
import { pipeline, memory, registersInt } from '$lib/riscv/state.svelte.js'

// Follow this pattern for all other instructions

/**
 * Executes an sw instruction.
 * M[rs1+imm][0:31] = rs2[0:31]
 *
 * @param bin The binary (31:0) representation of the instruction.
 */
export const swExecute = (bin) => {
    let binaryRep = bin.toString(2).padStart(32, '0')
    let rs1 = parseInt(binaryRep.slice(12, 17), 2)
    let rs2 = parseInt(binaryRep.slice(7, 12), 2)
    let imm = parseInt(binaryRep.slice(0, 7) + binaryRep.slice(20, 25), 2)

    // TODO: Writeback
    // rs2Value = registersInt.get(rs2)
    // memory.storeInteger(rs1 + imm, rs2Value, 4)
    
    pipeline.EX_MEM.ALUOUT = rs1 + imm
}

/**
 * Mems a sw instruction.
 * 
 * @param bin The binary (31:0) representation of the instruction.
 */
export const lwMem = (bin) => {
    // Need to account for addresses that are imm + register address
}

/**
 * Writes back a sw instruction.
 * 
 * @param bin The binary (31:0) representation of the instruction.
 */
export const swWB = (bin) => {
    pipeline.WB.REGISTER = "N/A"
}


/**
 * Packs an SW instruction into a 32-bit binary value.
 * sw rs2, imm(rs1)
 */
export const swPack = (rs2, imm, rs1) => {
    let immSignExtended = (imm >>> 0).toString(2).padStart(12, '0').slice(-12);
    let imm0to4 = immSignExtended.substring(7)
    let imm5to11 = immSignExtended.substring(0, 7)

    let bin = imm5to11 + rs2.toString(2).padStart(5,'0') + rs1.toString(2).padStart(5,'0') + "010" + imm0to4 + "0100011"
    return parseInt(bin, 2)
}
