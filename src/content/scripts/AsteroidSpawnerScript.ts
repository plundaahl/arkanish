import { Entity } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Script } from "../../game-state/Script";
import { Prefab } from "../../game-state/Prefab";

const TIME_BETWEEN_SPAWNS = 180

const NOTHING = 'N/A'

const CHANCES: [number, string][] = [
    [30, NOTHING],
    [3, 'Coin'],
    [1, 'ShieldRecharge'],
    [5, 'BeamSpinner'],
    [2, 'BouncyBall'],
    [40, 'Asteroid'],
    [5, 'Plank'],
]
const TOTAL = CHANCES.map(([chance]) => chance).reduce((prev, total) => prev + total, 0)

export const AsteroidSpawnerScript = {
    id: 'AsteroidSpawner',
    IDLE: 0,
    SPAWNING: 1,
    update: (gameState: GameState, entity: Entity): void => {
        if (entity.scriptState === AsteroidSpawnerScript.IDLE) {
            if (gameState.time > entity.scriptTimeEnteredState + TIME_BETWEEN_SPAWNS) {
                Script.transitionTo(gameState, entity, AsteroidSpawnerScript.SPAWNING)
            }
        } else if (entity.scriptState === AsteroidSpawnerScript.SPAWNING) {
            const x = Math.ceil(Math.random() * gameState.playArea.width) + gameState.playArea.left + entity.posX
            const y = entity.posY
            const roll = Math.floor(Math.random() * TOTAL)

            let soFar = 0
            for (let i = 0; i < CHANCES.length; i++) {
                const [weight, prefabName] = CHANCES[i]
                soFar += weight
                if (roll <= soFar) {
                    if (prefabName !== NOTHING) {
                        const entity = Prefab.spawn(gameState, prefabName)
                        entity.posX = clampToPlaySpace(gameState, x, 40)
                        entity.posY += y
                    }
                    break
                }
            }
            Script.transitionTo(gameState, entity, AsteroidSpawnerScript.IDLE)
        }
    },
    handleEvent: (): void => {},
}

function clampToPlaySpace(gameState: GameState, x: number, width: number) {
    return x * ((gameState.playArea.width - width) / gameState.playArea.width)
}
