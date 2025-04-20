import { EntityFlags } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Prefab } from "../../game-state/Prefab";
import { ExtraMath } from "../../Math";
import { createStateMachineHandler, StateMachineScript, transitionScript } from "./StateMachineScript";

const NOTHING = 'N/A'
const IDLE_TIME = 180

const SPAWN_LISTS: [string, number][][] = [
    [
        [NOTHING, 40],
        ['Coin', 3],
        ['BouncyBall', 2],
        ['Asteroid', 40],
        ['Weaver', 10],
    ],
    [
        [NOTHING, 40],
        ['BouncyBall', 5],
        ['Asteroid', 30],
        ['Plank', 4],
        ['Coin', 3],
    ],
    [
        [NOTHING, 50],
        ['Weaver', 10],
        ['Gunship', 1],
        ['BeamSpinner', 5],
        ['Coin', 1],
    ],
    [
        [NOTHING, 45],
        ['Weaver', 15],
        ['Plank', 5],
        ['BeamSpinner', 8],
        ['Coin', 1],
    ],
]

const stateInit: StateMachineScript<'AsteroidSpawner'> = {
    type: "AsteroidSpawner",
    onUpdate(gameState, entity) {
        entity.hp = Math.round(ExtraMath.rollBetween(0, SPAWN_LISTS.length - 1))
        transitionScript(gameState, entity, stateSpawning)
    },
}

const stateIdle: StateMachineScript<'AsteroidSpawner'> = {
    type: "AsteroidSpawner",
    onUpdate(gameState, entity) {
        const timeInState = gameState.time - entity.scriptData.timeEnteredState
        if (timeInState > IDLE_TIME) { 
            transitionScript(gameState, entity, stateSpawning)
        }
    },
}

const stateSpawning: StateMachineScript<'AsteroidSpawner'> = {
    type: "AsteroidSpawner",
    onUpdate(gameState, entity) {
        const spawnList = SPAWN_LISTS[entity.hp]

        const prefabName = ExtraMath.rollOneOf(...spawnList)
        if (prefabName !== NOTHING) {
            const spawnedEntity = Prefab.spawn(gameState, prefabName)
            const x = Math.ceil(Math.random() * gameState.playArea.width) + gameState.playArea.left + entity.posXL
            if (!(spawnedEntity.flags & EntityFlags.DO_NOT_CLAMP_TO_WIDTH_ON_SPAWN)) {
                spawnedEntity.posXL = clampToPlaySpace(gameState, x, 40)
            }
            spawnedEntity.posYL += entity.posYL
        }
        transitionScript(gameState, entity, stateIdle)
    },
}

export const AsteroidSpawnerScriptHandler = createStateMachineHandler('AsteroidSpawner', stateInit)

function clampToPlaySpace(gameState: GameState, x: number, width: number) {
    return x * ((gameState.playArea.width - width) / gameState.playArea.width)
}
