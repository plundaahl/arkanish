import { GameEvent } from "../../game-state/GameEvent";
import { Prefab, PrefabParameters } from "../../game-state/Prefab";
import { ScriptHandler } from "../../game-state/Script";
import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { Vector2 } from "../../game-state/Vector";
import { ExtraMath } from "../../Math";
import { AsteroidBasicParameters } from "content/prefabs";
import { spawnExplosion } from "./behaviours/spawnExplosion";
import { GameState } from "game-state/GameState";

const FRAGMENTS_MIN = 2
const FRAGMENTS_MAX = 4
const VEL_MIN = 100
const VEL_MAX = 200

const fragVel = Vector2.createFromCoordinates(0, 0)

export const AsteroidBaseScriptHandler: ScriptHandler<'AsteroidBase', PrefabParameters> = {
    type: "AsteroidBase",
    script: {
        type: "AsteroidBase",
        onEvent(gameState, entity, event) {
            if (GameEvent.isChildDeathEvent(event)) {
                const hitbox = World.getEntity(gameState, event.child)
                const radius = hitbox?.radius || 80
                const count = FRAGMENTS_MIN + Math.round(Math.random() * (FRAGMENTS_MAX - FRAGMENTS_MIN))

                spawnAsteroidFragments(gameState, entity, count, radius)
                spawnExplosion(gameState, entity)
            }
        },
    },
    nullData: {},
    serializeData: function (data: PrefabParameters): Object {
        throw new Error("Function not implemented.");
    },
    deserializeData: function (input: unknown): PrefabParameters | undefined {
        throw new Error("Function not implemented.");
    }
}

function spawnAsteroidFragments(gameState: GameState, entity: Entity, count: number, radius: number) {
    for (let i = 0; i < count; i++) {
        const fragment = Prefab.spawn(gameState, 'AsteroidBasic', 0, {
            minSize: 1,
            maxSize: Math.ceil(radius / (30 * count)),
        } as AsteroidBasicParameters)
        fragment.posXL = entity.posXG
        fragment.posYL = entity.posYG
        fragment.flags &= ~EntityFlags.USE_INTERNAL_VELOCITY
        Vector2.setToAngleAndMag(
            fragVel,
            ExtraMath.FULL_CIRCLE * Math.random(),
            ExtraMath.rollBetween(VEL_MIN, VEL_MAX),
        )
        Vector2.addCoordinates(fragVel, entity.velXG, entity.velYG)
        fragment.velXL = Vector2.xOf(fragVel)
        fragment.velYL = Vector2.yOf(fragVel)
    }
}
