import { GameEvent } from "../GameEvent";
import { Entity } from "../Entity";
import { World } from "../World";

export type Script = {
    update(world: World, entity: Entity): void
    handleEvent(world: World, entity: Entity, event: GameEvent): void
}

export const Script = {
    transitionTo: (world: World, entity: Entity, state: number) => {
        if (entity.scriptState === state) {
            return
        }
        entity.scriptState = state
        entity.scriptTimeEnteredState = world.lastUpdateTime
    },
}
