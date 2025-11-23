// If you need access to memory and registers, include this import
import { pipeline, memory, registersInt } from '$lib/riscv/state.svelte.js'

// Follow this pattern for all other instructions

/**
 * Executes an slt instruction.
 * rd = (rs1 < rs2)?1:0
 *
 * @param bin The binary (31:0) representation of the instruction.
 */
export const sltExecute = (bin) => {
    let binaryRep = bin.toString(2).padStart(32, '0')
    let rs1 = parseInt(binaryRep.slice(12, 17), 2)
    let rs2 = parseInt(binaryRep.slice(7, 12), 2)
    // TODO: Move to a writeback function
    // let rd = parseInt(binaryRep.slice(20, 25), 2)
    
    const entries = [...registersInt]
    let value = entries[rs1]?.[1] < entries[rs2]?.[1] ? 1 : 0

    pipeline.EX_MEM.ALUOUT = value
    pipeline.EX_MEM.B = entries[rs2]?.[1]
    pipeline.EX_MEM.COND = 0
}

/**
 * Packs an SLT instruction into a 32-bit binary value.
 * slt rd, rs1, rs2
 */
export const sltPack = (rd, rs1, rs2) => {
    let bin = "0000000" + rs2.toString(2).padStart(5,'0') + rs1.toString(2).padStart(5,'0') + "010" + rd.toString(2).padStart(5,'0') + "0110011"

    return parseInt(bin, 2)
}

export const sltDecode = (bin) => {
    let binaryRep = bin.toString(2).padStart(32, '0')
    let rs1 = parseInt(binaryRep.slice(12, 17), 2)
    let rs2 = parseInt(binaryRep.slice(7, 12), 2)
    let imm = parseInt(binaryRep.slice(0, 12), 2)

    const entries = [...registersInt]
    
    pipeline.ID_EX.A = entries[rs1]?.[1]
    pipeline.ID_EX.B = entries[rs2]?.[1]
    pipeline.ID_EX.IMM = imm
}

export const sltMem = () => {
    pipeline.MEM_WB.ALUOUT = pipeline.EX_MEM.ALUOUT
    pipeline.MEM_WB.B = pipeline.EX_MEM.B
}

export const sltWB = (bin) => {
    let binaryRep = bin.toString(2).padStart(32, '0')
    let rd = parseInt(binaryRep.slice(20, 25), 2)

    const entries = [...registersInt]
    
    registersInt.set(entries[rd]?.[0], pipeline.MEM_WB.ALUOUT)
    pipeline.WB.REGISTER = pipeline.MEM_WB.ALUOUT
}