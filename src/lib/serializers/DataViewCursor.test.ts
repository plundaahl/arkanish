import { DataViewCursor } from './DataViewCursor'
import { abToStr } from './util'

let buffer: ArrayBuffer
let cursor: DataViewCursor
beforeEach(() => {
    buffer = new ArrayBuffer(256)
    cursor = new DataViewCursor(new DataView(buffer))
})

describe.each([
    ['Uint8',   1, [1, 0, 4, 255]],
    ['Uint16',  2, [1, 0, 4, 255]],
    ['Uint32',  4, [1, 0, 4, 255]],
    ['Int8',    1, [1, 0, 4, -127]],
    ['Int16',   2, [1, 0, 4, -32]],
    ['Int32',   4, [1, 0, 4, -50]],
    ['Float32', 4, [1, -12.572, 3.14]],
    ['Float64', 8, [1, -12.572, 3.14]],
])('%s', (type, bytesPerElement, values) => {
    const setter = 'set' + type
    const getter = 'get' + type

    test(`${getter} returns 0 for new DataView`, () => {
        expect((cursor as any)[getter]()).toEqual(0)
    })

    test(`${getter} correctly deserializes values set by ${setter}`, () => {
        values.forEach(value => (cursor as any)[setter](value))
        expect(cursor.offset).toEqual(values.length * bytesPerElement)
    
        cursor.reset()
    
        const results = values.map(() => (cursor as any)[getter]())
        expect(results.length).toEqual(values.length)
        results.forEach((result, i) => expect(result).toBeCloseTo(values[i]))
        expect(cursor.offset).toEqual(values.length * bytesPerElement)
    })
})

test.each([
    [''],
    ['example text'],
])('Text encoding/decoding', (text) => {
    cursor.setString(text)
    cursor.reset()
    expect(cursor.getString()).toEqual(text)
})
