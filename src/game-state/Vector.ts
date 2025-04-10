const VEC2_X = 0
const VEC2_Y = 1
export type Vector2 = [number, number]

const FULL_CIRCLE = Math.PI * 2

export const Vector2 = {
    createFromCoordinates: (x: number, y: number): Vector2 => [x, y],
    createFromAngle: (angle: number, magnitude: number): Vector2 => [Math.cos(angle) * magnitude, Math.sin(angle) * magnitude],
    createFromVec: (vec: Vector2): Vector2 => [vec[VEC2_X], vec[VEC2_Y]],
    setToCoordinates: (vec: Vector2, x: number, y: number): Vector2 => {
        vec[VEC2_X] = x
        vec[VEC2_Y] = y
        return vec
    },
    setToVec: (vec: Vector2, source: Vector2): Vector2 => {
        vec[VEC2_X] = source[VEC2_X]
        vec[VEC2_Y] = source[VEC2_Y]
        return vec
    },
    scaleBy: (vec: Vector2, scale: number): Vector2 => {
        vec[VEC2_X] *= scale
        vec[VEC2_Y] *= scale
        return vec
    },
    scaleToUnit: (vec: Vector2): Vector2 => {
        const mag = Vector2.magnitudeOf(vec)
        if (mag != 0) {
            const scale = 1 / mag
            vec[VEC2_X] *= scale
            vec[VEC2_Y] *= scale
        }
        return vec
    },
    xOf: (vec: Vector2): number => vec[VEC2_X],
    yOf: (vec: Vector2): number => vec[VEC2_Y],
    magnitudeOf: (vec: Vector2): number => Math.sqrt((vec[VEC2_X] * vec[VEC2_X]) + (vec[VEC2_Y] * vec[VEC2_Y])),
    angleOf: (vec: Vector2): number => modulo(Math.atan2(vec[VEC2_Y], vec[VEC2_X]), FULL_CIRCLE),
    angleBetween: (a: Vector2, b: Vector2): number => modulo(Vector2.angleOf(b) - Vector2.angleOf(a), FULL_CIRCLE),
    distanceBetween: (a: Vector2, b: Vector2): number => {
        const xDist = a[VEC2_X] - b[VEC2_X]
        const yDist = a[VEC2_Y] - b[VEC2_Y]
        return Math.sqrt((xDist * xDist) + (yDist * yDist))
    },
    rotatedBy: (vec: Vector2, rotation: number): Vector2 => Vector2.createFromAngle(Vector2.angleOf(vec) + rotation, Vector2.magnitudeOf(vec)),
    rotateBy: (vec: Vector2, rotation: number): Vector2 => {
        const curAngle = Vector2.angleOf(vec)
        const curMag = Vector2.magnitudeOf(vec)
        vec[VEC2_X] = Math.cos(curAngle + rotation) * curMag
        vec[VEC2_Y] = Math.sin(curAngle + rotation) * curMag
        return vec
    },
    subtracted: (a: Vector2, b: Vector2): Vector2 => {
        return [Vector2.xOf(a) - Vector2.xOf(b), Vector2.yOf(a) - Vector2.yOf(b)]
    },
    subtract: (a: Vector2, b: Vector2): Vector2 => {
        a[VEC2_X] -= b[VEC2_X]
        a[VEC2_Y] -= b[VEC2_Y]
        return a
    },
    added: (a: Vector2, b: Vector2): Vector2 => {
        return [Vector2.xOf(a) + Vector2.xOf(b), Vector2.yOf(a) + Vector2.yOf(b)]
    },
    add: (a: Vector2, b: Vector2): Vector2 => {
        a[VEC2_X] += b[VEC2_X]
        a[VEC2_Y] += b[VEC2_Y]
        return a
    },
    addCoordinates: (vec: Vector2, x: number, y: number): Vector2 => {
        vec[VEC2_X] += x
        vec[VEC2_Y] += y
        return vec
    },
    dot: (a: Vector2, b: Vector2): number => (Vector2.xOf(a) * Vector2.xOf(b)) + (Vector2.yOf(a) * Vector2.yOf(b)),
    unitFrom: (vec: Vector2): Vector2 => {
        const scale = 1 / Vector2.magnitudeOf(vec)
        return [Vector2.xOf(vec) * scale, Vector2.yOf(vec) * scale]
    },
    mean: (...vectors: Vector2[]): Vector2 => {
        const sum = vectors.reduce(Vector2.added, Vector2.createFromCoordinates(0, 0))
        return [sum[VEC2_X] / vectors.length, sum[VEC2_Y] / vectors.length]
    },
}

export function modulo(value: number, cap: number): number {
    let result = value % cap
    return result < 0
        ? cap + result
        : result
}