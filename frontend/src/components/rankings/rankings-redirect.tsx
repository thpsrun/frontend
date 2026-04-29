import { Navigate, useParams } from "react-router"

export const RankingsRedirect = () => {
    const { gameSlug } = useParams<{ gameSlug?: string }>()
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const tail = gameSlug ? `/${gameSlug}` : ""
    return (
        <Navigate
            to={`/rankings/history/overall/${year}/${month}${tail}`}
            replace
        />
    )
}
