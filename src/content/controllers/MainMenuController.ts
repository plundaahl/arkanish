import { Controller, UiState } from "../../ui-state";
import * as buildInfo from '../../build-info.json'
import { RenderCommandBuffer } from "../../RenderCommand";
import { GameState } from "../../game-state/GameState";
import { Scene } from "../../game-state/Scene";
import { mainMenuLabel } from "../gui-components/mainMenuLabel";
import { mainMenuButton } from "../gui-components/mainMenuButton";

const TITLE = 'Arkanish'
const START = 'Start'

export const MainMenuController: Controller<'MainMenuController'> = {
    id: "MainMenuController",
    update(gameState, uiState, buffer): void {
        RenderCommandBuffer.addCustomRenderCmd(buffer, 1000, renderMainMenuUi, gameState, uiState)
    }
}

function renderMainMenuUi(ctx: CanvasRenderingContext2D, gameState: GameState, ui: UiState) {
    const height = ui.playArea.height

    // Title
    const layout = { hPos: (4 * height / 12) + ui.playArea.top }
    mainMenuLabel(TITLE, '85px serif', 'white', ctx, ui, layout, -50)
    mainMenuLabel(`v${buildInfo.version}`, '20px serif', 'white', ctx, ui, layout)
    layout.hPos += 40

    if (mainMenuButton(START, ctx, gameState, ui, layout)) {
        Scene.transitionToScene(gameState, 'Game')
    }
}
