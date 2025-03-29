import { Flag } from './Flag'

describe('hasFlags', () => {
    test('full overlap should return true', () => {
        const flag = Flag.makeBigintFlagFactory()
        const a = flag()
        const b = flag()
        const bitfield = a | b
        expect(Flag.hasBigintFlags(bitfield, a, b)).toBe(true)
    })

    test('partial overlap returns false', () => {
        const flag = Flag.makeBigintFlagFactory()
        const a = flag()
        const b = flag()
        const c = flag()
        const bitfield = a | b
        expect(Flag.hasBigintFlags(bitfield, a, b, c)).toBe(false)
    })

    test('no overlap returns false', () => {
        const flag = Flag.makeBigintFlagFactory()
        const a = flag()
        const b = flag()
        const c = flag()
        const bitfield = c
        expect(Flag.hasBigintFlags(bitfield, a, b)).toBe(false)
    })

    test('check for one of many flags', () => {
        const flag = Flag.makeBigintFlagFactory()
        const a = flag()
        const b = flag()
        const bitfield = a | b
        expect(Flag.hasBigintFlags(bitfield, a)).toBe(true)
    })
})