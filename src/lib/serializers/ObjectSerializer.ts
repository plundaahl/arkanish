import { DataViewCursor } from "./DataViewCursor";
import { PrimitiveSerializer } from "./PrimitiveSerializers";
import { NullValued, ISerializer, Tagged, ITranslationMap } from "./Serializer";

type FieldSerializerSpec<K, T> = {
    name: K,
    version: number,
    serializer: ISerializer<string, T>,
    upgrade?: (from: any) => T,
    removed?: true,
}

class ObjectSerializerBuilder<N extends string, T extends { [key: string]: any }> {
    constructor(
        public readonly name: N,
        public readonly version: number,
        private readonly fieldSerializers: FieldSerializerSpec<keyof T, any>[][],
    ) {}

    newVersion(): ObjectSerializerBuilder<N, T> {
        return new ObjectSerializerBuilder(
            this.name,
            this.version + 1,
            this.fieldSerializers,
        )
    }

    addField<K extends Exclude<string, keyof T>, F>(
        name: K,
        serializer: ISerializer<string, F>
    ): ObjectSerializerBuilder<N, T & { [key in K]: F }> {
        return new ObjectSerializerBuilder(
            this.name,
            this.version,
            [...this.fieldSerializers, [{
                name,
                version: this.version,
                serializer,
            }]]
        )
    }

    retypeField<K extends (keyof T & string), O>(
        name: K,
        serializer: ISerializer<string, O>,
        upgrade: (from: T[K]) => O,
    ): ObjectSerializerBuilder<N, Omit<T, K> & { [key in K]: O }> {
        for (let i = 0; i < this.fieldSerializers.length; i++) {
            const field = this.fieldSerializers[i]
            const currentVersion = field[field.length - 1]

            if (currentVersion.name !== name || currentVersion.removed) {
                continue
            }

            const newLayer: FieldSerializerSpec<K, O> = {
                name,
                version: this.version,
                serializer,
                upgrade,
            }

            const newFields = [...this.fieldSerializers]
            newFields[i] = [...newFields[i], newLayer]

            return new ObjectSerializerBuilder(
                this.name,
                this.version,
                newFields as any,
            )
        }

        throw new Error(`Could not find field with key [${name}] for ObjectSerializer [${this.name}].`)
    }

    renameField<K extends (keyof T & string), K2 extends Exclude<string, keyof T> & string>(
        from: K,
        to: K2,
    ): ObjectSerializerBuilder<N, Omit<T, K> & { [key in K2]: T[K] }> {
        for (let i = 0; i < this.fieldSerializers.length; i++) {
            const field = this.fieldSerializers[i]
            const currentVersion = field[field.length - 1]

            if (currentVersion.name !== from || currentVersion.removed) {
                continue
            }

            const newLayer: FieldSerializerSpec<K2, T[K]> = {
                name: to,
                version: this.version,
                serializer: currentVersion.serializer,
            }

            const newFields = [...this.fieldSerializers]
            newFields[i] = [...newFields[i], newLayer]

            return new ObjectSerializerBuilder(
                this.name,
                this.version,
                newFields as any,
            )
        }

        throw new Error(`Could not find field with key [${from}] for ObjectSerializer [${this.name}].`)
    }

    removeField<K extends (keyof T & string)>(name: K): ObjectSerializerBuilder<N, Omit<T, K>> {
        for (let i = 0; i < this.fieldSerializers.length; i++) {
            const field = this.fieldSerializers[i]
            const currentVersion = field[field.length - 1]

            if (currentVersion.name !== name || currentVersion.removed) {
                continue
            }

            const newLayer: FieldSerializerSpec<K, undefined> = {
                name,
                version: this.version,
                serializer: PrimitiveSerializer.null,
                removed: true,
            }

            const newFields = [...this.fieldSerializers]
            newFields[i] = [...newFields[i], newLayer]

            return new ObjectSerializerBuilder(
                this.name,
                this.version,
                newFields as any,
            )
        }

        throw new Error(`Could not find field with key [${name}] for ObjectSerializer [${this.name}].`)
    }

