const VEC2_X = 0
const VEC2_Y = 1
export type Vector2 = [number, number]

export const Vector2 = {
    fromCoordinates: (x: number, y: number): Vector2 => [x, y],
    fromAngle: (angle: number, magnitude: number): Vector2 => [Math.cos(angle) * magnitude, Math.sin(angle) * magnitude],
    xOf: (vec: Vector2): number => vec[VEC2_X],
    yOf: (vec: Vector2): number => vec[VEC2_Y],
    magnitudeOf: (vec: Vector2): number => Math.sqrt(
        (Vector2.xOf(vec) * Vector2.xOf(vec))
        + (Vector2.yOf(vec) * Vector2.yOf(vec))
    ),
    angleOf: (vec: Vector2): number => Math.atan2(Vector2.yOf(vec), Vector2.xOf(vec)),
    subtract: (a: Vector2, b: Vector2): Vector2 => {
        return [Vector2.xOf(a) - Vector2.xOf(b), Vector2.yOf(a) - Vector2.yOf(b)]
    },
    add: (a: Vector2, b: Vector2): Vector2 => {
        return [Vector2.xOf(a) + Vector2.xOf(b), Vector2.yOf(a) + Vector2.yOf(b)]
    },
}
