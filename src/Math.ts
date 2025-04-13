export const ExtraMath = {
    rollBetween: (from: number, to: number): number => from + (Math.random() * (to - from)),
    positiveOrNegative: (): number => Math.random() < 0.5 ? -1 : 1,
}
