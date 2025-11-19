// If you need access to memory and registers, include this import
import { memory, registersInt } from '$lib/riscv/state.svelte.js'

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
    let rd = parseInt(binaryRep.slice(20, 25), 2)
    
    shiftedVal = registersInt.get(rs1) << registersInt.get(rs2)
    registersInt.set(rd, shiftedVal)
}

/**
 * Packs an SLL instruction into a 32-bit binary value.
 * sll rd, rs1, rs2
 */
export const sllPack = (rd, rs1, rs2) => {
    let bin = "0000000" + rs2.toString(2).padStart(5,'0') + rs1.toString(2).padStart(5,'0') + "001" + rd.toString(2).padStart(5,'0') + "0110011"

    return parseInt(bin, 2)
}
