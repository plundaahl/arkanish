import { GameEvent } from "../../game-state/GameEvent";
import { Entity, World } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { ScriptHandler } from "game-state/Script";

export const PowerupScriptHandler: ScriptHandler<'Powerup', {}> = {
    type: 'Powerup',
    nullData: {},
    script: {
        type: 'Powerup',
        onEvent(state: GameState, entity: Entity, event: GameEvent): void {
            if (GameEvent.isCollisionEvent(event)) {
                const other = World.getEntity(state, event.hitBy)
                if (other) {
                    other.hp = Math.min(other.hp + 1, 3)
                }
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
