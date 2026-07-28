import { apiFetch } from "@/lib/api-client"
import type { GameCategory } from "@/types/api"
import type { TimingMethodType } from "@/types/shared"

export interface UpdateCategoryRequest {
    defaulttime?: TimingMethodType | null
    allowed_methods?: TimingMethodType[] | null
    required_methods?: TimingMethodType[] | null
    rules?: string | null
}

export const updateCategoryFn = (
    categoryId: string,
    body: UpdateCategoryRequest,
): Promise<GameCategory> =>
    apiFetch<GameCategory>(`/categories/${categoryId}`, {
        method: "PUT",
        json: body,
    })
