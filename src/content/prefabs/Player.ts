import { BoundingBox } from "../../game-state/BoundingBox";
import { ColliderFlags, Entity, EntityFlags, World } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Prefab } from "../../game-state/Prefab";
import { Vector2 } from "../../game-state/Vector";
import { PlayerScript } from "../scripts";
import { Script } from "../../game-state/Script";

const PLAYER_SCALE = 2
const PLAYER_HEIGHT_HALF = PLAYER_SCALE * 15
const PLAYER_WIDTH_HALF = PLAYER_SCALE * 10
const PLAYER_OFFSET = PLAYER_HEIGHT_HALF / 2

export const PlayerPrefab: Prefab = {
    id: "Player",
    spawn: (gameState: GameState): Entity => {
        const player = World.spawnEntity(gameState)
        player.flags |= EntityFlags.ROLE_PLAYER

        player.flags |= EntityFlags.COLLIDER
        player.colliderBbSrc = [
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(0, 0 - PLAYER_HEIGHT_HALF - PLAYER_OFFSET),
                Vector2.createFromCoordinates(-PLAYER_WIDTH_HALF, PLAYER_HEIGHT_HALF - PLAYER_OFFSET),
                Vector2.createFromCoordinates(0, (PLAYER_HEIGHT_HALF / 2) - PLAYER_OFFSET),
            ),
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(0, 0 - PLAYER_HEIGHT_HALF - PLAYER_OFFSET),
                Vector2.createFromCoordinates(0, (PLAYER_HEIGHT_HALF / 2) - PLAYER_OFFSET),
                Vector2.createFromCoordinates(PLAYER_WIDTH_HALF, PLAYER_HEIGHT_HALF - PLAYER_OFFSET),
            ),
        ]
        player.colliderBbTransform = player.colliderBbSrc.map(BoundingBox.clone)
        player.colliderGroup = ColliderFlags.PLAYER
        player.collidesWith = ColliderFlags.ENEMY | ColliderFlags.POWERUP
        player.colour = 'green'

        Script.attachScript(gameState, player, PlayerScript.id)

        player.hp = 3

        player.posZ = 1
        player.flags |= EntityFlags.CONSTRAIN_TO_PLAY_SPACE

        return player
    }
}