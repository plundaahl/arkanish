export type Collisions = {
    collidedEntities: Set<number>
}

export const Collisions = {
    create: (): Collisions => ({
        collidedEntities: new Set(),
    })
}
