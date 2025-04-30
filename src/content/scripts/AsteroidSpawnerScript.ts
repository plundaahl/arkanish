import { GameState } from "../../game-state/GameState";
import { Entity } from "../../game-state/Entity";
import { Prefab } from "../../game-state/Prefab";
import { ExtraMath } from "../../Math";
import { createStateMachineHandler, StateMachineScript, transitionScript } from "./StateMachineScript";
import { GameEvent } from "../../game-state/GameEvent";

const NOTHING = 'N/A'
const IDLE_TIME = 500

const SPAWN_LISTS: [string, number][][] = [
    [
        ['Coin', 3],
        ['BouncyBall', 2],
        ['Asteroid', 40],
        ['Weaver', 10],
    ],
    [
        ['BouncyBall', 5],
        ['Asteroid', 30],
        ['Plank', 4],
        ['Coin', 3],
    ],
    [
        ['Weaver', 10],
        ['Gunship', 1],
        ['BeamSpinner', 5],
        ['Coin', 1],
    ],
    [
        ['Weaver', 15],
        ['Plank', 5],
        ['BeamSpinner', 8],
        ['Coin', 1],
    ],
    [
        ['MissileFrigate', 1],
        ['BeamSpinner', 3],
        ['Weaver', 15],
        ['Plank', 6],
        ['Coin', 3],
    ]
]

let intensities: Map<string, number> = new Map()

const stateInit: StateMachineScript<'AsteroidSpawner'> = {
    type: "AsteroidSpawner",
    onEvent,
    onUpdate(gameState, entity) {
        intensities.clear()
        entity.hp = Math.round(ExtraMath.rollBetween(0, SPAWN_LISTS.length - 1))
        for (const [prefabName] of SPAWN_LISTS[entity.hp]) {
            if (prefabName !== NOTHING) {
                intensities.set(prefabName, Prefab.intensityOf(prefabName))
            }
        }
        transitionScript(gameState, entity, stateSpawning)
    },
}

const stateIdle: StateMachineScript<'AsteroidSpawner'> = {
    type: "AsteroidSpawner",
    onEvent,
    onUpdate(gameState, entity) {
        const timeInState = gameState.gameTime - entity.scriptData.timeEnteredState
        if (timeInState > IDLE_TIME) { 
            transitionScript(gameState, entity, stateSpawning)
        }
    },
}

const stateSpawning: StateMachineScript<'AsteroidSpawner'> = {
    type: "AsteroidSpawner",
    onEvent,
    onUpdate(gameState, entity) {
        if (gameState.intensity < gameState.intensityBudget) {
            const spawnList = SPAWN_LISTS[entity.hp]
            
            const prefabName = ExtraMath.rollOneOf(...spawnList)

            if (prefabName !== NOTHING) {
                const spawnedEntity = Prefab.spawn(gameState, prefabName)
                spawnedEntity.intensity = Prefab.intensityOf(prefabName)
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
        }
        transitionScript(gameState, entity, stateIdle)
    },
}

function onEvent(gameState: GameState, _: Entity, event: GameEvent) {
    if (GameEvent.isDeathEvent(event)) {
        gameState.intensityBudget = Math.round(gameState.intensityBudget * 1.1)
    }
}

export const AsteroidSpawnerScriptHandler = createStateMachineHandler('AsteroidSpawner', stateInit)
