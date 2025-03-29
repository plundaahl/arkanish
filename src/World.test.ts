import { World } from './World'

describe('spawnEntity', () => {
    test('Creates a new entity record if list is empty', () => {
        const world = World.create(0)
        expect(world.entities.length).toEqual(0)
        World.spawnEntity(world)
        expect(world.entities.length).toEqual(1)
    })

    test('Adds a new entity if all are in use', () => {
        const world = World.create(1)
        World.spawnEntity(world)
        expect(world.entities.length).toEqual(1)
        World.spawnEntity(world)
        expect(world.entities.length).toEqual(2)
    })
})

describe('getEntity', () => {
    test('Returns undefined if entity not created yet', () => {
        const world = World.create(1)
        const entity = World.getEntity(world, 0)
        expect(entity).toBeUndefined()
    })

    test('Returns entity if entity created', () => {
        const world = World.create(1)
        const spawnedEntity = World.spawnEntity(world)
        expect(World.getEntity(world, spawnedEntity.id)).toBe(spawnedEntity)
    })

    test('Returns undefined if entity released', () => {
        const world = World.create(1)
        const spawnedEntity = World.spawnEntity(world)
        const id = spawnedEntity.id
        World.releaseEntity(world, spawnedEntity)
        expect(World.getEntity(world, id)).toBeUndefined()
    })
})

describe('releaseEntity', () => {
    test('Puts index back on free list', () => {
        const world = World.create(32)
        const freeListLength = world.freeList.length
        const idx = world.freeList[freeListLength - 1]
        const entity = World.spawnEntity(world)
        expect(world.freeList.length).toEqual(freeListLength - 1)
        World.releaseEntity(world, entity)
        expect(world.freeList.length).toEqual(freeListLength)
        expect(world.freeList[freeListLength - 1]).toEqual(idx)
    })

    test('Does not release entity if already freed', () => {
        const world = World.create(32)
        const entity = World.spawnEntity(world)
        World.releaseEntity(world, entity)
        const freeListLength = world.freeList.length
        const releasedEntityId = entity.id
        World.releaseEntity(world, entity)
        expect(world.freeList.length).toEqual(freeListLength)
        expect(entity.id).toEqual(releasedEntityId)
    })
})
