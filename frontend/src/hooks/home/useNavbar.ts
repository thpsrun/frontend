import { useQuery } from "@tanstack/react-query"
import type { NavbarResponse } from "@/types/api"
import { apiFetch } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

export const useNavbar = () => {
    return useQuery({
        queryKey: queryKeys.home.navbar(),
        queryFn: ({ signal }) =>
            apiFetch<NavbarResponse>("/website/navbar", { signal }),
        staleTime: 15 * 60 * 1000,
    })
}
