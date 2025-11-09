<script>
    import Editor from '$lib/components/Editor.svelte';

    let editor;

    const run = () => {
        console.log(editor.getValue())
    }
</script>

<h1>&mu;RISC-V: Simplified RISC-V Simulator</h1>

<Editor bind:this={editor} />

<button on:click={run}>Run</button>
