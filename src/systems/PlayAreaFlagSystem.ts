import { EntityFlags, EntityStates } from "../game-state/Entity";
import { GameState } from "../game-state/GameState";

const BUFFER = 100

export const PlayAreaFlagSystem = {
    run(gameState: GameState) {
        const { left, top, width, height} = gameState.playArea

        const leftWithMargin = left - BUFFER
        const rightWithMargin = left + width + BUFFER
        const topWithMargin = top - BUFFER
        const bottomWithMargin = top + height + BUFFER

        for (const entity of gameState.entities) {
            if (entity.state === EntityStates.ALIVE) {
                if (
                    leftWithMargin <= entity.posXG
                    && entity.posXG <= rightWithMargin
                    && topWithMargin <= entity.posYG
                    && entity.posYG <= bottomWithMargin
                ) {
                    entity.flags |= EntityFlags.IN_PLAY_AREA
                } else {
                    entity.flags &= ~EntityFlags.IN_PLAY_AREA
                }
            }
        }
    },
}
