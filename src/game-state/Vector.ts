const VEC2_X = 0
const VEC2_Y = 1
export type Vector2 = [number, number]

const FULL_CIRCLE = Math.PI * 2

export const Vector2 = {
    fromCoordinates: (x: number, y: number): Vector2 => [x, y],
    fromAngle: (angle: number, magnitude: number): Vector2 => [Math.cos(angle) * magnitude, Math.sin(angle) * magnitude],
    fromVec: (vec: Vector2): Vector2 => [vec[VEC2_X], vec[VEC2_Y]],
    xOf: (vec: Vector2): number => vec[VEC2_X],
    yOf: (vec: Vector2): number => vec[VEC2_Y],
    magnitudeOf: (vec: Vector2): number => Math.sqrt(
        (Vector2.xOf(vec) * Vector2.xOf(vec))
        + (Vector2.yOf(vec) * Vector2.yOf(vec))
    ),
    angleOf: (vec: Vector2): number => modulo(Math.atan2(Vector2.yOf(vec), Vector2.xOf(vec)), FULL_CIRCLE),
    angleBetween: (a: Vector2, b: Vector2): number => modulo(Vector2.angleOf(b) - Vector2.angleOf(a), FULL_CIRCLE),
    rotatedBy: (vec: Vector2, rotation: number): Vector2 => Vector2.fromAngle(Vector2.angleOf(vec) + rotation, Vector2.magnitudeOf(vec)),
    rotateBy: (vec: Vector2, rotation: number): Vector2 => {
        const curAngle = Vector2.angleOf(vec)
        const curMag = Vector2.magnitudeOf(vec)
        vec[VEC2_X] = Math.cos(curAngle + rotation) * curMag
        vec[VEC2_Y] = Math.sin(curAngle + rotation) * curMag
        return vec
    },
    subtract: (a: Vector2, b: Vector2): Vector2 => {
        return [Vector2.xOf(a) - Vector2.xOf(b), Vector2.yOf(a) - Vector2.yOf(b)]
    },
    add: (a: Vector2, b: Vector2): Vector2 => {
        return [Vector2.xOf(a) + Vector2.xOf(b), Vector2.yOf(a) + Vector2.yOf(b)]
    },
    dot: (a: Vector2, b: Vector2): number => (Vector2.xOf(a) * Vector2.xOf(b)) + (Vector2.yOf(a) * Vector2.yOf(b)),
    unitFrom: (vec: Vector2): Vector2 => {
        const scale = 1 / Vector2.magnitudeOf(vec)
        return [Vector2.xOf(vec) * scale, Vector2.yOf(vec) * scale]
    },
    scaleToUnit: (vec: Vector2): Vector2 => {
        const scale = 1 / Vector2.magnitudeOf(vec)
        vec[VEC2_X] *= scale
        vec[VEC2_Y] *= scale
        return vec
    },
    mean: (...vectors: Vector2[]): Vector2 => {
        const sum = vectors.reduce(Vector2.add, Vector2.fromCoordinates(0, 0))
        return [Vector2.xOf(sum) / vectors.length, Vector2.yOf(sum) / vectors.length]
    },
}

export function modulo(value: number, cap: number): number {
    let result = value % cap
    return result < 0
        ? cap + result
        : result
}