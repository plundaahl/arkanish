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