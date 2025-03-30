import { GameEvent } from "../GameEvent";
import { Entity, EntityFlags } from "../Entity";
import { World } from "../World";

export const PowerupScript = {
    update: () => {},
    handleEvent: (world: World, entity: Entity, event: GameEvent): void => {
        if (GameEvent.isCollisionEvent(event)) {
            entity.flags |= EntityFlags.DYING
        }
    }
}
