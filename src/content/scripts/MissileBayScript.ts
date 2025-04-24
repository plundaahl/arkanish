import { ExtraMath } from "../../Math";
import { createStateMachineHandler, StateMachineData, StateMachineScript, transitionScript } from "./StateMachineScript";
import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { Vector2 } from "../../game-state/Vector";
import { ConvexPolyBB } from "../../game-state/BoundingBox";
import { Prefab } from "../../game-state/Prefab";
import { GameState } from "../../game-state/GameState";
import { MissileScriptData } from "./MissileScript";

const TIME_TOGGLE_DOOR = 500
const TIME_CLOSED = 4000
const TIME_PRE_LAUNCH = 500
const TIME_PER_LAUNCH = 500
const TIME_POST_LAUNCH = 1000
const ANGLE_VARIATION = Math.PI * 0.05
const MIN_LAUNCH_HEIGHT = 20
const MAX_LAUNCH_HEIGHT = 125

const DEFAULT_SHOTS = 5

// Super hacky.  This depends on the sorting order of createConvexPolyBb.
const DOOR_BBOXES = [2, 3]
const DOOR_DIR = [1, -1]
const DOOR_VERTEXES = [2, 3, 0, 1]
const PARENT_DIRS = [1, 1, -1, -1]

const DOOR_WIDTH = 46

export const MissileBay = {
    SIGNAL_UNSET: 0,
    SIGNAL_CLOSE: 1,
    SIGNAL_LAUNCH: 2,
}

export interface MissileBayData extends StateMachineData {
    doorPercentOpen: number
    doorHalfW: number
    shotsPerSalvo: number
    shotsRemain: number
    signal: number
    heart: number
}

const NULL_MISSILE_BAY_DATA: MissileBayData = {
    doorPercentOpen: 0,
    doorHalfW: DOOR_WIDTH,
    timeEnteredState: 0,
    shotsPerSalvo: DEFAULT_SHOTS,
    shotsRemain: DEFAULT_SHOTS,
    signal: MissileBay.SIGNAL_UNSET,
    heart: 0,
}

const stateClosed: StateMachineScript<'MissileBay', MissileBayData> = {
    type: "MissileBay",
    onInit(gameState, entity) {
        const data = (entity.scriptData as MissileBayData)
        const heart = World.getEntity(gameState, data.heart)
        data.timeEnteredState = gameState.time
        if (heart) {
            heart.flags |= EntityFlags.INVULNERABLE
        }
    },
    onUpdate(gameState, entity) {
        const data = entity.scriptData as MissileBayData

        if (data.signal) {
            if (data.signal === MissileBay.SIGNAL_LAUNCH) {
                transitionScript(gameState, entity, stateOpening)
            }
            return
        }

        const timeInState = gameState.time - data.timeEnteredState
        if (timeInState > TIME_CLOSED && entity.flags & EntityFlags.IN_PLAY_AREA) {
            transitionScript(gameState, entity, stateOpening)
        }
    },   
}

const stateOpening: StateMachineScript<'MissileBay', MissileBayData> = {
    type: "MissileBay",
    onInit(gameState, entity) {
        const data = (entity.scriptData as MissileBayData)
        const heart = World.getEntity(gameState, data.heart)
        if (heart) {
            heart.flags &= ~EntityFlags.INVULNERABLE
        }
    },
    onUpdate(gameState, entity) {
        const data = entity.scriptData as MissileBayData
        const timeInState = gameState.time - data.timeEnteredState
        const doorOpenPercent = ExtraMath.clamp(0, timeInState / TIME_TOGGLE_DOOR, 1)
        const heart = World.getEntity(gameState, data.heart)
        if (!heart) {
            throw new Error(`MissileBay heart missing`)
        }
        setDoorWidth(gameState, entity, heart, data.doorHalfW * doorOpenPercent)

        if (doorOpenPercent === 1) {
            transitionScript(gameState, entity, stateOpenPreLaunch)
        }
    },
}

