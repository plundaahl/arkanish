import { Scene } from './Scene'
import { CURSOR_CLICK, CURSOR_DOWN, UiState } from '../ui-state'
import * as buildInfo from '../build-info.json'
const TITLE = 'Arkanish'
const START = 'Start'

export class MenuScene implements Scene {
    private shouldStart: boolean = false

    constructor(
        private readonly onStartGame: () => void 
    ) {}

    update(time: number, canvas: CanvasRenderingContext2D, ui: UiState): void {
        this.shouldStart = false
        this.render(canvas, ui)

        if (this.shouldStart) {
            this.onStartGame()
        }
    }

    private render(ctx: CanvasRenderingContext2D, ui: UiState): void {
        const { width, height, cursorActive, cursorX, cursorY } = ui

        ctx.save()


        ctx.clearRect(0, 0, width, height)
        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, width, height)

        // Title
        let hPos = 3 * height / 12
        const halfW = width / 2
        {
            ctx.save()
            ctx.font = '85px serif'
            ctx.fillStyle = 'white'
            const textMetrics = ctx.measureText(TITLE)
            ctx.fillText(TITLE, halfW - (textMetrics.width / 2), hPos)
            hPos += textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent
            ctx.restore()
        }

        // Version
        {
            ctx.save()
            ctx.font = '20px serif'
            ctx.fillStyle = 'white'
            const text = `v${buildInfo.version}`
            const textMetrics = ctx.measureText(text)
            ctx.fillText(text, halfW - (textMetrics.width / 2), hPos - 40)
            hPos += textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent
            ctx.restore()
        }

        // Play Button
        {
            ctx.save()
            ctx.font = '36px serif'
            const textMetrics = ctx.measureText(START)
            const textWidth = textMetrics.actualBoundingBoxRight - textMetrics.actualBoundingBoxLeft
            const textHeight = textMetrics.actualBoundingBoxDescent + textMetrics.actualBoundingBoxAscent
            const margin = textHeight * 0.5
            const padding = textHeight * 0.25
            const elWidth = textWidth + padding + padding
            const elHeight = textHeight + padding + padding
            hPos += margin
            const left = halfW - (textWidth / 2) - padding
            const right = halfW + (textWidth / 2) + padding
            const top = hPos - padding
            const bottom = hPos + textHeight + padding

            const cursorIn = cursorActive && left <= cursorX && cursorX <= right && top <= cursorY && cursorY <= bottom
            let touchIn = false
            for (const touch of ui.touches) {
                if (left <= touch.x && touch.x <= right && top <= touch.y && touch.y <= bottom) {
                    // Touch complete click
                    if (touch.element === 1 && touch.state === CURSOR_CLICK) {
                        touchIn = true
                    }
                    // Touch begin click
                    if (touch.element === 0 && touch.state === CURSOR_DOWN) {
                        touch.element = 1
                    }
                }
            }

            if (touchIn || (cursorIn && ui.cursorState === CURSOR_CLICK)) {
                this.shouldStart = true
            }

            if (cursorIn) {
                ctx.fillStyle = 'green'
                ctx.fillRect(left, top, elWidth, elHeight)
                ctx.fillStyle = 'black'
            } else {
                ctx.strokeStyle = 'green'
                ctx.lineWidth = 4
                ctx.strokeRect(left, top, elWidth, elHeight)
                ctx.fillStyle = 'white'
            }
            
            ctx.fillText(START, left + padding, top + textHeight + padding)

            ctx.restore()
            hPos += elHeight
        }

        ctx.restore()
    }
}