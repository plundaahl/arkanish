import { GameState } from "../game-state/GameState";
import { Entity, EntityStates, World } from "../game-state/Entity";
import { Id } from "../game-state/Id";

/*
The dedicated SPAWNING state exists to avoid flicker.  We calculate movement
and collisions before running events, which happens before rendering.  If we
didn't have this state and an event handler spawned an entity, we'd get a
flicker that frame because the transform won't have been updated yet (because)
we've already passed the movement phase.

The dedicated DYING state is similar:  if an entity such as a bullet simply
freed itself when a collision occurred, then the other entity wouldn't be able
to interrogate it to see how it should respond.
*/

export const SpawnSystem = {
    runSpawn: (state: GameState) => {
        // Finalize spawning entities.
        for (let i = 0; i < state.entities.length; i++) {
            const entity = state.entities[i]
            if (entity.state === EntityStates.SPAWNING) {
                entity.state = EntityStates.ALIVE
            }
        }
    },
    runDespawn: (state: GameState) => {
        const childEntities: Entity[] = []
        for (const entity of state.entities) {
            if (entity.state !== EntityStates.ALIVE) {
                continue
            }
 
            if (entity.parent !== 0) {
                childEntities.push(entity)
            }

            // Remove out-of-bounds entities
            if (entity.parent === 0 && isEntityInWorldBounds(state, entity)) {
                World.releaseEntity(state, entity)
            }
        }

        // Remove entities whose parents have been freed
        childEntities.sort(byIdIndex)
        for (const entity of childEntities) {
            const parent = World.getEntity(state, entity.parent)

            if (parent === undefined || parent.state === EntityStates.DYING) {
                Entity.killEntity(entity)
            }
        }

        // Release dying entities
        for (const entity of state.entities) {
            if (entity.state === EntityStates.DYING) {
                World.releaseEntity(state, entity)
            }
        }
    }
}

function byIdIndex(a: Entity, b: Entity): number {
    return Id.indexOf(a.id) - Id.indexOf(b.id)
}

function isEntityInWorldBounds(state: GameState, entity: Entity) {
    return (
        (entity.velYL > 0 && entity.posYL > state.playArea.height * 2)
        || (entity.velYL < 0 && entity.posYL < state.playArea.height * -2)
    )
}