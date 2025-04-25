import { Buttons, CURSOR_CLICK, CURSOR_DOWN, CURSOR_IDLE, UiState } from './ui-state'
import {
    MenuScene,
    GameScene,
} from './content/scenes'
import { Registry } from './registry'
import {
    SpawnPrefabActionHandler,
    StartSectionActionHandler,
} from './content/actions'
import {
    AsteroidSpawnerScriptHandler,
    BeamSpinnerScriptHandler,
    BouncyBallScriptHandler,
    BulletScriptHandler,
    CoinScriptHandler,
    PlayerScriptHandler,
    PowerupScriptHandler,
    ScoreIncrementerScriptHandler,
    TurretScriptHandler,
    WeaverScriptHandler,
    MissileScriptHandler,
    JetEmitterScriptHandler,
    MissileBayScriptHandler,
    MissileFrigateScriptHandler,
} from './content/scripts'
import {
    BlastBeamParticle,
    BlastCircleParticle,
    ExplosionRedParticle,
    ExplosionWhiteParticle,
    JetParticle,
    LaunchParticle,
    TelegraphBeamParticle,
    TelegraphCircleParticle
} from './content/particles'
import {
    AsteroidPrefab,
    AsteroidSpawnerPrefab,
    BeamSpinnerPrefab,
    BouncyBallPrefab,
    CoinPrefab,
    GunshipPrefab,
    PlankPrefab,
    PlayerBulletPrefab,
    PlayerPrefab,
    ShieldRechargePrefab,
    TurretPrefab,
    EnemyBulletPrefab,
    WeaverPrefab,
    ScoreIncrementerPrefab,
    MissilePrefab,
    JetEmitterPrefab,
    MissileBayPrefab,
    MissileFrigatePrefab,
    SpawnPosClampedAbovePrefab,
    SpawnPosAngledAbovePrefab,
    WeakPointPrefab,
} from './content/prefabs'
import {
    GameplayGuiController,
    MainMenuGuiController,
} from './content/gui-controllers'
import { GameState } from './game-state/GameState'
import { Scene } from './game-state/Scene'
import { Engine } from './Engine'
import { RenderCommandBuffer } from './RenderCommand'

Registry.registerActions(
    SpawnPrefabActionHandler,
    StartSectionActionHandler,
)
Registry.registerScriptHandlers(
    CoinScriptHandler,
    PowerupScriptHandler,
    BulletScriptHandler,
    BeamSpinnerScriptHandler,
    BouncyBallScriptHandler,
    PlayerScriptHandler,
    AsteroidSpawnerScriptHandler,
    TurretScriptHandler,
    WeaverScriptHandler,
    ScoreIncrementerScriptHandler,
    MissileScriptHandler,
    MissileBayScriptHandler,
    MissileFrigateScriptHandler,
    JetEmitterScriptHandler,
)
Registry.registerParticleHandlers(
    BlastBeamParticle,
    BlastCircleParticle,
    ExplosionRedParticle,
    ExplosionWhiteParticle,
    JetParticle,
    TelegraphBeamParticle,
    TelegraphCircleParticle,
    LaunchParticle,
)
Registry.registerPrefabs(
    BeamSpinnerPrefab,
    PlankPrefab,
    BouncyBallPrefab,
    CoinPrefab,
    ShieldRechargePrefab,
    AsteroidPrefab,
    AsteroidSpawnerPrefab,
    PlayerBulletPrefab,
    PlayerPrefab,
    GunshipPrefab,
    TurretPrefab,
    EnemyBulletPrefab,
    WeaverPrefab,
    ScoreIncrementerPrefab,
    MissilePrefab,
    MissileBayPrefab,
    MissileFrigatePrefab,
    JetEmitterPrefab,
    SpawnPosClampedAbovePrefab,
    SpawnPosAngledAbovePrefab,
    WeakPointPrefab,
)
Registry.registerGuiControllers(
    GameplayGuiController,
    MainMenuGuiController,
)
Registry.registerScenes(
    MenuScene,
    GameScene,
)

function orError<T>(element: T | null, error: string, ifNull: (message: string) => void): T {
    if (element === null) {
        ifNull(error)
        throw new Error(error)
    }
    return element
}

const KEY_MAP: { [code: string]: number } = {
    Escape: Buttons.MENU,
}

export class ArkanishApp extends HTMLElement {
    private $canvas: HTMLCanvasElement;
    private canvasContext: CanvasRenderingContext2D;
    private running: boolean = false;
    private scene: Scene;

    private gameState: GameState
    private uiState: UiState
    private gameObjBuffer: RenderCommandBuffer
    private uiBuffer: RenderCommandBuffer

    constructor() {
        super()

        this.handleMouseEvent = this.handleMouseEvent.bind(this)
        this.handleTouchEvent = this.handleTouchEvent.bind(this)
        this.handleResize = this.handleResize.bind(this)
        this.handleKeyboardEvent = this.handleKeyboardEvent.bind(this)
        this.error = this.error.bind(this)
        this.update = this.update.bind(this)
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
        document.addEventListener('keydown', this.handleKeyboardEvent)
        document.addEventListener('keyup', this.handleKeyboardEvent)
        window.addEventListener('resize', this.handleResize)

        // Game-specific setup
        this.uiBuffer = RenderCommandBuffer.create()
        this.gameObjBuffer = RenderCommandBuffer.create()
        this.gameState = GameState.create(Date.now())
        this.uiState = UiState.create()
        Scene.transitionToScene(this.gameState, 'MainMenu')
        this.running = true;

        // Start the render loop 
        this.handleResize()
        this.update()
    }

    disconnectedCallback() {
        this.running = false
        window.removeEventListener('resize', this.handleResize)
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
        const keyCode = event.code
        const button = KEY_MAP[keyCode]

        if (!button) {
            return
        }

        if (event.type === 'keydown') {
            this.uiState.buttonsDown |= button
        } else if (event.type === 'keyup') {
            this.uiState.buttonsDown &= ~button
        }
    }

    error(message: string) {
        this.running = false
        this.innerHTML = `<div class="error"><h1>Error</h1><p>${message}</p></div>`
    }

    update() {
        if (!this.running) {
            return
        }

        Engine.update(
            this.gameState,
            this.uiState,
            Date.now(),
            this.gameObjBuffer,
            this.uiBuffer,
            this.canvasContext,
        )

        this.uiState.prevButtonsDown = this.uiState.buttonsDown

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