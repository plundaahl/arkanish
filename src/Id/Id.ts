export const FIRST_GEN_BIT = 16
export const MAX_GEN_BIT = 30

export const GEN_START = 1 << FIRST_GEN_BIT;
export const IDX_MASK = GEN_START - 1;
export const GEN_MASK = (() => {
    let mask = GEN_START
    for (let i = FIRST_GEN_BIT; i < MAX_GEN_BIT; i++) {
        mask = (mask << 1) | GEN_START
    }
    return mask
})()
export const GEN_MAX = GEN_MASK;

export const Id = {
    init: (id: number): number => {
        const index = Id.indexOf(id)
        if (index !== id) {
            throw new Error(`Out-of-bounds ID initializer ${id} does not conform to mask ${IDX_MASK}`)
        }
        return index | GEN_START
    },
    incrementGen: (id: number): number => {
        let gen = Id.generationOf(id)
        if (gen === GEN_MASK) {
            gen = GEN_START
        } else {
            gen += GEN_START
        }
        return Id.indexOf(id) | gen
    },
    generationOf: (id: number): number => id & GEN_MASK,
    indexOf: (id: number): number => id & IDX_MASK,
}
