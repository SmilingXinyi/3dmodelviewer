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
    helper?: Boolean
}
