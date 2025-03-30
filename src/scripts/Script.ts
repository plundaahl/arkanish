import { GameEvent } from "../game-state/GameEvent";
import { Entity } from "../game-state/Entity";
import { GameState } from "../game-state/GameState";

export type Script = {
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
}
