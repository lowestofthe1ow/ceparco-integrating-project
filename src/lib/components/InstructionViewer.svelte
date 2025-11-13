<script>
    import { program } from '$lib/riscv/state.svelte.js';
    import formatAsHex from '$lib/helpers/hex.js'

    const getInstructions = () => {
        return program.program ? program.program.instructions : [];
    }

    const getInstructionsText = () => {
        return program.program ? program.program.instructionText : [];
    }
</script>

<div class='viewer'>
    {#each getInstructions() ?? [] as instruction, index}
        <div class='viewer__row'>
            <div class='viewer__label'>{getInstructionsText()[index]}</div>
            <div class='viewer__label'>{formatAsHex(0x80 + index * 4, 8)}</div>
            <div class='viewer__label'>{formatAsHex(instruction, 8)}</div>
        </div>
    {:else}
        <div class='viewer__row'>
            <p>No program loaded.</p>
        </div>
    {/each}
</div>
