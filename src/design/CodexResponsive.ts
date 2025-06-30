// ABOUTME: Responsive utilities aligned with Wikimedia Codex breakpoints and responsive patterns
// ABOUTME: Provides consistent responsive behavior across canvas-based UI components

import { codexTokens } from './CodexTokens';

/**
 * Codex breakpoint values (based on Wikimedia design system)
 */
export const codexBreakpoints = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1440,
  extraLarge: 1920
} as const;

export type BreakpointName = keyof typeof codexBreakpoints;

/**
 * Container size mappings from Codex design system
 */
export const codexContainerSizes = {
  mobile: {
    margin: codexTokens.spacing.px12,
    padding: codexTokens.spacing.px16,
    maxWidth: '100%'
  },
  tablet: {
    margin: codexTokens.spacing.px20,
    padding: codexTokens.spacing.px24,
    maxWidth: '720px'
  },
  desktop: {
    margin: codexTokens.spacing.px24,
    padding: codexTokens.spacing.px24,
    maxWidth: '960px'
  },
  largeDesktop: {
    margin: codexTokens.spacing.px24,
    padding: codexTokens.spacing.px24,
    maxWidth: '1200px'
  },
  extraLarge: {
    margin: codexTokens.spacing.px24,
    padding: codexTokens.spacing.px24,
    maxWidth: '1400px'
  }
} as const;

/**
 * Typography scale adjustments for different screen sizes
 */
export const codexResponsiveTypography = {
  mobile: {
    fontSizeMultiplier: 0.875,
    lineHeightMultiplier: 0.9,
    letterSpacing: '0.01em'
  },
  tablet: {
    fontSizeMultiplier: 0.95,
    lineHeightMultiplier: 0.95,
    letterSpacing: '0'
  },
  desktop: {
    fontSizeMultiplier: 1,
    lineHeightMultiplier: 1,
    letterSpacing: '0'
  },
  largeDesktop: {
    fontSizeMultiplier: 1.05,
    lineHeightMultiplier: 1.05,
    letterSpacing: '0'
  },
  extraLarge: {
    fontSizeMultiplier: 1.1,
    lineHeightMultiplier: 1.1,
    letterSpacing: '0'
  }
} as const;

/**
 * Spacing adjustments for responsive design
 */
export const codexResponsiveSpacing = {
  mobile: {
    multiplier: 0.75,
    minSpacing: 4,
    maxSpacing: 16
  },
  tablet: {
    multiplier: 0.875,
    minSpacing: 6,
    maxSpacing: 20
  },
  desktop: {
    multiplier: 1,
    minSpacing: 8,
    maxSpacing: 24
  },
  largeDesktop: {
    multiplier: 1.125,
    minSpacing: 8,
    maxSpacing: 32
  },
  extraLarge: {
    multiplier: 1.25,
    minSpacing: 12,
    maxSpacing: 40
  }
} as const;

/**
 * Utility class for responsive calculations using Codex design principles
 */
export class CodexResponsive {
  private currentBreakpoint: BreakpointName = 'desktop';
  private screenWidth: number = 1920;
  private screenHeight: number = 1080;

  constructor() {
    this.updateScreenSize();
    this.setupResizeListener();
  }

  /**
   * Update screen size and current breakpoint
   */
  private updateScreenSize(): void {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    this.currentBreakpoint = this.getCurrentBreakpoint();
  }

  /**
   * Set up window resize listener
   */
  private setupResizeListener(): void {
    window.addEventListener('resize', () => {
      this.updateScreenSize();
    });
  }

  /**
   * Get current breakpoint based on screen width
   */
  getCurrentBreakpoint(): BreakpointName {
    if (this.screenWidth >= codexBreakpoints.extraLarge) {
      return 'extraLarge';
    } else if (this.screenWidth >= codexBreakpoints.largeDesktop) {
      return 'largeDesktop';
    } else if (this.screenWidth >= codexBreakpoints.desktop) {
      return 'desktop';
    } else if (this.screenWidth >= codexBreakpoints.tablet) {
      return 'tablet';
    }
    return 'mobile';
  }

  /**
   * Check if current screen matches a breakpoint
   */
  matches(breakpoint: BreakpointName): boolean {
    return this.screenWidth >= codexBreakpoints[breakpoint];
  }

  /**
   * Check if screen is mobile size
   */
  isMobile(): boolean {
    return this.currentBreakpoint === 'mobile';
  }

  /**
   * Check if screen is tablet size or larger
   */
  isTabletOrLarger(): boolean {
    return this.matches('tablet');
  }

  /**
   * Check if screen is desktop size or larger
   */
  isDesktopOrLarger(): boolean {
    return this.matches('desktop');
  }

