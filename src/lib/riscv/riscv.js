// Get global processor state (memory and registers)
import { memory, registersInt } from '$lib/riscv/state.svelte.js'

// Follow this pattern for all other instructions
import { lwExecute, lwPack } from '$lib/riscv/instructions/lw.js';
import { sllExecute, sllPack } from '$lib/riscv/instructions/sll.js';
import { slliExecute, slliPack } from '$lib/riscv/instructions/slli.js';
import { sltExecute, sltPack } from '$lib/riscv/instructions/slt.js';
import { swExecute, swPack } from '$lib/riscv/instructions/sw.js';

/** Splits a line of code into its first token and the rest of the line */
const getParts = (line) => {
    let parts = line.trim().split(/\s+/)

    let head = parts[0].trim()
    let tail = parts.slice(1).join(' ').trim()


    if (!head && !tail) {
        // If both head and tail are empty, return null
        return null
    } else {
        // Otherwise, return the non-empty parts
        return [head, tail].filter(Boolean)
    }
}

const parseInstruction = (line) => {

}

const parseDirective = (line) => {
    // I think we only care about .word right now
}

const parseLabel = (line) => {

}

/** Parses RISC-V code. */
export const parse = (input) => {
    // Split into lines
    // Do not ignore empty lines since that's needed for error line count
    let lines = input.split(/\r?\n/)

    // Handle comments
    lines = lines.map(line => {
            line = line.split('#')[0]
            line.trim()
            return line
    })

    // Tokenize per line and remove comments
    lines = lines.map(line => getParts(line)
    ).map(line => {
        if(line === null) {
            return " "
        }
        return line
    }) // Avoid dealing with NULL

    // Go over each line
    for (let line in lines) {
        // line[0] is the "head" of the line and can be a instruction, a
        // directive, or a label. line[1] is the rest of the line. Both are
        // guaranteed to have been trimmed already.

        if (line[0].startsWith('.')) {
            // Treat as directive
            parseDirective(line)
        } else if (line[0].endsWith(':')) {
            // Treat as label
            parseLabel(line)
        } else {
            // Treat as instruction.
            parseInstruction(line)
        }
    }

    return lines
}
