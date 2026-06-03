import { toast } from "sonner"
import { Button } from "@/components/ui/button"

interface Props {
    codes: string[]
}

export function RecoveryCodesDisplay({ codes }: Props) {
    const copyAll = () => {
        void navigator.clipboard.writeText(codes.join("\n"))
        toast.success("Recovery codes copied.")
    }

    const download = () => {
        const blob = new Blob([codes.join("\n") + "\n"], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "thps-run-recovery-codes.txt"
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
                SAVE THESE SOMEWHERE SAFE - YOU WON'T SEE THIS AGAIN UNLESS YOU
                REGENERATE THEM IN YOUR PROFILE SETTINGS! Each code will only work once!
            </p>
            <div className="grid grid-cols-2 gap-2 rounded-md border border-border/40 p-3 font-mono text-sm">
                {codes.map((c) => (
                    <span key={c}>{c}</span>
                ))}
            </div>
            <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={copyAll}>
                    Copy All
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={download}>
                    Download .txt
                </Button>
            </div>
        </div>
    )
}
