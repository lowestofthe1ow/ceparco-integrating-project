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

<!-- Moves the addresses window up by 1 address -->
<!-- TODO: Check for out-of-range errors -->
<button on:click={() => {startingAddress--;}}>&uarr;</button>

<!-- Moves the addresses window down by 1 address -->
<!-- TODO: Check for out-of-range errors -->
<button on:click={() => {startingAddress++;}}>&darr;</button>

<!-- Mechanism to jump to an address -->
<!-- TODO: Check for out-of-range errors -->
<input type='text'
    on:input={(e) => {startingAddress = parseInt(e.target.value, 16)}}
    value={formatAsHex(startingAddress, 4)}/>

<table>
    {#each getMemorySlice() as value, index}
        <tr>
            <!-- Provides direct edit access to all memory addresses -->
            <!-- Address label -->
            <td>{formatAsHex(startingAddress + index, 4)}</td>
            <!-- Value field -->
            <td>
                <input type='text'
                    on:input={(e) =>
                        memory.storeByte(startingAddress + index, parseInt(e.target.value, 16))}
                    value={formatAsHex(value, 2)} />
            </td>
        </tr>
    {/each}
</table>


