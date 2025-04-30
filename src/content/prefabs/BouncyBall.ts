import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Prefab } from "../../game-state/Prefab";
import { Vector2 } from "../../game-state/Vector";
import { BoundingBox } from "../../game-state/BoundingBox";
import { BouncyBallScriptHandler, BouncyBallData } from "../scripts";
import { Script } from "../../game-state/Script";
import { ExtraMath } from "../../Math";
import { INTENSITIES } from "./intensities";

export const BouncyBallPrefab: Prefab = {
    id: "BouncyBall",
    intensity: INTENSITIES.BouncyBall,
    spawn: (gameState: GameState, parent?: number): Entity => {
        const entity = World.spawnEntity(gameState, parent)

        const halfSize = 20

        const minMag = gameState.playArea.height * 0.5
        const maxMag = gameState.playArea.height * 0.8
        const minAngle = Math.PI * 1.25
        const maxAngle = Math.PI * 1.45 
        const angle = (Math.random() * (maxAngle - minAngle)) + minAngle
        const mag = (Math.random() * (maxMag - minMag)) + minMag
        const vec = Vector2.createFromAngle(angle, mag)

        entity.posYL = -halfSize
        entity.velYL = Vector2.yOf(vec)
        entity.velXL = Vector2.xOf(vec) * (Math.random() < 0.5 ? 1 : -1)

        entity.flags |= EntityFlags.COLLIDER
        entity.colliderBbSrc = [BoundingBox.createCircleBb(0, 0, halfSize)]
        entity.collidesWith = EntityFlags.ROLE_PLAYER | EntityFlags.ROLE_PLAYER_BULLET

        Script.attach(gameState, entity, BouncyBallScriptHandler)
        entity.flags |= EntityFlags.BOUNCE_IN_PLAY_SPACE
        const scriptData: BouncyBallData = {
            bouncesRemaining: ExtraMath.rollBetween(0, 3),
            timeEnteredState: 0
        }
        entity.scriptData = scriptData

        entity.colour = 'red'
        entity.flags |= EntityFlags.ROLE_OBSTACLE
        entity.flags |= EntityFlags.DESTROY_AT_0_HP
        entity.hurtBy |= EntityFlags.ROLE_PLAYER_BULLET
        entity.scoreValue = 20

        return entity
    }
}