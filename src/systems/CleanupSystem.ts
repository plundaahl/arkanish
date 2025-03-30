import { Flag } from "../game-state/Flag";
import { GameState } from "../game-state/GameState";
import { EntityFlags, World } from "../game-state/Entity";

export const CleanupSystem = {
    run: (state: GameState) => {
        // Remove DYING entities
        for (let i = 0; i < state.entities.length; i++) {
            const entity = state.entities[i]
            if (Flag.hasBigintFlags(entity.flags, EntityFlags.DYING, EntityFlags.ALIVE)) {
                World.releaseEntity(state, entity)
            }
        }

        // Remove out-of-bounds entities
        for (let i = 0; i < state.entities.length; i++) {
            const entity = state.entities[i]
            if (!(entity.flags & EntityFlags.ALIVE)) {
                continue
            }
            if ((entity.velY > 0 && entity.posY > 3000)
                || (entity.velY < 0 && entity.posY < -1000)) {
                World.releaseEntity(state, entity)
                state.numEntities--
            }
        }
    }
}
