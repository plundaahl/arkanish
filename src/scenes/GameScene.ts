import { CURSOR_DOWN, Scene, UiState } from './Scene'
import { World } from '../World'
import { ColliderFlag, Entity, EntityFlags } from '../Entity'
import { BoundingBox, BoundingBoxTypes } from '../BoundingBox'
import { Flag } from '../Flag'
import { Collisions, CollisionSystem } from '../CollisionDetectionSystem'
import { ScriptSystem } from '../ScriptSystem'
import { GameEventBuffer } from '../GameEvent'
import { PlayerScript } from '../Script/PlayerScript'
import { PowerupScript } from '../Script/PowerupScript'
import { BulletScript } from '../Script/BulletScript'

const MS_PER_SEC = 1000

const STAR_TIME_SCALE = 1 / 5000
const PLAYER_SCALE = 2
const PLAYER_HEIGHT_HALF = PLAYER_SCALE * 15
const PLAYER_WIDTH_HALF = PLAYER_SCALE * 10
const PLAYER_OFFSET = PLAYER_HEIGHT_HALF / 2
const PLAYER_RATE_OF_FIRE = 200
const PLAYER_BULLET_SPEED = -500
const MS_PER_SCORE_TICK = 800

type State = {
    playerId: number,
    world: World,
    lastSpawnTime: number,
    numEntities: number,
    playerNextShotTime: number,
    score: number,
    scoreTimeIncrementer: number,
}

export class GameScene implements Scene {
    private state: State;
    private collisions: Collisions = CollisionSystem.makeState()
    private eventBuffer: GameEventBuffer = GameEventBuffer.create() 

    constructor(
        private readonly onDeath: () => void,
    ) {}

    update(time: number, canvas: CanvasRenderingContext2D, uiState: UiState): void {
        if (!this.state) {
            this.init(time, uiState)
        }

        this.incrementScoreForTime(time)
        this.handlePlayerInput(time, uiState)
        this.spawnEntities(time, uiState)
        this.updateMovement(time)
        this.updateBoundingBoxTransforms()
        CollisionSystem.run(this.state.world, this.collisions, this.eventBuffer)
        ScriptSystem.run(this.state.world, this.eventBuffer)
        GameEventBuffer.clear(this.eventBuffer)
        this.removeDyingEntities()
        this.removeOutOfBoundsEntities(uiState)

        this.renderBackground(time, canvas, uiState)
        this.renderGameObjects(time, canvas)
        this.renderUi(canvas)

        this.state.world.lastUpdateTime = time

        const player = World.getEntity(this.state.world, this.state.playerId)
        if (!player) {
            this.onDeath()
        }
    }

    private init(time: number, ui: UiState) {
        this.state = {
            playerId: 0,
            world: World.create(),
            lastSpawnTime: time,
            numEntities: 0,
            playerNextShotTime: 0,
            score: 0,
            scoreTimeIncrementer: 0,
        }
        this.state.world.lastUpdateTime = time

        const player = spawnPlayer(this.state.world)
        this.state.playerId = player.id

        console.log(this)
    }

    private handlePlayerInput(time: number, uiState: UiState) {
        if (!uiState.cursorActive) {
            return
        }

        const player = World.getEntity(this.state.world, this.state.playerId)
        if (!player || player.scriptState === PlayerScript.DYING) {
            return
        }

        player.posX = uiState.cursorX
        player.posY = uiState.cursorY

        if (uiState.cursorState === CURSOR_DOWN && time > this.state.playerNextShotTime) {
            this.state.playerNextShotTime = time + PLAYER_RATE_OF_FIRE
            spawnPlayerBullet(this.state.world, player.posX, player.posY - PLAYER_HEIGHT_HALF)
        }
    }

    private incrementScoreForTime(time: number) {
        this.state.scoreTimeIncrementer += time - this.state.world.lastUpdateTime
        if (this.state.scoreTimeIncrementer > MS_PER_SCORE_TICK) {
            this.state.scoreTimeIncrementer -= MS_PER_SCORE_TICK
            this.state.score += 1
        }
    }

    private renderBackground(time: number, ctx: CanvasRenderingContext2D, ui: UiState): void {
        const { width, height } = ui

        ctx.save()

        ctx.clearRect(0, 0, width, height)
        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, width, height)

        ctx.fillStyle = 'white'

