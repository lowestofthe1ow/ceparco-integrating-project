<script>
    import Editor from '$lib/components/Editor.svelte';
    import { parse } from '$lib/riscv/riscv.js';
    import { memory, registersInt } from '$lib/riscv/state.svelte.js'

    let editor;

    let startingAddress = 0x0000;

    /** @return An array of 4 strings representing hex data in memory */
    const run = () => {
        memory.storeInteger(0x0000, -99, 4)
    }

    /** @return An array of 4 strings representing hex data in memory */
    const getMemorySlice = () => {
        let slice = memory.memory.slice(startingAddress, startingAddress+4);
        return slice.map(value => '0x' + value.toString(16).toUpperCase());
    }
</script>

<h1>&mu;RISC-V: Simplified RISC-V Simulator</h1>

<Editor bind:this={editor} />
<button on:click={run}>Run</button>

<h2>Memory viewer</h2>

<p>Values at address 0x{startingAddress.toString(16)}: {getMemorySlice()}</p>
<p>Starting address: <input type="text" bind:value={startingAddress} /></p>
