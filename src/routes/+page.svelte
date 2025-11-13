<script>
    import InstructionViewer from '$lib/components/InstructionViewer.svelte';
    import RegisterViewer from '$lib/components/RegisterViewer.svelte';
    import MemoryViewer from '$lib/components/MemoryViewer.svelte';
    import Editor from '$lib/components/Editor.svelte';
    import { parse } from '$lib/riscv/riscv.js';
    import { memory, program, registersInt } from '$lib/riscv/state.svelte.js';
    import { slliPack } from '$lib/riscv/instructions/slli.js';
    import { beqPack } from '$lib/riscv/instructions/beq.js';

    let editor;
    let startingAddress = 0x0000;

    // Reactive variable for error handling
    let error = null;

    const run = () => {
        try {
            // Reset error objcet
            error = null
            editor.clearHighlight()

            // Parse program
            program.program = parse(editor.getValue())

            // Load program into memory
            for (let i = 0; i < program.program.instructions.length; i++) {
                memory.storeInteger(0x0080 + i*4, program.program.instructions[i], 4)
            }

            // Do stuff with program
            console.log(program)
        } catch (e) {
            error = e;
            editor.highlightLine(e.line);
        }
    }

    const loadASM = async (e) => {
        const file = event.target.files[0];
        const content = await file.text();
        editor.setValue(content)
    }
</script>


<h1>&mu;RISC-V: <span style="font-weight: 200">Simplified RISC-V Simulator</span></h1>

<div class="main">
    <div class="sidebar">
        <div>
            <h2>Memory viewer</h2>
            <MemoryViewer />
        </div>

        <div>
            <h2>Register viewer</h2>
            <RegisterViewer />
        </div>
    </div>

    <div style="flex-grow: 1">
        <Editor bind:this={editor} />

        <div class="editor__tray">
            <button class="editor__tray--button" on:click={run}>Run</button>
            <input class="editor__tray--button" type="file" accept=".asm" on:change={loadASM} />
        </div>

        {#if error}
        <p style="color: red; font-family: 'Fira Code'"><strong>Error in line {error.line}.</strong> {error.message}</p>
        {/if}

        <br /> <!-- TODO: Don't use a <br> here -->

        <div>
            <h2>Instruction viewer</h2>
            <InstructionViewer />
        </div>
    </div>
</div>




