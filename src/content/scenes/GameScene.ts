import { Scene } from '../../game-state/Scene'
import { World } from '../../game-state/Entity'
import { GameState } from '../../game-state/GameState'
import { Level, LevelState } from '../../game-state/Level'
import { Prefab } from '../../game-state/Prefab'
import { SpawnPrefabActionHandler, StartSectionActionHandler } from '../actions'
import { Gui, UiState } from '../../ui-state'
import { HighScoreDAO } from '../../Persistence'

const level: Level = {
    initSection: 'start',
    sections: {
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

export const GameScene: Scene = {
    id: 'Game',
    onStart(gameState: GameState, uiState: UiState): void {
        gameState.score = 0
        gameState.scoreTimeIncrementer = 0

        // Load player
        const player = Prefab.spawn(gameState, 'Player')
        player.posYL = gameState.playArea.height / 4
        gameState.playerId = player.id

        Prefab.spawn(gameState, 'ScoreIncrementer')
        LevelState.loadLevel(gameState, level)
        Gui.startController(uiState, 'GameplayController')
    },
    onUpdate(gameState: GameState, uiState: UiState): void {
        const player = World.getEntity(gameState, gameState.playerId)
        if (!player) {
            console.log('no player')
            gameState.playerId = 0
            gameState.playerNextShotTime = 0
            Scene.transitionToScene(gameState, 'GameOver')
        }
    }
}
