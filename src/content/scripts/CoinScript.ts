import { GameEvent } from "../../game-state/GameEvent";
import { Entity } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { ScriptHandler } from "../../game-state/Script";

export const CoinScriptHandler: ScriptHandler<'Coin', {}> = {
    type: 'Coin',
    nullData: {},
    script: {
        type: 'Coin',
        onEvent(state: GameState, entity: Entity, event: GameEvent): void {
            if (GameEvent.isCollisionEvent(event) && event.hitBy === state.playerId) {
                state.score += 250
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
