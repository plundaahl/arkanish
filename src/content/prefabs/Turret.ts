import { Script } from "../../game-state/Script";
import { BoundingBox } from "../../game-state/BoundingBox";
import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { Prefab } from "../../game-state/Prefab";
import { Vector2 } from "../../game-state/Vector";
import { TurretScriptHandler } from "../scripts/TurretScript";

export const TurretPrefab: Prefab = {
    id: 'Turret',
    spawn(gameState, parent): Entity {
        const entity = World.spawnEntity(gameState, parent)

        entity.flags |= EntityFlags.COLLIDER
        entity.colliderBbSrc = [
            BoundingBox.createCircleBb(0, 0, 15),
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(-5, -5),
                Vector2.createFromCoordinates(-5, 5),
                Vector2.createFromCoordinates(25, 5),
                Vector2.createFromCoordinates(25, -5),
            )
        ]

        entity.colour = 'red'

        Script.attach(gameState, entity, TurretScriptHandler)

        return entity
    }
}
