export type GradientColors = [
    string | null,
    string | null,
    string | null,
]

export type GradientPreset = {
    id: string
    name: string
    preview: "static" | "placeholder"
    getColors: () => GradientColors
}

function randomHex(): string {
    const n = Math.floor(Math.random() * 0x1000000)
    return "#" + n.toString(16).padStart(6, "0").toUpperCase()
}

function randomGradient(): GradientColors {
    const stops = 1 + Math.floor(Math.random() * 3)
    const colors: (string | null)[] = [null, null, null]
    for (let i = 0; i < stops; i++) {
        colors[i] = randomHex()
    }
    return colors as GradientColors
}

export const GRADIENT_PRESETS: GradientPreset[] = [
    {
        id: "trans",
        name: "Trans",
        preview: "static",
        getColors: () => ["#5BCEFA", "#F5A9B8", "#FFFFFF"],
    },
    {
        id: "nonbinary",
        name: "Nonbinary",
        preview: "static",
        getColors: () => ["#FCF434", "#FFFFFF", "#9C59D0"],
    },
    {
        id: "red-white",
        name: "Red to White",
        preview: "static",
        getColors: () => ["#FF0000", "#FFFFFF", null],
    },
    {
        id: "purple",
        name: "Purple",
        preview: "static",
        getColors: () => ["#9C59D0", null, null],
    },
    {
        id: "random",
        name: "Random",
        preview: "placeholder",
        getColors: randomGradient,
    },
]
