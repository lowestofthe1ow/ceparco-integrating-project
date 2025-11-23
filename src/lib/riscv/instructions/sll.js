// If you need access to memory and registers, include this import
import { pipeline, memory, registersInt } from '$lib/riscv/state.svelte.js'

// Follow this pattern for all other instructions

/**
 * Executes an sll instruction.
 * rd = rs1 << rs2
 *
 * @param bin The binary (31:0) representation of the instruction.
 */
export const sllExecute = (bin) => {
    let binaryRep = bin.toString(2).padStart(32, '0')
    let rs1 = parseInt(binaryRep.slice(12, 17), 2)
    let rs2 = parseInt(binaryRep.slice(7, 12), 2)
    // TODO: Move to a writeback function
    // let rd = parseInt(binaryRep.slice(20, 25), 2)
    
    const entries = [...registersInt]
    let shiftedVal = entries[rs1]?.[1] << entries[rs2]?.[1]

    pipeline.EX_MEM.ALUOUT = shiftedVal
    pipeline.EX_MEM.B = entries[rs2]?.[1]
    pipeline.EX_MEM.COND = 0
}

export const sllDecode = (bin) => {
    let binaryRep = bin.toString(2).padStart(32, '0')
    let rs1 = parseInt(binaryRep.slice(12, 17), 2)
    let rs2 = parseInt(binaryRep.slice(7, 12), 2)
    let imm = parseInt(binaryRep.slice(0, 12), 2)

    const entries = [...registersInt]
    
    pipeline.ID_EX.A = entries[rs1]?.[1]
    pipeline.ID_EX.B = entries[rs2]?.[1]
    pipeline.ID_EX.IMM = imm
}

export const sllMem = () => {
    pipeline.MEM_WB.ALUOUT = pipeline.EX_MEM.ALUOUT
    pipeline.MEM_WB.B = pipeline.EX_MEM.B
}

export const sllWB = (bin) => {
    let binaryRep = bin.toString(2).padStart(32, '0')
    let rd = parseInt(binaryRep.slice(20, 25), 2)

    const entries = [...registersInt]
    
    registersInt.set(entries[rd]?.[0], pipeline.MEM_WB.ALUOUT)
    pipeline.WB.REGISTER = pipeline.MEM_WB.ALUOUT
}

/**
 * Packs an SLL instruction into a 32-bit binary value.
 * sll rd, rs1, rs2
 */
export const sllPack = (rd, rs1, rs2) => {
    let bin = "0000000" + rs2.toString(2).padStart(5,'0') + rs1.toString(2).padStart(5,'0') + "001" + rd.toString(2).padStart(5,'0') + "0110011"

    return parseInt(bin, 2)
}