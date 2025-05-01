import { GameEvent } from "../../game-state/GameEvent";
import { ScriptHandler } from "../../game-state/Script";
import { EntityFlags, EntityStates, World } from "../../game-state/Entity";
import { ExtraMath } from "../../Math";
import { Vector2 } from "../../game-state/Vector";
import { spawnExplosion } from "./behaviours/spawnExplosion";

const VEL_MIN = 50
const VEL_MAX = 80
const ROT_MAX = 3

const offsetCalc: Vector2 = Vector2.createFromCoordinates(0, 0) 
const velCalc: Vector2 = Vector2.createFromCoordinates(0, 0)

export const AsteroidFragileChunkScriptHandler: ScriptHandler<'AsteroidFragileChunk'> = {
    type: "AsteroidFragileChunk",
    script: {
        type: "AsteroidFragileChunk",
        onEvent(gameState, entity, event) {
            if (GameEvent.isDeathEvent(event)) {
                const parent = World.getEntity(gameState, entity.parent)

                if (entity.parent && parent && parent.state !== EntityStates.ALIVE) {
                    const grandparent = World.getEntity(gameState, parent.parent)

                    World.orphanEntity(gameState, parent)
                    Vector2.setToCoordinates(velCalc, parent.velXL, parent.velYL)
                    Vector2.rotateBy(velCalc, -parent.posRL)
                    Vector2.setToCoordinates(offsetCalc, parent.posXG, parent.posYG)
                    Vector2.addCoordinates(offsetCalc, -(grandparent?.posXG || 0), -(grandparent?.posYG || 0))
                    Vector2.scaleToUnit(offsetCalc)
                    Vector2.scaleBy(offsetCalc, ExtraMath.rollBetween(VEL_MIN, VEL_MAX))
                    Vector2.add(velCalc, offsetCalc)
                    parent.state = EntityStates.ALIVE
                    parent.velMI = Vector2.magnitudeOf(velCalc)
                    parent.velAI = Vector2.angleOf(velCalc)
                    parent.flags |= EntityFlags.USE_INTERNAL_VELOCITY | EntityFlags.DESTROY_AT_0_HP
                    parent.hp = 1

                    entity.state = EntityStates.ALIVE
                    entity.velRL = ExtraMath.rollBetween(-ROT_MAX, ROT_MAX)
                    entity.flags &= ~EntityFlags.PROPAGATE_DAMAGE_TO_PARENT

                    spawnExplosion(gameState, parent)
                }
            }
        },
    },
    nullData: {},
    serializeData: function (data: {}): Object {
        throw new Error("Function not implemented.");
    },
    deserializeData: function (input: unknown): {} | undefined {
        throw new Error("Function not implemented.");
    }
}
