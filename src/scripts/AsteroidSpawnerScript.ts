import { ColliderFlags, Entity, EntityFlags, World } from "../game-state/Entity";
import { GameState } from "../game-state/GameState";
import { BoundingBox } from "../game-state/BoundingBox";
import { Script } from "./Script";
import { CoinScript } from "./CoinScript";
import { PowerupScript } from "./PowerupScript";

const TIME_BETWEEN_SPAWNS = 150
const PLAY_AREA_WIDTH = 1000

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
            const x = Math.ceil(Math.random() * PLAY_AREA_WIDTH) + entity.posX
            const y = entity.posY
            const roll = Math.random()

            if (roll < 0.90) {
                spawnAsteroid(gameState, x, y)
            } else if (roll < 0.99) {
                spawnPowerup(gameState, x, y)
            } else {
                spawnCoin(gameState, x, y)
            }
            Script.transitionTo(gameState, entity, AsteroidSpawnerScript.IDLE)
        }
    },
    handleEvent: (): void => {},
}

export function spawnAsteroidSpawner(gameState: GameState, x: number, y: number) {
    const entity = World.spawnEntity(gameState)
    entity.posX = x
    entity.posY = y

    Script.attachScript(gameState, entity, AsteroidSpawnerScript)
}

function randomVel() {
    return Math.ceil(Math.random() * 300) + 300
}

function spawnAsteroid(gameState: GameState, x: number, y: number) {
    const entity = World.spawnEntity(gameState)

    const halfSize = Math.ceil((Math.random() * 100) + 20)
    const size = halfSize * 2
    const vel = randomVel()

    entity.posX = x
    entity.posY = y - halfSize
    entity.velY = vel

    entity.flags |= EntityFlags.COLLIDER
    entity.colliderBbSrc = [BoundingBox.createAabb(-halfSize, -halfSize, size, size)]
    entity.colliderBbTransform = [BoundingBox.clone(entity.colliderBbSrc[0])]
    entity.colliderGroup = ColliderFlags.ENEMY
    entity.collidesWith = ColliderFlags.PLAYER | ColliderFlags.PLAYER_BULLET

    entity.colour = 'red'
    entity.flags |= EntityFlags.ROLE_ENEMY
}

function spawnPowerup(gameState: GameState, x: number, y: number) {
    const entity = World.spawnEntity(gameState)
    entity.flags |= EntityFlags.ROLE_PICKUP

    entity.posX = x
    entity.posY = y
    entity.velY = 350

    entity.flags |= EntityFlags.COLLIDER
    entity.colliderBbSrc = [BoundingBox.createAabb(-20, -20, 40, 40)]
    entity.colliderBbTransform = [BoundingBox.clone(entity.colliderBbSrc[0])]
    entity.colliderGroup = ColliderFlags.POWERUP
    entity.collidesWith = ColliderFlags.PLAYER

    entity.colour = 'blue' 

    Script.attachScript(gameState, entity, PowerupScript)
}

function spawnCoin(gameState: GameState, x: number, y: number) {
    const entity = World.spawnEntity(gameState)
    entity.flags |= EntityFlags.ROLE_PICKUP

    entity.posX = x
    entity.posY = y
    entity.velY = 350

    entity.flags |= EntityFlags.COLLIDER
    entity.colliderBbSrc = [BoundingBox.createAabb(-20, -20, 40, 40)]
    entity.colliderBbTransform = [BoundingBox.clone(entity.colliderBbSrc[0])]
    entity.colliderGroup = ColliderFlags.POWERUP
    entity.collidesWith = ColliderFlags.PLAYER

    entity.colour = 'yellow' 

    Script.attachScript(gameState, entity, CoinScript)
}