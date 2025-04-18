import { GameEvent } from "../../game-state/GameEvent";
import { Entity } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { ScriptHandler } from "game-state/Script";

export const PowerupScriptHandler: ScriptHandler<'Powerup', {}> = {
    type: 'Powerup',
    nullData: {},
    script: {
        type: 'Powerup',
        onEvent(state: GameState, entity: Entity, event: GameEvent): void {
            if (GameEvent.isCollisionEvent(event)) {
                Entity.killEntity(entity)
            }
        },
    },
    serializeData(): Object {
        return {}
    },
    deserializeData(): {} | undefined {
        return {}
    },
}
