<script>
    import { program } from '$lib/riscv/state.svelte.js'
    import { pipeline } from '$lib/riscv/state.svelte.js'
    import formatAsHex from '$lib/helpers/hex.js'

    const updateRegister = (register, value) => {
        // Check if valid numeric input, then load into register
        if (value) {
            registersInt.set(register, value)

            // Log the change
            console.log('Set register ' + register + ' to ' + parseInt(value, 16))
        }
    }
</script>

<table class='viewer'>
    <tbody>
        <tr class='viewer__row'>
            <th class='viewer__label viewer__label--header'>Instruction</th>
            {#each { length: pipeline.cycle - 1 } as _, i}
                <th class='viewer__label'>
                    Cycle {i+1}
                </th>
            {/each}
        </tr>

        {#each Object.entries(pipeline.stageCycles) as [key, value]}
            <tr class='viewer__row'>
                <td class='viewer__label'>
                    {program.data.lines[program.data.instructions.indexOf(Number(key) >>> 0)]}
                </td>
                {#each { length: pipeline.cycle - 1 } as _, i}
                    <td class='viewer__label'>
                        {#if value[0] == i+1}IF
                        {:else if value[1] == i+1}ID
                        {:else if value[2] == i+1}EX
                        {:else if value[3] == i+1}MEM
                        {:else if value[4] == i+1}WB
                        {:else if value[0] < i+1 && value[4] > i+1}*
                        {/if}
                    </td>
                {/each}
            </tr>
        {/each}
    </tbody>
</table>
