import { Scene, UiState } from './Scene'
import { World } from '../World'
import { EntityFlags } from '../Entity'
import { BoundingBox, BoundingBoxTypes } from '../BoundingBox'

const MS_PER_SEC = 1000

const STAR_TIME_SCALE = 1 / 5000
const PLAYER_SCALE = 2
const PLAYER_HEIGHT_HALF = PLAYER_SCALE * 15
const PLAYER_WIDTH_HALF = PLAYER_SCALE * 10
const PLAYER_OFFSET = PLAYER_HEIGHT_HALF / 2

const COLLIDER_FLAGS = EntityFlags.ALIVE | EntityFlags.COLLIDER

const COLLIDER_GROUP_PLAYER = 1
const COLLIDER_GROUP_ENEMY = 1 << 1
const COLLIDER_GROUP_POWERUP = 1 << 2

type State = {
    playerX: number,
    playerY: number,
    playerId: number,
    world: World,
    lastSpawnTime: number,
    numEntities: number,
    health: number,
    quitTime: number,
}

export class GameScene implements Scene {
    private prevTime: number;
    private state: State;
    private collidedEntities: Set<number> = new Set()
    private collisions: number[] = [] // Pairs of entity IDs: the listener, and the one that was collided with

    constructor(
        private readonly onDeath: () => void,
    ) {}

    update(time: number, canvas: CanvasRenderingContext2D, uiState: UiState): void {
        if (!this.state) {
            this.init(time, uiState)
        }

        this.updatePlayerPos(uiState)
        this.spawnEntities(time, uiState)
        this.updateMovement(time)
        this.updateBoundingBoxTransforms()
        this.detectCollisions()
        this.handlePlayerCollisions(time)
        this.renderBackground(time, canvas, uiState)
        this.renderGameObjects(time, canvas)
        this.prevTime = time

        if (this.state.quitTime > 0 && time >= this.state.quitTime) {
            this.onDeath()
        }
    }

    private init(time: number, ui: UiState) {
        this.prevTime = time
        this.state = {
            playerX: ui.width / 2,
            playerY: 9 * ui.height / 12,
            playerId: 0,
            world: World.create(),
            lastSpawnTime: time,
            numEntities: 0,
            health: 3,
            quitTime: -1,
        }

        const player = World.spawnEntity(this.state.world)
        this.state.playerId = player.id

        player.flags |= EntityFlags.COLLIDER
        player.colliderBbSrc = [
            BoundingBox.createAabb(-20, -15, 40, 30),
            BoundingBox.createAabb(-10, -45, 20, 30),
        ]
        player.colliderBbTransform = [
            BoundingBox.createAabb(0, 0, 0, 0),
            BoundingBox.createAabb(0, 0, 0, 0),
        ]
        player.colliderGroup = COLLIDER_GROUP_PLAYER
        player.collidesWith = COLLIDER_GROUP_ENEMY

        console.log(this)
    }

