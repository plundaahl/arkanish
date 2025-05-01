import { regenerateAsteroidHitbox } from "../scripts/behaviours/regenerateAsteroidHitbox";
import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Prefab, PrefabParameters } from "../../game-state/Prefab";
import { ExtraMath } from "../../Math";
import { Vector2 } from "../../game-state/Vector";
import { AsteroidHitboxParameters } from "./AsteroidHitBox";
import { Script } from "../../game-state/Script";
import { AsteroidFragileChunkScriptHandler } from "../scripts";

const CHUNK_SIZE_MIN = 10
const CHUNK_SIZE_MAX = 15
const CHUNK_COUNT_MIN = 8
const CHUNK_COUNT_MAX = 18
const OFFSET_MIN = 20
const OFFSET_MAX = 30
const ROT_MAX = 1

const offset: Vector2 = Vector2.createFromCoordinates(0, 1)
const prevOffset: Vector2 = Vector2.createFromCoordinates(0, 0)

const chunkParams: Partial<AsteroidHitboxParameters> = {
    minCorners: 5,
    maxCorners: 9,
}

export const AsteroidFragilePrefab: Prefab = {
    id: 'AsteroidFragile',
    spawn(gameState: GameState, parent?: number, parameters?: Partial<PrefabParameters> | undefined): Entity {
        const position = Prefab.spawn(gameState, 'MotionDrift', parent)
        
        const numChunks = Math.round(ExtraMath.rollBetween(CHUNK_COUNT_MIN, CHUNK_COUNT_MAX))

        const center = World.spawnEntity(gameState, position.id)
        center.hp = Math.ceil(numChunks * 0.3)
        center.flags |= EntityFlags.DESTROY_AT_0_HP
        center.velRL = ExtraMath.rollBetween(-ROT_MAX, ROT_MAX)

        Vector2.setToCoordinates(prevOffset, 0, 0)
        let sizeMultiple = 1
        let numNearCenter = 1
        for (let i = 0; i < numChunks; i++) {
            const offsetRoll = ExtraMath.rollBetween(OFFSET_MIN * i / numChunks, OFFSET_MAX)
            const growthRoll = Math.random()
            const angleRoll = Math.random() * Math.PI * 2
            if (growthRoll < 0.2 * numChunks / numNearCenter) {
                sizeMultiple = 1
                numNearCenter++
                Vector2.setToCoordinates(prevOffset, 0, 0)
                Vector2.setToAngleAndMag(offset, angleRoll, offsetRoll * sizeMultiple)
            } else {
                sizeMultiple *= 0.8
                Vector2.setToVec(offset, prevOffset)
                Vector2.scaleToUnit(offset)
                Vector2.scaleBy(offset, offsetRoll)
                Vector2.rotateBy(offset, angleRoll / 6)
                Vector2.add(offset, prevOffset)
            }

            const sizeRoll = Math.max(
                Math.round(ExtraMath.rollBetween(CHUNK_SIZE_MIN, CHUNK_SIZE_MAX) * sizeMultiple),
                CHUNK_SIZE_MIN
            )

            const offsetEntity = World.spawnEntity(gameState, center.id)
            Vector2.setToVec(prevOffset, offset)
            offsetEntity.posXL = Vector2.xOf(offset)
            offsetEntity.posYL = Vector2.yOf(offset)
            offsetEntity.posRL = Math.random() * Math.PI
            offsetEntity.flags |= EntityFlags.PROPAGATE_DAMAGE_TO_PARENT

            const chunk = Prefab.spawn(gameState, 'AsteroidHitbox', offsetEntity.id, chunkParams)
            chunk.hp = 1
            chunk.scoreValue = 5
            chunk.hurtBy |= EntityFlags.ROLE_PLAYER_BULLET
            chunk.flags |= EntityFlags.DESTROY_AT_0_HP
            chunk.flags |= EntityFlags.PROPAGATE_DAMAGE_TO_PARENT

            Script.attach(gameState, chunk, AsteroidFragileChunkScriptHandler)

            regenerateAsteroidHitbox(gameState, chunk, sizeRoll)
        }

        return position
    }
}