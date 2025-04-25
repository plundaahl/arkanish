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
        (entity.scriptData as StateMachineData).timeEnteredState = gameState.gameTime + Math.round(Math.random() * MS_PER_SHOT)
    },
    onUpdate(gameState, entity) {
        trackPlayer(gameState, entity)
        const timeEntered = (entity.scriptData as StateMachineData).timeEnteredState
        if (timeEntered < gameState.gameTime) {
            transitionScript(gameState, entity, fireState)
        }
    },
}

const idleState: StateMachineScript<'Turret'> = {
    type: 'Turret',
    onUpdate(gameState, entity) {
        trackPlayer(gameState, entity)
        const timeInState = gameState.gameTime - (entity.scriptData as StateMachineData).timeEnteredState
        if (timeInState > MS_PER_SHOT) {
            transitionScript(gameState, entity, fireState)
        }
    },
}

const fireState: StateMachineScript<'Turret'> = {
    type: 'Turret',
    onUpdate(gameState, entity) {
        if (entity.posXG < gameState.playArea.left
            || entity.posXG > gameState.playArea.left + gameState.playArea.width
            || entity.posYG < gameState.playArea.top
            || entity.posYG > gameState.playArea.top + gameState.playArea.height
        ) {
            return
        }
        
        const bullet = Prefab.spawn(gameState, 'EnemyBullet')

        Vector2.setToCoordinates(selfVector, 1, 0)
        Vector2.rotateBy(selfVector, entity.posRG)
        Vector2.scaleBy(selfVector, 25)
        
        bullet.posXL = entity.posXG + Vector2.xOf(selfVector)
        bullet.posYL = entity.posYG + Vector2.yOf(selfVector)

        Vector2.scaleToUnit(selfVector)
        Vector2.scaleBy(selfVector, SHOT_SPEED)

        bullet.velXL = Vector2.xOf(selfVector)
        bullet.velYL = Vector2.yOf(selfVector)

        const parent = World.getEntity(gameState, entity.parent)
        if (parent) {
            bullet.velXL += parent.velXL
            bullet.velYL += parent.velYL
        }

        transitionScript(gameState, entity, idleState)
    },
}

export const TurretScriptHandler = createStateMachineHandler('Turret', initState)

function trackPlayer(gameState: GameState, entity: Entity) {
    const player = World.getEntity(gameState, gameState.playerId)
    if (!player) {
        entity.velRL = 0
        return
    }

    Vector2.setToCoordinates(selfVector, entity.posXG, entity.posYG)
    Vector2.setToCoordinates(targetVector, player.posXG, player.posYG)
    Vector2.subtract(targetVector, selfVector)

    let deltaAngle = ExtraMath.modulo(entity.posRG - Vector2.angleOf(targetVector), Math.PI * 2) 
    if (deltaAngle > Math.PI) {
        deltaAngle -= Math.PI * 2
    }

    if (Math.abs(deltaAngle) <= ANGLE_THRESHOLD) {
        entity.velRL = TURRET_ROTATION_SPEED_MIN * (entity.velRL < 0 ? -1 : 1)
    } else if (deltaAngle > 0) {
        entity.velRL = -TURRET_ROTATION_SPEED_MAX
    } else {
        entity.velRL = TURRET_ROTATION_SPEED_MAX
    }
}