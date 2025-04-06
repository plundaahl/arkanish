import { Vector2 } from "./Vector"

const TypeNullBB = 0 as const
const TypeAABB = 1 as const
const TypeCircleBB = 2 as const

export const BoundingBoxTypes = {
    AABB: TypeAABB,
    NULL: TypeNullBB,
    CIRCLE: TypeCircleBB,
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

export type CircleBB = {
    type: typeof TypeCircleBB,
    x: number,
    y: number,
    r: number,
}

export type BoundingBox = NullBB | AABB | CircleBB

export const BoundingBox = {
    createAabb: (left: number, top: number, width: number, height: number): AABB => {
        return { type: TypeAABB, left, top, width, height}
    },
    createNullBb: () => ({ type: TypeNullBB }),
    createCircleBb: (x: number, y: number, r: number): CircleBB => ({ type: TypeCircleBB, x, y, r: Math.abs(r) }),
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
                {
                    const destBox = dest as AABB
                    destBox.left += xOffset
                    destBox.top += yOffset
                    return
                }
            case TypeCircleBB:
                {
                    const destBox = dest as CircleBB
                    destBox.x += xOffset
                    destBox.y += yOffset
                }
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
        if (a.type === TypeCircleBB && b.type === TypeCircleBB) {
            return intersectsCircleWithCircle(a, b)
        }
        if (a.type === TypeAABB && b.type === TypeCircleBB) {
            return intersectsAabbWithCircle(a, b)
        }
        if (a.type === TypeCircleBB && b.type === TypeAABB) {
            return intersectsAabbWithCircle(b, a)
        }
        throw new Error(`Unrecognized types [${a.type}, ${b.type}]`)
    },
    leftOf: (...boxes: BoundingBox[]): number => {
        let leftMost = undefined
        for (const box of boxes) {
            if (box.type === TypeAABB) {
                leftMost = leftMost === undefined ? box.left : Math.min(leftMost, box.left)
            } else if (box.type === TypeCircleBB) {
                leftMost = leftMost === undefined ? box.x - box.r : Math.min(leftMost, box.x - box.r)
            }
        }
        return leftMost || 0
    },
    rightOf: (...boxes: BoundingBox[]): number => {
        let rightMost = undefined
        for (const box of boxes) {
            if (box.type === TypeAABB) {
                const right =  box.left + box.width
                rightMost = rightMost === undefined ? right : Math.max(rightMost, right)
            } else if (box.type === TypeCircleBB) {
                rightMost = rightMost === undefined ? box.x + box.r : Math.min(rightMost, box.x + box.r)
            }
        }
        return rightMost || 0
    },
    topOf: (...boxes: BoundingBox[]): number => {
        let topMost = undefined
        for (const box of boxes) {
            if (box.type === TypeAABB) {
                topMost = topMost === undefined ? box.top : Math.min(topMost, box.top)
            } else if (box.type === TypeCircleBB) {
                topMost = topMost === undefined ? box.y - box.r : Math.min(topMost, box.y - box.r)
            }
        }
        return topMost || 0
    },
    bottomOf: (...boxes: BoundingBox[]): number => {
        let bottomMost = undefined
        for (const box of boxes) {
            if (box.type === TypeAABB) {
                const bottom = box.top + box.height
                bottomMost = bottomMost === undefined ? bottom : Math.max(bottomMost, bottom)
            } else if (box.type === TypeCircleBB) {
                bottomMost = bottomMost === undefined ? box.y + box.r : Math.min(bottomMost, box.y + box.r)
            }
        }
        return bottomMost || 0
    },
    centerOf: (box: BoundingBox): Vector2 => {
        if (box.type === TypeNullBB) {
            return Vector2.fromCoordinates(0, 0)
        } else if (box.type === TypeAABB) {
            return Vector2.fromCoordinates(box.left + (box.width * 0.5), box.top + (box.height * 0.5))
        } else if (box.type === TypeCircleBB) {
            return Vector2.fromCoordinates(box.x, box.y)
        }
        throw new Error(`Unrecognized bounding box [${JSON.stringify(box)}].`)
    },
}

function distanceBetween(x1: number, y1: number, x2: number, y2: number) {
    const xDistance = x1 - x2
    const yDistance = y1 - y2
    return Math.sqrt((xDistance * xDistance) + (yDistance * yDistance))
}

function intersectsAabbWithAabb(a: AABB, b: AABB): boolean {
    return (a.left + a.width) >= b.left && (b.left + b.width) >= a.left
        && (a.top + a.height) >= b.top && (b.top + b.height) >= a.top
}

function intersectsCircleWithCircle(a: CircleBB, b: CircleBB): boolean {
    return distanceBetween(a.x, a.y, b.x, b.y) <= a.r + b.r
}

function intersectsAabbWithCircle(a: AABB, b: CircleBB): boolean {
    // See https://gamedev.stackexchange.com/a/178154
    const circleCenter = BoundingBox.centerOf(b)
    const aabbCenter = BoundingBox.centerOf(a)

    const aabbToCircle = Vector2.subtract(circleCenter, aabbCenter)
    const aabbBoundsX = a.width * 0.5
    const aabbBoundsY = a.height * 0.5
    const clampedX = Math.min(Math.max(-aabbBoundsX, Vector2.xOf(aabbToCircle)), aabbBoundsX)
    const clampedY = Math.min(Math.max(-aabbBoundsY, Vector2.yOf(aabbToCircle)), aabbBoundsY)
    const closestPointOnAabb = Vector2.add(aabbCenter, Vector2.fromCoordinates(clampedX, clampedY))
    const distance = Vector2.subtract(closestPointOnAabb, circleCenter)

    return Math.min(Vector2.magnitudeOf(distance), Vector2.magnitudeOf(aabbToCircle)) <= b.r
}
