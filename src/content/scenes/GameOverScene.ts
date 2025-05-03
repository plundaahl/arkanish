import { Gui } from "../../ui-state";
import { Scene } from "../../game-state/Scene";

export const GameOverScene: Scene = {
    id: 'GameOver',
    onStart(_, uiState) {
        Gui.startController(uiState, 'GameOverController')
    },
}
