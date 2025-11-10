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
        errorLineNumber = lineNum
        errorDescription = desc
        editor.highlightLine(lineNum)
    }

    const run = () => {
        // Test function: Stores 4-byte integer -99 at address 0x0000
        memory.storeInteger(0x0000, -99, 4)

        errorDetected = false
        let parsedLines = parse(editor.getValue())
        
        let globlNames = new Array()    // names of global functions
        let isData = false
        let isText = false
        let isGloblFunc = false

        for(let i in parsedLines) {
            let line = parsedLines[i]

            // globl, data, text directives
            if(line[0] === ".globl") {
                // cannot declare more than one global function in the same line
                if(line.length == 2 && !/\s/.test(line[1])) {
                    globlNames.push(line[1])
                    isData = false
                    isText = false
                    isGloblFunc = false
                }
                else {
                    errorDisplay(i, "Invalid .globl declaration")
                    break
                }
            }
            else if(line[0] === ".data" && line.length == 1) {
                if(line.length == 1 && !/\s/.test(line[0])) {
                    isData = true
                    isText = false
                    isGloblFunc = false
                }
                else {
                    errorDisplay(i, "Invalid .data declaration")
                    break
                }
            }
            else if(line[0] === ".text" && line.length == 1) {
                isData = false
                isText = true
                isGloblFunc = false
            }
            else if(isText && globlNames.includes(line[0].slice(0, -1))
                    && line[0].charAt(line[0].length - 1) == ':') {
                isData = false
                isGloblFunc = true
            }
            
            // data declaration
            else if(isData) {
                //valid syntax
                if(line[0].charAt(line[0].length - 1) == ':'        // name is valid
                    && line[0].charAt(line[0].length - 1) != ':')    // part after name is not another name
                    {

                    }
            }

            // If text
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
