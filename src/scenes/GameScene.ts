import { Scene, UiState } from './Scene'

const STAR_TIME_SCALE = 1 / 5000
const PLAYER_SCALE = 2
const PLAYER_HEIGHT_HALF = PLAYER_SCALE * 15
const PLAYER_WIDTH_HALF = PLAYER_SCALE * 10
const PLAYER_OFFSET = PLAYER_HEIGHT_HALF / 2

type State = {
    playerX: number,
    playerY: number,
}

export class GameScene implements Scene {
    private prevTime: number;
    private state: State 

    update(time: number, canvas: CanvasRenderingContext2D, uiState: UiState): void {
        if (!this.state) {
            this.init(time, uiState)
        }

        this.updateState(time, uiState)
        this.renderBackground(time, canvas, uiState)
        this.renderGameObjects(time, canvas)
        this.prevTime = time
    }

    private init(time: number, ui: UiState) {
        this.prevTime = time
        this.state = {
            playerX: ui.width / 2,
            playerY: 9 * ui.height / 12, 
        }
    }

    private updateState(time: number, uiState: UiState) {
        if (uiState.cursorActive) {
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
        ctx.fillStyle = 'red'
        ctx.lineWidth = 5
        ctx.fill()

        ctx.restore()
    }
}