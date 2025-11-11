<script>
    import { memory } from '$lib/riscv/state.svelte.js'
    import formatAsHex from '$lib/helpers/hex.js'

    let startingAddress = 0;

    /** @return An array of 4 values in memory */
    const getMemorySlice = () => {
        let slice = memory.memory.slice(startingAddress, startingAddress+8);
        return slice.map(value => value);
    }
</script>

<div class='viewer'>
    <div class='viewer__row'>
        <!-- Moves the addresses window up by 1 address -->
        <!-- TODO: Check for out-of-range errors -->
        <button class='viewer__button' on:click={() => {startingAddress--;}}>&larr;</button>
        <!-- Mechanism to jump to an address -->
        <!-- TODO: Check for out-of-range errors -->
        <input class='viewer__input viewer__input--goto' type='text'
            on:input={(e) => {startingAddress = parseInt(e.target.value, 16)}}
            value={formatAsHex(startingAddress, 4)}/>
        <!-- Moves the addresses window down by 1 address -->
        <!-- TODO: Check for out-of-range errors -->
        <button class='viewer__button' on:click={() => {startingAddress++;}}>&rarr;</button>
    </div>

    {#each getMemorySlice() as value, index}
        <div class='viewer__row'>
            <!-- Provides direct edit access to all memory addresses -->
            <!-- Address label -->
            <div class='viewer__label'>{formatAsHex(startingAddress + index, 4)}</div>
            <!-- Value field -->
            <div>
                <input
                    class='viewer__input'
                    type='text'
                    on:input={(e) =>
                        memory.storeByte(startingAddress + index, parseInt(e.target.value, 16))}
                    value={formatAsHex(value, 2)} />
            </div>
        </div>
    {/each}
</div>