const stateOpenPreLaunch: StateMachineScript<'MissileBay', MissileBayData> = {
    type: "MissileBay",
    onInit(_, entity) {
        const data = entity.scriptData as MissileBayData
        data.shotsRemain = data.shotsPerSalvo
    },
    onUpdate(gameState, entity) {
        const data = entity.scriptData as MissileBayData
        if (gameState.time > data.timeEnteredState + TIME_PRE_LAUNCH) {
            if (data.signal === MissileBay.SIGNAL_CLOSE) {
                transitionScript(gameState, entity, stateClosing)
            } else {
                transitionScript(gameState, entity, stateLaunching)
            }
        }
    },
}

const stateLaunching: StateMachineScript<'MissileBay', MissileBayData> = {
    type: "MissileBay",
    onInit(gameState, entity) {
        launchMissile(gameState, entity)
    },
    onUpdate(gameState, entity) {
        const data = entity.scriptData as MissileBayData
        if (gameState.time > data.timeEnteredState + TIME_PER_LAUNCH) {
            if (--data.shotsRemain <= 0 || !(entity.flags & EntityFlags.IN_PLAY_AREA)) {
                data.shotsRemain = data.shotsPerSalvo
                transitionScript(gameState, entity, stateOpenPostLaunch)
            } else {
                transitionScript(gameState, entity, stateLaunching)
            }
        }
    },
}

const stateOpenPostLaunch: StateMachineScript<'MissileBay', MissileBayData> = {
    type: "MissileBay",
    onUpdate(gameState, entity) {
        const data = entity.scriptData as MissileBayData
        if (gameState.time > data.timeEnteredState + TIME_POST_LAUNCH) {
            if (data.signal === MissileBay.SIGNAL_LAUNCH) {
                transitionScript(gameState, entity, stateOpenPreLaunch)
            } else {
                transitionScript(gameState, entity, stateClosing)
            }
        }
    },
}

const stateClosing: StateMachineScript<'MissileBay', MissileBayData> = {
    type: "MissileBay",
    onUpdate(gameState, entity) {
        const data = entity.scriptData as MissileBayData
        const timeInState = gameState.time - data.timeEnteredState
        const doorOpenPercent = 1 - ExtraMath.clamp(0, timeInState / TIME_TOGGLE_DOOR, 1)
        const heart = World.getEntity(gameState, data.heart)
        if (!heart) {
            throw new Error(`MissileBay heart missing`)
        }
        setDoorWidth(gameState, entity, heart, data.doorHalfW * doorOpenPercent)

        if (doorOpenPercent === 0) {
            transitionScript(gameState, entity, stateClosed)
        }
    },
}

export const MissileBayScriptHandler = createStateMachineHandler(
    'MissileBay',
    stateClosed,
    NULL_MISSILE_BAY_DATA
)

function setDoorWidth(_: GameState, doors: Entity, heart: Entity, width: number) {
    for (let d = 0; d < DOOR_BBOXES.length; d++) {
        const direction = DOOR_DIR[d]
        const box = doors.colliderBbSrc[DOOR_BBOXES[d]] as ConvexPolyBB
        for (let v = 0; v < 2; v++) {
            const vertexI = v + (d * 2)
            const vertex = box.vertexes[DOOR_VERTEXES[vertexI]]
            Vector2.setToCoordinates(
                vertex,
                Vector2.xOf(vertex),
                width * direction,
            )
        }
    }

    const box = heart.colliderBbSrc[0] as ConvexPolyBB
    for (let i = 0; i < box.vertexes.length; i++) {
        const vertex = box.vertexes[i]
        const direction = PARENT_DIRS[i]
        Vector2.setToCoordinates(
            vertex,
            Vector2.xOf(vertex),
            width * direction,
        )
    }
}

function launchMissile(gameState: GameState, entity: Entity) {
    const missile = Prefab.spawn(gameState, 'Missile')
    missile.posXL = entity.posXG
    missile.posYL = entity.posYG
    missile.posRL = entity.posRG + ExtraMath.rollBetween(-ANGLE_VARIATION, ANGLE_VARIATION)
    missile.posZL = entity.posZG + 50
    const data = (missile.scriptData as MissileScriptData)
    data.seekDelay = ExtraMath.rollBetween(MIN_LAUNCH_HEIGHT, MAX_LAUNCH_HEIGHT) / missile.velMI
}
