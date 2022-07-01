/**
 * @file modelviewer types
 * @author xinyi
 */

type Size = {
    width: number,
    height: number
}

export type Options = {
    hrd: ArrayBuffer;
    auto: boolean
    modelType: string
    model: string
    backgroundColor?: number
    backgroundImage?: string
    dom: string | HTMLElement
    scale: number
    size?: Size
    helper?: boolean
    hemisphereLight?: any[]
    ambientLights?: {color: number, intensity?: number}[]
    directionalLights?: {
        color?: number, position: [x: number, y: number, z: number], intensity?: number
    }[]
    stats?: boolean
    outputEncoding: number
    rotationValue: number
    parsed: Function,
    controls: {minDistance: number, maxDistance: number}
}
