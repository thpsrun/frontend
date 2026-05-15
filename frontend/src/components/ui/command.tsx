import * as React from "react"
import {
    Command as CommandRoot,
    CommandInput as CommandInputPrimitive,
    CommandList as CommandListPrimitive,
    CommandEmpty as CommandEmptyPrimitive,
    CommandGroup as CommandGroupPrimitive,
    CommandItem as CommandItemPrimitive,
} from "cmdk"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"

function Command({
    className,
    ...props
}: React.ComponentProps<typeof CommandRoot>) {
    return (
        <CommandRoot
            className={cn(
                "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
                className,
            )}
            {...props}
        />
    )
}

function CommandInput({
    className,
    ...props
}: React.ComponentProps<typeof CommandInputPrimitive>) {
    return (
        <div className="flex items-center border-b border-border px-3" cmdk-input-wrapper="">
            <Search className="mr-2 size-4 shrink-0 opacity-50" />
            <CommandInputPrimitive
                className={cn(
                    "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
                {...props}
            />
        </div>
    )
}

function CommandList({
    className,
    ...props
}: React.ComponentProps<typeof CommandListPrimitive>) {
    return (
        <CommandListPrimitive
            className={cn(
                "max-h-75 overflow-x-hidden overflow-y-auto",
                className,
            )}
            {...props}
        />
    )
}

function CommandEmpty(
    props: React.ComponentProps<typeof CommandEmptyPrimitive>,
) {
    return (
        <CommandEmptyPrimitive
            className="py-6 text-center text-sm text-muted-foreground"
            {...props}
        />
    )
}

function CommandGroup({
    className,
    ...props
}: React.ComponentProps<typeof CommandGroupPrimitive>) {
    return (
        <CommandGroupPrimitive
            className={cn(
                "text-foreground **:[[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium",
                className,
            )}
            {...props}
        />
    )
}

function CommandItem({
    className,
    ...props
}: React.ComponentProps<typeof CommandItemPrimitive>) {
    return (
        <CommandItemPrimitive
            className={cn(
                "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
                className,
            )}
            {...props}
        />
    )
}

export {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
}
