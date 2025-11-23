// If you need access to memory and registers, include this import
import { pipeline, memory, registersInt,
        getRegValue, setRegValue } from '$lib/riscv/state.svelte.js'

// Follow this pattern for all other instructions

/**
 * Decodes an slli instruction.
 * A <- Regs[IF/ID[rs1]]
 * B <- Regs[IF/UD[rs2]]
 * 
 * @param bin The binary (31:0) representation of the instruction.
 */
export const slliDecode = (bin) => {
    let binaryRep = bin.toString(2).padStart(32, '0')
    let rs1 = parseInt(binaryRep.slice(12, 17), 2)
    let imm = parseInt(binaryRep.slice(0, 12), 2)
    
    pipeline.ID_EX.A = getRegValue(rs1)
    pipeline.ID_EX.B = pipeline.EX_MEM.B
    pipeline.ID_EX.IMM = imm
}

/**
 * Executes an slli instruction.
 * rd = rs1 << imm[0:4]
 *
 * @param bin The binary (31:0) representation of the instruction.
 */
export const slliExecute = (bin) => {
    let binaryRep = bin.toString(2).padStart(32, '0')
    let rs2 = parseInt(binaryRep.slice(7, 12), 2)
    
    pipeline.EX_MEM.ALUOUT = pipeline.MEM_WB.ALUOUT
    pipeline.EX_MEM.B = getRegValue(rs2)
    pipeline.EX_MEM.COND = 0
}

/**
 * Mems an slli instruction.
 * 
 * @param bin The binary (31:0) representation of the instruction.
 */
export const lwMem = (bin) => {
    pipeline.MEM_WB.LMD = "N/A"
    pipeline.MEM_WB.ALUOUT = pipeline.WB.REGISTER
    pipeline.MEM_WB.MEMORY = "N/A"
}

/**
 * Writes back an slli instruction.
 * 
 * @param bin The binary (31:0) representation of the instruction.
 */
export const slliWB = (bin) => {
    let binaryRep = bin.toString(2).padStart(32, '0')
    let imm = parseInt(binaryRep.slice(0, 12), 2)
    let rs1 = parseInt(binaryRep.slice(7, 12), 2)
    let rd = parseInt(binaryRep.slice(20, 25), 2)
    
    pipeline.WB.REGISTER = getRegValue(rs1) << imm
    setRegValue(rd, pipeline.WB.REGISTER)
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
