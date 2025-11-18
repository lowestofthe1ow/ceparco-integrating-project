<script>
    import InstructionViewer from '$lib/components/InstructionViewer.svelte';
    import RegisterViewer from '$lib/components/RegisterViewer.svelte';
    import MemoryViewer from '$lib/components/MemoryViewer.svelte';
    import Editor from '$lib/components/Editor.svelte';
    import { parse } from '$lib/riscv/riscv.js';
    import { memory, program, registersInt } from '$lib/riscv/state.svelte.js';
    import { slliPack } from '$lib/riscv/instructions/slli.js';
    import { beqPack } from '$lib/riscv/instructions/beq.js';

    import IconCode from '~icons/solar/code-bold'
    import IconData from '~icons/solar/database-bold-duotone'
    import IconCPU from '~icons/solar/cpu-bold-duotone'
    import IconPlay from '~icons/solar/playback-speed-bold-duotone'

    let editor;
    let startingAddress = 0x0000;

    // Reactive variable for error handling
    let error = null;

    const run = () => {
        try {
            // Clear all memory and program data
            memory.clear();
            program.data = {};

            // Reset error objcet
            error = null
            editor.clearHighlight()

            // Parse program
            program.data = parse(editor.getValue())

            // Load program into memory
            for (let i = 0; i < program.data.instructions.length; i++) {
                memory.storeInteger(0x0080 + i*4, program.data.instructions[i], 4)
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
            <hgroup class="header">
                <IconData class="icon--header"/>
                <h2 style="margin: 0">Memory</h2>
            </hgroup>
            <MemoryViewer />
        </div>

        <div>
            <hgroup class="header">
                <IconCPU class="icon--header"/>
                <h2 style="margin: 0">Registers</h2>
            </hgroup>

            <RegisterViewer />
        </div>
    </div>

    <div style="flex-grow: 1">
        <Editor bind:this={editor} />

        <div class="editor__tray">
            <button class="editor__tray__button" on:click={run}><IconPlay />Run</button>
            <input class="editor__tray__button" type="file" accept=".asm" on:change={loadASM} />
        </div>

        {#if error}
        <p style="color: red; font-family: 'Fira Code'"><strong>Error in line {error.line}.</strong> {error.message}</p>
        {/if}

        <br /> <!-- TODO: Don't use a <br> here -->

        <div>
            <hgroup class="header">
                <IconCode class="icon--header"/>
                <h2 style="margin: 0">Instructions</h2>
            </hgroup>

            <InstructionViewer />
        </div>
    </div>
</div>




