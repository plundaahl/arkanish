import { FrameState } from "./Frame"

// CONDITIONS
export type InitCondition = { type: 'init' }
const INIT_CONDIITON: InitCondition = Object.freeze({ type: 'init' })
export const InitCondition = {
    is: (obj: unknown): obj is InitCondition => {
        return (
            typeof obj === 'object'
            && (obj as any).type === 'init'
        )
    },
    create: (): InitCondition => INIT_CONDIITON,
}

export type TimeCondition = { type: 'time', at: number }
export const TimeCondition = {
    is: (obj: unknown): obj is TimeCondition => {
        return (
            typeof obj === 'object'
            && (obj as any).type === 'time'
            && typeof (obj as any).at === 'number'
        )
    },
    create: (at: number): TimeCondition => ({ type: 'time', at }),
}

export type Condition = InitCondition | TimeCondition
export const Condition = {
    is: (obj: unknown): obj is Condition => {
        return InitCondition.is(obj)
            || TimeCondition.is(obj)
    }
}

// COMMANDS
export interface Action<T extends string> { type: T }
export interface ActionHandler<T extends string, A extends Action<T>, S> {
    readonly type: T
    is(obj: unknown): obj is A
    execute(state: S, action: A): void
}

const actionHandlers: { [T in string]: ActionHandler<T, Action<T>, any> } = {}
export const Action = {
    is: (obj: unknown): obj is Action<string> => {
        for (const handler of Object.values(actionHandlers)) {
            if (handler.is(obj)) {
                true
            }
        }
        return false
    },
    execute: (state: any, action: Action<string>) => {
        const handler = actionHandlers[action.type]
        if (!handler) {
            throw new Error(`No handler registered for action of type [${action.type}].`)
        }
        if (!handler.is(action)) {
            throw new Error(`Action has type [${handler.type}], but handler failed to parse it.  Action: [${JSON.stringify(action)}]`)
        }
        handler.execute(state, action)
    },
}

export const ActionHandlerRegistry = {
    registerActions: (...handlers: ActionHandler<string, Action<string>, any>[]): void => {
        for (const handler of handlers) {
            if (actionHandlers[handler.type]) {
                throw new Error(`Handler for action [${handler.type}] already registered.`)
            }
            actionHandlers[handler.type] = handler
        }
    },
}

// LEVELS
export type Statement<C extends Condition = Condition> = { when: C, then: Action<string>[] }
export const Statement = {
    is: (obj: unknown): obj is Statement => {
        return typeof obj === 'object'
            && Condition.is((obj as any).when)
            && Array.isArray((obj as any).then)
            && ((obj as any).then as Array<unknown>).every(Action.is)
    },
}

export type Section = { contents: Statement[] }
export const Section = {
    is: (obj: unknown): obj is Section => {
        return typeof obj === 'object'
            && Array.isArray((obj as any).contents)
            && ((obj as any).contents as Array<unknown>).every(Statement.is)
    },
}

export type Level = { initSection: string, sections: { [id: string]: Section }}
export const Level = {
    is: (obj: unknown): obj is Level => {
        return typeof obj === 'object'
            && typeof (obj as any).initSection === 'string'
            && typeof (obj as any).sections === 'object'
            && Object.values((obj as any).sections).every(Section.is)
    },
}

// LEVEL STATE
export type LevelState = {
    level: Level | undefined
    levelPending: Level | undefined
    levelPendingSection: string | undefined
    levelCurrentSection: string
    levelSectionTimeStart: number 
    levelSectionTimeStatements: Statement<TimeCondition>[]
    levelSectionTimeNextIdx: number
}
export const LevelState = {
    create: (): LevelState => ({
        level: undefined,
        levelPending: undefined,
        levelPendingSection: undefined,
        levelCurrentSection: '',
        levelSectionTimeStart: 0,
        levelSectionTimeStatements: [],
        levelSectionTimeNextIdx: 0,
    }),
    reset(state: LevelState): void {
        state.level = undefined
        state.levelPending = undefined
        state.levelPendingSection = undefined
        state.levelCurrentSection = ''
        state.levelSectionTimeStart = 0
        state.levelSectionTimeStatements.length = 0
        state.levelSectionTimeNextIdx = 0
    },
    loadLevel: (state: LevelState, level: Level) => {
        state.levelPending = level
    },
    startNextLevel: (state: LevelState & FrameState) => {
        if (!state.levelPending) {
            return
        }
        state.level = state.levelPending
        state.levelPending = undefined
        LevelState.startSection(state, state.level.initSection)
    },
    startSection: (state: LevelState & FrameState, section: string) => {
        if (!state.level || !section) {
            return
        }
        state.levelPendingSection = undefined
        state.levelCurrentSection = section
        state.levelSectionTimeStart = state.gameTime
        state.levelSectionTimeNextIdx = 0
        state.levelSectionTimeStatements.length = 0
        const currentSection = LevelState.currentSection(state)
        if (currentSection) {
            for (const statement of currentSection.contents) {
                if (TimeCondition.is(statement.when)) {
                    state.levelSectionTimeStatements.push(statement as Statement<TimeCondition>)
                }
            }
            state.levelSectionTimeStatements.sort((a, b) => a.when.at - b.when.at)
        }
    },
    currentSection: (state: LevelState): Section | undefined => {
        if (!state.level || !state.levelCurrentSection) {
            return undefined
        }
        const section = state.level.sections[state.levelCurrentSection]
        if (!section) {
            throw new Error(`Tried to load level section [${state.levelCurrentSection}], but current level has no section with that ID.`)
        }
        return section
    },
}
