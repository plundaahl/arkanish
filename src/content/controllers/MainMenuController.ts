import { Controller } from "../../ui-state";
import * as buildInfo from '../../build-info.json'
import { RenderCommandBuffer } from "../../RenderCommand";
import { Scene } from "../../game-state/Scene";
import { textButton } from "../gui-components/textButton";
import { RenderFlags, renderText } from "../../systems";
import { DebugFlags } from "../../game-state/DebugState";
import { GameState } from "../../game-state/GameState";

const TITLE = 'Arkanish'
const START = 'Start'
const SANDBOX = 'Sandbox'

const layout = { hPos: 0 }
export const MainMenuController: Controller<'MainMenuController'> = {
    id: "MainMenuController",
    update(gameState, ui, buffer): void {
        const height = ui.playArea.height

        // Title
        layout.hPos = (4 * height / 12) + ui.playArea.top
        RenderCommandBuffer.addCustomRenderCmd(
            buffer, 0, renderText,
            [TITLE], ui.playArea.width * 0.5, layout.hPos,
            RenderFlags.ALIGN_X_CENTER | RenderFlags.ALIGN_Y_CENTER,
            'white', '85px serif'
        )

        // High Score
        RenderCommandBuffer.addCustomRenderCmd(
            buffer, 0, renderText,
            [calculateHighScoreText(gameState)], ui.playArea.width * 0.5, layout.hPos,
            RenderFlags.ALIGN_X_CENTER, 'white', '22px serif'
        )

        layout.hPos += 40

        if (textButton(buffer, START, ui, 100, layout)) {
            Scene.transitionToScene(gameState, 'Game')
        }

        if (gameState.debugFlags & DebugFlags.DEV_MODE && textButton(buffer, SANDBOX, ui, 150, layout)) {
            Scene.transitionToScene(gameState, 'Sandbox')
        }

        // Version
        layout.hPos = ui.playArea.height - 10
        RenderCommandBuffer.addCustomRenderCmd(
            buffer, 0, renderText,
            [`v${buildInfo.version}`], ui.playArea.width * 0.5, layout.hPos,
            RenderFlags.ALIGN_X_CENTER | RenderFlags.ALIGN_Y_BOTTOM,
            'white', '20px serif'
        )
    }
}

function calculateHighScoreText(gameState: GameState) {
    if (!gameState.highScores.length) {
        return ''
    }
    const record = gameState.highScores[0]
    return `High Score: ${record.score}`
}