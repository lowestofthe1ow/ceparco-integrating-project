// If you need access to memory and registers, include this import
import { pipeline, memory, registersInt } from '$lib/riscv/state.svelte.js'

// Follow this pattern for all other instructions

/**
 * Executes an blt instruction.
 * if(rs1 < rs2) PC += imm
 *
 * @param bin The binary (31:0) representation of the instruction.
 */
export const bltExecute = (bin) => {
    let binaryRep = bin.toString(2).padStart(32, '0')
    let rs1 = parseInt(binaryRep.slice(12, 17), 2)
    let rs2 = parseInt(binaryRep.slice(7, 12), 2)
    let imm = parseInt(binaryRep[0] + binaryRep[24] + binaryRep.slice(1, 7) + binaryRep.slice(20, 24), 2)

    pipeline.EX_MEM.ALUOUT = pipeline.ID_EX.NPC + imm - 8 // TODO: -8 is a hack fix kasi idt tama yung address na lumalabas

    const entries = [...registersInt]
    if(entries[rs1]?.[1] < entries[rs2]?.[1]){
        pipeline.EX_MEM.COND = 1
    } else {
        pipeline.EX_MEM.COND = 0
    }
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

export const bltDecode = (bin) => {
    let binaryRep = bin.toString(2).padStart(32, '0')
    let rs1 = parseInt(binaryRep.slice(12, 17), 2)
    let rs2 = parseInt(binaryRep.slice(7, 12), 2)
    let imm = parseInt(binaryRep[0] + binaryRep[24] + binaryRep.slice(1, 7) + binaryRep.slice(20, 24), 2)

    const entries = [...registersInt]
    
    pipeline.ID_EX.A = entries[rs1]?.[1]
    pipeline.ID_EX.B = entries[rs2]?.[1]
    pipeline.ID_EX.IMM = imm
}