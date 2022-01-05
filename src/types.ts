/**
 * @file modelviewer types
 * @author xinyi
 */

type Size = {
    width: number,
    height: number
}

export type Options = {
    auto: boolean
    modelType: string
    model: string
    backgroundColor?: number
    backgroundImage?: string
    dom: string | HTMLElement
    scale: number
    size?: Size
<<<<<<< Updated upstream
    helper?: Boolean
=======
    helper?: boolean
    ambientLights?: {color: number, intensity?: number}[]
    directionalLights?: {
        color?: number, position: [x: number, y: number, z: number], intensity?: number
    }[]
    stats?: boolean
    outputEncoding: number
>>>>>>> Stashed changes
}
