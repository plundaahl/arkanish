export type Collisions = {
    // Pairs of entity IDs: the listener, and the one that was collided with
    collisions: number[]
    collidedEntities: Set<number>
}

export const Collisions = {
    create: (): Collisions => ({
        collisions: [],
        collidedEntities: new Set(),
    })
}
