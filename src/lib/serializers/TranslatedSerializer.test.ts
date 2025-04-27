import { DataViewCursor } from "./DataViewCursor"
import { PrimitiveSerializer } from "./PrimitiveSerializers"
import { TaggedSerializer } from "./TaggedSerializer"
import { TranslatedSerializer } from "./TranslatedSerializer"
import { TranslationMap } from "./TranslationMap"

const translationMap = new TranslationMap()

let buffer: ArrayBuffer
let cursor: DataViewCursor

beforeEach(() => {
    buffer = new ArrayBuffer(256)
    cursor = new DataViewCursor(new DataView(buffer))
})

test('TaggedSerializer test', () => {
    const entityId = TranslatedSerializer.create(TaggedSerializer.create('entityId', 1, PrimitiveSerializer.uint32))

    entityId.serialize(cursor, 7)
    entityId.serialize(cursor, 9)
    entityId.serialize(cursor, 2)

    cursor.reset()

    translationMap.addTranslation(entityId, 7, 12)
    translationMap.addTranslation(entityId, 9, 44)
    translationMap.addTranslation(entityId, 2, 3)

    const results = [
        entityId.deserialize(cursor, translationMap),
        entityId.deserialize(cursor, translationMap),
        entityId.deserialize(cursor, translationMap),
    ]

    expect(results[0]).toEqual(12)
    expect(results[1]).toEqual(44)
    expect(results[2]).toEqual(3)
})
