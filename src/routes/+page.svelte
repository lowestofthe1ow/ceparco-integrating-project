<script>
    import Editor from '$lib/components/Editor.svelte';
    import { parse } from '$lib/riscv/riscv.js';

    let editor;

    const run = () => {
        console.log(parse(editor.getValue()))
    }
</script>

<h1>&mu;RISC-V: Simplified RISC-V Simulator</h1>

<Editor bind:this={editor} />

<button on:click={run}>Run</button>
