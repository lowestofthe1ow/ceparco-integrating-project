<script>
    import RegisterViewer from '$lib/components/RegisterViewer.svelte';
    import MemoryViewer from '$lib/components/MemoryViewer.svelte';
    import Editor from '$lib/components/Editor.svelte';
    import { parse } from '$lib/riscv/riscv.js';
    import { memory, registersInt } from '$lib/riscv/state.svelte.js';

    let editor;
    let startingAddress = 0x0000;

    // Reactive  for error handling
    let error = null;

    const run = () => {
        try {
            // Reset error objcet
            error = null

            // Parse program
            let program = parse(editor.getValue())

            // Do stuff with program
            console.log(program)
        } catch (e) {
            error = e;
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

{#if error}
  <h3 style="color: red;">Error in line {error.line}. {error.message}</h3>
{/if}

<h2>Memory viewer</h2>

<MemoryViewer />

<h2>Register viewer</h2>

<RegisterViewer />
