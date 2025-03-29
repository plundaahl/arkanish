const TypeNullBB = 0 as const
const TypeAABB = 1 as const

export const BoundingBoxTypes = {
    AABB: TypeAABB,
    Null: TypeNullBB,
}

export type NullBB = {
    type: typeof TypeNullBB
}
const NULL_BB: NullBB = { type: TypeNullBB }

export type AABB = {
    type: typeof TypeAABB,
    left: number,
    top: number,
    width: number,
    height: number,
}

export type BoundingBox = NullBB | AABB

export const BoundingBox = {
    createAabb: (left: number, top: number, width: number, height: number): AABB => {
        return { type: TypeAABB, left, top, width, height}
    },
    createNullBb: () => ({ type: TypeNullBB }),
    clone: (box: BoundingBox): BoundingBox => {
        return Object.assign({}, box)
    },
    transform: (source: BoundingBox, dest: BoundingBox, xOffset: number, yOffset: number) => {
        for (const prop of Object.getOwnPropertyNames(dest)) {
            delete (dest as any)[prop]
        }
        Object.assign(dest, source)
        switch (source.type) {
            case TypeNullBB:
                return
            case TypeAABB:
                const destBox = dest as AABB
                destBox.left += xOffset
                destBox.top += yOffset
        }
    },
    intersects: (a: BoundingBox, b: BoundingBox): boolean => {
        if (a.type === TypeNullBB || b.type === TypeNullBB) {
            return false
        }
        if (a.type === TypeAABB) {
            if (b.type === TypeAABB) {
                return intersectsAabbWithAabb(a, b)
            }
        }
        throw new Error(`Unrecognized types [${a.type}, ${b.type}]`)
    },
}

function intersectsAabbWithAabb(a: AABB, b: AABB): boolean {
    return (a.left + a.width) >= b.left && (b.left + b.width) >= a.left
        && (a.top + a.height) >= b.top && (b.top + b.height) >= a.top
}
