import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Prefab } from "../../game-state/Prefab";
import { BoundingBox } from "../../game-state/BoundingBox";
import { PowerupScriptHandler } from "../scripts";
import { Script } from "../../game-state/Script";

export const ShieldRechargePrefab: Prefab = {
    id: "ShieldRecharge",
    spawn: (gameState: GameState): Entity => {
        const entity = World.spawnEntity(gameState)
        entity.flags |= EntityFlags.ROLE_PICKUP | EntityFlags.ROLE_POWERUP

        entity.velY = 350

        entity.flags |= EntityFlags.COLLIDER
        entity.flags |= EntityFlags.DESTROY_AT_0_HP
        entity.hp = 1
        entity.hurtBy = EntityFlags.ROLE_PLAYER
        entity.collidesWith = EntityFlags.ROLE_PLAYER
        entity.colliderBbSrc = [BoundingBox.createAabb(-20, -20, 40, 40)]

        entity.colour = 'blue' 

        Script.attach(entity, PowerupScriptHandler)
        return entity
    }
}