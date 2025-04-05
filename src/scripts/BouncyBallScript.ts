import { GameEvent } from "../game-state/GameEvent";
import { Entity, EntityFlags } from "../game-state/Entity";
import { GameState } from "../game-state/GameState";

export const BouncyBallScript = {
    id: 'BouncyBall',
    update: () => {},
    handleEvent: (state: GameState, entity: Entity, event: GameEvent): void => {
        if (GameEvent.isBounceEvent(event)) {
            entity.hp -= 1
            if (entity.hp <= 1) {
                entity.flags ^= EntityFlags.BOUNCE_IN_PLAY_SPACE
            }
        }
    }
}