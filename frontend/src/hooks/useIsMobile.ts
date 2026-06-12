import { useIsWide } from "@/hooks/useIsWide"

export const useIsMobile = (): boolean => !useIsWide(1024)
