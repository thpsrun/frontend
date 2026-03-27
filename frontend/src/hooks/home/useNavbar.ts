import { useQuery } from "@tanstack/react-query"
import { API_BASE_URL } from "@/constants"
import type { NavbarResponse } from "@/types/api"

const fetchNavbar = async (): Promise<NavbarResponse> => {
    const response = await fetch(`${API_BASE_URL}/website/navbar`)
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
}

export const useNavbar = () => {
    return useQuery({
        queryKey: ["navbar"],
        queryFn: fetchNavbar,
        staleTime: 15 * 60 * 1000,
    })
}
