const MASK = 1 | 2 | 4 | 8

export function abToStr(buffer: ArrayBuffer, from: number = 0, to: number | undefined = undefined): string {
    const view = new DataView(buffer, from, to === undefined ? undefined : to)
    let result: number[] = []
    const bytes: number[] = []
    for (let i = 0; i < view.byteLength; i++) {
        const num = view.getInt8(i)
        const left = (num >> 4) & MASK
        const right = num & MASK
        bytes.push(num)
        result.push(left, right)
    }
    return result.map(num => num.toString(16)).join('')
}

export function strToAb(binString: string, destBuffer: ArrayBuffer, offset: number) {
    const view = new DataView(destBuffer, offset, binString.length * 0.5)
    for (let i = 0; i < binString.length * 0.5; i++) {
        const left = parseInt(binString[i * 2], 16) << 4
        const right = parseInt(binString[(i * 2) + 1], 16)
        view.setUint8(i, left | right)
    }
}