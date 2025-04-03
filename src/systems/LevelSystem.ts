import { GameState } from '../game-state/GameState'
import { Action, InitCondition, LevelState, Statement } from '../game-state/Level'

export const LevelSystem = {
    run: (state: GameState) => {
        // Load pending level
        if (state.levelPending) {
            LevelState.startNextLevel(state)
            const section = LevelState.currentSection(state)
            if (section) {
                for (const statement of section.contents) {
                    if (InitCondition.is(statement.when)) {
                        executeStatement(state, statement)
                    }
                }
            }
        }

        // Run TimeCondition actions
        if (state.level) {
            const sectionTime = state.time - state.levelSectionTimeStart
            for (let i = state.levelSectionTimeNextIdx; i < state.levelSectionTimeStatements.length; i++) {
                const statement = state.levelSectionTimeStatements[i]
                if (statement.when.at <= sectionTime) {
                    executeStatement(state, statement)
                    state.levelSectionTimeNextIdx = i + 1
                }
            }
        }
    },
}

function executeStatement(state: GameState, statement: Statement) {
    for (const action of statement.then) {
        Action.execute(state, action)
    }
}
