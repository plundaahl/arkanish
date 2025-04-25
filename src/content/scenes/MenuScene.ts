import { Scene } from '../../game-state/Scene'
import { Gui, UiState } from '../../ui-state'
import { GameState } from 'game-state/GameState'

export const MenuScene: Scene = {
    id: 'MainMenu',
    onStart(_: GameState, uiState: UiState): void {
        Gui.startController(uiState, 'MainMenu')
    },
}
