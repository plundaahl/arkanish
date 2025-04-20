export const ExtraMath = {
    FULL_CIRCLE: Math.PI * 2,
    rollBetween: (from: number, to: number): number => from + (Math.random() * (to - from)),
    positiveOrNegative: (): number => Math.random() < 0.5 ? -1 : 1,
    rollOneOf: <T>(...options: [T, number?][]): T => {
        let total = 0
        for (const [_, weight] of options) {
            total += weight || 0
        }
        const roll = Math.floor(Math.random() * total)
        let prevTotal = 0
        for (const [value, weight] of options) {
            const nextTotal = prevTotal + (weight === undefined ? 1 : weight)
            if (prevTotal <= roll && roll < nextTotal) {
                return value
            }
            prevTotal = nextTotal
        }
        throw new Error(`Should not get here.  Total was [${total}] but rolled [${roll}].`)
    },
    modulo(value: number, cap: number): number {
        let result = value % cap
        if (result < 0) {
            result += cap
        }
        if (result === -0) {
            return 0
        }
        return result
    },
    moduloBetween(value: number, min: number, max: number): number {
        return ExtraMath.modulo(value - min, max - min) + min
    },
    clamp(min: number, current: number, max: number): number {
        return Math.min(Math.max(min, current), max)
    },
}
