import { Scene } from '../../game-state/Scene'
import { World } from '../../game-state/Entity'
import { GameState } from '../../game-state/GameState'
import { Level, LevelState } from '../../game-state/Level'
import { Prefab } from '../../game-state/Prefab'
import { SpawnPrefabActionHandler } from '../actions'
import { Gui, UiState } from '../../ui-state'

const level: Level = {
    initSection: 'scratch',
    sections: {
        scratch: {
            contents: [
                { when: { type: 'time', at: 0 }, then: [
                    SpawnPrefabActionHandler.create('AsteroidTurretBase', { posYL: -200 })
                ]},
            ]
        },
    }
}

export const SandboxScene: Scene = {
    id: 'Sandbox',
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
            Scene.transitionToScene(gameState, 'MainMenu')
        }
    }
}