        for (let i = 0; i < 100; i++) {
            const xScaler = (i * i) + (i / 3)
            const yScaler = (i * i * i) - (i / 73)
            const speedScaler = ((((i + xScaler + yScaler) % 10) / 10) + 0.5)
            const sizeScaler = (speedScaler * 2) + 0.1 
            const xPos = (1.37 * xScaler * ui.width) % ui.width
            const yPos = ((0.83 * yScaler * ui.height) + (time * speedScaler * STAR_TIME_SCALE * ui.height)) % ui.height
            ctx.fillRect(xPos, yPos, sizeScaler, sizeScaler)
        }

        ctx.restore()
    }

    private renderGameObjects(time: number, ctx: CanvasRenderingContext2D): void {
        // Render Bounding Boxes
        ctx.save()
        ctx.lineWidth = 2
        for (const entity of this.state.world.entities) {
            const colourIfDying = entity.flags & EntityFlags.DYING ? 'yellow' : ''
            if (Flag.hasBigintFlags(entity.flags, EntityFlags.ALIVE, EntityFlags.COLLIDER)) {
                for (const box of entity.colliderBbTransform) {
                    if (box.type === BoundingBoxTypes.AABB) {
                        if (this.collisions.collidedEntities.has(entity.id)) {
                            ctx.fillStyle = colourIfDying || entity.colour || 'white'
                            ctx.fillRect(box.left, box.top, box.width, box.height)
                        } else {
                            ctx.strokeStyle = colourIfDying || entity.colour || 'white'
                            ctx.strokeRect(box.left, box.top, box.width, box.height)
                        }
                    }
                }
            }
        }
        ctx.restore()

        // Render Player
        const player = World.getEntity(this.state.world, this.state.playerId)
        if (player) {
            ctx.save()
            ctx.beginPath()

            ctx.moveTo(player.posX, player.posY - PLAYER_HEIGHT_HALF - PLAYER_OFFSET)
            ctx.lineTo(player.posX - PLAYER_WIDTH_HALF, player.posY + PLAYER_HEIGHT_HALF - PLAYER_OFFSET)
            ctx.lineTo(player.posX, player.posY + (PLAYER_HEIGHT_HALF / 2) - PLAYER_OFFSET)
            ctx.lineTo(player.posX + PLAYER_WIDTH_HALF, player.posY + PLAYER_HEIGHT_HALF - PLAYER_OFFSET)
            ctx.closePath()

            if (player.scriptState === PlayerScript.INVULNERABLE) {
                ctx.lineWidth = 2
                ctx.strokeStyle = 'red'
                ctx.stroke()
            } else {
                ctx.fillStyle = player.scriptState === PlayerScript.DYING
                    ? 'white'
                    : 'red'
                ctx.fill()
            }
            
            ctx.restore()
        }
    }

    private renderUi(ctx: CanvasRenderingContext2D) {
        ctx.save()

        const player = World.getEntity(this.state.world, this.state.playerId)

        ctx.font = '20px serif'
        ctx.fillStyle = 'white'

        const hpText = `HP: ${player?.hp || 0}`
        const scoreText = `Score: ${this.state.score}`
        const stateText = `State: ${player?.scriptTimeEnteredState}`

        const hpTextMetrics = ctx.measureText(hpText)

        ctx.fillText(hpText, 50, 50)
        ctx.fillText(scoreText, 50, 50 + hpTextMetrics.actualBoundingBoxAscent + hpTextMetrics.actualBoundingBoxDescent + 10)
        ctx.fillText(stateText, 50, 50 + ((hpTextMetrics.actualBoundingBoxAscent + hpTextMetrics.actualBoundingBoxDescent + 10) * 2))

        ctx.restore()
    }

    private spawnEntities(time: number, uiState: UiState) {
        if (this.state.numEntities < 50 && time - this.state.lastSpawnTime > 150) {
            this.state.numEntities++;
            this.state.lastSpawnTime = time

            const x = Math.ceil(Math.random() * uiState.width)
            const y = -50
            if (Math.random() < 0.9) {
                spawnAsteroid(this.state.world, x, y)
            } else {
                spawnPowerup(this.state.world, x, y)
            }
        }

    }
    
    private removeOutOfBoundsEntities(uiState: UiState) {
        const world = this.state.world
        for (let i = 0; i < world.entities.length; i++) {
            const entity = world.entities[i]
            if (!(entity.flags & EntityFlags.ALIVE)) {
                continue
            }
            if ((entity.velY > 0 && entity.posY > uiState.height + 200)
                || (entity.velY < 0 && entity.posY < -200)) {
                World.releaseEntity(world, entity)
                this.state.numEntities--
            }
        }
    }

    private updateMovement(time: number) {
        const deltaT = time - this.state.world.lastUpdateTime
        const world = this.state.world

        for (let i = 0; i < world.entities.length; i++) {
            const entity = world.entities[i]
            if (entity.flags & EntityFlags.ALIVE) {
                entity.posY += (entity.velY * deltaT) / MS_PER_SEC
            }
        }
    }

    private updateBoundingBoxTransforms() {
        for (const entity of this.state.world.entities) {
            if (entity.flags & EntityFlags.ALIVE) {
                for (let i = 0; i < entity.colliderBbSrc.length; i++) {
                    const src = entity.colliderBbSrc[i]
                    const dest = entity.colliderBbTransform[i]
                    BoundingBox.transform(src, dest, entity.posX, entity.posY)
                } 
            }
        }
    }

    private removeDyingEntities() {
        const world = this.state.world
        for (let i = 0; i < world.entities.length; i++) {
            const entity = world.entities[i]
            if (Flag.hasBigintFlags(entity.flags, EntityFlags.DYING, EntityFlags.ALIVE)) {
                World.releaseEntity(world, entity)
            }
        }
    }
}

