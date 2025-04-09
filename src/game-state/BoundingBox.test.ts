import { BoundingBox } from './BoundingBox'

describe('intersects', () => {
    describe('AABB vs. AABB', () => {
        test('Standard intersection should return true', () => {
            const a = BoundingBox.createAabb(0, 0, 10, 10)
            const b = BoundingBox.createAabb(5, 5, 10, 10)
            expect(BoundingBox.intersects(a, b)).toEqual(true)
        })

        test('Non-intersecting should return false', () => {
            const a = BoundingBox.createAabb(0, 0, 10, 10)
            const b = BoundingBox.createAabb(15, 5, 10, 10)
            expect(BoundingBox.intersects(a, b)).toEqual(false)
        })
    })
})

describe('createConvexPoly', () => {
    test('Should error if not a polygon', () => {
        expect(() => BoundingBox.createConvexPolyBb([0, 1], [1, 0])).toThrow()
    })

    test('Should error if polygon is concave', () => {
        expect(() => BoundingBox.createConvexPolyBb([1, 0], [0, 1], [0, 2], [-1, -1])).toThrow()
    })

    test('Should not error if polygon is convex', () => {
        expect(() => BoundingBox.createConvexPolyBb([1, 0], [0, 1], [-1, -1])).not.toThrow()
    })
})