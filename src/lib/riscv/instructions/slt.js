// If you need access to memory and registers, include this import
import { memory, registersInt } from '$lib/riscv/state.svelte.js'

// Follow this pattern for all other instructions

/**
 * Executes an slt instruction.
 * rd = (rs1 < rs2)?1:0
 *
 * @param bin The binary (31:0) representation of the instruction.
 */
export const sltExecute = (bin) => {

}

/**
 * Packs an SLT instruction into a 32-bit binary value.
 * slt rd, rs1, rs2
 */
export const sltPack = (rd, rs1, rs2) => {
    let bin = "0000000" + rs2.toString(2).padStart(5,'0') + rs1.toString(2).padStart(5,'0') + "010" + rd.toString(2).padStart(5,'0') + "0110011"

    return parseInt(bin, 2)
}
