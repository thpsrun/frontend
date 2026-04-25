import { useMutation } from "@tanstack/react-query"

export function useInvalidatingMutation<TData, TVariables = void>(
    mutationFn: (vars: TVariables) => Promise<TData>,
    invalidate: () => void,
) {
    return useMutation<TData, Error, TVariables>({
        mutationFn,
        onSuccess: () => invalidate(),
    })
}
