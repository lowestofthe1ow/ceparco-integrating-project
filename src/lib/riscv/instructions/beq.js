// If you need access to memory and registers, include this import
import { pipeline, memory, registersInt, getRegValue } from '$lib/riscv/state.svelte.js'

// Follow this pattern for all other instructions

/**
 * Packs a BEQ instruction into a 32-bit binary value.
 * beq rs1, rs2, imm
 */
export const beqPack = (imm, rs1, rs2) => {
    let immSignExtended = (imm >>> 0).toString(2).padStart(13, '0').slice(-13);
    let imm1to4 = immSignExtended.substring(8, 12)
    let imm5to10 = immSignExtended.substring(2, 8)

    let bin = immSignExtended.toString(2)[0] + imm5to10 + rs2.toString(2).padStart(5,'0') +  rs1.toString(2).padStart(5,'0') + "000" + imm1to4 + immSignExtended.toString(2)[1] + "1100011"

    return parseInt(bin, 2) >>> 0 // Ensure the value is treated as unsigned
}

export const beqDecode = (bin) => {
    let binaryRep = bin.toString(2).padStart(32, '0')
    let rs1 = parseInt(binaryRep.slice(12, 17), 2)
    let rs2 = parseInt(binaryRep.slice(7, 12), 2)

    // Jump offset
    let imm = binaryRep[0] + binaryRep[24] + binaryRep.slice(1, 7) + binaryRep.slice(20, 24)
    imm = imm.padStart(32, imm[0])
    imm = parseInt(imm, 2)

    const entries = [...registersInt]
    
    pipeline.ID_EX.A = entries[rs1]?.[1]
    pipeline.ID_EX.B = entries[rs2]?.[1]
    pipeline.ID_EX.IMM = imm
}

/**
 * Executes a BEQ Jump. Since we work with a modified pipeline, occurs after ID.
 * if(rs1 == rs2) PC += imm
 *
 * @param bin The binary (31:0) representation of the instruction.
 */
export const beqExecute = (bin) => {
    let binaryRep = bin.toString(2).padStart(32, '0')
    let rs1 = parseInt(binaryRep.slice(12, 17), 2)
    let rs2 = parseInt(binaryRep.slice(7, 12), 2)

    // TODO: Clear the rest of the pipeline after the branch executes
    const entries = [...registersInt]
    if (getRegValue(rs1) == getRegValue(rs2)){
        console.log("Old PC: " + pipeline.IF_ID.PC)
        pipeline.IF_ID.PC = ((pipeline.ID_EX.IMM << 1) + pipeline.ID_EX.NPC) >>> 0
        console.log("New PC: " + pipeline.IF_ID.PC)
        pipeline.cutOffBranch = true
    } else {
        pipeline.IF_ID.PC += 4
    }

}
