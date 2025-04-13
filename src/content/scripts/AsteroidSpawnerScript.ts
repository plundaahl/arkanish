import { ColliderFlags, Entity, EntityFlags, World } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { BoundingBox } from "../../game-state/BoundingBox";
import { Script } from "../../game-state/Script";
import { CoinScript } from "./CoinScript";
import { PowerupScript } from "./PowerupScript";
import { BouncyBallScript } from "./BouncyBallScript";
import { Vector2 } from "../../game-state/Vector";
import { BeamSpinnerScript } from "./BeamSpinnerScript";
import { ExtraMath } from "../../Math";

const TIME_BETWEEN_SPAWNS = 180

type SpawnFn = (state: GameState, x: number, y: number) => any

const CHANCES: [number, SpawnFn][] = [
    [3, spawnCoin],
    [1, spawnShieldRecharge],
    [30, spawnNothing],
    [5, spawnBeamSpinner],
    [2, spawnBouncyBall],
    [40, spawnAsteroid],
    [5, spawnPlank],
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
    entity.posY = y - size
    entity.velY = vel

    entity.flags |= EntityFlags.COLLIDER
    entity.colliderBbSrc = [BoundingBox.createAabb(-halfSize, -halfSize, size, size)]
    entity.colliderBbTransform = [BoundingBox.clone(entity.colliderBbSrc[0])]
    entity.colliderGroup = ColliderFlags.ENEMY
    entity.collidesWith = ColliderFlags.PLAYER | ColliderFlags.PLAYER_BULLET

    entity.colour = 'red'
    entity.flags |= EntityFlags.KILLS_PLAYER_BULLETS
    entity.flags |= EntityFlags.HURTS_PLAYER
    entity.flags |= EntityFlags.HURT_BY_PLAYER_BULLETS
}

function spawnShieldRecharge(gameState: GameState, x: number, y: number) {
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

export function spawnBouncyBall(gameState: GameState, x: number, y: number) {
    const entity = World.spawnEntity(gameState)

    const halfSize = 20

    const minMag = gameState.playArea.height * 0.5
    const maxMag = gameState.playArea.height * 0.8
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
    entity.flags |= EntityFlags.KILLS_PLAYER_BULLETS
    entity.flags |= EntityFlags.HURTS_PLAYER
    entity.flags |= EntityFlags.HURT_BY_PLAYER_BULLETS
}

const PLANK_SECTION_SIZE = 50

function spawnPlank(gameState: GameState, x: number, y: number) {
    const center = World.spawnEntity(gameState)
    center.posX = x
    center.posY = y
    center.velY = ExtraMath.rollBetween(100, 250)
    center.velR = ExtraMath.rollBetween(0.25, 0.8) * Math.PI * positiveOrNegative()
    center.posR = Math.random() * Math.PI * 2

    const numSections = Math.floor(ExtraMath.rollBetween(3, 7))
    const halfWidth = PLANK_SECTION_SIZE * numSections * 0.5

    for (let i = 0; i < numSections; i++) {
        const section = World.spawnEntity(gameState)
        section.parent = center.id
        section.posX = (PLANK_SECTION_SIZE * i) - halfWidth

        section.flags |= EntityFlags.COLLIDER
        section.colliderGroup = ColliderFlags.ENEMY
        section.collidesWith = ColliderFlags.PLAYER | ColliderFlags.PLAYER_BULLET
        section.colliderBbSrc = [BoundingBox.createConvexPolyBb(
            Vector2.createFromCoordinates(-25, -25),
            Vector2.createFromCoordinates(25, -25),
            Vector2.createFromCoordinates(25, 25),
            Vector2.createFromCoordinates(-25, 25),
        )]
        section.colliderBbTransform = [BoundingBox.clone(section.colliderBbSrc[0])]

        section.colour = 'red'
        section.flags |= EntityFlags.KILLS_PLAYER_BULLETS
        section.flags |= EntityFlags.HURTS_PLAYER
        section.flags |= EntityFlags.HURT_BY_PLAYER_BULLETS
    }
}

const BEAM_LENGTH = 2000
const BEAM_WIDTH = 50
const BEAM_HALF_WIDTH = BEAM_WIDTH * 0.5
function spawnBeamSpinner(gameState: GameState, x: number, y: number) {
    // Spinner
    const spinner = World.spawnEntity(gameState)

    const size = 50
    const halfSize = size * 0.5

    const maxVel = gameState.playArea.height * 0.5
    const minVel = gameState.playArea.height * 0.2

    spinner.posX = x
    spinner.posY = y - size
    spinner.velY = ExtraMath.rollBetween(minVel, maxVel)
    spinner.velR = ExtraMath.rollBetween(0, 0.15) * Math.PI * positiveOrNegative()
    spinner.posR = Math.random() * Math.PI * 2

    spinner.flags |= EntityFlags.COLLIDER
    spinner.colliderBbSrc = [BoundingBox.createCircleBb(0, 0, halfSize)]
    spinner.colliderBbTransform = [BoundingBox.clone(spinner.colliderBbSrc[0])]
    spinner.colliderGroup = ColliderFlags.ENEMY
    spinner.collidesWith = ColliderFlags.PLAYER | ColliderFlags.PLAYER_BULLET

    spinner.colour = 'red'
    spinner.flags |= EntityFlags.KILLS_PLAYER_BULLETS
    spinner.flags |= EntityFlags.HURTS_PLAYER
    spinner.flags |= EntityFlags.HURT_BY_PLAYER_BULLETS

    // Hit box
    const hitBox = World.spawnEntity(gameState)
    hitBox.parent = spinner.id
    hitBox.colliderBbSrc = [BoundingBox.createConvexPolyBb(
        Vector2.createFromCoordinates(-BEAM_LENGTH, -BEAM_HALF_WIDTH),
        Vector2.createFromCoordinates(BEAM_LENGTH, -BEAM_HALF_WIDTH),
        Vector2.createFromCoordinates(BEAM_LENGTH, BEAM_HALF_WIDTH),
        Vector2.createFromCoordinates(-BEAM_LENGTH, BEAM_HALF_WIDTH),
    )]
    hitBox.colliderBbTransform = [BoundingBox.clone(hitBox.colliderBbSrc[0])]
    hitBox.colliderGroup = ColliderFlags.ENEMY
    hitBox.collidesWith = ColliderFlags.PLAYER
    hitBox.flags |= EntityFlags.HURTS_PLAYER
    hitBox.colour = '#FFFFFF00'

    Script.attachScript(gameState, hitBox, BeamSpinnerScript)
}

function spawnNothing(state: GameState, x: number, y: number) {
    
}

function positiveOrNegative() {
    return Math.random() < 0.5 ? -1 : 1
}