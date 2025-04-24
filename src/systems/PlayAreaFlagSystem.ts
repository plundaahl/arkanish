import { EntityFlags, EntityStates } from "../game-state/Entity";
import { GameState } from "../game-state/GameState";

export const PlayAreaFlagSystem = {
    run(gameState: GameState) {
        const { left, top, width, height} = gameState.playArea
        const right = left + width
        const bottom = top + height

        for (const entity of gameState.entities) {
            if (entity.state === EntityStates.ALIVE) {
                if (
                    left - entity.radius <= entity.posXG && entity.posXG <= right + entity.radius
                    && top - entity.radius <= entity.posYG && entity.posYG <= bottom + entity.radius
                ) {
                    entity.flags |= EntityFlags.IN_PLAY_AREA
                } else {
                    entity.flags &= ~EntityFlags.IN_PLAY_AREA
                }
            }
        }
    },
}
