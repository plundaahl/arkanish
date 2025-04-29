export type Style = {
    glyph: string
    bg: string
    outline: string
}

export type StyleSet = {
    idle: Style
    hot: Style
    active: Style
}

export type Theme = {
    panel: Style
    label: Style
    button: StyleSet
}

const INVISIBLE = "#00000000"

export const theme: Theme = {
    panel: {
        glyph: "white",
        bg: "#FFFFFF33",
        outline: "white"
    },
    label: {
        glyph: "white",
        bg: INVISIBLE,
        outline: INVISIBLE
    },
    button: {
        idle: {
            glyph: "white",
            bg: INVISIBLE,
            outline: "green"
        },
        hot: {
            glyph: "black",
            bg: "green",
            outline: "green"
        },
        active: {
            glyph: "white",
            bg: "#005500",
            outline: "green"
        },
    }
}