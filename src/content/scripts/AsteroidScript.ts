import { GameEvent } from "../../game-state/GameEvent";
import { ScriptHandler } from "../../game-state/Script";
import { regenerateAsteroidHitbox } from "./behaviours/regenerateAsteroidHitbox";
import { randomizeSpin } from "./behaviours/randomizeSpin";
import { spawnExplosion } from "./behaviours/spawnExplosion";

export const AsteroidScriptHandler: ScriptHandler<'Asteroid'> = {
    type: "Asteroid",
    script: {
        type: "Asteroid",
        onInit(gameState, entity) {
            randomizeSpin(entity)
            regenerateAsteroidHitbox(gameState, entity, entity.hp)
        },
        onEvent(gameState, entity, event) {
            if (GameEvent.isDamageEvent(event) && !event.dead) {
                regenerateAsteroidHitbox(gameState, entity, entity.hp)
                randomizeSpin(entity)
                spawnExplosion(gameState, entity)
            }
        },
    },
    nullData: {},
    serializeData(data: {}): Object {
        throw new Error("Function not implemented.");
    },
    deserializeData(input: unknown): {} | undefined {
        throw new Error("Function not implemented.");
    }
}
