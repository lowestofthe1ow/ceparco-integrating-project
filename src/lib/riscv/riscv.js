// Get global processor state (memory and registers)
import { memory, registersInt } from '$lib/riscv/state.svelte.js'

// Follow this pattern for all other instructions
import { lwExecute, lwPack } from '$lib/riscv/instructions/lw.js';
import { sllExecute, sllPack } from '$lib/riscv/instructions/sll.js';
import { slliExecute, slliPack } from '$lib/riscv/instructions/slli.js';
import { sltExecute, sltPack } from '$lib/riscv/instructions/slt.js';
import { swExecute, swPack } from '$lib/riscv/instructions/sw.js';

const sections = {
    NONE: 0,
    DATA: 1,
    TEXT: 2
}
const regNames = [
    // Named registers (aliases)
    ...registersInt.keys(),
    // x0, x1, ... x31
    ...Array.from({ length: 32 }, (_, i) => `x${i}`)
]
const hexAllowedRegex = /^0x[0-9a-fA-F]+$/;
const binAllowedRegex = /^0b[0-1]+$/;
const decAllowedRegex = /^-?[0-9]+$/;
const locNameAllowedRegex = /[0-9a-zA-Z]:$/;

/** Splits a line of code into its first token and the rest of the line */
const getParts = (line) => {
    let parts = line.trim().split(/\s+/)

    let head = parts[0].trim()
    let tail = parts.slice(1).join(' ').trim()

    if (!head && !tail) {
        // If both head and tail are empty, return whitespace
        return " "
    } else {
        // Otherwise, return the non-empty parts
        return [head, tail].filter(Boolean)
    }
}