    build<C extends T>(nullValue: C, backfillLogic?: (deserialized: T) => void): ObjectSerializerImpl<N, T, C> {
        return new ObjectSerializerImpl(
            this.name,
            nullValue,
            this.version,
            this.fieldSerializers,
            backfillLogic || (i => {}),
        )
    }
}

export interface ObjectSerializer<N extends string, T, C extends T = T> extends ISerializer<N, T>, NullValued<C> {}
export const ObjectSerializer = {
    builder<N extends string>(name: N): ObjectSerializerBuilder<N, {}> {
        return new ObjectSerializerBuilder(name, 1, [])
    }
}

const DEBUG = false

class ObjectSerializerImpl<N extends string, T extends { [key: string]: any }, C extends T> implements ObjectSerializer<N, T, C> {
    constructor(
        public readonly name: N,
        public readonly nullValue: C,
        public readonly version: number,
        private readonly fieldSerializers: FieldSerializerSpec<keyof T, any>[][],
        private readonly backfillFn: (deserialized: T) => void,
    ) {}

    static create<N extends string>(name: N): ObjectSerializerBuilder<N, {}> {
        return new ObjectSerializerBuilder(name, 1, [])
    }

    serialize(cursor: DataViewCursor, value: C): void {
        cursor.setUint16(this.version)
        for (const field of this.fieldSerializers) {
            const fieldVersion = field[field.length - 1]
            if (fieldVersion.removed) {
                continue
            }
            fieldVersion.serializer.serialize(cursor, value[fieldVersion.name])
        }
    }

    deserialize(cursor: DataViewCursor, translationMap: ITranslationMap, destination?: C): C {
        destination = destination || Object.assign({}, this.nullValue)

        const prevPosition = cursor.offset

        const serializedVersion = cursor.getUint16()
        if (serializedVersion > this.version) {
            cursor.reset(prevPosition)
            throw new Error(`Invalid version [${serializedVersion}] read while trying to deserialize [${this.name}].  Highest valid version is [${this.version}].`)
        }

        try {
            field: for (const field of this.fieldSerializers) {
                if (field[0].version > serializedVersion) {
                    continue field
                }

                let serializedVersionIdx = 0;
                for (const fieldVersion of field) {
                    if (fieldVersion.version >= serializedVersion) {
                        break
                    }
                    serializedVersionIdx++
                }

                const layer = field[serializedVersionIdx]
                if (field[field.length - 1].removed) {
                    layer.serializer.skip(cursor)
                    continue field
                }
                let value = layer.serializer.deserialize(cursor, translationMap)

                for (let i = serializedVersionIdx + 1; i < field.length; i++) {
                    if (field[i].removed) {
                        continue field
                    }
                    const upgrade = field[i].upgrade
                    if (upgrade) {
                        value = upgrade(value)
                    }
                }

                destination[field[field.length - 1].name as keyof T] = value
            }

            this.backfillFn(destination)

            return destination
        } catch (err) {
            cursor.reset(prevPosition)
            throw err
        }
    }

    skip(cursor: DataViewCursor): void {
        const prevPosition = cursor.offset

        const serializedVersion = cursor.getUint16()
        if (serializedVersion > this.version) {
            cursor.reset(prevPosition)
            throw new Error(`Invalid version [${serializedVersion}] read while trying to deserialize [${this.name}].  Highest valid version is [${this.version}].`)
        }

        field: for (const field of this.fieldSerializers) {
            let serializedVersionIdx = 0;
            for (const fieldVersion of field) {
                if (fieldVersion.removed) {
                    continue field
                }
                if (fieldVersion.version > serializedVersion) {
                    break
                }
                serializedVersionIdx++
            }

            field[serializedVersionIdx].serializer.skip(cursor)
        }
    }
}

