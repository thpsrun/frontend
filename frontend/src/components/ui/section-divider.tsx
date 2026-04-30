import * as React from "react"

import { cn } from "@/lib/utils"

function SectionDivider({
    className,
    children,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="section-divider"
            role={children ? undefined : "separator"}
            aria-hidden={children ? undefined : true}
            className={cn("border-t border-border/40 pt-4 mt-2", className)}
            {...props}
        >
            {children}
        </div>
    )
}

export { SectionDivider }
