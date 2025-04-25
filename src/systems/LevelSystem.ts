import { Entity, EntityFlags, EntityStates } from '../game-state/Entity'
import { GameState } from '../game-state/GameState'
import { Action, InitCondition, LevelState, Statement } from '../game-state/Level'
import { Flag } from '../game-state/Flag'

export const LevelSystem = {
    run: (state: GameState) => {
        // Load pending level or section
        let changedSections = false

        if (state.levelPending) {
            changedSections = true
            LevelState.startNextLevel(state)
        } else if (state.levelPendingSection) {
            changedSections = true
            LevelState.startSection(state, state.levelPendingSection)
        }

        if (changedSections) {
            for (const entity of state.entities) {
                if ((entity.state === EntityStates.ALIVE
                    || entity.state === EntityStates.SPAWNING)
                    && Flag.hasBigintFlags(entity.flags, EntityFlags.DESTROY_AFTER_SECTION)
                ) {
                    Entity.killEntity(entity)
                }
            }

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
            const sectionTime = state.gameTime - state.levelSectionTimeStart
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
