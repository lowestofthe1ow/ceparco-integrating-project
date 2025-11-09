export class Memory {
    memory = $state(new Array(65536));

    /** Stores an n-byte integer value at an address */
    storeInteger(address, value, n) {
        // TODO: Check for if value is in range

        for (let i = 0; i < n; i++) {
            this.memory[address + i] = (value >> i * 8) & 0xFF;
        }
    }

    /** @return The n-byte integer value stored at an address */
    readInteger(address, n) {
        // This seems to work with signed integers as well
        let retval = 0;

        for (let i = 0; i < n; i++) {
            retval += this.memory[address + i] << (i * 8);
        }

        return retval;
    }
}
