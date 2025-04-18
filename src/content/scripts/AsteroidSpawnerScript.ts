import { GameState } from "../../game-state/GameState";
import { Prefab } from "../../game-state/Prefab";
import { ExtraMath } from "../../Math";
import { createStateMachineHandler, StateMachineScript, transitionScript } from "./StateMachineScript";

const NOTHING = 'N/A'
const IDLE_TIME = 180

const SPAWN_LISTS: [string, number][][] = [
    // [
    //     [NOTHING, 30],
    //     ['Coin', 3],
    //     ['ShieldRecharge', 1],
    //     ['BeamSpinner', 5],
    //     ['BouncyBall', 2],
    //     ['Asteroid', 40],
    //     ['Plank', 5],
    // ],
    [
        [NOTHING, 30],
        ['BouncyBall', 10],
    ],
    // [
    //     [NOTHING, 20],
    //     ['BeamSpinner', 5],
    //     ['Asteroid', 40],
    //     ['Plank', 8],
    // ],
    // [
    //     [NOTHING, 20],
    //     ['ShieldRecharge', 5],
    //     ['Asteroid', 10],
    // ],
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
            const x = Math.ceil(Math.random() * gameState.playArea.width) + gameState.playArea.left + entity.posX
            spawnedEntity.posX = clampToPlaySpace(gameState, x, 40)
            spawnedEntity.posY += entity.posY
        }
        transitionScript(gameState, entity, stateIdle)
    },
}

export const AsteroidSpawnerScriptHandler = createStateMachineHandler('AsteroidSpawner', stateInit)

function clampToPlaySpace(gameState: GameState, x: number, width: number) {
    return x * ((gameState.playArea.width - width) / gameState.playArea.width)
}
