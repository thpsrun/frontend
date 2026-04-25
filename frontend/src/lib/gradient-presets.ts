import type { Gradients } from "@/types/shared"

export type GradientPreset = {
    id: string
    name: string
    preview: "static" | "placeholder"
    getColors: () => Gradients
}

function randomHex(): string {
    const n = Math.floor(Math.random() * 0x1000000)
    return "#" + n.toString(16).padStart(6, "0").toUpperCase()
}

function randomGradient(): Gradients {
    const stops = 1 + Math.floor(Math.random() * 3)
    const slots: (string | null)[] = [null, null, null]
    for (let i = 0; i < stops; i++) {
        slots[i] = randomHex()
    }
    return {
        gradient_1: slots[0],
        gradient_2: slots[1],
        gradient_3: slots[2],
    }
}

export const GRADIENT_PRESETS: GradientPreset[] = [
    {
        id: "trans",
        name: "Trans",
        preview: "static",
        getColors: () => ({
            gradient_1: "#5BCEFA",
            gradient_2: "#F5A9B8",
            gradient_3: "#FFFFFF",
        }),
    },
    {
        id: "nonbinary",
        name: "Nonbinary",
        preview: "static",
        getColors: () => ({
            gradient_1: "#FCF434",
            gradient_2: "#FFFFFF",
            gradient_3: "#9C59D0",
        }),
    },
    {
        id: "red-white",
        name: "Red to White",
        preview: "static",
        getColors: () => ({
            gradient_1: "#FF0000",
            gradient_2: "#FFFFFF",
            gradient_3: null,
        }),
    },
    {
        id: "purple",
        name: "Purple",
        preview: "static",
        getColors: () => ({
            gradient_1: "#9C59D0",
            gradient_2: null,
            gradient_3: null,
        }),
    },
    {
        id: "random",
        name: "Random",
        preview: "placeholder",
        getColors: randomGradient,
    },
]
