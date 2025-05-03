import { GameState } from "../../game-state/GameState";
import { Entity } from "../../game-state/Entity";
import { Prefab } from "../../game-state/Prefab";
import { createStateMachineHandler, StateMachineScript, transitionScript } from "./StateMachineScript";
import { GameEvent } from "../../game-state/GameEvent";
import { SpawnListing, SpawnTable } from "../../game-state/DirectorState";

const IDLE_TIME = 200
const SECONDS_PER_XFADE_CYCLE = 15
const TABLE_XFADE_SPEED = 1 / (SECONDS_PER_XFADE_CYCLE * 1000 * Math.PI * 2)
const TABLE_XFADE_MAX = 0.8
const MAX_INTENSITY_MUTLIPLE = 1.5
const BOON_CHANCE = 1 / 15

const ENEMY_TABLES: SpawnTable[] = [
    {
        name: 'Asteroids',
        spawns: [
            { prefab: 'AsteroidBasic', intensity: 30, weight: 30 },
            { prefab: 'Plank', intensity: 25, weight: 4 },
        ]
    },
    {
        name: 'Minefield',
        spawns: [
            { prefab: 'BeamSpinner', intensity: 50, weight: 10 },
            { prefab: 'BouncyBall', intensity: 30, weight: 5 },
        ]
    },
    {
        name: 'Armada',
        spawns: [
            { prefab: 'Weaver', intensity: 40, weight: 80 },
            { prefab: 'Gunship', intensity: 80, weight: 13 },
            { prefab: 'MissileFrigate', intensity: 100, weight: 7 },
        ]
    },
]

const BOON_TABLE: SpawnTable = {
    name: 'Boons',
    spawns: [
        { prefab: 'Coin', intensity: 0, weight: 10 },
        { prefab: 'ShieldRecharge', intensity: 0, weight: 1 },
    ]
}

const WEIGHT_TOTALS: Map<SpawnTable, number> = new Map()
WEIGHT_TOTALS.set(BOON_TABLE, calculateWeightTotals(BOON_TABLE))
for (const table of ENEMY_TABLES) {
    WEIGHT_TOTALS.set(table, calculateWeightTotals(table))
}

const stateInit: StateMachineScript<'AsteroidSpawner'> = {
    type: "AsteroidSpawner",
    onEvent,
    onUpdate(gameState, entity) {
        gameState.enemyTableA = Math.floor(Math.random() * ENEMY_TABLES.length)
        const bRoll = Math.floor(Math.random() * ENEMY_TABLES.length) % (ENEMY_TABLES.length - 1)
        gameState.enemyTableB = (gameState.enemyTableA + bRoll + 1) % ENEMY_TABLES.length
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
        if (gameState.intensityFiltered < gameState.intensityBudget) {
            // Pick a table
            const tableXFade = Math.sin(gameState.gameTime * TABLE_XFADE_SPEED)
            const enemyTableIdx = (Math.random() * TABLE_XFADE_MAX) < tableXFade
                ? gameState.enemyTableA
                : gameState.enemyTableB

            let table: SpawnTable
            if (Math.random() < BOON_CHANCE) {
                table = BOON_TABLE
            } else {
                try {
                    table = ENEMY_TABLES[enemyTableIdx]
                } catch (err) {
                    throw new Error(`${enemyTableIdx}`, { cause: err })
                }
            }
            const weightTotal = WEIGHT_TOTALS.get(table) || 0

            // Roll an entry from the table
            let roll = Math.floor(Math.random() * weightTotal)
            let chosenListing: SpawnListing | undefined = undefined
            for (const entry of table.spawns) {
                if (roll <= entry.weight) {
                    chosenListing = entry
                    break
                }
                roll -= entry.weight
            }

            const maxAllowedIntensity = (MAX_INTENSITY_MUTLIPLE * gameState.intensityBudget) - gameState.intensityFiltered

            if (!chosenListing) {
                console.warn(`No listing chosen`)
            } else if (chosenListing.intensity <= 0 || chosenListing.intensity <= maxAllowedIntensity) {
                // Spawn the prefab
                const spawnedEntity = Prefab.spawn(gameState, chosenListing.prefab)
                spawnedEntity.intensity = chosenListing.intensity

                // Position the prefab
                const position = Prefab.spawn(
                    gameState,
                    spawnedEntity.defaultSpawner || 'SpawnPosClampedAbove',
                    0,
                    { size: spawnedEntity.radius }
                )
                
                spawnedEntity.posXL += position.posXL
                spawnedEntity.posYL += position.posYL
                spawnedEntity.posRL += position.posRL
                
                Entity.killEntity(position)
            }
        }
        transitionScript(gameState, entity, stateIdle)
    },
}

function onEvent(gameState: GameState, _: Entity, event: GameEvent) {
    if (GameEvent.isDeathEvent(event)) {
        gameState.intensityBudget = Math.round(gameState.intensityBudget * 1.05)
    }
}

export const AsteroidSpawnerScriptHandler = createStateMachineHandler('AsteroidSpawner', stateInit)

function calculateWeightTotals(table: SpawnTable) {
    return table.spawns.map(entry => entry.weight).reduce((a, b) => a + b), 0
}