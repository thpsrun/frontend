import { apiFetch } from "@/lib/api-client"
import type {
    CategoryVariable,
    CategoryVariableValue,
} from "@/types/api"
import type { TimingMethodType } from "@/types/shared"

export interface UpdateVariableRequest {
    allowed_methods?: TimingMethodType[] | null
    required_methods?: TimingMethodType[] | null
    defaulttime?: TimingMethodType | null
}

export interface UpdateVariableValueRequest {
    allowed_methods?: TimingMethodType[] | null
    required_methods?: TimingMethodType[] | null
    defaulttime?: TimingMethodType | null
    rules?: string | null
}

export const updateVariableFn = (
    variableId: string,
    body: UpdateVariableRequest,
): Promise<CategoryVariable> =>
    apiFetch<CategoryVariable>(`/variables/${variableId}`, {
        method: "PUT",
        json: body,
    })

// NOTE: variable values do not currently expose a stable numeric id in the
// embedded GameDetail shape - the `value` field (speedrun.com value hash)
// serves as the identifier. If the backend exposes a separate id later,
// update both this caller and the VariablesSection consumer.
export const updateVariableValueFn = (
    valueId: string,
    body: UpdateVariableValueRequest,
): Promise<CategoryVariableValue> =>
    apiFetch<CategoryVariableValue>(`/variables/values/${valueId}`, {
        method: "PUT",
        json: body,
    })
