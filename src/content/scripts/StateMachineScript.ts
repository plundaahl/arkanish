import { Entity } from '../../game-state/Entity'
import { GameState } from '../../game-state/GameState'
import { Script, ScriptHandler } from '../../game-state/Script'

export function transitionScript(gameState: GameState, entity: Entity, state: StateMachineScript<string, StateMachineData>) {
    (entity.scriptData as StateMachineData).timeEnteredState = gameState.time
    const oldScript = entity.script as StateMachineScript<string>
    if (oldScript.onExitState) {
        oldScript.onExitState(gameState, entity)
    }
    entity.script = state
    if (state.onEnterState) {
        state.onEnterState(gameState, entity)
    }
}

export interface StateMachineData {
    timeEnteredState: number
}

export interface StateMachineScript<
    T extends string,
    D extends StateMachineData = StateMachineData
> extends Script<T, D> {
    onEnterState?(gameState: GameState, entity: Entity): void
    onExitState?(gameState: GameState, entity: Entity): void
}

export function createStateMachineHandler<T extends string, D extends StateMachineData>(
    type: T,
    initialScript: Script<T, D>,
    nullData?: D,
    serializeData?: (data: D) => Object,
    deserializeData?: (input: unknown) => D | undefined,
): ScriptHandler<T, D> {
    return {
        type,
        nullData: Object.freeze(nullData ? nullData : { timeEnteredState: 0 }) as unknown as D,
        script: initialScript,
        serializeData: serializeData ? serializeData : (data: D): Object => ({ ...data }),
        deserializeData: deserializeData ? deserializeData : (input: unknown): D | undefined => {
            return typeof input === 'object'
                ? { ...input } as D
                : undefined
        }
    }
}
