import { BoundingBox } from "../game-state/BoundingBox";
import { EntityFlags } from "../game-state/Entity";
import { GameState } from "../game-state/GameState";

const MS_PER_SEC = 1000

export const MovementSystem = {
    run: (state: GameState) => {
        const deltaT = state.frameLength

        // Move entities
        for (let i = 0; i < state.entities.length; i++) {
            const entity = state.entities[i]
            if (entity.flags & EntityFlags.ALIVE) {
                entity.posY += (entity.velY * deltaT) / MS_PER_SEC
            }
        }

        // Update transforms
        for (const entity of state.entities) {
            if (entity.flags & EntityFlags.ALIVE) {
                for (let i = 0; i < entity.colliderBbSrc.length; i++) {
                    const src = entity.colliderBbSrc[i]
                    const dest = entity.colliderBbTransform[i]
                    BoundingBox.transform(src, dest, entity.posX, entity.posY)
                } 
            }
        }
    }
}
