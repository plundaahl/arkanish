import { Controller } from "../../ui-state";
import * as buildInfo from '../../build-info.json'
import { RenderCommandBuffer } from "../../RenderCommand";
import { Scene } from "../../game-state/Scene";
import { textButton } from "../gui-components/textButton";
import { RenderFlags, renderText } from "../../systems";
import { DebugFlags } from "../../game-state/DebugState";

const TITLE = 'Arkanish'
const START = 'Start'
const SANDBOX = 'Sandbox'

export const MainMenuController: Controller<'MainMenuController'> = {
    id: "MainMenuController",
    update(gameState, ui, buffer): void {
        const height = ui.playArea.height

        // Title
        const layout = { hPos: (4 * height / 12) + ui.playArea.top }
        RenderCommandBuffer.addCustomRenderCmd(
            buffer, 0, renderText,
            [TITLE], ui.playArea.width * 0.5, layout.hPos,
            RenderFlags.ALIGN_X_CENTER | RenderFlags.ALIGN_Y_CENTER,
            'white', '85px serif'
        )

        // Version
        RenderCommandBuffer.addCustomRenderCmd(
            buffer, 0, renderText,
            [`v${buildInfo.version}`], ui.playArea.width * 0.5, layout.hPos,
            RenderFlags.ALIGN_X_CENTER, 'white', '20px serif'
        )

        layout.hPos += 40

        if (textButton(buffer, START, ui, 100, layout)) {
            Scene.transitionToScene(gameState, 'Game')
        }

        if (gameState.debugFlags & DebugFlags.DEV_MODE && textButton(buffer, SANDBOX, ui, 150, layout)) {
            Scene.transitionToScene(gameState, 'Sandbox')
        }
    }
}
