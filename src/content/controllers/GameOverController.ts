import { RenderFlags, renderText } from "../../systems";
import { GameState } from "../../game-state/GameState";
import { RenderCommandBuffer } from "../../RenderCommand";
import { Controller, UiState } from "../../ui-state";
import { HighScoreDAO } from "../../Persistence";
import { textButton } from "../gui-components/textButton";
import { Scene } from "../../game-state/Scene";

const GAME_OVER = 'Game Over'
const MAIN_MENU = 'Main Menu'

const layout = { hPos: 0 }
export const GameOverController: Controller<'GameOverController'> = {
    id: "GameOverController",
    update(gameState: GameState, ui: UiState, buffer: RenderCommandBuffer): void {
        const height = ui.playArea.height

        // 'Game Over' text
        layout.hPos = (4 * height / 12) + ui.playArea.top
        RenderCommandBuffer.addCustomRenderCmd(
            buffer, 0, renderText,
            [GAME_OVER], ui.playArea.width * 0.5, layout.hPos,
            RenderFlags.ALIGN_X_CENTER | RenderFlags.ALIGN_Y_CENTER,
            'white', '85px serif'
        )

        // Score
        const score = gameState.score
        const previousHighScore = gameState.highScores[0]?.score || undefined

        let scoreTextA = ''
        let scoreTextB = ''
        if (score > (previousHighScore || 0)) {
            scoreTextA = `NEW HIGH SCORE! ${score}`
            scoreTextB = `Old record: ${previousHighScore}`
        } else {
            scoreTextA = `Your score: ${score}`
            scoreTextB = `Current record: ${previousHighScore}`
        }

        layout.hPos += 40
        RenderCommandBuffer.addCustomRenderCmd(
            buffer, 0, renderText,
            [scoreTextA], ui.playArea.width * 0.5, layout.hPos,
            RenderFlags.ALIGN_X_CENTER, 'white', '22px serif'
        )

        layout.hPos += 30
        RenderCommandBuffer.addCustomRenderCmd(
            buffer, 0, renderText,
            [scoreTextB], ui.playArea.width * 0.5, layout.hPos,
            RenderFlags.ALIGN_X_CENTER, 'white', '22px serif'
        )

        layout.hPos += 120
        if (textButton(buffer, MAIN_MENU, ui, 200, layout)) {
            HighScoreDAO.persistScore(gameState.score)
            gameState.highScores = HighScoreDAO.loadHighScores()
            Scene.transitionToScene(gameState, 'MainMenu')
        }
    }
}