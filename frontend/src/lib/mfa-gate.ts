import { useSyncExternalStore } from "react"

let gated = false
const listeners = new Set<() => void>()

export function setMfaGate(value: boolean): void {
    if (gated === value) return
    gated = value
    for (const listener of listeners) {
        listener()
    }
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

function getSnapshot(): boolean {
    return gated
}

export function useMfaGate(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot)
}
