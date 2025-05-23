import { GameEvent } from "./GameEvent";
import { Entity, EntityFlags } from "./Entity";
import { GameState } from "./GameState";

export const CONTROLLER_FIRE = 1

export interface Script<T extends string, D extends Object> {
    type: T
    onInit?(gameState: GameState, entity: Entity & { scriptData: D }): void
    onUpdate?(gameState: GameState, entity: Entity & { scriptData: D }): void
    onEvent?(gameState: GameState, entity: Entity & { scriptData: D }, event: GameEvent): void
    onInput?(gameState: GameState, entity: Entity & { scriptData: D }, xImpulse: number, yImpulse: number, controllerFlags: number): void
}

export interface ScriptHandler<T extends string, D extends Object = {}> {
    type: T
    script: Script<T, D>
    nullData: D
    serializeData(data: D): Object
    deserializeData(input: unknown): D | undefined
}

export const Script = {
    attach<D extends Object>(gameState: GameState, entity: Entity, scriptHandler: ScriptHandler<string, D>, data?: Partial<D>): void {
        entity.flags |= EntityFlags.SCRIPT
        entity.script = scriptHandler.script
        entity.scriptData = Object.assign({}, scriptHandler.nullData, data)
        if (entity.script.onInit) {
            entity.script.onInit(gameState, entity as any)
        }
    },
}

const scriptHandlerRegistry: { [T in string]: ScriptHandler<T, object> } = {}
export const ScriptHandlerRegistry = {
    registerScriptHandlers: (...handlers: ScriptHandler<string, object>[]): void => {
        for (const handler of handlers) {
            if (scriptHandlerRegistry[handler.type]) {
                if (Object.is(scriptHandlerRegistry[handler.type], handler)) {
                    console.warn(`Script handler [${handler.type}] has been registered multiple times.`)
                } else {
                    throw new Error(`Attempted to register script with duplicate ID [${handler.type}]`)
                }
            }
            scriptHandlerRegistry[handler.type] = handler
        }
    },
}

function getScriptHandler<T extends string>(type: T): ScriptHandler<T, Object> {
    const handler = scriptHandlerRegistry[type]
    if (!handler) {
        throw new Error(`No ScriptHandler registerd with type [${type}].`)
    }
    return handler as ScriptHandler<T, Object>
}
