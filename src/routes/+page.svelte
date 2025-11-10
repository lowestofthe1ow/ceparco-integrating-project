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
    }

    const run = () => {
        // Test function: Stores 4-byte integer -99 at address 0x0000
        memory.storeInteger(0x0000, -99, 4)

        errorDetected = false
        let parsedLines = parse(editor.getValue())

        let globlNames = new Array()    // names of global functions
        let isData = false
        let isText = false
        let isFunc = false

        mainLoop:
        for(let i in parsedLines) {
            let line = parsedLines[i]

            console.log(line)

            if(line[0] === " ") { // Instead of null, Editor turns it into " "
                // Do nothing
            }
            // globl, data, text directives ==========================================================
            else if(line[0] === ".globl") {
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
            else if(line[0] === ".data") {
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
            else if(line[0] === ".text") {
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
            else if(isText && line[0].charAt(line[0].length - 1) == ':') {
                isData = false
                isFunc = true
            }
            // Data declaration =====================================================================
            else if(isData) {
                let dataArgs = line[1].toLowerCase().replace(/,/g, "").split(" ");
                let dump = dataArgs.shift()
                const hexAllowedRegex = /^[0-9a-fA-F]+$/;
                const binaryAllowedRegex = /^[0-1]+$/;
                const decAllowedRegex = /^[0-9]+$/;
                if(line[0].charAt(line[0].length - 1) != ':'         // name ends with :
                    && line[0].charAt(line[0].length - 1) == ':')    // part after name is not another name
                    {
                    errorDisplay(i, "Invalid data declaration")
                    break
                }
                else if(!line[1].toLowerCase().startsWith(".word ")) { // needs to be this to account for commas
                    errorDisplay(i, "μRISC-V only supports .word")
                    break
                }
                else {
                    // CHECK EACH VALUE INDIVIDUALLY
                    for(let j in dataArgs) {
                        // Hexadecimal
                        if(dataArgs[j].startsWith("0x") && hexAllowedRegex.test(dataArgs[j].slice(2))) {
                            // TODO: Insert hexadecimal into memory
                        }
                        // Binary
                        else if(dataArgs[j].startsWith("0b") && binaryAllowedRegex.test(dataArgs[j].slice(2))) {
                            // TODO: Insert binary into memory
                        }
                        // Decimal
                        else if(decAllowedRegex.test(dataArgs[j])) {
                            // TODO: Insert decimal into memory
                        }
                        else {
                            errorDisplay(i, "Invalid variable declaration")
                            break mainLoop;
                        }
                    }
                }
            }
            // Inside a function  ===================================================================
            else if(isFunc) {
                // nemurihiMEEEEEEE mezameru watashi wa iMAAAAAAAAAAAA
                if(line[0].toLowerCase() === "lw") {

                }
                else if(line[0].toLowerCase() === "sw") {
                    
                }
                else if(line[0].toLowerCase() === "slt") {

                }
                else if(line[0].toLowerCase() === "sll") {

                }
                else if(line[0].toLowerCase() === "slli") {

                }
                else if(line[0].toLowerCase() === "beq") {

                }
                else if(line[0].toLowerCase() === "blt") {

                }
                else {
                    errorDisplay(i, line[0].split(" ")[0] + " is not a recognized operator")
                    break
                }
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
