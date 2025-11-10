<script>
    import RegisterViewer from '$lib/components/RegisterViewer.svelte';
    import MemoryViewer from '$lib/components/MemoryViewer.svelte';
    import Editor from '$lib/components/Editor.svelte';
    import { parse } from '$lib/riscv/riscv.js';
    import { memory, registersInt } from '$lib/riscv/state.svelte.js';

    let editor;
    let startingAddress = 0x0000;

    const run = () => {
        // Test function: Stores 4-byte integer -99 at address 0x0000
        memory.storeInteger(0x0000, -99, 4)
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

<h2>Memory viewer</h2>

<MemoryViewer />

<h2>Register viewer</h2>

<RegisterViewer />
