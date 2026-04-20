import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function PasswordInput({
    className,
    ...props
}: Omit<React.ComponentProps<"input">, "type">) {
    const [show, setShow] = React.useState(false)

    return (
        <div className="relative">
            <Input
                type={show ? "text" : "password"}
                className={className}
                {...props}
            />
            <button
                type="button"
                tabIndex={-1}
                onClick={() => setShow((v) => !v)}
                className={cn(
                    "absolute right-2.5",
                    "top-1/2 -translate-y-1/2",
                    "text-muted-foreground",
                    "hover:text-foreground",
                )}
            >
                {show
                    ? <EyeOff className="size-4" />
                    : <Eye className="size-4" />}
            </button>
        </div>
    )
}

export { PasswordInput }
