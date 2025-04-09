import { modulo, Vector2 } from "./Vector"

const TypeNullBB = 0 as const
const TypeAABB = 1 as const
const TypeCircleBB = 2 as const
const TypeConvexPolyBB = 3 as const

export const BoundingBoxTypes = {
    NULL: TypeNullBB,
    AABB: TypeAABB,
    CIRCLE: TypeCircleBB,
    CONVEX_POLY: TypeConvexPolyBB,
}

export type NullBB = {
    type: typeof TypeNullBB
}

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

export type ConvexPolyBB = {
    type: typeof TypeConvexPolyBB,
    vertexes: Vector2[],
}

export type BoundingBox = NullBB | AABB | CircleBB | ConvexPolyBB

export const BoundingBox = {
    createAabb: (left: number, top: number, width: number, height: number): AABB => {
        return { type: TypeAABB, left, top, width, height}
    },
    createNullBb: () => ({ type: TypeNullBB }),
    createCircleBb: (x: number, y: number, r: number): CircleBB => ({ type: TypeCircleBB, x, y, r: Math.abs(r) }),
    createConvexPolyBb: (...vertexes: Vector2[]): ConvexPolyBB => {
        if (vertexes.length < 3) {
            throw new Error(`Convex polygons must have at least 3 points.  You provided [${vertexes.length}].`)
        }

        const center = Vector2.mean(...vertexes)

        let totalAngle = 0
        for (let i = 0; i < vertexes.length; i++) {
            const v1 = vertexes[i]
            const v2 = vertexes[(i + 1) % (vertexes.length)]
            const angleBetween = Vector2.angleBetween(Vector2.subtract(v1, center), Vector2.subtract(v2, center))
            totalAngle += angleBetween <= Math.PI ? angleBetween : angleBetween - (Math.PI * 2)
        }
        if (totalAngle < 0) {
            vertexes.reverse()
        }

        // Make sure it's convex
        const edges: Vector2[] = []
        for (let i = 0; i < vertexes.length; i++) {
            const v1 = vertexes[i]
            const v2 = vertexes[(i + 1) % (vertexes.length)]
            edges.push(Vector2.subtract(v2, v1))
        }

        for (let i = 0; i < edges.length; i++) {
            const edge1 = edges[i]
            const edge2 = edges[(i + 1) % (edges.length)]
            const angle = Vector2.angleBetween(edge1, edge2)
            if (!(0 <= angle && angle <= Math.PI)) {
                throw new Error([
                    `Not a convex polygon.`,
                    `Angle at vertex [${i}] was [${angle}].`,
                    `Vertexes: [${JSON.stringify(vertexes)}].`,
                    `Their centered angles were [${vertexes.map(v => Vector2.angleOf(Vector2.subtract(v, center))).join(', ')}]`,
                    `Edges: [${JSON.stringify(edges)}].`].join('  '))
            }
        }

        return { type: TypeConvexPolyBB, vertexes }
    },
    clone: (box: BoundingBox): BoundingBox => {
        switch (box.type) {
            case TypeNullBB:
            case TypeAABB:
            case TypeCircleBB:
                return Object.assign({}, box)
            case TypeConvexPolyBB:
                return {
                    ...box,
                    vertexes: box.vertexes.map((vertex) => [...vertex]),
                }
            default:
                throw new Error(`Unrecognized BoundingBox type.`)
        }
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
                    return
                }
            case TypeConvexPolyBB:
                {
                    const destBox = dest as ConvexPolyBB
                    // TODO:  This is awful.  Shouldn't need to re-allocate brand new vertexes every time.
                    destBox.vertexes = []
                    for (const vertex of source.vertexes) {
                        destBox.vertexes.push([vertex[0] + xOffset, vertex[1] + yOffset])
                    }
                    return
                }
        }
    },
    intersects: (...boxes: [BoundingBox, BoundingBox]): boolean => {
        boxes.sort((a, b) => a.type - b.type)
        const [a, b] = boxes

        if (a.type === TypeNullBB || b.type === TypeNullBB) {
            return false
        }

        if (a.type === TypeAABB) {
            if (b.type === TypeAABB) {
                return intersectsAabbWithAabb(a, b)
            } else if (b.type === TypeCircleBB) {
                return intersectsAabbWithCircle(a, b)
            } else if (b.type === TypeConvexPolyBB) {
                return intersectsConvexPolyWithAabb(b, a)
            }
        } else if (a.type === TypeCircleBB) {
            if (b.type === TypeCircleBB) {
                return intersectsCircleWithCircle(a, b)
            } else if (b.type === TypeConvexPolyBB) {
                return intersectsConvexPolyWithCircle(b, a)
            }
        } else if (a.type === TypeConvexPolyBB) {
            if (b.type === TypeConvexPolyBB) {
                return intersectsConvexPolyWithConvexPoly(a, b)
            }
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

function intersectsConvexPolyWithConvexPoly(...polys: [ConvexPolyBB, ConvexPolyBB]): boolean {
    for (let p = 0; p < polys.length; p++) {
        const a = polys[p]
        const b = polys[(p + 1) % polys.length]

        for (let i = 0; i < a.vertexes.length; i++) {
            const normal = Vector2.scaleToUnit(
                Vector2.rotateBy(
                    Vector2.subtract(a.vertexes[(i + 1) % a.vertexes.length], a.vertexes[i]),
                    Math.PI * -0.5))
            
            let aMin = Number.MAX_SAFE_INTEGER
            let aMax = Number.MIN_SAFE_INTEGER
            for (const v of a.vertexes) {
                const dot = Vector2.dot(v, normal)
                aMin = Math.min(aMin, dot)
                aMax = Math.max(aMax, dot)
            }
            
            let bMin = Number.MAX_SAFE_INTEGER
            let bMax = Number.MIN_SAFE_INTEGER
            for (const v of b.vertexes) {
                const dot = Vector2.dot(v, normal)
                bMin = Math.min(bMin, dot)
                bMax = Math.max(bMax, dot)
            }

            if (aMax < bMin || bMax < bMin) {
                return false
            }
        }
    }
    return true
}

function intersectsConvexPolyWithCircle(a: ConvexPolyBB, b: CircleBB): boolean {
    return false
}

function intersectsConvexPolyWithAabb(a: ConvexPolyBB, b: AABB): boolean {
    const bAsPoly = {
        type: TypeConvexPolyBB,
        vertexes: [
            Vector2.fromCoordinates(b.left + b.width, b.top + b.height),
            Vector2.fromCoordinates(b.left + b.width, b.top),
            Vector2.fromCoordinates(b.left, b.top),
            Vector2.fromCoordinates(b.left, b.top + b.height),
        ]
    }
    return intersectsConvexPolyWithConvexPoly(a, bAsPoly)
}
