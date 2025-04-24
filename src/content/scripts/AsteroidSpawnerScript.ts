import { Entity, EntityFlags, World } from "../../game-state/Entity";
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
    [
        [NOTHING, 80],
        ['MissileFrigate', 1],
        ['BeamSpinner', 3],
        ['Weaver', 15],
        ['Plank', 6],
        ['Coin', 3],
    ]
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
            const position = Prefab.spawn(
                gameState,
                spawnedEntity.defaultSpawner || 'SpawnPosClampedAbove',
                0,
                { size: spawnedEntity.radius }
            )

            spawnedEntity.posXL = position.posXL
            spawnedEntity.posYL = position.posYL
            spawnedEntity.posRL = position.posRL

            Entity.killEntity(position)
        }
        transitionScript(gameState, entity, stateIdle)
    },
}

export const AsteroidSpawnerScriptHandler = createStateMachineHandler('AsteroidSpawner', stateInit)
