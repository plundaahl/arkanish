export const Flag = {
    makeBigintFlagFactory: () => {
        let next = 1n
        return (): bigint => {
            let current = next
            next = next << 1n
            return current
        }
    },
    makeNumberFlagFactory: () => {
        let next = 1
        return (): number => {
            let current = next
            next = next << 1
            return current
        }
    },
    hasBigintFlags: (bitfield: bigint, ...flags: bigint[]): boolean => {
        let mask = 0n
        for (const flag of flags) {
            mask |= flag
        }
        return (bitfield & mask) === mask
    },
    hasNumberFlags: (bitfield: number, ...flags: number[]): boolean => {
        let mask = 0
        for (const flag of flags) {
            mask |= flag
        }
        return (bitfield & mask) === mask
    },
}