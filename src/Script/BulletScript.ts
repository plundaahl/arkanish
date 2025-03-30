import { GameEvent } from "../GameEvent";
import { Entity, EntityFlags } from "../Entity";
import { World } from "../World";

export const BulletScript = {
    update: (world: World, entity: Entity): void => {},
    handleEvent: (world: World, self: Entity, event: GameEvent): void => {
        if (GameEvent.isCollisionEvent(event)) {
            const other = World.getEntity(world, event.hitBy)
            if (!other) {
                return
            }

            if ((self.flags & EntityFlags.ROLE_PLAYER_BULLET)
                && (other.flags & EntityFlags.ROLE_ENEMY)
            ) {
                self.flags |= EntityFlags.DYING
                other.flags |= EntityFlags.DYING
            }
        }
    }
}
