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
    const v1Builder = ObjectSerializer.builder('Entity')
    .addField('id', PrimitiveSerializer.uint32)
    .addField('flags', PrimitiveSerializer.uint32)
    .addField('hp', PrimitiveSerializer.int32)
    .addField('alive', PrimitiveSerializer.boolean)

    const v2Builder = v1Builder
    .newVersion()
    .retypeField('flags', PrimitiveSerializer.bigUint64, BigInt)
    .retypeField('id', TaggedSerializer.create('entityId', 2, PrimitiveSerializer.uint32), i => i)
    .removeField('alive')

    const v3Builder = v2Builder
    .newVersion()
    .renameField('hp', 'hpCur')
    .addField('hpMax', PrimitiveSerializer.uint32)

    type V1Entity = { id: number, flags: number, hp: number, alive: boolean }
    const v1 = v1Builder.build<V1Entity>({ id: 0, flags: 0, hp: 0, alive: false })

    type V2Entity = { id: number, flags: bigint, hp: number, transient: string }
    const v2 = v2Builder.build<V2Entity>({ flags: 0n, id: 0, hp: 0, transient: '' })

    type V3Entity = { id: 0, flags: 0n, hpCur: 0, hpMax: 0 }
    const v3NullObj: V3Entity = { id: 0, flags: 0n, hpCur: 0, hpMax: 0 }
    const v3 = v3Builder.build(v3NullObj, (deserialized) => {
        if (deserialized.hpMax < deserialized.hpCur) {
            deserialized.hpMax = deserialized.hpCur
        }
    })

    v1.serialize(cursor, {
        id: 1,
        flags: 123,
        alive: true,
        hp: 23,
    })
    const v1Offset = cursor.offset

    v2.serialize(cursor, {
        id: 3,
        flags: 255n,
        hp: 12,
        transient: '',
    })
    const v2Offset = cursor.offset

    cursor.reset()

    {
        const result = v3.deserialize(cursor, translationMap)

        expect(cursor.offset).toEqual(v1Offset)

        expect(Object.getOwnPropertyNames(result).sort().join(',')).toEqual(Object.getOwnPropertyNames(v3NullObj).sort().join(','))
        expect(result.id).toEqual(1)
        expect(result.flags).toEqual(123n)
        expect(result.hpCur).toEqual(23)
        expect(result.hpMax).toEqual(23)
    }

    {
        const result = v3.deserialize(cursor, translationMap)

        expect(cursor.offset).toEqual(v2Offset)

        expect(Object.getOwnPropertyNames(result).sort().join(',')).toEqual(Object.getOwnPropertyNames(v3NullObj).sort().join(','))
        expect(result.id).toEqual(3)
        expect(result.flags).toEqual(255n)
        expect(result.hpCur).toEqual(12)
        expect(result.hpMax).toEqual(12)
    }
})
