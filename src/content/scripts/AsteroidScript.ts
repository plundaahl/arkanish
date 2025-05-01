import { GameEvent } from "../../game-state/GameEvent";
import { ScriptHandler } from "../../game-state/Script";
import { regenerateAsteroidHitbox } from "./behaviours/regenerateAsteroidHitbox";
import { randomizeSpin } from "./behaviours/randomizeSpin";
import { spawnExplosion } from "./behaviours/spawnExplosion";

const HP_MIN = 1
const HP_MAX = 10
const SIZE_MIN = 3
const SIZE_MAX = 40
const SIZE_RANGE = (SIZE_MAX - SIZE_MIN) / (HP_MAX - HP_MIN)

const entityHpToSize = (hp: number) => SIZE_MIN + (hp * SIZE_RANGE)

export const AsteroidBasicScriptHandler: ScriptHandler<'AsteroidBasic'> = {
    type: "AsteroidBasic",
    script: {
        type: "AsteroidBasic",
        onInit(gameState, entity) {
            randomizeSpin(entity)
            regenerateAsteroidHitbox(gameState, entity, entityHpToSize(entity.hp))
        },
        onEvent(gameState, entity, event) {
            if (GameEvent.isDamageEvent(event) && !event.dead) {
                regenerateAsteroidHitbox(gameState, entity, entityHpToSize(entity.hp))
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
