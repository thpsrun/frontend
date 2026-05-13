export const queryKeys = {
    home: {
        all: ["home"] as const,
        thpsData: () => [...queryKeys.home.all, "thps-data"] as const,
        navbar: () => [...queryKeys.home.all, "navbar"] as const,
    },

    games: {
        all: ["games"] as const,
        list: () => [...queryKeys.games.all, "list"] as const,
        detail: (gameSlug: string) => [...queryKeys.games.all, "detail", gameSlug] as const,
    },

    guides: {
        all: ["guides"] as const,
        list: (params: { game?: string; tag?: string; player_id?: string; embed?: string }) =>
            [...queryKeys.guides.all, "list", params] as const,
        detail: (slug: string, embed?: string) =>
            [...queryKeys.guides.all, "detail", slug, embed ?? ""] as const,
    },

    leaderboard: {
        all: ["leaderboard"] as const,
        full: (params: Record<string, unknown>) =>
            [...queryKeys.leaderboard.all, "full", params] as const,
        il: (params: Record<string, unknown>) =>
            [...queryKeys.leaderboard.all, "il", params] as const,
        ilOverview: (params: Record<string, unknown>) =>
            [...queryKeys.leaderboard.all, "il-overview", params] as const,
        wrHistory: (params: Record<string, unknown>) =>
            [...queryKeys.leaderboard.all, "wr-history", params] as const,
    },

    rankings: {
        all: ["rankings"] as const,
        historical: (params: Record<string, unknown>) =>
            [...queryKeys.rankings.all, "historical", params] as const,
        oldestRuns: (gameSlug: string) =>
            [...queryKeys.rankings.all, "oldest-runs", gameSlug] as const,
    },

    runs: {
        all: ["runs"] as const,
        detail: (id: string) => [...queryKeys.runs.all, "detail", id] as const,
        list: <T extends object>(params?: T) =>
            params === undefined
                ? ([...queryKeys.runs.all, "list"] as const)
                : ([...queryKeys.runs.all, "list", params] as const),
        listPaginated: <T extends object>(params: T) =>
            [...queryKeys.runs.all, "list-paginated", params] as const,
    },

    player: {
        all: ["player"] as const,
        profile: (playerName: string, includeObsolete: boolean) =>
            [...queryKeys.player.all, "profile", playerName, includeObsolete] as const,
        profilePrefix: (playerName: string) =>
            [...queryKeys.player.all, "profile", playerName] as const,
        search: (query: string) => [...queryKeys.player.all, "search", query] as const,
    },

    awards: {
        all: ["awards"] as const,
        list: () => [...queryKeys.awards.all, "list"] as const,
    },

    auth: {
        all: ["auth"] as const,
        session: () => [...queryKeys.auth.all, "session"] as const,
        me: () => [...queryKeys.auth.all, "me"] as const,
        countries: () => ["countries"] as const,
        apiKeys: () => [...queryKeys.auth.all, "api-keys"] as const,
        capabilities: () => [...queryKeys.auth.all, "capabilities"] as const,
        linkedProviders: () => [...queryKeys.auth.all, "linked-providers"] as const,
        passkeys: () => [...queryKeys.auth.all, "passkeys"] as const,
    },

    submissions: {
        all: ["submissions"] as const,
        list: () => [...queryKeys.submissions.all, "list"] as const,
    },

    admin: {
        all: ["admin"] as const,
        syncLogs: <T extends object>(params?: T) =>
            params === undefined
                ? ([...queryKeys.admin.all, "sync-logs"] as const)
                : ([...queryKeys.admin.all, "sync-logs", params] as const),
        botSession: () => [...queryKeys.admin.all, "bot-session"] as const,
        reconcileJobs: <T extends object>(params?: T) =>
            params === undefined
                ? ([...queryKeys.admin.all, "reconcile-jobs"] as const)
                : ([...queryKeys.admin.all, "reconcile-jobs", params] as const),
        reconcileJob: (jobId: string) =>
            [...queryKeys.admin.all, "reconcile-job", jobId] as const,
        reconcileItems: <T extends object>(jobId: string, params?: T) =>
            params === undefined
                ? ([...queryKeys.admin.all, "reconcile-items", jobId] as const)
                : ([...queryKeys.admin.all, "reconcile-items", jobId, params] as const),
        gameDisplay: (gameId: string) =>
            [...queryKeys.admin.all, "game-display", gameId] as const,
        userModerates: (ident: string) =>
            [...queryKeys.admin.all, "user-moderates", ident] as const,
        userAwards: (ident: string) =>
            [...queryKeys.admin.all, "user-awards", ident] as const,
        navbar: () => [...queryKeys.admin.all, "navbar"] as const,
    },

    tags: {
        all: ["tags"] as const,
        list: () => [...queryKeys.tags.all, "list"] as const,
        detail: (slug: string) =>
            [...queryKeys.tags.all, "detail", slug] as const,
    },
} as const
