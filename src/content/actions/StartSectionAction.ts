import { Action, ActionHandler, LevelState } from '../../game-state/Level'
import { GameState } from '../../game-state/GameState'
import { Flag } from '../../game-state/Flag'
import { Entity, EntityFlags, EntityStates } from '../../game-state/Entity'

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
        state.levelPendingSection = action.section
    },
}
