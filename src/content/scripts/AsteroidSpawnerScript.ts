import { Entity } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Script } from "../../game-state/Script";
import { Prefab } from "../../game-state/Prefab";
import { ExtraMath } from "../../Math";

const NOTHING = 'N/A'

const SPAWN_LISTS: [string, number][][] = [
    [
        [NOTHING, 30],
        ['Coin', 3],
        ['ShieldRecharge', 1],
        ['BeamSpinner', 5],
        ['BouncyBall', 2],
        ['Asteroid', 40],
        ['Plank', 5],
    ],
    [
        [NOTHING, 30],
        ['BeamSpinner', 10],
    ],
    [
        [NOTHING, 20],
        ['BeamSpinner', 5],
        ['Asteroid', 40],
        ['Plank', 8],
    ],
]

const IDLE_TIME = 180

export const AsteroidSpawnerScript = {
    id: 'AsteroidSpawner',
    INIT: 0,
    IDLE: 1,
    SPAWNING: 2,
    update: (gameState: GameState, entity: Entity): void => {
        const sectionTime = gameState.time - entity.scriptTimeEnteredState

        if (entity.scriptState === AsteroidSpawnerScript.INIT) {
            entity.hp = Math.round(ExtraMath.rollBetween(0, SPAWN_LISTS.length - 1))
            Script.transitionTo(gameState, entity, AsteroidSpawnerScript.SPAWNING)

        } else if (entity.scriptState === AsteroidSpawnerScript.IDLE && sectionTime > IDLE_TIME) { 
            Script.transitionTo(gameState, entity, AsteroidSpawnerScript.SPAWNING)

        } else if (entity.scriptState === AsteroidSpawnerScript.SPAWNING) {
            const spawnList = SPAWN_LISTS[entity.hp]

            const prefabName = ExtraMath.rollOneOf(...spawnList)
            if (prefabName !== NOTHING) {
                const spawnedEntity = Prefab.spawn(gameState, prefabName)
                const x = Math.ceil(Math.random() * gameState.playArea.width) + gameState.playArea.left + entity.posX
                spawnedEntity.posX = clampToPlaySpace(gameState, x, 40)
                spawnedEntity.posY += entity.posY
            }
            Script.transitionTo(gameState, entity, AsteroidSpawnerScript.IDLE)
        }
    },
    handleEvent: (): void => {},
}

function clampToPlaySpace(gameState: GameState, x: number, width: number) {
    return x * ((gameState.playArea.width - width) / gameState.playArea.width)
}
