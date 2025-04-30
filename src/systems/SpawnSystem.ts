import { GameState } from "../game-state/GameState";
import { Entity, EntityFlags, EntityStates, World } from "../game-state/Entity";
import { Id } from "../game-state/Id";
import { GameEventBuffer } from "../game-state/GameEvent";

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
                GameEventBuffer.addSpawnEvent(state, entity.id, entity.intensity)
            }
        }
    },
    runDespawn: (state: GameState) => {
        const childEntities: Entity[] = []
        for (const entity of state.entities) {
            if (entity.state !== EntityStates.ALIVE) {
                continue
            }
 
            // Collect children
            if (entity.parent !== 0) {
                childEntities.push(entity)
            }

            // Remove out-of-bounds entities
            if (entity.parent === 0 && isEntityInWorldBounds(state, entity) && entity.flags & EntityFlags.SEEN) {
                Entity.killEntity(entity)
            }
        }

        // Propagate DYING status to children
        childEntities.sort(byIdIndex)
        for (const entity of childEntities) {
            const parent = World.getEntity(state, entity.parent)

            if (parent === undefined || parent.state === EntityStates.DYING) {
                Entity.killEntity(entity)
            }
        }

        // Mark dying entities as dead and release dead entities.  This two-phase system
        // is so that death events can be propagated to before the entity is freed.
        for (const entity of state.entities) {
            if (entity.state === EntityStates.DYING) {
                entity.state = EntityStates.DEAD
                GameEventBuffer.addDeathEvent(state, entity.id, entity.intensity)
                if (entity.parent) {
                    GameEventBuffer.addChildDeathEvent(state, entity.parent, entity.id)
                    const parent = World.getEntity(state, entity.parent)
                    if (parent) {
                        parent.childCount--
                        if (parent.childCount <= 0 && parent.flags & EntityFlags.KILL_IF_CHILDLESS) {
                            Entity.killEntity(parent)
                        }
                    }
                }
            } else if (entity.state === EntityStates.DEAD) {
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
        (entity.velYL > 0 && entity.posYL > state.playArea.height * 1)
        || (entity.velYL < 0 && entity.posYL < state.playArea.height * -1)
        || (entity.velXL < 0 && entity.posXL < state.playArea.width * -1)
        || (entity.velXL > 0 && entity.posXL > state.playArea.width * 1)
    )
}