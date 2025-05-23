import { BeamSpinnerScriptHandler } from "../scripts";
import { BoundingBox } from "../../game-state/BoundingBox";
import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Prefab } from "../../game-state/Prefab";
import { Script } from "../../game-state/Script";
import { Vector2 } from "../../game-state/Vector";
import { ExtraMath } from "../../Math";
import { INTENSITIES } from "./intensities";

const BEAM_LENGTH = 2000
const BEAM_WIDTH = 50
const BEAM_HALF_WIDTH = BEAM_WIDTH * 0.5

export const BeamSpinnerPrefab: Prefab = {
    id: "BeamSpinner",
    intensity: INTENSITIES.BeamSpinner,
    spawn: (gameState: GameState, parent?: number): Entity => {
        // Spinner
        const spinner = World.spawnEntity(gameState, parent)
    
        const size = 50
        const halfSize = size * 0.5
    
        const maxVel = gameState.playArea.height * 0.5
        const minVel = gameState.playArea.height * 0.2
    
        spinner.posYL = -size
        spinner.velYL = ExtraMath.rollBetween(minVel, maxVel)
        spinner.velRL = ExtraMath.rollBetween(0, 0.15) * Math.PI * ExtraMath.positiveOrNegative()
        spinner.posRL = Math.random() * Math.PI * 2
    
        spinner.flags |= EntityFlags.COLLIDER
        spinner.colliderBbSrc = [BoundingBox.createCircleBb(0, 0, halfSize)]
        spinner.colliderBbTransform = [BoundingBox.clone(spinner.colliderBbSrc[0])]
        spinner.collidesWith = EntityFlags.ROLE_PLAYER | EntityFlags.ROLE_PLAYER_BULLET
        spinner.hurtBy |= EntityFlags.ROLE_PLAYER | EntityFlags.ROLE_PLAYER_BULLET
        spinner.flags |= EntityFlags.ROLE_OBSTACLE
        spinner.flags |= EntityFlags.DESTROY_AT_0_HP
        spinner.hp = 1
        spinner.scoreValue = 15

        spinner.colour = 'red'
    
        // Hit box
        const hitBox = World.spawnEntity(gameState, spinner.id)
        hitBox.colliderBbSrc = [BoundingBox.createConvexPolyBb(
            Vector2.createFromCoordinates(-BEAM_LENGTH, -BEAM_HALF_WIDTH),
            Vector2.createFromCoordinates(BEAM_LENGTH, -BEAM_HALF_WIDTH),
            Vector2.createFromCoordinates(BEAM_LENGTH, BEAM_HALF_WIDTH),
            Vector2.createFromCoordinates(-BEAM_LENGTH, BEAM_HALF_WIDTH),
        )]
        hitBox.collidesWith = EntityFlags.ROLE_PLAYER
        hitBox.flags |= EntityFlags.ROLE_OBSTACLE
        hitBox.colour = '#FFFFFF00'
    
        Script.attach(gameState, hitBox, BeamSpinnerScriptHandler)

        return spinner
    }
}
