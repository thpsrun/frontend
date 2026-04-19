import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { fetchCountries } from "./auth-api"

export function useCountries() {
    const query = useQuery({
        queryKey: queryKeys.auth.countries(),
        queryFn: ({ signal }) => fetchCountries(signal),
        staleTime: 60 * 60 * 1000,
    })

    return {
        countries: query.data ?? [],
        isLoading: query.isLoading,
    }
}