  /**
   * Get responsive font size
   */
  getFontSize(baseSize: number): number {
    const config = codexResponsiveTypography[this.currentBreakpoint];
    return Math.round(baseSize * config.fontSizeMultiplier);
  }

  /**
   * Get responsive line height
   */
  getLineHeight(baseLineHeight: number): number {
    const config = codexResponsiveTypography[this.currentBreakpoint];
    return Math.round(baseLineHeight * config.lineHeightMultiplier);
  }

  /**
   * Get responsive spacing value
   */
  getSpacing(baseSpacing: number): number {
    const config = codexResponsiveSpacing[this.currentBreakpoint];
    const adjusted = Math.round(baseSpacing * config.multiplier);
    return Math.max(config.minSpacing, Math.min(config.maxSpacing, adjusted));
  }

  /**
   * Get container configuration for current breakpoint
   */
  getContainerConfig() {
    return codexContainerSizes[this.currentBreakpoint];
  }

  /**
   * Get responsive margin for container
   */
  getContainerMargin(): number {
    return this.getContainerConfig().margin;
  }

  /**
   * Get responsive padding for container
   */
  getContainerPadding(): number {
    return this.getContainerConfig().padding;
  }

  /**
   * Calculate responsive width for content
   */
  getContentWidth(canvasWidth: number): number {
    const config = this.getContainerConfig();
    const margin = config.margin * 2; // Both sides
    
    if (config.maxWidth === '100%') {
      return canvasWidth - margin;
    }
    
    const maxWidthPx = parseInt(config.maxWidth);
    return Math.min(canvasWidth - margin, maxWidthPx);
  }

  /**
   * Get responsive button size
   */
  getButtonSize(baseSize: 'small' | 'medium' | 'large'): { width: number; height: number; padding: number } {
    const multiplier = codexResponsiveSpacing[this.currentBreakpoint].multiplier;
    
    const baseSizes = {
      small: { width: 80, height: 24, padding: 8 },
      medium: { width: 120, height: 32, padding: 12 },
      large: { width: 160, height: 40, padding: 16 }
    };
    
    const base = baseSizes[baseSize];
    
    return {
      width: Math.round(base.width * multiplier),
      height: Math.round(base.height * multiplier),
      padding: Math.round(base.padding * multiplier)
    };
  }

  /**
   * Get responsive icon size
   */
  getIconSize(baseSize: 'x-small' | 'small' | 'medium'): number {
    const multiplier = codexResponsiveTypography[this.currentBreakpoint].fontSizeMultiplier;
    
    const baseSizes = {
      'x-small': 12,
      'small': 16,
      'medium': 20
    };
    
    return Math.round(baseSizes[baseSize] * multiplier);
  }

  /**
   * Calculate responsive grid columns
   */
  getGridColumns(baseColumns: number = 12): number {
    switch (this.currentBreakpoint) {
      case 'mobile':
        return Math.min(baseColumns, 4);
      case 'tablet':
        return Math.min(baseColumns, 8);
      default:
        return baseColumns;
    }
  }

  /**
   * Get responsive text truncation length
   */
  getTextTruncationLength(baseLength: number): number {
    const multipliers = {
      mobile: 0.6,
      tablet: 0.8,
      desktop: 1,
      largeDesktop: 1.2,
      extraLarge: 1.4
    };
    
    return Math.round(baseLength * multipliers[this.currentBreakpoint]);
  }

  /**
   * Check if touch interface is likely
   */
  isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Get responsive touch target size
   */
  getTouchTargetSize(): number {
    // Codex recommends minimum 44px touch targets
    const baseSize = 44;
    
    if (this.isTouchDevice()) {
      return Math.max(baseSize, this.getSpacing(baseSize));
    }
    
    return this.getSpacing(32); // Smaller for mouse/keyboard interfaces
  }

  /**
   * Get responsive layout direction (for RTL support)
   */
  getLayoutDirection(): 'ltr' | 'rtl' {
    return document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr';
  }

  /**
   * Get current screen dimensions
   */
  getScreenDimensions(): { width: number; height: number } {
    return {
      width: this.screenWidth,
      height: this.screenHeight
    };
  }

  /**
   * Calculate responsive aspect ratio
   */
  getResponsiveAspectRatio(baseRatio: number = 16/9): number {
    // Adjust aspect ratio for mobile to be more square
    if (this.isMobile()) {
      return Math.min(baseRatio, 4/3);
    }
    return baseRatio;
  }

  /**
   * Get responsive z-index values
   */
  getZIndex(layer: 'base' | 'dropdown' | 'sticky' | 'modal' | 'toast'): number {
    const zIndexMap = {
      base: 1,
      dropdown: 50,
      sticky: 100,
      modal: 1000,
      toast: 2000
    };
    
    return zIndexMap[layer];
  }
}

/**
 * Global responsive instance - can be used throughout the application
 */
export const codexResponsive = new CodexResponsive();