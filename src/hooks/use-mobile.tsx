
import * as React from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState<boolean>(
    // Initialize with a check for window to prevent SSR issues
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  )

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined
    
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    
    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [matches, query])

  return matches
}

// Breakpoint for mobile devices
export function useIsMobile() {
  return useMediaQuery("(max-width: 640px)")
}

// Breakpoint for tablet devices
export function useIsTablet() {
  return useMediaQuery("(min-width: 641px) and (max-width: 1024px)")
}

// Responsive helper
export function useResponsiveValue<T>(options: {
  mobile: T;
  tablet?: T;
  desktop: T;
}): T {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  if (isMobile) return options.mobile;
  if (isTablet && options.tablet) return options.tablet;
  return options.desktop;
}
