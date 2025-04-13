import { GameEvent } from "./GameEvent";
import { Entity, EntityFlags } from "./Entity";
import { GameState } from "./GameState";

export type Script = {
    readonly id: string
    update(gameState: GameState, entity: Entity): void
    handleEvent(gameState: GameState, entity: Entity, event: GameEvent): void
}

const scriptRegistry: { [t in string]: Script } = {}
export const Script = {
    register: (...scripts: Script[]): void => {
        for (const script of scripts) {
            if (scriptRegistry[script.id]) {
                if (Object.is(scriptRegistry[script.id], script)) {
                    console.warn(`Script [${script.id}] has been registered multiple times.`)
                } else {
                    throw new Error(`Attempted to register script with duplicate ID [${script.id}]`)
                }
            }
            scriptRegistry[script.id] = script
        }
    },
    getScriptById: (id: string): Script | undefined => scriptRegistry[id],
    transitionTo: (gameState: GameState, entity: Entity, state: number) => {
        if (entity.scriptState === state) {
            return
        }
        entity.scriptState = state
        entity.scriptTimeEnteredState = gameState.time
    },
    attachScript: (world: GameState, entity: Entity, script: Script | string) => {
        const scriptId = typeof script === 'string' ? script : script.id 
        if (!scriptId) {
            throw new Error(`No such script id [${scriptId}]`)
        }
        entity.flags |= EntityFlags.SCRIPT
        entity.script = scriptId
        entity.scriptState = 0
        entity.scriptTimeEnteredState = world.time
    }
}
