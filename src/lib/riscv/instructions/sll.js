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

}

/**
 * Packs an SLL instruction into a 32-bit binary value.
 * sll rd, rs1, rs2
 */
export const sllPack = (rd, imm, rs1) => {
    let bin = "0000000" + rs2.toString(2).padStart(5,'0') + rs1.toString(2).padStart(5,'0') + "001" + rd.toString(2).padStart(5,'0') + "0110011"
    return bin
}