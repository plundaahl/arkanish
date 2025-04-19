import { Vector2 } from "../../game-state/Vector";
import { Entity, World } from "../../game-state/Entity";
import { createStateMachineHandler, StateMachineData, StateMachineScript, transitionScript } from "./StateMachineScript";
import { ExtraMath } from "../../Math";
import { GameState } from "../../game-state/GameState";
import { Prefab } from "../../game-state/Prefab";
import { BoundingBox } from "game-state/BoundingBox";

const selfVector: Vector2 = Vector2.createFromCoordinates(1, 1)
const targetVector: Vector2 = Vector2.createFromCoordinates(1, 1)

const TURRET_ROTATION_SPEED_MAX = Math.PI * 0.4
const TURRET_ROTATION_SPEED_MIN = Math.PI * 0.2
const ANGLE_THRESHOLD = Math.PI * 0.1
const MS_PER_SHOT = 1000 * 2
const SHOT_SPEED = 200

const initState: StateMachineScript<'Turret'> = {
    type: 'Turret',
    onInit(gameState, entity) {
        (entity.scriptData as StateMachineData).timeEnteredState = gameState.time + Math.round(Math.random() * MS_PER_SHOT)
    },
    onUpdate(gameState, entity) {
        trackPlayer(gameState, entity)
        const timeEntered = (entity.scriptData as StateMachineData).timeEnteredState
        if (timeEntered < gameState.time) {
            transitionScript(gameState, entity, fireState)
        }
    },
}

const idleState: StateMachineScript<'Turret'> = {
    type: 'Turret',
    onUpdate(gameState, entity) {
        trackPlayer(gameState, entity)
        const timeInState = gameState.time - (entity.scriptData as StateMachineData).timeEnteredState
        if (timeInState > MS_PER_SHOT) {
            transitionScript(gameState, entity, fireState)
        }
    },
}

const fireState: StateMachineScript<'Turret'> = {
    type: 'Turret',
    onUpdate(gameState, entity) {
        if (entity.transX < gameState.playArea.left
            || entity.transX > gameState.playArea.left + gameState.playArea.width
            || entity.transY < gameState.playArea.top
            || entity.transY > gameState.playArea.top + gameState.playArea.height
        ) {
            return
        }
        
        const bullet = Prefab.spawn(gameState, 'EnemyBullet')

        Vector2.setToCoordinates(selfVector, 1, 0)
        Vector2.rotateBy(selfVector, entity.transR)
        Vector2.scaleBy(selfVector, 25)
        
        bullet.posX = entity.transX + Vector2.xOf(selfVector)
        bullet.posY = entity.transY + Vector2.yOf(selfVector)

        Vector2.scaleToUnit(selfVector)
        Vector2.scaleBy(selfVector, SHOT_SPEED)

        bullet.velX = Vector2.xOf(selfVector)
        bullet.velY = Vector2.yOf(selfVector)

        const parent = World.getEntity(gameState, entity.parent)
        if (parent) {
            bullet.velX += parent.velX
            bullet.velY += parent.velY
        }

        transitionScript(gameState, entity, idleState)
    },
}

export const TurretScriptHandler = createStateMachineHandler('Turret', initState)

function trackPlayer(gameState: GameState, entity: Entity) {
    const player = World.getEntity(gameState, gameState.playerId)
    if (!player) {
        entity.velR = 0
        return
    }

    Vector2.setToCoordinates(selfVector, entity.transX, entity.transY)
    Vector2.setToCoordinates(targetVector, player.transX, player.transY)
    Vector2.subtract(targetVector, selfVector)

    let deltaAngle = ExtraMath.modulo(entity.transR - Vector2.angleOf(targetVector), Math.PI * 2) 
    if (deltaAngle > Math.PI) {
        deltaAngle -= Math.PI * 2
    }

    if (Math.abs(deltaAngle) <= ANGLE_THRESHOLD) {
        entity.velR = TURRET_ROTATION_SPEED_MIN * (entity.velR < 0 ? -1 : 1)
    } else if (deltaAngle > 0) {
        entity.velR = -TURRET_ROTATION_SPEED_MAX
    } else {
        entity.velR = TURRET_ROTATION_SPEED_MAX
    }
}