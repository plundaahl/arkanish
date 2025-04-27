const OFFSET_8 = 1
const OFFSET_16 = 2
const OFFSET_32 = 4
const OFFSET_64 = 8

const STR_LEN_OFFET = OFFSET_32

export class DataViewCursor {
    private readonly textEncoder = new TextEncoder()
    private readonly textDecoder = new TextDecoder('utf-8', { fatal: true })

    constructor(
        private dataView: DataView,
        private _offset: number = 0
    ) {}

    get offset(): number { return this._offset }

    reset(offset: number = 0) {
        this._offset = offset
    }

    setDataView(view: DataView, offset: number = 0) {
        this.dataView = view
        this._offset = offset
    }

    getBoolean(): boolean {
        const value = this.dataView.getUint8(this._offset)
        this._offset += OFFSET_8
        return Boolean(value)
    }

    setBoolean(value: boolean) {
        this.dataView.setUint8(this._offset, value ? 1 : 0)
        this._offset += OFFSET_8
    }

    getUint8(): number {
        const value = this.dataView.getUint8(this._offset)
        this._offset += OFFSET_8
        return value
    }

    setUint8(value: number): void {
        this.dataView.setUint8(this._offset, value)
        this._offset += OFFSET_8
    }

    getUint16(): number {
        const value = this.dataView.getUint16(this._offset)
        this._offset += OFFSET_16
        return value
    }

    setUint16(value: number): void {
        this.dataView.setUint16(this._offset, value)
        this._offset += OFFSET_16
    }

    getUint32(): number {
        const value = this.dataView.getUint32(this._offset)
        this._offset += OFFSET_32
        return value
    }

    setUint32(value: number): void {
        this.dataView.setUint32(this._offset, value)
        this._offset += OFFSET_32
    }

    getInt8(): number {
        const value = this.dataView.getInt8(this._offset)
        this._offset += OFFSET_8
        return value
    }

    setInt8(value: number): void {
        this.dataView.setInt8(this._offset, value)
        this._offset += OFFSET_8
    }

    getInt16(): number {
        const value = this.dataView.getInt16(this._offset)
        this._offset += OFFSET_16
        return value
    }

    setInt16(value: number): void {
        this.dataView.setInt16(this._offset, value)
        this._offset += OFFSET_16
    }

    getInt32(): number {
        const value = this.dataView.getInt32(this._offset)
        this._offset += OFFSET_32
        return value
    }

    setInt32(value: number): void {
        this.dataView.setInt32(this._offset, value)
        this._offset += OFFSET_32
    }

    getFloat32(): number {
        const value = this.dataView.getFloat32(this._offset)
        this._offset += OFFSET_32
        return value
    }

    setFloat32(value: number): void {
        this.dataView.setFloat32(this._offset, value)
        this._offset += OFFSET_32
    }

    getFloat64(): number {
        const value = this.dataView.getFloat64(this._offset)
        this._offset += OFFSET_64
        return value
    }

    setFloat64(value: number): void {
        this.dataView.setFloat64(this._offset, value)
        this._offset += OFFSET_64
    }

    getBigInt64(): bigint {
        const value = this.dataView.getBigInt64(this._offset)
        this._offset += OFFSET_64
        return value
    }

    setBigInt64(value: bigint): void {
        this.dataView.setBigInt64(this._offset, value)
        this._offset += OFFSET_64
    }

    getBigUint64(): bigint {
        const value = this.dataView.getBigUint64(this._offset)
        this._offset += OFFSET_64
        return value
    }

    setBigUint64(value: bigint): void {
        this.dataView.setBigUint64(this._offset, value)
        this._offset += OFFSET_64
    }

    getString(): string {
        const byteLength = this.dataView.getUint32(this._offset)
        const textView = new Uint8Array(this.dataView.buffer, this._offset + STR_LEN_OFFET, byteLength)
        this._offset += byteLength + STR_LEN_OFFET
        return this.textDecoder.decode(textView)
    }

    setString(str: string): void {
        const headerOffset = this._offset
        const textView = new Uint8Array(this.dataView.buffer, this._offset + STR_LEN_OFFET)
        const result = this.textEncoder.encodeInto(str, textView)
        this._offset += result.written + STR_LEN_OFFET
        // Write string length into header
        this.dataView.setUint32(headerOffset, result.written)
    }

    skipBoolean() { this._offset += OFFSET_8 }
    skip8() { this._offset += OFFSET_8 }
    skip16() { this._offset += OFFSET_16 }
    skip32() { this._offset += OFFSET_32 }
    skip64() { this._offset += OFFSET_64 }

    skipString(): void {
        const byteLength = this.dataView.getUint32(this._offset)
        this._offset += byteLength + STR_LEN_OFFET
    }
}