    private updatePlayerPos(uiState: UiState) {
        if (uiState.cursorActive && this.state.health > 0) {
            const player = World.getEntity(this.state.world, this.state.playerId)
            if (player) {
                player.posX = uiState.cursorX
                player.posY = uiState.cursorY
            }
            this.state.playerX = uiState.cursorX
            this.state.playerY = uiState.cursorY
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
        ctx.save()

        ctx.beginPath()
        ctx.moveTo(this.state.playerX, this.state.playerY - PLAYER_HEIGHT_HALF - PLAYER_OFFSET)
        ctx.lineTo(this.state.playerX - PLAYER_WIDTH_HALF, this.state.playerY + PLAYER_HEIGHT_HALF - PLAYER_OFFSET)
        ctx.lineTo(this.state.playerX, this.state.playerY + (PLAYER_HEIGHT_HALF / 2) - PLAYER_OFFSET)
        ctx.lineTo(this.state.playerX + PLAYER_WIDTH_HALF, this.state.playerY + PLAYER_HEIGHT_HALF - PLAYER_OFFSET)
        ctx.closePath()
        ctx.fillStyle = this.state.health === 3
            ? '#FF0000'
            : this.state.health === 2
            ? '#990000'
            : this.state.health === 1
            ? '#550000'
            : 'white'
            
        ctx.lineWidth = 5
        ctx.fill()

        ctx.restore()

        ctx.save()
        ctx.lineWidth = 2
        for (const entity of this.state.world.entities) {
            if ((entity.flags & COLLIDER_FLAGS) === COLLIDER_FLAGS) {
                const colour = entity.colliderGroup === COLLIDER_GROUP_PLAYER
                    ? 'green'
                    : entity.colliderGroup === COLLIDER_GROUP_ENEMY
                    ? 'red'
                    : entity.colliderGroup === COLLIDER_GROUP_POWERUP
                    ? 'blue'
                    : 'white'

                for (const box of entity.colliderBbTransform) {
                    if (box.type === BoundingBoxTypes.AABB) {
                        if (this.collidedEntities.has(entity.id)) {
                            ctx.fillStyle = colour
                            ctx.fillRect(box.left, box.top, box.width, box.height)
                        } else {
                            ctx.strokeStyle = colour
                            ctx.strokeRect(box.left, box.top, box.width, box.height)
                        }
                    }
                }
            }
        }
        ctx.restore()
    }

    private spawnEntities(time: number, uiState: UiState) {
        if (this.state.numEntities < 50 && time - this.state.lastSpawnTime > 1000) {
            this.state.numEntities++;
            this.state.lastSpawnTime = time

            const type = Math.random() < 0.5
                ? COLLIDER_GROUP_ENEMY
                : COLLIDER_GROUP_POWERUP

            const entity = World.spawnEntity(this.state.world)
            entity.posX = Math.ceil(Math.random() * uiState.width)
            entity.posY = Math.ceil(0)
            entity.velY = 350
            entity.flags |= EntityFlags.COLLIDER
            entity.colliderBbSrc = [BoundingBox.createAabb(-20, -20, 40, 40)]
            entity.colliderBbTransform = [BoundingBox.clone(entity.colliderBbSrc[0])]
            entity.colliderGroup = type
            entity.collidesWith = COLLIDER_GROUP_PLAYER
        }

        const world = this.state.world
        for (let i = 0; i < world.entities.length; i++) {
            const entity = world.entities[i]
            if (entity.flags & EntityFlags.ALIVE && entity.posY > uiState.height + 40) {
                World.releaseEntity(world, entity)
                this.state.numEntities--
            }
        }
    }

    private updateMovement(time: number) {
        const deltaT = time - this.prevTime
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

    private detectCollisions() {
        this.collidedEntities.clear()
        this.collisions.length = 0

        const entities = this.state.world.entities

        for (let i = 0; i < entities.length; i++) {
            const entityI = entities[i]
            if ((entityI.flags & COLLIDER_FLAGS) !== COLLIDER_FLAGS) {
                continue
            }
            for (let j = i + 1; j < entities.length; j++) {
                const entityJ = entities[j]
                if ((entityJ.flags & COLLIDER_FLAGS) !== COLLIDER_FLAGS) {
                    continue
                }

                const entityIListens = (entityI.collidesWith & entityJ.colliderGroup) !== 0
                const entityJListens = (entityJ.collidesWith & entityI.colliderGroup) !== 0

                if (!(entityIListens || entityJListens)) {
                    continue
                }

                for (const a of entityI.colliderBbTransform) {
                    for (const b of entityJ.colliderBbTransform) {
                        if (BoundingBox.intersects(a, b)) {
                            if (entityIListens) {
                                this.collidedEntities.add(entityI.id)
                                this.collisions.push(entityI.id, entityJ.id)
                            }
                            if (entityJListens) {
                                this.collidedEntities.add(entityJ.id)

                                this.collisions.push(entityJ.id, entityI.id)
                            }
                        }
                    }
                }
            }
        }
    }

    private handlePlayerCollisions(time: number) {
        for (let i = 0; i < this.collisions.length; i += 2) {
            const selfId = this.collisions[i]
            const otherId = this.collisions[i + 1]
            if (selfId === this.state.playerId) {
                const player = World.getEntity(this.state.world, selfId)
                const other = World.getEntity(this.state.world, otherId)
                if (!player || !other) {
                    continue
                }
                if (other.colliderGroup & COLLIDER_GROUP_ENEMY && player.invulnerableUntil < time) {
                    player.invulnerableUntil = time + 1000
                    this.state.health -= 1
                    if (this.state.health === 0) {
                        this.state.quitTime = time + 2000
                    }
                }
            }
        }
    }
}
