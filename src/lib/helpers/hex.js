/** @return Hex string representation of a numeric value, padded with zeroes */
export default (value, pad) => {
    return '0x' + value.toString(16).toUpperCase().padStart(pad, '0')
}
