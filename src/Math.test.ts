import { ExtraMath } from './Math'

describe('modulo', () => {
    test.each([
        [-21, 5, 4],
        [5, 5, 0],
        [-5, 5, 0],
    ])('Expected', (input, modulo, expected) => {
        expect(ExtraMath.modulo(input, modulo)).toEqual(expected)
    })
})

describe('moduloBetween', () => {
    test.each([
        [-1, -5, 5, -1],
        [-5, -5, 5, -5],
        [-6, -5, 5, 4],
        [6, -5, 5, -4],
        [5, -5, 5, -5],
    ])('Expected', (input, min, max, expected) => {
        expect(ExtraMath.moduloBetween(input, min, max)).toEqual(expected)
    })
})