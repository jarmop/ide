export function leftPad(str: string, n: number) {
    let pStr = str;
    while (pStr.length < n) {
        pStr = "0" + pStr;
    }
    return pStr;
}

/**
 * Only supports max 32 bits
 */
export function leMax32(n: number, bits: number): number[] {
    const arr: number[] = [];
    for (let i = 0; i < bits; i += 8) {
        arr.push(n >> i);
    }

    // Cast to uint8Array to get only the first byte of each number
    return [...(new Uint8Array(arr))];
}

export function le(n: number, bits: number): number[] {
    if (bits > 32) {
        return [...leMax32(n, 32), ...leMax32(0, bits - 32)];
    }

    return leMax32(n, bits);
}
