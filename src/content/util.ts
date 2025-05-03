import { ExtraMath } from "../Math"

export function mkIntensityCalcFn(minIntensity: number, maxIntensity: number, minValue: number, maxValue: number) {
    const valueRange = (maxValue - minValue) / (maxIntensity - minIntensity)
    return function(intensity: number) {
        return minValue + (ExtraMath.clamp(minIntensity, intensity, maxIntensity) * valueRange)
    }    
}
