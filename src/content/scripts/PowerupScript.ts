import { GameEvent } from "../../game-state/GameEvent";
import { Entity } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";

export const PowerupScript = {
    id: 'Powerup',
    update: () => {},
    handleEvent: (state: GameState, entity: Entity, event: GameEvent): void => {
        if (GameEvent.isCollisionEvent(event)) {
            Entity.killEntity(entity)
        }
    }
}
