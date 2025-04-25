import { AABB, BoundingBox } from "../game-state/BoundingBox"

export type ScreenState = {
    width: number
    height: number
    playArea: AABB
}

export const ScreenState = {
    create(): ScreenState {
        return {
            width: 0,
            height: 0,
            playArea: BoundingBox.createAabb(0, 0, 0, 0),
        }
    }
}
