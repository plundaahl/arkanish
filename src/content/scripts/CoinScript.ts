import { GameEvent } from "../../game-state/GameEvent";
import { Entity } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";

export const CoinScript = {
    id: 'Coin',
    update: () => {},
    handleEvent: (state: GameState, entity: Entity, event: GameEvent): void => {
        if (GameEvent.isCollisionEvent(event)) {
            state.score += 250
            Entity.killEntity(entity)
        }
    }
}