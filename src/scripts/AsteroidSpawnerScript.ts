import { ColliderFlags, Entity, EntityFlags, World } from "../game-state/Entity";
import { GameState } from "../game-state/GameState";
import { BoundingBox } from "../game-state/BoundingBox";
import { Script } from "./Script";
import { CoinScript } from "./CoinScript";
import { PowerupScript } from "./PowerupScript";
import { BouncyBallScript } from "./BouncyBallScript";
import { Vector2 } from "../game-state/Vector";

const TIME_BETWEEN_SPAWNS = 180

const CHANCES: [number, typeof spawnAsteroid][] = [
    [3, spawnCoin],
    [2, spawnPowerup],
    [15, spawnNothing],
    [8, spawnBouncyBall],
    [70, spawnAsteroid],
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
                const [weight, spawnFn] = CHANCES[i]
                soFar += weight
                if (roll <= soFar) {
                    spawnFn(gameState, x, y)
                    break
                }
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

function clampToPlaySpace(gameState: GameState, x: number, width: number) {
    return x * ((gameState.playArea.width - width) / gameState.playArea.width)
}

function spawnAsteroid(gameState: GameState, x: number, y: number) {
    const entity = World.spawnEntity(gameState)

    const maxSize = gameState.playArea.width * 0.45
    const minSize = gameState.playArea.width * 0.1
    const size = Math.ceil((Math.random() * (maxSize - minSize)) + minSize)
    const halfSize = size * 0.5

    const maxVel = gameState.playArea.height * 0.7
    const minVel = gameState.playArea.height * 0.3
    const vel = Math.ceil(Math.random() * (maxVel - minVel)) + minVel

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

    entity.posX = clampToPlaySpace(gameState, x, 40)
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

    entity.posX = clampToPlaySpace(gameState, x, 40)
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

function spawnBouncyBall(gameState: GameState, x: number, y: number) {
    const entity = World.spawnEntity(gameState)

    const halfSize = 20

    const minMag = gameState.playArea.height * 0.7
    const maxMag = gameState.playArea.height * 0.9
    const minAngle = Math.PI * 1.25
    const maxAngle = Math.PI * 1.45 
    const angle = (Math.random() * (maxAngle - minAngle)) + minAngle
    const mag = (Math.random() * (maxMag - minMag)) + minMag
    const vec = Vector2.createFromAngle(angle, mag)

    entity.posX = x
    entity.posY = y - halfSize
    entity.velY = Vector2.yOf(vec)
    entity.velX = Vector2.xOf(vec) * (Math.random() < 0.5 ? 1 : -1)

    entity.flags |= EntityFlags.COLLIDER
    entity.colliderBbSrc = [BoundingBox.createCircleBb(0, 0, halfSize)]
    entity.colliderBbTransform = [BoundingBox.clone(entity.colliderBbSrc[0])]
    entity.colliderGroup = ColliderFlags.ENEMY
    entity.collidesWith = ColliderFlags.PLAYER | ColliderFlags.PLAYER_BULLET

    Script.attachScript(gameState, entity, BouncyBallScript)
    entity.flags |= EntityFlags.BOUNCE_IN_PLAY_SPACE
    entity.hp = Math.ceil(Math.random() * 3) + 1

    entity.colour = 'red'
    entity.flags |= EntityFlags.ROLE_ENEMY
}

function spawnNothing(state: GameState, x: number, y: number) {
    
}