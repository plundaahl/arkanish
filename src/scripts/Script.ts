import { GameEvent } from "../game-state/GameEvent";
import { Entity, EntityFlags } from "../game-state/Entity";
import { GameState } from "../game-state/GameState";

export type Script = {
    readonly id: string
    update(gameState: GameState, entity: Entity): void
    handleEvent(gameState: GameState, entity: Entity, event: GameEvent): void
}

export const Script = {
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
