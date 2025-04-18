import { ColliderFlags, Entity, EntityFlags, World } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Prefab } from "../../game-state/Prefab";
import { BoundingBox } from "../../game-state/BoundingBox";
import { PowerupScriptHandler } from "../scripts";
import { Script } from "../../game-state/Script";

export const ShieldRechargePrefab: Prefab = {
    id: "ShieldRecharge",
    spawn: (gameState: GameState): Entity => {
        const entity = World.spawnEntity(gameState)
        entity.flags |= EntityFlags.ROLE_PICKUP

        entity.velY = 350

        entity.flags |= EntityFlags.COLLIDER
        entity.colliderBbSrc = [BoundingBox.createAabb(-20, -20, 40, 40)]
        entity.colliderBbTransform = [BoundingBox.clone(entity.colliderBbSrc[0])]
        entity.colliderGroup = ColliderFlags.POWERUP
        entity.collidesWith = ColliderFlags.PLAYER

        entity.colour = 'blue' 

        Script.attach(entity, PowerupScriptHandler)
        return entity
    }
}