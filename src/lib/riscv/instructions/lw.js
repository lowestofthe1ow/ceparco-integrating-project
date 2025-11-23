// If you need access to memory and registers, include this import
import { pipeline, memory, registersInt,
        getRegValue, setRegValue } from '$lib/riscv/state.svelte.js'

// Follow this pattern for all other instructions

/**
 * Decodes an lw instruction.
 * A <- Regs[IF/ID[rs1]]
 * B <- Regs[IF/UD[rs2]]
 * 
 * @param bin The binary (31:0) representation of the instruction.
 */
export const lwDecode = (bin) => {
    let binaryRep = bin.toString(2).padStart(32, '0')
    let rs1 = parseInt(binaryRep.slice(12, 17), 2)
    let imm = parseInt(binaryRep.slice(0, 12), 2)
    
    pipeline.ID_EX.A = getRegValue(rs1)
    pipeline.ID_EX.B = pipeline.EX_MEM.B
    pipeline.ID_EX.IMM = imm
}

/**
 * Executes an lw instruction.
 * rd = M[rs1+imm][0:31]
 *
 * @param bin The binary (31:0) representation of the instruction.
 */
export const lwExecute = (bin) => {
    let binaryRep = bin.toString(2).padStart(32, '0')
    let rs2 = parseInt(binaryRep.slice(7, 12), 2)
    
    // This shouldn't happen until MEM stage
    // wordVal = memory.readInteger(rs1 + imm, 4)

    // EX/MEM.ALUOUT <- ID/EX.A op ID/EX.IMM
    pipeline.EX_MEM.ALUOUT = pipeline.MEM_WB.ALUOUT
    pipeline.EX_MEM.B = getRegValue(rs2)
    pipeline.EX_MEM.COND = 0
}

/**
 * Mems an lw instruction.
 * 
 * @param bin The binary (31:0) representation of the instruction.
 */
export const lwMem = (bin) => {
    let binaryRep = bin.toString(2).padStart(32, '0')
    let rd = parseInt(binaryRep.slice(20, 25), 2)

    pipeline.MEM_WB.LMD = "N/A"
    pipeline.MEM_WB.ALUOUT = pipeline.WB.REGISTER
    pipeline.MEM_WB.MEMORY = "N/A"

    setRegValue(rd, pipeline.MEM_WB.ALUOUT)
}

/**
 * Writes back an lw instruction.
 * 
 * @param bin The binary (31:0) representation of the instruction.
 */
export const lwWB = (bin) => {
    let binaryRep = bin.toString(2).padStart(32, '0')
    let rs1 = parseInt(binaryRep.slice(12, 17), 2)
    let imm = parseInt(binaryRep.slice(0, 12), 2)
    
    pipeline.WB.REGISTER = memory.readInteger(getRegValue(rs1) + imm, 1)
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
