export const GameEventType = {
    NULL: 0,
    COLLISION: 1,
}

type NullGameEvent = {
    type: typeof GameEventType.NULL,
    entity: number,
}
type CollisionGameEvent = {
    type: typeof GameEventType.COLLISION,
    entity: number,
    hitBy: number,
}

export type GameEvent = NullGameEvent
    | CollisionGameEvent 

function reset(obj: Object): any {
    for (const prop of Object.getOwnPropertyNames(obj)) {
        delete (obj as any)[prop]
    }
    return obj
}

export const GameEvent = {
    create: (): GameEvent => ({ type: GameEventType.NULL, entity: 0 }),
    releaseEvent: (event: GameEvent): NullGameEvent => {
        const cleared = reset(event) as NullGameEvent
        cleared.type = GameEventType.NULL
        return cleared
    },
    isCollisionEvent: (event: GameEvent): event is CollisionGameEvent => event.type === GameEventType.COLLISION,
}

export type GameEventBuffer = {
    publishedEvents: GameEvent[]
    pendingEvents: GameEvent[]
}

const provisionEvent = (buffer: GameEventBuffer): GameEvent => {
    for (const event of buffer.pendingEvents) {
        if (event.type === GameEventType.NULL) {
            return event
        }
    }
    const event = GameEvent.create()
    buffer.publishedEvents.push(event)
    return event
}

export const GameEventBuffer = {
    create: (): GameEventBuffer => ({ publishedEvents: [], pendingEvents: [] }),
    clear: (buffer: GameEventBuffer) => {
        for (const event of buffer.publishedEvents) {
            GameEvent.releaseEvent(event)
        }
    },
    addCollisionEvent: (buffer: GameEventBuffer, entity: number, hitBy: number) => {
        const event = provisionEvent(buffer) as CollisionGameEvent
        event.type = GameEventType.COLLISION
        event.entity = entity
        event.hitBy = hitBy
        return event
    },
}
