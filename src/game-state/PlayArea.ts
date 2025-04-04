import { AABB, BoundingBox } from "./BoundingBox"

const WIDTH = 450
const HEIGHT = 800
const LEFT = WIDTH * -0.5
const TOP = HEIGHT * -0.5

export type PlayAreaState = {
    playArea: AABB,
}

export const PlayAreaState = {
    create: (): PlayAreaState => ({ 
        playArea: BoundingBox.createAabb(LEFT, TOP, WIDTH, HEIGHT),
    })
}