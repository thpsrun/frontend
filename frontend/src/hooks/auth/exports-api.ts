import { apiFetch } from "@/lib/api-client"
import { API_BASE_URL } from "@/constants"
import type { DataExportItem, DataExportListResponse } from "@/types/exports"

export const listMyExportsFn = (
    signal?: AbortSignal,
): Promise<DataExportListResponse> =>
    apiFetch<DataExportListResponse>("/auth/me/exports", { signal })

export const requestMyExportFn = (): Promise<DataExportItem> =>
    apiFetch<DataExportItem>("/auth/me/export", { method: "POST" })

export const exportDownloadHref = (exportId: string): string =>
    `${API_BASE_URL}/auth/me/exports/${exportId}/download`
