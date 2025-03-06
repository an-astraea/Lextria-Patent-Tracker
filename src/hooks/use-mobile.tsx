
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

// Breakpoint for mobile devices - anything below sm
export function useIsMobile() {
  return useMediaQuery("(max-width: 640px)")
}

// Breakpoint for tablet devices - between sm and lg
export function useIsTablet() {
  return useMediaQuery("(min-width: 641px) and (max-width: 1024px)")
}

// Breakpoint for small screens - anything below md
export function useIsSmallScreen() {
  return useMediaQuery("(max-width: 768px)")
}

// Breakpoint for medium screens - between md and xl
export function useIsMediumScreen() {
  return useMediaQuery("(min-width: 769px) and (max-width: 1280px)")
}

// Breakpoint for large screens - anything above xl
export function useIsLargeScreen() {
  return useMediaQuery("(min-width: 1281px)")
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

// Get the number of columns based on screen size
export function useResponsiveGridColumns(options: {
  mobile?: number;
  tablet?: number;
  desktop?: number;
}): number {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  const { mobile = 1, tablet = 2, desktop = 3 } = options;

  if (isMobile) return mobile;
  if (isTablet) return tablet;
  return desktop;
}
