import { Id } from './Id'
import { Entity, EntityFlags, EntitySpec } from './Entity'

const DEFAULT_NUM_ENTITIES = 512
export interface World {
    entities: Entity[]
    freeList: number[]
    lastUpdateTime: number
}
export const World = {
    create: (size: number = DEFAULT_NUM_ENTITIES): World => {
        const entities: Entity[] = new Array(size)
        const freeList: number[] = new Array(size)

        for (let i = 0; i < size; i++) {
            entities[i] = Entity.create(i)
            freeList[i] = size - i - 1
        }

        return {
            entities,
            freeList,
            lastUpdateTime: 0,
        }
    },
    reset: (world: World) => {
        for (const entity of world.entities) {
            World.releaseEntity(world, entity)
        }
    },
    getEntity: (world: World, id: number): Entity | undefined => {
        const idx = Id.indexOf(id)
        if (idx >= world.entities.length) {
            throw new Error(`Entity index [${idx}] is out-of-bounds.  World only contains [${world.entities.length}] entities.`)
        }
        const entity = world.entities[idx]
        return entity.id === id
            ? entity
            : undefined
    },
    spawnEntity: (world: World, spec?: EntitySpec): Entity => {
        let idx = world.freeList.pop()
        let entity: Entity
        if (idx === undefined) {
            idx = world.entities.length
            entity = Entity.create(idx, spec)
            world.entities[idx] = entity
        } else {
            entity = world.entities[idx]
        }
        entity.flags = EntityFlags.ALIVE
        return entity
    },
    releaseEntity: (world: World, entity: number | Entity): void => {
        const id = typeof entity === 'number' ? entity : entity.id
        const ent = typeof entity === 'number' ? World.getEntity(world, entity) : entity
        const idx = Id.indexOf(id)
        if (ent === undefined || world.freeList.includes(idx)) {
            return
        }
        world.freeList.push(idx)
        Entity.release(ent)
    },
}
