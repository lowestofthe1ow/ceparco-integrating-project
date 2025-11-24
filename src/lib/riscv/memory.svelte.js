export class Memory {
    memory = $state(new Array(256).fill(0));

    clear() {
        this.memory.fill(0);
    }

    /** Stores an n-byte integer value at an address */
    storeInteger(address, value, n) {
        // TODO: Check for if value is in range
        if(value >= 0 && value <= 0xFFFFFFFF){
            for (let i = 0; i < n; i++) {
                this.memory[address + i] = (((value >> i * 8)) & 0xFF);
            }   
        }
    }

    /** @return The n-byte integer value stored at an address */
    readInteger(address, n) {
        // TODO: Check for if value is in range

        // This seems to work with signed integers as well
        let retval = 0;

        for (let i = 0; i < n; i++) {
            // The >>> 0 will keep the value as an unsigned integer
            retval += (this.memory[address + i] << (i * 8)) >>> 0;
        }

        return retval;
    }

    storeByte(address, value) {

        if(value >= 0 && value <= 255){
            this.memory[address] = value;
        } else {
            // Overflow
            this.memory[address] = 0;
        }
    }
}
