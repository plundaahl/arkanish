import { Action, ActionHandler } from '../../game-state/Level'
import { GameState } from '../../game-state/GameState'

interface StartSectionAction extends Action<'StartSection'> {
    section: string,
}

interface StartSectionActionHandler extends ActionHandler<'StartSection', StartSectionAction, GameState> {
    create: (section: string) => StartSectionAction
}

export const StartSectionActionHandler: StartSectionActionHandler = {
    type: 'StartSection',
    create: (section: string): StartSectionAction => {
        return { section, type: StartSectionActionHandler.type }
    },
    is: (obj: unknown): obj is StartSectionAction => {
        return typeof obj === 'object'
            && (obj as any).type === StartSectionActionHandler.type
            && typeof (obj as any).section === 'string'
    },
    execute: (state: GameState, action: StartSectionAction): void => {
        console.log(`Starting section [${action.section}].`)
        state.levelPendingSection = action.section
    },
}
