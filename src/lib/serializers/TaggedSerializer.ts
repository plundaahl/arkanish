import { DataViewCursor } from "./DataViewCursor"
import { ISerializer, Tagged, ITranslationMap } from "./Serializer"

export class TaggedSerializer<N extends string, T> implements ISerializer<N, T>, Tagged {
    private readonly mainDelegate: ISerializer<string, T>

    private constructor(
        public readonly name: N,
        public readonly typeId: number,
        private readonly delegates: ISerializer<string, any>[],
        private readonly upgrades: ((previous: any) => any)[],
    ) {
        this.mainDelegate = delegates[delegates.length - 1]
    }

    get version(): number { return this.delegates.length - 1 }

    static create<N extends string, T>(name: N, typeId: number) {
        return {
            initialVersion<T>(serializer: ISerializer<string, T>): TaggedSerializer<N, T> {
                return new TaggedSerializer(
                    name,
                    typeId,
                    [serializer],
                    []
                )
            }
        }
    }

    newVersion<O>(serializer: ISerializer<string, O>, upgrade: (from: T) => O): TaggedSerializer<N, O> {
        return new TaggedSerializer(
            this.name,
            this.typeId,
            [...this.delegates, serializer],
            [...this.upgrades, upgrade],
        )
    }

    serialize(cursor: DataViewCursor, value: T): void {
        cursor.setUint16(this.typeId)
        cursor.setUint16(this.version)
        this.mainDelegate.serialize(cursor, value)
    }

    deserialize(cursor: DataViewCursor, translationMap: ITranslationMap, destination?: T | undefined): T {
        const prevPosition = cursor.offset

        const typeId = cursor.getUint16()
        if (typeId !== this.typeId) {
            cursor.reset(prevPosition)
            throw new Error(`Invalid typeId [${typeId}] read while trying to deserialize [${this.name}].  Expected [${this.typeId}].`)
        }
        const version = cursor.getUint16()
        if (version > this.version) {
            cursor.reset(prevPosition)
            throw new Error(`Invalid version [${version}] read while trying to deserialize [${this.name}].  Highest valid version is [${this.version}].`)
        }

        let value = this.delegates[version].deserialize(cursor, translationMap, destination)
        for (let i = version; i < this.upgrades.length; i++) {
            value = this.upgrades[i](value)
        }

        return value
    }

    skip(cursor: DataViewCursor): void {
        const typeId = cursor.getUint16()
        if (typeId !== this.typeId) {
            throw new Error(`Invalid typeId [${typeId}] read while trying to deserialize [${this.name}].  Expected [${this.typeId}].`)
        }
        const version = cursor.getUint16()
        if (version > this.version) {
            throw new Error(`Invalid version [${version}] read while trying to deserialize [${this.name}].  Highest valid version is [${this.version}].`)
        }

        this.delegates[version].skip(cursor)
    }
}
