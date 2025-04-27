import { DataViewCursor } from "./DataViewCursor";
import { ISerializer, ITranslationMap } from "./Serializer";
import { TaggedSerializer } from "./TaggedSerializer";

type TypeOfSerializer<S extends TaggedSerializer<string, any>> = S extends TaggedSerializer<string, infer T> ? T : never

type TypesOfSerializers<T extends TaggedSerializer<string, any>[]> = T extends [infer Head, ...infer Tail]
    ? Head extends TaggedSerializer<string, any>
        ? Tail extends TaggedSerializer<string, any>[]
            ? TypeOfSerializer<Head> | TypesOfSerializers<Tail>
            : TypeOfSerializer<Head>
        : never
    : never

type Matcher<S> = (obj: unknown) => obj is S

type MatcherFor<S extends TaggedSerializer<string, any>> = S extends TaggedSerializer<string, infer T>
    ? Matcher<S>
    : never

type MatchersFor<T extends TaggedSerializer<string, any>[]> = T extends [infer Head, ...infer Tail]
    ? Head extends TaggedSerializer<string, any>
        ? Tail extends TaggedSerializer<string, any>[]
            ? [MatcherFor<Head>, ...MatchersFor<Tail>]
            : [MatcherFor<Head>]
        : []
    : []

export class UnionSerializer<N extends string, S extends TaggedSerializer<string, any>[]> implements ISerializer<N, TypesOfSerializers<S>> {
    private constructor(
        public readonly name: N,
        private readonly serializers: S,
        private readonly matchers: MatchersFor<S>,
    ) {}

    static create<N extends string>(name: N): UnionSerializer<N, []> {
        return new UnionSerializer(name, [], [])
    }

    withMember<T>(serializer: TaggedSerializer<string, T>, matcher: Matcher<T>): UnionSerializer<N, [...S, TaggedSerializer<string, T>]> {
        return new UnionSerializer(
            this.name,
            [...this.serializers, serializer],
            [...this.matchers, matcher] as any,
        )
    }

    serialize(cursor: DataViewCursor, value: TypesOfSerializers<S>): void {
        const serializer = this.getSerializerByObject(value)
        if (!serializer) {
            throw new Error(`TaggedUnionSerializer [${this.name}] could not find serializer for object.`)
        }
        serializer.serialize(cursor, value)
    }

    deserialize(cursor: DataViewCursor, translationMap: ITranslationMap, destination?: TypesOfSerializers<S> | undefined): TypesOfSerializers<S> {
        const previousPos = cursor.offset
        const typeId = cursor.getUint16()
        cursor.reset(previousPos)

        const serializer = this.getSerializerByTypeId(typeId)
        if (!serializer) {
            throw new Error(`TaggedUnionSerializer [${this.name}] could not find serializer for typeId [${typeId}].`)
        }
        return serializer.deserialize(cursor, translationMap, destination)
    }

    skip(cursor: DataViewCursor): void {
        const previousPos = cursor.offset
        const typeId = cursor.getUint16()
        cursor.reset(previousPos)

        const serializer = this.getSerializerByTypeId(typeId)
        if (!serializer) {
            throw new Error(`TaggedUnionSerializer [${this.name}] could not find serializer for typeId [${typeId}].`)
        }
        return serializer.skip(cursor)
    }

    private getSerializerByTypeId(typeId: number): TaggedSerializer<string, TypesOfSerializers<S>> | undefined {
        for (const serializer of this.serializers) {
            if (serializer.typeId === typeId) {
                return serializer
            }
        }
    }

    private getSerializerByObject(obj: unknown): TaggedSerializer<string, TypesOfSerializers<S>> | undefined {
        for (let i = 0; i < this.serializers.length; i++) {
            if (this.matchers[i](obj)) {
                return this.serializers[i]
            }
        }
    }
}
