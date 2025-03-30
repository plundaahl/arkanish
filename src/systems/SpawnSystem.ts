import { GameState } from "../game-state/GameState";
import { EntityStates, World } from "../game-state/Entity";

export const SpawnSystem = {
    runSpawn: (state: GameState) => {
        // Finalize spawning entities ones
        for (let i = 0; i < state.entities.length; i++) {
            const entity = state.entities[i]
            if (entity.state === EntityStates.SPAWNING) {
                entity.state = EntityStates.ALIVE
            }
        }
    },
    runDespawn: (state: GameState) => {
        // Release dying entities
        for (const entity of state.entities) {
            if (entity.state === EntityStates.DYING) {
                World.releaseEntity(state, entity)
            }
        }

        // Remove out-of-bounds entities
        for (const entity of state.entities) {
            if (entity.state !== EntityStates.ALIVE) {
                continue
            }
            if ((entity.velY > 0 && entity.posY > 3000)
                || (entity.velY < 0 && entity.posY < -1000)) {
                World.releaseEntity(state, entity)
            }
        }
    }
}
