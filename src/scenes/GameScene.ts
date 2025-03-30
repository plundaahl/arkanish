import { CURSOR_DOWN, Scene, UiState } from './Scene'
import { EntityStates, World } from '../game-state/Entity'
import { ColliderFlags, Entity, EntityFlags } from '../game-state/Entity'
import { BoundingBox, BoundingBoxTypes } from '../game-state/BoundingBox'
import { Flag } from '../game-state/Flag'
import { CollisionSystem } from '../systems/CollisionSystem'
import { ScriptSystem } from '../systems/ScriptSystem'
import { PlayerScript } from '../scripts/PlayerScript'
import { BulletScript } from '../scripts/BulletScript'
import { GameState } from '../game-state/GameState'
import { SpawnSystem } from '../systems/SpawnSystem'
import { MovementSystem } from '../systems/MovementSystem'
import { Script } from '../scripts/Script'
import { spawnAsteroidSpawner } from '../scripts/AsteroidSpawnerScript'
import { EventSystem } from '../systems/EventSystem'

const STAR_TIME_SCALE = 1 / 5000
const PLAYER_SCALE = 2
const PLAYER_HEIGHT_HALF = PLAYER_SCALE * 15
const PLAYER_WIDTH_HALF = PLAYER_SCALE * 10
const PLAYER_OFFSET = PLAYER_HEIGHT_HALF / 2
const PLAYER_RATE_OF_FIRE = 200
const PLAYER_BULLET_SPEED = -500
const MS_PER_SCORE_TICK = 800

type State = GameState

export class GameScene implements Scene {
    private state: State;

    constructor(
        private readonly onDeath: () => void,
    ) {}

    update(time: number, canvas: CanvasRenderingContext2D, uiState: UiState): void {
        if (!this.state) {
            this.state = GameState.create(time)
            this.state.playerId = spawnPlayer(this.state).id
            spawnAsteroidSpawner(this.state, 0, -100)
        }

        this.state.frameLength = time - this.state.time
        this.state.time = time

        this.incrementScoreForTime(time)
        SpawnSystem.runSpawn(this.state)
        
        this.handlePlayerInput(time, uiState)
        MovementSystem.run(this.state)
        CollisionSystem.run(this.state)
        
        EventSystem.run(this.state)
        ScriptSystem.run(this.state)

        SpawnSystem.runDespawn(this.state)

        this.renderBackground(time, canvas, uiState)
        this.renderBoundingBoxes(canvas)
        this.renderPlayer(canvas)
        this.renderUi(canvas)

        const player = World.getEntity(this.state, this.state.playerId)
        if (!player) {
            this.onDeath()
        }
    }

    private handlePlayerInput(time: number, uiState: UiState) {
        if (!uiState.cursorActive) {
            return
        }

        const player = World.getEntity(this.state, this.state.playerId)
        if (!player || player.scriptState === PlayerScript.DYING) {
            return
        }

        player.posX = uiState.cursorX
        player.posY = uiState.cursorY

        if (uiState.cursorState === CURSOR_DOWN && time > this.state.playerNextShotTime) {
            this.state.playerNextShotTime = time + PLAYER_RATE_OF_FIRE
            spawnPlayerBullet(this.state, player.posX, player.posY - PLAYER_HEIGHT_HALF)
        }
    }

    private incrementScoreForTime(time: number) {
        this.state.scoreTimeIncrementer += time - this.state.time
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

    private renderBoundingBoxes(ctx: CanvasRenderingContext2D) {
        ctx.save()
        ctx.lineWidth = 2
        for (const entity of this.state.entities) {
            if (entity.state !== EntityStates.ALIVE
                || !Flag.hasBigintFlags(entity.flags, EntityFlags.COLLIDER)
            ) {
                continue
            }
            for (const box of entity.colliderBbTransform) {
                if (box.type === BoundingBoxTypes.AABB) {
                    if (this.state.collidedEntities.has(entity.id)) {
                        ctx.fillStyle = entity.colour || 'white'
                        ctx.fillRect(box.left, box.top, box.width, box.height)
                    } else {
                        ctx.strokeStyle = entity.colour || 'white'
                        ctx.strokeRect(box.left, box.top, box.width, box.height)
                    }
                }
            }
        }
        ctx.restore()
    }

    private renderPlayer(ctx: CanvasRenderingContext2D): void {
        const player = World.getEntity(this.state, this.state.playerId)
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

        const player = World.getEntity(this.state, this.state.playerId)

        ctx.font = '20px serif'
        ctx.fillStyle = 'white'

        const hpText = `HP: ${player?.hp || 0}`
        const scoreText = `Score: ${this.state.score}`

        const hpTextMetrics = ctx.measureText(hpText)

        ctx.fillText(hpText, 50, 50)
        ctx.fillText(scoreText, 50, 50 + hpTextMetrics.actualBoundingBoxAscent + hpTextMetrics.actualBoundingBoxDescent + 10)

        ctx.restore()
    }
}

function spawnPlayer(gameState: GameState): Entity {
    const player = World.spawnEntity(gameState)
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
    player.colliderGroup = ColliderFlags.PLAYER
    player.collidesWith = ColliderFlags.ENEMY | ColliderFlags.POWERUP
    player.colour = 'green'

    Script.attachScript(gameState, player, PlayerScript)

    player.hp = 3

    return player
}

function spawnPlayerBullet(gameState: GameState, x: number, y: number) {
    const bullet = World.spawnEntity(gameState)
    bullet.flags |= EntityFlags.ROLE_PLAYER_BULLET

    bullet.posX = x
    bullet.posY = y
    bullet.velY = PLAYER_BULLET_SPEED

    bullet.flags |= EntityFlags.COLLIDER
    bullet.colliderBbSrc = [BoundingBox.createAabb(-5, -5, 10, 10)]
    bullet.colliderBbTransform = [BoundingBox.createAabb(-5, -5, 10, 10)]
    bullet.colliderGroup = ColliderFlags.PLAYER_BULLET
    bullet.collidesWith = ColliderFlags.ENEMY

    Script.attachScript(gameState, bullet, BulletScript)

    bullet.colour = 'red'
}
