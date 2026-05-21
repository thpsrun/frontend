import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertBanner } from "@/components/common/alert-banner"
import { ApiError } from "@/lib/api-client"
import { validateApiKeyLabel } from "@/lib/validation"
import { usePatchApiKey } from "@/hooks/auth/usePatchApiKey"
import { apiKeyErrorMessage } from "@/hooks/auth/api-keys-api"
import {
    LabelDescriptionFields,
    type LabelDescriptionFormValues,
} from "./label-description-fields"
import type { ApiKeyResponse } from "@/types/api-keys"

type EditApiKeyDialogProps = {
    apiKey: ApiKeyResponse | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditApiKeyDialog({
    apiKey,
    open,
    onOpenChange,
}: EditApiKeyDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                {apiKey && (
                    <EditApiKeyDialogBody
                        key={apiKey.id}
                        apiKey={apiKey}
                        onOpenChange={onOpenChange}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}

type EditApiKeyDialogBodyProps = {
    apiKey: ApiKeyResponse
    onOpenChange: (open: boolean) => void
}

function EditApiKeyDialogBody({
    apiKey,
    onOpenChange,
}: EditApiKeyDialogBodyProps) {
    const patchKey = usePatchApiKey()
    const [error, setError] = useState<string | null>(null)

    const form = useForm<LabelDescriptionFormValues>({
        defaultValues: {
            label: apiKey.label,
            description: apiKey.description,
        },
    })

    const onSubmit = form.handleSubmit(async (values) => {
        setError(null)

        const labelError = validateApiKeyLabel(values.label)
        if (labelError) {
            form.setError("label", { message: labelError })
            return
        }

        try {
            await patchKey.mutateAsync({
                id: apiKey.id,
                data: {
                    label: values.label.trim(),
                    description: values.description,
                },
            })
            toast.success("Key updated.")
            onOpenChange(false)
        } catch (err) {
            if (err instanceof ApiError && err.isNotFound) {
                toast.info("Key was already revoked.")
                onOpenChange(false)
                return
            }
            setError(apiKeyErrorMessage(err))
        }
    })

    return (
        <>
            <DialogHeader>
                <DialogTitle>Edit API key</DialogTitle>
                <DialogDescription>
                    After creation, only the label and description can be changed. Scope and expiration
                    date of the API key cannot be changed.
                </DialogDescription>
            </DialogHeader>

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <LabelDescriptionFields
                    register={form.register}
                    labelError={form.formState.errors.label}
                    idPrefix="api-key-edit"
                />

                {error && <AlertBanner variant="error">{error}</AlertBanner>}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={patchKey.isPending}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={patchKey.isPending}>
                        {patchKey.isPending ? "Saving..." : "Save changes"}
                    </Button>
                </DialogFooter>
            </form>
        </>
    )
}