function spawnPlayer(world: World): Entity {
    const player = World.spawnEntity(world)
    player.flags |= EntityFlags.ROLE_PLAYER

    player.flags |= EntityFlags.COLLIDER
    player.colliderBbSrc = [
        BoundingBox.createAabb(-20, -15, 40, 30),
        BoundingBox.createAabb(-10, -45, 20, 30),
    ]
    player.colliderBbTransform = [
        BoundingBox.createAabb(0, 0, 0, 0),
        BoundingBox.createAabb(0, 0, 0, 0),
    ]
    player.colliderGroup = ColliderFlag.PLAYER
    player.collidesWith = ColliderFlag.ENEMY | ColliderFlag.POWERUP
    player.colour = 'green'

    ScriptSystem.attachScript(world, player, PlayerScript)

    player.hp = 3

    return player
}

function spawnPlayerBullet(world: World, x: number, y: number) {
    const bullet = World.spawnEntity(world)
    bullet.flags |= EntityFlags.ROLE_PLAYER_BULLET

    bullet.posX = x
    bullet.posY = y
    bullet.velY = PLAYER_BULLET_SPEED

    bullet.flags |= EntityFlags.COLLIDER
    bullet.colliderBbSrc = [BoundingBox.createAabb(-5, -5, 10, 10)]
    bullet.colliderBbTransform = [BoundingBox.createAabb(-5, -5, 10, 10)]
    bullet.colliderGroup = ColliderFlag.PLAYER_BULLET
    bullet.collidesWith = ColliderFlag.ENEMY

    ScriptSystem.attachScript(world, bullet, BulletScript)

    bullet.colour = 'red'
}

function spawnAsteroid(world: World, x: number, y: number) {
    const entity = World.spawnEntity(world)

    const halfSize = Math.ceil((Math.random() * 100) + 20)
    const size = halfSize * 2
    const vel = Math.ceil(Math.random() * 300) + 300

    entity.posX = x
    entity.posY = y - halfSize
    entity.velY = vel

    entity.flags |= EntityFlags.COLLIDER
    entity.colliderBbSrc = [BoundingBox.createAabb(-halfSize, -halfSize, size, size)]
    entity.colliderBbTransform = [BoundingBox.clone(entity.colliderBbSrc[0])]
    entity.colliderGroup = ColliderFlag.ENEMY
    entity.collidesWith = ColliderFlag.PLAYER | ColliderFlag.PLAYER_BULLET

    entity.colour = 'red'
    entity.flags |= EntityFlags.ROLE_ENEMY
}

function spawnPowerup(world: World, x: number, y: number) {
    const entity = World.spawnEntity(world)
    entity.flags |= EntityFlags.ROLE_POWERUP

    entity.posX = x
    entity.posY = y
    entity.velY = 350

    entity.flags |= EntityFlags.COLLIDER
    entity.colliderBbSrc = [BoundingBox.createAabb(-20, -20, 40, 40)]
    entity.colliderBbTransform = [BoundingBox.clone(entity.colliderBbSrc[0])]
    entity.colliderGroup = ColliderFlag.POWERUP
    entity.collidesWith = ColliderFlag.PLAYER

    entity.colour = 'blue' 

    ScriptSystem.attachScript(world, entity, PowerupScript)
}
