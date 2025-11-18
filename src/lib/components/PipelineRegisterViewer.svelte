<script>
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
            <th class='viewer__label viewer__label--header'>Register</th>
            <th class='viewer__label viewer__label--header'>Data</th>
        </tr>

        {#each Object.entries(pipeline.IF_ID) as [key, value]}
            <tr class='viewer__row'>
                <td class='viewer__label'>
                    <span style="color: gray">IF/ID.</span>{key}
                </td>
                <td class='viewer__label'>{formatAsHex(value, 8)}</td>
            </tr>
        {/each}

        <tr><td><br /></td></tr> <!-- TODO: This sucks -->

        {#each Object.entries(pipeline.ID_EX) as [key, value]}
            <tr class='viewer__row'>
                <td class='viewer__label'>
                    <span style="color: gray">ID/EX.</span>{key}
                </td>
                <td class='viewer__label'>{formatAsHex(value, 8)}</td>
            </tr>
        {/each}

        <tr><td><br /></td></tr>

        {#each Object.entries(pipeline.EX_MEM) as [key, value]}
            <tr class='viewer__row'>
                <td class='viewer__label'>
                    <span style="color: gray">EX/MEM.</span>{key}
                </td>
                <td class='viewer__label'>{formatAsHex(value, 8)}</td>
            </tr>
        {/each}

        <tr><td><br /></td></tr>

        {#each Object.entries(pipeline.MEM_WB) as [key, value]}
            <tr class='viewer__row'>
                <td class='viewer__label'>
                    <span style="color: gray">MEM/WB.</span>{key}
                </td>
                <td class='viewer__label'>{formatAsHex(value, 8)}</td>
            </tr>
        {/each}

        <tr><td><br /></td></tr>

        {#each Object.entries(pipeline.WB) as [key, value]}
            <tr class='viewer__row'>
                <td class='viewer__label'>
                    <span style="color: gray">WB.</span>{key}
                </td>
                <td class='viewer__label'>{formatAsHex(value, 8)}</td>
            </tr>
        {/each}
    </tbody>
</table>
