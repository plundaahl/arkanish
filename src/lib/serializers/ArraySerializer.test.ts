import { ArraySerializer } from './ArraySerializer'
import { DataViewCursor } from './DataViewCursor'
import { ObjectSerializer } from './ObjectSerializer'
import { PrimitiveSerializer } from './PrimitiveSerializers'
import { TaggedSerializer } from './TaggedSerializer'
import { TranslationMap } from './TranslationMap'

const translationMap = new TranslationMap()

let buffer: ArrayBuffer
let cursor: DataViewCursor

beforeEach(() => {
    buffer = new ArrayBuffer(256)
    cursor = new DataViewCursor(new DataView(buffer))
})

test('Basic test', () => {
    const int32ArraySerializer = ArraySerializer.create(PrimitiveSerializer.int32)
    const input = [1, 2, 3, 4, 5, 6, 7]

    int32ArraySerializer.serialize(cursor, input)

    const expectedOffset = cursor.offset
    cursor.reset()

    const result = int32ArraySerializer.deserialize(cursor, translationMap)
    expect(cursor.offset).toEqual(expectedOffset)
    expect(JSON.stringify(result)).toEqual(JSON.stringify(input))
})

test('With objects', () => {
    type EntityV1 = { id: number }
    type EntityV2 = { id: number, flags: bigint, mp: number }
    type EntityV3 = { id: number, flags: bigint }

    const v1Builder = ObjectSerializer.builder('entity').addField('id', PrimitiveSerializer.uint8)

    const v2Builder = v1Builder.newVersion()
        .addField('flags', PrimitiveSerializer.bigUint64)
        .addField('mp', PrimitiveSerializer.uint32)
        .retypeField('id', PrimitiveSerializer.uint32, i => i)

    const v3Builder = v2Builder.newVersion()
        .removeField('mp')
    
    const v1Serializer = v1Builder.build<EntityV1>({ id: 0 })
    const v2Serializer = v2Builder.build<EntityV2>({ flags: 0n, mp: 0, id: 0 })
    const v3Serializer = v3Builder.build<EntityV3>({ id: 0, flags: 0n })

    ArraySerializer.create(v1Serializer).serialize(cursor, [{ id: 1 }, { id: 2 }, { id: 3 }])

    const expectedOffset = cursor.offset
    cursor.reset()

    const result = ArraySerializer.create(v3Serializer).deserialize(cursor, translationMap)

    expect(cursor.offset).toEqual(expectedOffset)
    expect(result.length).toEqual(3)
    for (let i = 0; i < 3; i++) {
        expect(result[i].id).toEqual(i + 1)
        expect(BigInt(result[i].flags).toString()).toEqual(BigInt(0n).toString())
    }
})

test('Tagged primitives', () => {
    const v1 = TaggedSerializer.create('entityId', 7).initialVersion(PrimitiveSerializer.uint8)
    const v2 = v1.newVersion(PrimitiveSerializer.uint32, i => i)
    const v3 = v2.newVersion(PrimitiveSerializer.bigUint64, BigInt)
    const input = [7, 9, 24, 2]

    ArraySerializer.create(v1).serialize(cursor, input)

    const expectedOffset = cursor.offset
    cursor.reset()

    const result = ArraySerializer.create(v3).deserialize(cursor, translationMap)

    expect(cursor.offset).toEqual(expectedOffset)
    expect(result.length).toEqual(4)
    expect(result.map(BigInt).join(', ')).toEqual(input.map(val => val.toString()).join(', '))
})
