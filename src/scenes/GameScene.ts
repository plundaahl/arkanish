import { Scene } from './Scene'
import { World } from '../game-state/Entity'
import { GameState } from '../game-state/GameState'
import { RenderCommandBuffer } from '../RenderCommand'
import { Level, LevelState } from '../game-state/Level'
import { Prefab } from '../game-state/Prefab'
import { SpawnPrefabActionHandler, StartSectionActionHandler } from '../content/actions'
import { UiState } from '../ui-state'
import { Engine } from '../Engine'

type State = GameState

const level: Level = {
    initSection: 'start',
    // initSection: 'scratch',
    sections: {
        scratch: {
            contents: [
                { when: { type: 'time', at: 0 }, then: [
                    SpawnPrefabActionHandler.create('MissileBay', { posYL: -200, posRL: Math.PI * 0.5 })
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

        Engine.update(
            this.state,
            uiState,
            time,
            this.gameObjBuffer,
            this.uiBuffer,
            canvas,
        )

        const player = World.getEntity(this.state, this.state.playerId)
        if (!player) {
            this.onDeath()
        }
    }
}
