import { Scene, UiState } from './Scene'
import { World } from '../game-state/Entity'
import { CollisionSystem } from '../systems/CollisionSystem'
import { ScriptSystem } from '../systems/ScriptSystem'
import { GameState } from '../game-state/GameState'
import { SpawnSystem } from '../systems/SpawnSystem'
import { MovementSystem } from '../systems/MovementSystem'
import { EventSystem } from '../systems/EventSystem'
import { RenderCommandBuffer } from '../RenderCommand'
import { RenderSystem } from '../systems/RenderSystem'
import { ParticleSystem } from '../systems/ParticleSystem'
import { Level, LevelState } from '../game-state/Level'
import { LevelSystem } from '../systems/LevelSystem'
import { Prefab } from '../game-state/Prefab'
import { SpawnPrefabActionHandler, StartSectionActionHandler } from '../content/actions'
import { InputSystem } from '../systems/InputSystem'

const STAR_TIME_SCALE = 1 / 5000
const MS_PER_SCORE_TICK = 800

type State = GameState

const level: Level = {
    initSection: 'intermission',
    sections: {
        intermission: {
            contents: [
                { when: { type: 'time', at: 2500 }, then: [
                    StartSectionActionHandler.create('main1')
                ]},
            ]
        },
        main1: {
            contents: [
                { when: { type: 'init' }, then: [
                    SpawnPrefabActionHandler.create('AsteroidSpawner', { posY: -450 })
                ]},
                { when: { type: 'time', at: 20000 }, then: [
                    StartSectionActionHandler.create('main2')
                ]}
            ],
        },
        main2: {
            contents: [
                { when: { type: 'init' }, then: [
                    SpawnPrefabActionHandler.create('AsteroidSpawner', { posY: -450 })
                ]},
                { when: { type: 'time', at: 20000 }, then: [
                    StartSectionActionHandler.create('main3')
                ]}
            ],
        },
        main3: {
            contents: [
                { when: { type: 'init' }, then: [
                    SpawnPrefabActionHandler.create('AsteroidSpawner', { posY: -450 })
                ]},
                { when: { type: 'time', at: 20000 }, then: [
                    StartSectionActionHandler.create('intermission')
                ]}
            ],
        },
    }
}

export class GameScene implements Scene {
    private state: State;
    private gameRenderCommandBuffer: RenderCommandBuffer = RenderCommandBuffer.create()
    private uiRenderCommandBuffer: RenderCommandBuffer = RenderCommandBuffer.create()

    constructor(
        private readonly onDeath: () => void,
    ) {}

    update(time: number, canvas: CanvasRenderingContext2D, uiState: UiState): void {
        if (!this.state) {
            this.state = GameState.create(time)
            const player = Prefab.spawn(this.state, 'Player')
            player.posY = this.state.playArea.height / 4
            this.state.playerId = player.id
            LevelState.loadLevel(this.state, level)
        }

        this.state.frameLength = time - this.state.time
        this.state.time = time

        this.calculatePlayAreaProjection(uiState)
        this.incrementScoreForTime(time)

        LevelSystem.run(this.state)
        SpawnSystem.runSpawn(this.state)
        InputSystem.run(this.state, uiState)
        MovementSystem.run(this.state)
        CollisionSystem.run(this.state)
        EventSystem.run(this.state)
        ScriptSystem.run(this.state)
        SpawnSystem.runDespawn(this.state)

        this.renderBackground(time, canvas, uiState)
        this.renderUi(this.uiRenderCommandBuffer)

        ParticleSystem.render(this.state, this.gameRenderCommandBuffer)
        RenderSystem.render(this.state, uiState, this.gameRenderCommandBuffer, this.uiRenderCommandBuffer, canvas)

        const player = World.getEntity(this.state, this.state.playerId)
        if (!player) {
            this.onDeath()
        }
    }

    private calculatePlayAreaProjection(ui: UiState) {
        const canvasAspect = ui.width / ui.height
        const playSpaceAspect = this.state.playArea.width / this.state.playArea.height
        const isTooWide = canvasAspect > playSpaceAspect

        const projectionWidth = isTooWide
            ? Math.floor(ui.height * playSpaceAspect)
            : ui.width

        const projectionHeight = isTooWide
            ? ui.height
            : Math.floor(ui.width / playSpaceAspect)
        
        ui.playArea.left = Math.max(ui.width - projectionWidth, 0) * 0.5
        ui.playArea.top = Math.max(ui.height - projectionHeight, 0) * 0.5
        ui.playArea.width = projectionWidth
        ui.playArea.height = projectionHeight
    }

    private incrementScoreForTime(time: number) {
        this.state.scoreTimeIncrementer += this.state.frameLength
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

    private renderUi(buffer: RenderCommandBuffer) {
        const player = World.getEntity(this.state, this.state.playerId)
        const hpText = `HP: ${player?.hp || 0}`
        const scoreText = `Score: ${this.state.score}`
        // const frameRate = `Framerate: ${Math.round(100000 / this.state.frameLength) * 0.01}`
        RenderCommandBuffer.addCustomRenderCmd(buffer, 1000, renderText, [hpText, scoreText])
    }
}

function renderText(ctx: CanvasRenderingContext2D, text: string[]) {
    ctx.save()
    ctx.font = '20px serif'
    ctx.fillStyle = 'white'

    let pos = 50;

    for (const line of text) {
        ctx.fillText(line, 50, pos)
        const textMetrics = ctx.measureText(line)
        pos += textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent + 10
    }

    ctx.restore()
}
