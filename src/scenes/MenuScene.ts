import { CURSOR_CLICK, Scene, UiState } from './Scene'

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

            if (cursorIn) {
                ctx.fillStyle = 'green'
                ctx.fillRect(left, top, elWidth, elHeight)
                ctx.fillStyle = 'black'

                if (ui.cursorState === CURSOR_CLICK) {
                    this.shouldStart = true
                }
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