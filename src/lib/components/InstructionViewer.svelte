<script>
    import { program } from '$lib/riscv/state.svelte.js';
    import formatAsHex from '$lib/helpers/hex.js'

    const getInstructions = () => {
        return program.data ? program.data.instructions : [];
    }

    const getInstructionsText = () => {
        return program.data ? program.data.lines : [];
    }
</script>

<table class='viewer'>
    <tbody>
        <tr class='viewer__row'>
            <th class='viewer__label viewer__label--header'>Address</th>
            <th class='viewer__label viewer__label--header'>Line</th>
            <th class='viewer__label viewer__label--header'>Binary</th>
        </tr>
        {#each getInstructions() ?? [] as instruction, index}
            <tr class='viewer__row'>
                <td class='viewer__label'>{formatAsHex(0x80 + index * 4, 8)}</td>
                <td class='viewer__label'>{getInstructionsText()[index]}</td>
                <td class='viewer__label'>{formatAsHex(instruction, 8)}</td>
            </tr>
        {:else}
            <tr class='viewer__row'>
                <td  class='viewer__label'>No program loaded.</td>
            </tr>
        {/each}
    </tbody>
</table>
