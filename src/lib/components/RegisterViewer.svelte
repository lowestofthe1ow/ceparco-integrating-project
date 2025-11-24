<script>
    import { registersInt } from '$lib/riscv/state.svelte.js'
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

<div class='viewer'>
    <div class='viewer__row'>
        <div class='viewer__label viewer__label--header'>Register</div>
        <div class='viewer__label viewer__label--header' style="text-align: right">Data</div>
    </div>

    {#each registersInt.entries() as [register, value], index}
        <div class='viewer__row'>
            <!-- Provides direct edit access to all registers -->
            <!-- Register label -->
            <div class='viewer__label'>{register}&nbsp;<span style="color: gray">(x{index})</span></div>
            <!-- Value field -->
            <div>
                <input
                    class='viewer__input'
                    type='text'
                    disabled={index == 0}
                    on:input={(e) => updateRegister(register, parseInt(e.target.value, 16))}
                    value={formatAsHex(value, 8)} />
            </div>
        </div>
    {/each}
</div>
