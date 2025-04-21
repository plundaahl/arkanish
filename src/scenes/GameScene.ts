import { Scene } from './Scene'
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
import { DamageSystem } from '../systems/DamageSystem'
import { UiState } from '../ui-state'
import { TimeSystem } from '../systems/TimeSystem'
import { UiSystem } from '../systems/UiSystem'

type State = GameState

const level: Level = {
    initSection: 'start',
    // initSection: 'scratch',
    sections: {
        scratch: {
            contents: [
                { when: { type: 'time', at: 1000 }, then: [
                    SpawnPrefabActionHandler.create('Weaver', { velYL: 0 })
                ]},
            ]
        },
        start: {
            contents: [
                { when: { type: 'time', at: 2000 }, then: [
                    StartSectionActionHandler.create('main1')
                ]},
            ]
        },
        main1: {
            contents: [
                { when: { type: 'init' }, then: [
                    SpawnPrefabActionHandler.create('AsteroidSpawner', { posYL: -450 })
                ]},
                { when: { type: 'time', at: 20000 }, then: [
                    StartSectionActionHandler.create('main2'),
                    SpawnPrefabActionHandler.create('ShieldRecharge', { posYL: -475 })
                ]}
            ],
        },
        main2: {
            contents: [
                { when: { type: 'init' }, then: [
                    SpawnPrefabActionHandler.create('AsteroidSpawner', { posYL: -450 })
                ]},
                { when: { type: 'time', at: 20000 }, then: [
                    StartSectionActionHandler.create('main3'),
                    SpawnPrefabActionHandler.create('ShieldRecharge', { posYL: -475 })
                ]}
            ],
        },
        main3: {
            contents: [
                { when: { type: 'init' }, then: [
                    SpawnPrefabActionHandler.create('AsteroidSpawner', { posYL: -450 })
                ]},
                { when: { type: 'time', at: 20000 }, then: [
                    StartSectionActionHandler.create('intermission'),
                    SpawnPrefabActionHandler.create('ShieldRecharge', { posYL: -475 })
                ]}
            ],
        },
        intermission: {
            contents: [
                { when: { type: 'time', at: 5000 }, then: [
                    StartSectionActionHandler.create('main1')
                ]},
            ]
        },
    }
}

export class GameScene implements Scene {
    private state: State;
    private gameObjBuffer: RenderCommandBuffer = RenderCommandBuffer.create()
    private uiBuffer: RenderCommandBuffer = RenderCommandBuffer.create()

    constructor(
        private readonly onDeath: () => void,
    ) {}

    update(time: number, canvas: CanvasRenderingContext2D, uiState: UiState): void {
        if (!this.state) {
            this.state = GameState.create(time)

            // Load player
            const player = Prefab.spawn(this.state, 'Player')
            player.posYL = this.state.playArea.height / 4
            this.state.playerId = player.id

            // Load score incrementer
            Prefab.spawn(this.state, 'ScoreIncrementer')

            // Load level
            LevelState.loadLevel(this.state, level)
        }

        TimeSystem.run(this.state, time)
        LevelSystem.run(this.state)
        SpawnSystem.runSpawn(this.state)
        InputSystem.run(this.state, uiState)
        MovementSystem.run(this.state)
        CollisionSystem.run(this.state)
        EventSystem.run(this.state)
        DamageSystem.run(this.state)
        ScriptSystem.run(this.state)
        SpawnSystem.runDespawn(this.state)
        UiSystem.run(this.state, this.uiBuffer)
        ParticleSystem.render(this.state, this.gameObjBuffer)
        RenderSystem.render(this.state, uiState, this.gameObjBuffer, this.uiBuffer, canvas)

        const player = World.getEntity(this.state, this.state.playerId)
        if (!player) {
            this.onDeath()
        }
    }
}
