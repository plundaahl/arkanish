import { CURSOR_CLICK, CURSOR_DOWN, CURSOR_IDLE, Scene, UiState } from './scenes/Scene'
import { MenuScene } from './scenes/MenuScene'
import { GameScene } from './scenes/GameScene'
import { Action } from './game-state/Level'
import { SpawnActionHandler } from './actions/SpawnAction'

Action.register(SpawnActionHandler)

function orError<T>(element: T | null, error: string, ifNull: (message: string) => void): T {
    if (element === null) {
        ifNull(error)
        throw new Error(error)
    }
    return element
}

export class ArkanishApp extends HTMLElement {
    private $canvas: HTMLCanvasElement;
    private canvasContext: CanvasRenderingContext2D;
    private running: boolean = false;
    private scene: Scene;
    private uiState: UiState

    constructor() {
        super()

        this.handleMouseEvent = this.handleMouseEvent.bind(this)
        this.handleTouchEvent = this.handleTouchEvent.bind(this)
        this.handleResize = this.handleResize.bind(this)
        this.handleKeyboardEvent = this.handleKeyboardEvent.bind(this)
        this.error = this.error.bind(this)
        this.update = this.update.bind(this)
        this.makeGameScene = this.makeGameScene.bind(this)
        this.makeMenuScene = this.makeMenuScene.bind(this)
    }

    connectedCallback() {
        // General setup
        this.$canvas = orError(this.querySelector('canvas'), 'Could not find canvas', this.error)
        this.canvasContext = orError(this.$canvas.getContext('2d'), 'Canvas context was null', this.error)
        
        this.addEventListener('click', this.handleMouseEvent)
        this.addEventListener('mousedown', this.handleMouseEvent)
        this.addEventListener('mouseup', this.handleMouseEvent)
        this.addEventListener('mousemove', this.handleMouseEvent)
        this.addEventListener('mouseleave', this.handleMouseEvent)
        this.addEventListener('touchstart', this.handleTouchEvent)
        this.addEventListener('touchend', this.handleTouchEvent)
        this.addEventListener('touchmove', this.handleTouchEvent)
        this.addEventListener('touchcancel', this.handleTouchEvent)
        window.addEventListener('resize', this.handleResize)

        // Game-specific setup
        this.uiState = UiState.create()
        this.scene = this.makeMenuScene()
        this.running = true;

        // Start the render loop 
        this.handleResize()
        this.update()
    }

    disconnectedCallback() {
        this.running = false
        window.removeEventListener('resize', this.handleResize)
    }

    private makeMenuScene() {
        return new MenuScene(() => this.scene = this.makeGameScene())
    }

    private makeGameScene() {
        return new GameScene(() => this.scene = this.makeMenuScene())
    }

    handleResize() {
        this.$canvas.width = window.innerWidth
        this.$canvas.height = window.innerHeight
        this.uiState.width = window.innerWidth
        this.uiState.height = window.innerHeight
    }

    handleMouseEvent(event: MouseEvent) {
        switch (event.type) {
            case "mousemove":
                this.uiState.cursorActive = true
                this.uiState.cursorX = event.clientX
                this.uiState.cursorY = event.clientY
                break;
            case "mouseleave":
                this.uiState.cursorActive = false
                this.uiState.cursorState = CURSOR_IDLE
                break;
            case "mousedown":
                this.uiState.cursorState = CURSOR_DOWN
                break;
            case "mouseup":
                const wasClicked = this.uiState.cursorState === CURSOR_DOWN
                this.uiState.cursorState = wasClicked ? CURSOR_CLICK : CURSOR_IDLE
                break;
        }
    }

    handleTouchEvent(event: TouchEvent) {
        event.preventDefault()
        switch (event.type) {
            case "touchstart":
                for (let i = 0; i < event.changedTouches.length; i++) {
                    const touch = event.changedTouches[i]
                    this.uiState.touches.push({
                        x: touch.clientX,
                        y: touch.clientY,
                        offsetX: 0,
                        offsetY: 0,
                        id: touch.identifier,
                        state: CURSOR_DOWN,
                        element: 0,
                    })
                }
                break;
            case "touchend":
            case "touchcancel":
                for (let i = 0; i < event.changedTouches.length; i++) {
                    const touch = event.changedTouches[i]
                    const state = this.uiState.touches.find(t => t.id === touch.identifier)
                    if (state) {
                        state.state = CURSOR_CLICK
                    }
                }
                break;
            case "touchmove":
                for (let i = 0; i < event.changedTouches.length; i++) {
                    const touch = event.changedTouches[i]
                    const state = this.uiState.touches.find(t => t.id === touch.identifier)
                    if (state) {
                        state.x = touch.clientX
                        state.y = touch.clientY
                    }
                }
                break;
        }
    }

    handleKeyboardEvent(event: KeyboardEvent) {

    }

    error(message: string) {
        this.running = false
        this.innerHTML = `<div class="error"><h1>Error</h1><p>${message}</p></div>`
    }

    update() {
        if (!this.running) {
            return
        }

        this.scene.update(Date.now(), this.canvasContext, this.uiState)

        if (this.uiState.cursorState === CURSOR_CLICK) {
            this.uiState.cursorState = CURSOR_IDLE
        }

        for (let i = 0; i < this.uiState.touches.length; i++) {
            const touch = this.uiState.touches[i]
            if (touch.state === CURSOR_CLICK) {
                this.uiState.touches[i] = this.uiState.touches[this.uiState.touches.length - 1]
                this.uiState.touches.pop()
            }
        }

        window.requestAnimationFrame(this.update)
    }
}