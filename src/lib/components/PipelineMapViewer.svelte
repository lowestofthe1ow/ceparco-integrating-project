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

<div class='viewer' style="overflow-x: auto; width: auto">
    <table style='display: table; width: 100%; table-layout: fixed;'>
        <tbody>
            <tr class='viewer__row' style="display: table;">
                <th class='viewer__label viewer__label--header' style="min-width: 120px; max-width: 150px;">Address</th>
                <th class='viewer__label viewer__label--header' style="min-width: 150px; max-width: 150px;">Instruction</th>
                {#each { length: pipeline.cycle - 1 } as _, i}
                    <th class='viewer__label' style="min-width: 30px;  text-align: center;">
                        {i+1}
                    </th>
                {/each}
            </tr>

            {#each pipeline.stageCycles as row}
                {#if row.instruction}
                    <tr class='viewer__row' style="display: table;">
                        <td class='viewer__label' style='min-width: 120px; max-width: 150px;'>
                            {formatAsHex(program.data?.instructions.indexOf(Number(row.instruction) >>> 0) * 4 + 0x80, 8)}
                        </td>

                        <td class='viewer__label' style='min-width: 150px; max-width: 150px;'>
                            {program.data?.lines[program.data.instructions.indexOf(Number(row.instruction) >>> 0)]}
                        </td>
                        {#each { length: pipeline.cycle - 1 } as _, i}
                            <td class='viewer__label' style='min-width: 30px; text-align: center;'>
                                {#if row.cycles?.indexOf(i+1) % 5 == 0}IF
                                {:else if row.cycles?.indexOf(i+1) % 5 == 1}ID
                                {:else if row.cycles?.indexOf(i+1) % 5 == 2}EX
                                {:else if row.cycles?.indexOf(i+1) % 5 == 3}MEM
                                {:else if row.cycles?.indexOf(i+1) % 5 == 4}WB
                                {/if}
                            </td>
                        {/each}
                    </tr>
                {/if}
            {/each}
        </tbody>
    </table>
</div>
