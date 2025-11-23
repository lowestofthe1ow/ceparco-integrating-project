// Get global processor state (memory and registers)
import { memory, registersInt } from '$lib/riscv/state.svelte.js'

// Follow this pattern for all other instructions
import { lwExecute, lwPack } from '$lib/riscv/instructions/lw.js';
import { sllExecute, sllPack } from '$lib/riscv/instructions/sll.js';
import { slliExecute, slliPack } from '$lib/riscv/instructions/slli.js';
import { sltExecute, sltPack } from '$lib/riscv/instructions/slt.js';
import { swExecute, swPack } from '$lib/riscv/instructions/sw.js';
import { beqExecute, beqPack } from '$lib/riscv/instructions/beq.js';
import { bltExecute, bltPack } from '$lib/riscv/instructions/blt.js';

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

/** Convert register into its number representation  */
const getRegNumber = (reg) => {
    return regNames.indexOf(reg) % 32
}

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

/** Parses RISC-V code and returns a single object containing all data */
export const parse = (input) => {
    // Return value. Object representation of the program
    const programData = {
        globlNames: [],
        branchNames: [],
        branchLineNos: [],
        branchTypes: [],
        branchRS1: [],
        branchRS2: [],
        locNames: [],
        locLineNos: [],
        instructions: [], // Instruction binary data (e.g. 0x0000A283)
        lines: [], // Instruction text data (e.g. "LW x5, 0(x1)")
        emptyLineNos: [],
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

    let currentTakenDataAddress = 0;
    mainLoop:
    for(let [index, line] of lines.entries()) {
        let i = index + 1 // True line number is +1

        // If instruction comes after location name
        if(line.length > 1 && currentSection == sections.TEXT && locNameAllowedRegex.test(line[0])) {
            programData.locNames.push(line[0].slice(0, -1))
            programData.locLineNos.push(i)
            let dump = line.shift()
            line = line[0].split(/\s+(.*)/);
        }

        if(line[0] === " ") {
            // Do nothing
            programData.emptyLineNos.push(i)
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
            programData.locNames.push(line[0].slice(0, -1))
            programData.locLineNos.push(i)
            programData.emptyLineNos.push(i)
        }
        // We're not dealing with single-word instructions
        else if(line.length == 1) {
            throw { message: line[0].split(" ")[0] + " is not a recognized instruction without arguments", line: i}
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
                        if(!(currentTakenDataAddress > 0x7F)){
                            memory.storeInteger(currentTakenDataAddress,dataArgs[j],4)
                            currentTakenDataAddress += 4
                        } else {
                            throw { message: "Data declaration breaches limits of data section.", line: i }
                        }
                    } else {
                        throw { message: "Invalid variable declaration", line: i }
                    }
                }
            }
        }

        // Inside .text ===========================================================================

        else if(currentSection == sections.TEXT) { // you can declare stuff outside of a function apparently
            let args = line[1].toLowerCase().replace(/,/g, "").split(" ")

            programData.lines.push(line[0] + " " + line[1]);

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
                    programData.instructions.push(lwPack(getRegNumber(args[0]), parseInt(numArg),
                                                  getRegNumber(innerArg)))
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
                    programData.instructions.push(swPack(getRegNumber(args[0]), parseInt(numArg),
                                getRegNumber(innerArg)))
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
                    programData.instructions.push(sltPack(getRegNumber(args[0]),
                                getRegNumber(args[1]), getRegNumber(args[2])))
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
                    programData.instructions.push(sllPack(getRegNumber(args[0]),
                                getRegNumber(args[1]), getRegNumber(args[2])))
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

                    // Check if imm < 0x20
                    if(args[2].startsWith("0x") &&
                        (parseInt(args[2].replace("0x", ""), 16) > 19)) {
                        throw { message: args[2] + " is out of range", line: i }
                    }
                    else if(args[2].startsWith("0b") &&
                        (parseInt(args[2].replace("0b", ""), 2) > 19)) {
                        throw { message: args[2] + " is out of range", line: i }
                    }
                    else if(parseInt(args[2].replace("0x", ""), 10) > 19) {
                        throw { message: args[2] + " is out of range", line: i }
                    }

                    // TODO: SLLI call
                    programData.instructions.push(slliPack(getRegNumber(args[0]),
                                getRegNumber(args[1]), parseInt(args[2])))
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
                    programData.branchTypes.push("beq")
                    programData.branchRS1.push(args[0])
                    programData.branchRS2.push(args[1])
                    programData.instructions.push(-1) // Indicate branch instruction
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
                    programData.branchTypes.push("blt")
                    programData.branchRS1.push(args[0])
                    programData.branchRS2.push(args[1])
                    programData.instructions.push(-1) // Indicate branch instruction
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

    for(let i in programData.branchLineNos) {
        let locLineNo = programData.locLineNos[programData.locNames.indexOf(programData.branchNames[i])]
        let branchLineNo = programData.branchLineNos[i]
        let numEmptyLines = 0

        for(let i in programData.emptyLineNos) {
            if((programData.emptyLineNos[i] > branchLineNo && programData.emptyLineNos[i] < locLineNo)
                || (programData.emptyLineNos[i] < branchLineNo && programData.emptyLineNos[i] > locLineNo))
                numEmptyLines++
        }

        let jmpCount = (locLineNo - branchLineNo - numEmptyLines) * 4

        // Index of branch in instructions is where instructions contains value -1
        let branchIndx = programData.instructions.indexOf(-1)

        if(programData.branchTypes[i].toLowerCase() === "beq")
            programData.instructions[branchIndx] = beqPack(jmpCount,
                getRegNumber(programData.branchRS1[i]), 
                getRegNumber(programData.branchRS2[i]))
        else if(programData.branchTypes[i].toLowerCase() === "blt")
            programData.instructions[branchIndx] = bltPack(jmpCount,
                getRegNumber(programData.branchRS1[i]), 
                getRegNumber(programData.branchRS2[i]))
    }

    return programData
}
