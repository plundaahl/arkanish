import { ArraySerializer } from './ArraySerializer'
import { ObjectSerializer } from './ObjectSerializer'
import { PrimitiveSerializer } from './PrimitiveSerializers'
import { ISerializer } from './Serializer'
import { TaggedSerializer } from './TaggedSerializer'
import { TranslatedSerializer } from './TranslatedSerializer'
import { UnionSerializer } from './UnionSerializer'

export { DataViewCursor } from './DataViewCursor'
export { TranslationMap } from './TranslationMap'

export type Serializer<N extends string, T> = ISerializer<N, T>

export const Serializer = {
    primitive: PrimitiveSerializer,
    tagged: TaggedSerializer.create,
    object: ObjectSerializer.builder,
    array: ArraySerializer.create,
    union: UnionSerializer.create,
    translated: TranslatedSerializer.create,
}