/** Parses RISC-V code. */
export const parse = (input) => {
    // Return value. Object representation of the program
    const programData = {
        globlNames: [],
        branchNames: [],
        branchLineNos: [],
        locNames: [],
        // TODO: Put packed instructions into here
        instructions: [],
    }

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
    lines = lines.map(line => getParts(line))

    let currentSection = sections.NONE

    mainLoop:
    for(let [index, line] of lines.entries()) {
        let i = index + 1 // True line number is +1

        // If instruction comes after location name
        if(line.length > 1 && currentSection == sections.TEXT && locNameAllowedRegex.test(line[0])) {
            programData.locNames.push(line[0].slice(0, -1))
            let dump = line.shift()
            line = line[0].split(/\s+(.*)/);
        }

        if(line[0] === " ") {
            // Do nothing
        }

        // globl, data, text directives ==========================================================

        // .globl
        else if(line[0].toLowerCase() === ".globl") {
            // Cannot declare more than one global function in the same line
            if(line.length == 2 && !/\s/.test(line[1])) {
                programData.globlNames.push(line[1])
                currentSection = sections.NONE
            } else {
                throw { message: "Invalid .globl declaration", line: i }
            }
        }
        // .data
        else if(line[0].toLowerCase() === ".data") {
            if(line.length == 1 && !/\s/.test(line[0])) {
                currentSection = sections.DATA
            } else {
                throw { messasge: "Invalid .data declaration", line: i }
            }
        }
        // .text
        else if(line[0].toLowerCase() === ".text") {
            if(line.length == 1 && !/\s/.test(line[0])) {
                currentSection = sections.TEXT
            } else {
                throw { message: "Invalid .text declaration", line: i }
            }
        }
        // Labeled instructions (branchable locations)
        else if(currentSection == sections.TEXT && locNameAllowedRegex.test(line[0])) {
            console.log("HERE")
            programData.locNames.push(line[0].slice(0, -1))
        }
        // We're not dealing with single-word instructions
        else if(line.length == 1) {
            throw { message: line[0].split(" ")[0] + " is not a recognized instruction", line: i}
        }

        // Data declarations =====================================================================

        else if(currentSection == sections.DATA) {
            if(!locNameAllowedRegex.test(line[0])) {
                throw { message: "Invalid data declaration", line: i }
            }
            // Needs to be this to account for commas
            else if(!line[1].toLowerCase().startsWith(".word ")) {
                throw { message: "μRISC-V only supports .word", line: i }
            } else {
                // CHECK EACH VALUE INDIVIDUALLY
                let dataArgs = line[1].toLowerCase().replace(/,/g, "").split(" ");
                let dump = dataArgs.shift()

                for(let j in dataArgs) {
                    if(hexAllowedRegex.test(dataArgs[j]) || binAllowedRegex.test(dataArgs[j])
                        || decAllowedRegex.test(dataArgs[j])) {
                        // TODO: Insert into memory
                    } else {
                        throw { message: "Invalid variable declaration", line: i }
                    }
                }
            }
        }

        // Inside .text ===========================================================================

        else if(currentSection == sections.TEXT) { // you can declare stuff outside of a function apparently
            let args = line[1].toLowerCase().replace(/,/g, "").split(" ")

            // nemurihiMEEEEEEE mezameru watashi wa iMAAAAAAAAAAAA
            // lw instruction
            if(line[0].toLowerCase() === "lw") {
                let numArg = args[1].split("(")[0]
                let innerArg = args[1].split("(")[1].slice(0, -1)

                if(!regNames.includes(args[0])) {
                    throw { message: "Invalid operands", line: i }
                } else if(args.length != 2) {
                    throw { message: "Invalid number of operands", line: i }
                } else if(regNames.includes(innerArg) &&
                    (hexAllowedRegex.test(numArg) || binAllowedRegex.test(numArg)
                    || decAllowedRegex.test(numArg))) {
                    // TODO: LW call
                } else {
                    throw { message: "Invalid operands", line: i }
                }
            }
            // sw instruction
            else if(line[0].toLowerCase() === "sw") {
                let numArg = args[1].split("(")[0]
                let innerArg = args[1].split("(")[1].slice(0, -1)

                if(!regNames.includes(args[0])) {
                    throw { message: "Invalid operands", line: i }
                } else if(args.length != 2) {
                    throw { message: "Invalid number of operands", line: i }
                } else if(regNames.includes(innerArg) &&
                    (hexAllowedRegex.test(numArg) || binAllowedRegex.test(numArg)
                    || decAllowedRegex.test(numArg))) {
                    // TODO: SW call
                } else {
                    throw { message: "Invalid operands", line: i }
                }
            }
            // slt instruction
            else if(line[0].toLowerCase() === "slt") {
                if(args.length != 3) {
                    throw { message: "Invalid number of operands", line: i }
                } else if(regNames.includes(args[0]) && regNames.includes(args[1])
                    && regNames.includes(args[2])) {
                    // TODO: SLT call
                } else {
                    throw { message: "Invalid operands", line: i }
                }
            }
            // sll instruction
            else if(line[0].toLowerCase() === "sll") {
                if(args.length != 3) {
                    throw { message: "Invalid number of operands", line: i }
                } else if(regNames.includes(args[0]) && regNames.includes(args[1])
                    && regNames.includes(args[2])) {
                    // TODO: SLL call
                } else {
                    throw { message: "Invalid operands", line: i }
                }
            }
            // slli instruction
            else if(line[0].toLowerCase() === "slli") {
                if(args.length != 3) {
                    throw { message: "Invalid number of operands", line: i }
                } else if(regNames.includes(args[0]) && regNames.includes(args[1]) &&
                    (hexAllowedRegex.test(args[2]) || binAllowedRegex.test(args[2])
                    || decAllowedRegex.test(args[2]))) {
                    // TODO: SLLI call
                } else {
                    throw { message: "Invalid operands", line: i }
                }
            }
            // beq instruction
            else if(line[0].toLowerCase() === "beq") {
                if(args.length != 3) {
                    throw { message: "Invalid number of operands", line: i }
                } else if(!regNames.includes(args[0]) || !regNames.includes(args[1])) {
                    console.log(args[1])
                    throw { message: "Invalid operands", line: i }
                } else {
                    // To consider capitalization
                    programData.branchNames.push(line[1].replace(/,/g, "").split(" ")[2])
                    programData.branchLineNos.push(i)
                }
            }
            // blt instruction
            else if(line[0].toLowerCase() === "blt") {
                if(args.length != 3) {
                    throw { message: "Invalid number of operands", line: i }
                } else if(!regNames.includes(args[0]) || !regNames.includes(args[1])) {
                    throw { message: "Invalid operands", line: i }
                } else {
                    programData.branchNames.push(line[1].replace(/,/g, "").split(" ")[2])
                    programData.branchLineNos.push(i)
                }
            }
            // Fail to match with any valid instructions
            else {
                throw { message: line[0].split(" ")[0] + " is not a recognized instruction", line: i }
            }
        }
    }

    // Check if branch names are valid

    for(let i in programData.branchNames) {
        if(!programData.locNames.includes(programData.branchNames[i])) {
            throw {
                message: "Branch location " + programData.branchNames[i] + " does not exist",
                line: programData.branchLineNos[i]
            }
        }
    }

    return programData
}
