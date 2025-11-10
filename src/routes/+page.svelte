<script>
    import RegisterViewer from '$lib/components/RegisterViewer.svelte';
    import MemoryViewer from '$lib/components/MemoryViewer.svelte';
    import Editor from '$lib/components/Editor.svelte';
    import { parse } from '$lib/riscv/riscv.js';
    import { memory, registersInt } from '$lib/riscv/state.svelte.js';

    let editor;
    let startingAddress = 0x0000;

    // Error detection
    let errorDetected = false;
    let errorLineNumber;
    let errorDescription;

    // Error function
    function errorDisplay(lineNum, desc) {
        errorDetected = true
        errorLineNumber = parseInt(lineNum) + 1
        errorDescription = desc
        editor.highlightLine(errorLineNumber)
        abruptEnd = true;
    }

    const run = () => {
        // Test function: Stores 4-byte integer -99 at address 0x0000
        memory.storeInteger(0x0000, -99, 4)

        errorDetected = false
        let parsedLines = parse(editor.getValue())

        let globlNames = new Array()    // names of global functions
        let branchNames = new Array()
        let branchLineNos = new Array()
        let locNames = new Array()
        let isData = false
        let isText = false
        let isFunc = false
        let abruptEnd = false

        let regNames = ["zero", "ra", "sp", "gp", "tp", "t0", "t1", "t2", "s0", "s1",
                        "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "s2", "s3",
                        "s4", "s5", "s6", "s7", "s8", "s9", "s10", "s11", "t3", "t4",
                        "t5", "t6", "pc",
                        "x0", "x1", "x2", "x3", "x4", "x5", "x6", "x7", "x8", "x9", "x10",
                        "x11", "x12", "x13", "x14", "x15", "x16", "x17", "x18", "x19", "x20",
                        "x21", "x22", "x23", "x24", "x25", "x26", "x27", "x28", "x29", "x30",
                        "x31"]

        const hexAllowedRegex = /^0x[0-9a-fA-F]+$/;
        const binAllowedRegex = /^0b[0-1]+$/;
        const decAllowedRegex = /^-?[0-9]+$/;
        const locNameAllowedRegex = /[0-9a-zA-Z]:$/;

        mainLoop:
        for(let i in parsedLines) {
            let line = parsedLines[i]

            // If instruction comes after location name
            if(line.length > 1 && isText && locNameAllowedRegex.test(line[0])) {
                isData = false
                isFunc = true
                locNames.push(line[0].slice(0, -1))

                let dump = line.shift()
                line = line[0].split(/\s+(.*)/);
            }

            console.log(line)

            if(line[0] === " ") { // Instead of null, Editor turns it into " "
                // Do nothing
            }

            // globl, data, text directives ==========================================================
            else if(line[0].toLowerCase() === ".globl") {
                // cannot declare more than one global function in the same line
                if(line.length == 2 && !/\s/.test(line[1])) {
                    globlNames.push(line[1])
                    isData = false
                    isText = false
                    isFunc = false
                }
                else {
                    errorDisplay(i, "Invalid .globl declaration")
                    break
                }
            }
            else if(line[0].toLowerCase() === ".data") {
                if(line.length == 1 && !/\s/.test(line[0])) {
                    isData = true
                    isText = false
                    isFunc = false
                }
                else {
                    errorDisplay(i, "Invalid .data declaration")
                    break
                }
            }
            else if(line[0].toLowerCase() === ".text") {
                if(line.length == 1 && !/\s/.test(line[0])) {
                    isData = false
                    isText = true
                    isFunc = false
                }
                else {
                    errorDisplay(i, "Invalid .text declaration")
                    break
                }
            }
            else if(isText && locNameAllowedRegex.test(line[0])) {
                isData = false
                isFunc = true
                locNames.push(line[0].slice(0, -1))
            }
            else if(line.length == 1) {
                errorDisplay(i, line[0].split(" ")[0] + " is not a recognized operator")
                break
            }
            // Data declaration =====================================================================
            else if(isData) {
                if(!locNameAllowedRegex.test(line[0])) {
                    errorDisplay(i, "Invalid data declaration")
                    break
                }
                else if(!line[1].toLowerCase().startsWith(".word ")) { // needs to be this to account for commas
                    errorDisplay(i, "μRISC-V only supports .word")
                    break
                }
                else {
                    // CHECK EACH VALUE INDIVIDUALLY
                    let dataArgs = line[1].toLowerCase().replace(/,/g, "").split(" ");
                    let dump = dataArgs.shift()

                    for(let j in dataArgs) {
                        if(hexAllowedRegex.test(dataArgs[j]) || binAllowedRegex.test(dataArgs[j])
                           || decAllowedRegex.test(dataArgs[j])) {
                            // TODO: Insert into memory
                        }
                        else {
                            errorDisplay(i, "Invalid variable declaration")
                            break mainLoop;
                        }
                    }
                }
            }
            // Inside .text ===========================================================================
            else if(isText) { // you can declare stuff outside of a function apparently
                let args = line[1].toLowerCase().replace(/,/g, "").split(" ")

                // nemurihiMEEEEEEE mezameru watashi wa iMAAAAAAAAAAAA
                if(line[0].toLowerCase() === "lw") {
                    let numArg = args[1].split("(")[0]
                    let innerArg = args[1].split("(")[1].slice(0, -1)

                    if(!regNames.includes(args[0])) {
                        errorDisplay(i, "Invalid operands")
                        break
                    }
                    else if(args.length != 2) {
                        errorDisplay(i, "Invalid number of operands")
                        break
                    }
                    else if(regNames.includes(innerArg) &&
                            (hexAllowedRegex.test(numArg) || binAllowedRegex.test(numArg)
                             || decAllowedRegex.test(numArg))) {
                        // TODO: LW call
                    }
                    else {
                        errorDisplay(i, "Invalid operands")
                        break
                    }
                }
                else if(line[0].toLowerCase() === "sw") {
                    let numArg = args[1].split("(")[0]
                    let innerArg = args[1].split("(")[1].slice(0, -1)

                    if(!regNames.includes(args[0])) {
                        errorDisplay(i, "Invalid operands")
                        break
                    }
                    else if(args.length != 2) {
                        errorDisplay(i, "Invalid number of operands")
                        break
                    }
                    else if(regNames.includes(innerArg) &&
                            (hexAllowedRegex.test(numArg) || binAllowedRegex.test(numArg)
                             || decAllowedRegex.test(numArg))) {
                        // TODO: SW call
                    }
                    else {
                        errorDisplay(i, "Invalid operands")
                        break
                    }
                }
                else if(line[0].toLowerCase() === "slt") {
                    if(args.length != 3) {
                        errorDisplay(i, "Invalid number of operands")
                        break
                    }
                    else if(regNames.includes(args[0]) && regNames.includes(args[1])
                            && regNames.includes(args[2])) {
                        // TODO: SLT call
                    }
                    else {
                        errorDisplay(i, "Invalid operands")
                        break
                    }
                }
                else if(line[0].toLowerCase() === "sll") {
                    if(args.length != 3) {
                        errorDisplay(i, "Invalid number of operands")
                        break
                    }
                    else if(regNames.includes(args[0]) && regNames.includes(args[1])
                            && regNames.includes(args[2])) {
                        // TODO: SLL call
                    }
                    else {
                        errorDisplay(i, "Invalid operands")
                        break
                    }
                }
                else if(line[0].toLowerCase() === "slli") {
                    if(args.length != 3) {
                        errorDisplay(i, "Invalid number of operands")
                        break
                    }
                    else if(regNames.includes(args[0]) && regNames.includes(args[1]) &&
                            (hexAllowedRegex.test(args[2]) || binAllowedRegex.test(args[2])
                             || decAllowedRegex.test(args[2]))) {
                        // TODO: SLLI call
                    }
                    else {
                        errorDisplay(i, "Invalid operands")
                        break
                    }
                }
                else if(line[0].toLowerCase() === "beq") {
                    if(args.length != 3) {
                        errorDisplay(i, "Invalid number of operands")
                        break
                    }
                    else if(!regNames.includes(args[0]) || !regNames.includes(args[1])) {
                        errorDisplay(i, "Invalid operands")
                        break
                    }
                    else {
                        // To consider capitalization
                        branchNames.push(line[1].replace(/,/g, "").split(" ")[2])
                        branchLineNos.push(i)
                    }
                }
                else if(line[0].toLowerCase() === "blt") {
                    if(args.length != 3) {
                        errorDisplay(i, "Invalid number of operands")
                        break
                    }
                    else if(!regNames.includes(args[0]) || !regNames.includes(args[1])) {
                        errorDisplay(i, "Invalid operands")
                        break
                    }
                    else {
                        branchNames.push(line[1].replace(/,/g, "").split(" ")[2])
                        branchLineNos.push(i)
                    }
                }
                else {
                    errorDisplay(i, line[0].split(" ")[0] + " is not a recognized operator")
                    break
                }
            }
        }

        // Check if branch names are valid

        if(!abruptEnd)
            for(let i in branchNames) {
                if(!locNames.includes(branchNames[i])) {
                    errorDisplay(branchLineNos[i], "Branch location " + branchNames[i] + " does not exist")
                    break
                }
            }
    }

    const loadASM = async (e) => {
        const file = event.target.files[0];
        const content = await file.text();
        editor.setValue(content)
    }
</script>

<h1>&mu;RISC-V: Simplified RISC-V Simulator</h1>

<Editor bind:this={editor} />
<button on:click={run}>Run</button>
<input type="file" accept=".asm" on:change={loadASM} />

{#if errorDetected}
  <h3 style="color: red;">Error in line {errorLineNumber}. {errorDescription}</h3>
{/if}

<h2>Memory viewer</h2>

<MemoryViewer />

<h2>Register viewer</h2>

<RegisterViewer />
