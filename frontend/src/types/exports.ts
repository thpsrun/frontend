export type DataExportStatus =
    | "PENDING"
    | "RUNNING"
    | "READY"
    | "FAILED"
    | "EXPIRED"

export interface DataExportItem {
    id: string
    status: DataExportStatus
    requested_at: string
    completed_at: string | null
    expires_at: string | null
    file_size_bytes: number | null
}

export interface DataExportListResponse {
    exports: DataExportItem[]
}
