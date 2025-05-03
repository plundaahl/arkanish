import { Scene } from '../../game-state/Scene'
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
                    // SpawnPrefabActionHandler.create('Turret', { posYL: -200 }),
                    SpawnPrefabActionHandler.create('AsteroidSpawner', { posYL: -450 }),
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

        gameState.forceXfade = 1
        gameState.enemyTableA = 1

        // Load player
        const player = Prefab.spawn(gameState, 'Player')
        player.posYL = gameState.playArea.height / 4
        gameState.playerId = player.id

        Prefab.spawn(gameState, 'ScoreIncrementer')
        LevelState.loadLevel(gameState, level)
        Gui.startController(uiState, 'GameplayController')
    },
    onUpdate(gameState: GameState, uiState: UiState): void {}
}