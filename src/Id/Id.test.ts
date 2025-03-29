import { IDX_MASK, GEN_MASK, FIRST_GEN_BIT, MAX_GEN_BIT, Id, GEN_START } from './Id'

test('IDX_MASK', () => {
    for (let i = 0; i < FIRST_GEN_BIT; i++) {
        expect(IDX_MASK & (1 << i)).toBeGreaterThan(0)
    }

    for (let i = FIRST_GEN_BIT; i < MAX_GEN_BIT; i++) {
        expect(IDX_MASK & (1 << i)).toEqual(0)
    }
})

test('GEN_MASK', () => {
    for (let i = 0; i < FIRST_GEN_BIT; i++) {
        expect(GEN_MASK & (1 << i)).toEqual(0)
    }

    for (let i = FIRST_GEN_BIT; i < MAX_GEN_BIT; i++) {
        expect(GEN_MASK & (1 << i)).toBeGreaterThan(0)
    }
})

test('GEN_MASK and IDX_MASK', () => {
    expect(GEN_MASK & IDX_MASK).toEqual(0)
    expect(GEN_MASK | IDX_MASK).toBeGreaterThan(0)
})

describe('incrementGen', () => {
    test('Number with no generation', () => {
        const id = Id.incrementGen(0)
        expect(id & GEN_MASK).toEqual(1 << FIRST_GEN_BIT)
        expect(id & IDX_MASK).toEqual(0)
    })

    test('Generations wrap', () => {
        const id = Id.incrementGen(1 | GEN_MASK)
        expect(id).toEqual(1 | GEN_START)
    })
})
