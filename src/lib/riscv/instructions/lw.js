// If you need access to memory and registers, include this import
import { pipeline, memory, registersInt } from '$lib/riscv/state.svelte.js'

// Follow this pattern for all other instructions

/**
 * Executes an lw instruction.
 * rd = M[rs1+imm][0:31]
 *
 * @param bin The binary (31:0) representation of the instruction.
 */
export const lwExecute = (bin) => {
    let binaryRep = bin.toString(2).padStart(32, '0')
    let rs1 = parseInt(binaryRep.slice(12, 17), 2)
    // TODO: Move to a writeback function
    // let rd = parseInt(binaryRep.slice(20, 25), 2)
    let imm = parseInt(binaryRep.slice(0, 12), 2)
    
    // This shouldn't happen until MEM stage
    // wordVal = memory.readInteger(rs1 + imm, 4)

    // EX/MEM.ALUOUT <- ID/EX.A op ID/EX.IMM
    pipeline.EX_MEM.ALUOUT = rs1 + imm
}

/**
 * Packs an LW instruction into a 32-bit binary value.
 * lw rd, imm(rs1)
 */
export const lwPack = (rd, imm, rs1) => {
    let immSignExtended = (imm >>> 0).toString(2).padStart(12, '0').slice(-12);

    let bin = immSignExtended.toString(2) +  rs1.toString(2).padStart(5,'0') + "010" + rd.toString(2).padStart(5,'0') + "0000011"

    return parseInt(bin, 2)
}
