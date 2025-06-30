// ABOUTME: Design token definitions extracted from Wikimedia Codex design system
// ABOUTME: Provides typed access to colors, typography, spacing, and other design tokens for canvas operations

/**
 * Wikimedia Codex Design Tokens
 * Extracted from @wikimedia/codex package for use in canvas-based UI
 */

export interface CodexColors {
  // Base colors
  base: string;
  subtle: string;
  emphasized: string;
  disabled: string;
  placeholder: string;
  inverted: string;
  
  // Interactive colors
  progressive: string;
  progressiveHover: string;
  progressiveActive: string;
  
  // Status colors
  destructive: string;
  destructiveHover: string;
  destructiveActive: string;
  error: string;
  errorHover: string;
  errorActive: string;
  
  // Icon colors
  iconError: string;
  iconNotice: string;
  iconSuccess: string;
  iconWarning: string;
}

export interface CodexBackgrounds {
  // Base backgrounds
  base: string;
  baseFixed: string;
  transparent: string;
  inverted: string;
  
  // Interactive backgrounds
  interactive: string;
  interactiveSubtle: string;
  interactiveSubtleHover: string;
  interactiveSubtleActive: string;
  
  // Progressive backgrounds
  progressive: string;
  progressiveHover: string;
  progressiveActive: string;
  progressiveSubtle: string;
  progressiveSubtleHover: string;
  progressiveSubtleActive: string;
  
  // Status backgrounds
  destructive: string;
  destructiveHover: string;
  destructiveActive: string;
  destructiveSubtle: string;
  destructiveSubtleHover: string;
  destructiveSubtleActive: string;
  
  errorSubtle: string;
  errorSubtleHover: string;
  errorSubtleActive: string;
  warningSubtle: string;
  noticeSubtle: string;
  successSubtle: string;
  
  // Other
  disabled: string;
  disabledSubtle: string;
  neutralSubtle: string;
  backdropLight: string;
}

export interface CodexBorders {
  // Base borders
  base: string;
  subtle: string;
  muted: string;
  transparent: string;
  disabled: string;
  
  // Interactive borders
  interactive: string;
  interactiveHover: string;
  interactiveActive: string;
  
  // Progressive borders
  progressive: string;
  progressiveHover: string;
  progressiveActive: string;
  progressiveFocus: string;
  
  // Status borders
  destructive: string;
  destructiveHover: string;
  destructiveActive: string;
  destructiveFocus: string;
  error: string;
  errorHover: string;
  errorActive: string;
  notice: string;
  success: string;
  warning: string;
  
  // Inverted borders
  inverted: string;
  invertedFixed: string;
}

export interface CodexTypography {
  // Font sizes
  fontSizeXSmall: string;
  fontSizeSmall: string;
  fontSizeMedium: string;
  fontSizeXLarge: string;
  
  // Line heights
  lineHeightSmall: string;
  lineHeightMedium: string;
  lineHeightXLarge: string;
  
  // Font family
  fontFamily: string;
}

export interface CodexSpacing {
  // Common spacing values
  px1: number;
  px4: number;
  px6: number;
  px8: number;
  px11: number;
  px12: number;
  px15: number;
  px16: number;
  px20: number;
  px24: number;
}

export interface CodexShadows {
  // Shadow colors
  base: string;
  progressiveFocus: string;
  progressiveActive: string;
  progressiveSelected: string;
  progressiveSelectedHover: string;
  progressiveSelectedActive: string;
  destructiveFocus: string;
  inverted: string;
  transparent: string;
  alphaBase: string;
}

export interface CodexSizes {
  // Icon sizes
  iconXSmall: string;
  iconSmall: string;
  iconMedium: string;
  
  // Button sizes
  buttonSmall: string;
  buttonMedium: string;
  buttonLarge: string;
}

export interface CodexEffects {
  // Opacity
  iconBase: number;
  iconDisabled: number;
  iconPlaceholder: number;
  
  // Transitions
  debounceInterval: number;
  pendingDelay: number;
}

/**
 * Complete Codex Design Token collection
 */
export interface CodexDesignTokens {
  colors: CodexColors;
  backgrounds: CodexBackgrounds;
  borders: CodexBorders;
  typography: CodexTypography;
  spacing: CodexSpacing;
  shadows: CodexShadows;
  sizes: CodexSizes;
  effects: CodexEffects;
}

/**
 * Codex Design Tokens - Default values extracted from @wikimedia/codex
 */
export const codexTokens: CodexDesignTokens = {
  colors: {
    // Base colors
    base: '#202122',
    subtle: '#54595d',
    emphasized: '#101418',
    disabled: '#a2a9b1',
    placeholder: '#72777d',
    inverted: '#fff',
    
    // Interactive colors
    progressive: '#36c',
    progressiveHover: '#3056a9',
    progressiveActive: '#233566',
    
    // Status colors
    destructive: '#bf3c2c',
    destructiveHover: '#9f3526',
    destructiveActive: '#612419',
    error: '#bf3c2c',
    errorHover: '#9f3526',
    errorActive: '#612419',
    
    // Icon colors
    iconError: '#f54739',
    iconNotice: '#72777d',
    iconSuccess: '#099979',
    iconWarning: '#ab7f2a',
  },
  
  backgrounds: {
    // Base backgrounds
    base: '#fff',
    baseFixed: '#fff',
    transparent: 'transparent',
    inverted: '#101418',
    
    // Interactive backgrounds
    interactive: '#eaecf0',
    interactiveSubtle: '#f8f9fa',
    interactiveSubtleHover: '#eaecf0',
    interactiveSubtleActive: '#dadde3',
    
    // Progressive backgrounds
    progressive: '#36c',
    progressiveHover: '#3056a9',
    progressiveActive: '#233566',
    progressiveSubtle: '#f1f4fd',
    progressiveSubtleHover: '#dce3f9',
    progressiveSubtleActive: '#cbd6f6',
    
    // Status backgrounds
    destructive: '#bf3c2c',
    destructiveHover: '#9f3526',
    destructiveActive: '#612419',
    destructiveSubtle: '#ffe9e5',
    destructiveSubtleHover: '#ffdad3',
    destructiveSubtleActive: '#ffc8bd',
    
    errorSubtle: '#ffe9e5',
    errorSubtleHover: '#ffdad3',
    errorSubtleActive: '#ffc8bd',
    warningSubtle: '#fdf2d5',
    noticeSubtle: '#eaecf0',
    successSubtle: '#dff2eb',
    
    // Other
    disabled: '#dadde3',
    disabledSubtle: '#eaecf0',
    neutralSubtle: '#f8f9fa',
    backdropLight: 'rgba(255, 255, 255, .65)',
  },
  
  borders: {
    // Base borders
    base: '#a2a9b1',
    subtle: '#c8ccd1',
    muted: '#dadde3',
    transparent: 'transparent',
    disabled: '#c8ccd1',
    
    // Interactive borders
    interactive: '#72777d',
    interactiveHover: '#27292d',
    interactiveActive: '#202122',
    
    // Progressive borders
    progressive: '#6485d1',
    progressiveHover: '#3056a9',
    progressiveActive: '#233566',
    progressiveFocus: '#36c',
    
    // Status borders
    destructive: '#f54739',
    destructiveHover: '#9f3526',
    destructiveActive: '#612419',
    destructiveFocus: '#36c',
    error: '#f54739',
    errorHover: '#9f3526',
    errorActive: '#612419',
    notice: '#72777d',
    success: '#099979',
    warning: '#ab7f2a',
    
    // Inverted borders
    inverted: '#fff',
    invertedFixed: '#fff',
  },
  
  typography: {
    // Font sizes (converted from rem to px assuming 16px base)
    fontSizeXSmall: '12px',
    fontSizeSmall: '14px',
    fontSizeMedium: '16px',
    fontSizeXLarge: '20px',
    
    // Line heights (converted from rem to px)
    lineHeightSmall: '22px',
    lineHeightMedium: '26px',
    lineHeightXLarge: '30px',
    
    // Font family
    fontFamily: 'Arial, sans-serif',
  },
  
  spacing: {
    // Common spacing values in pixels
    px1: 1,
    px4: 4,
    px6: 6,
    px8: 8,
    px11: 11,
    px12: 12,
    px15: 15,
    px16: 16,
    px20: 20,
    px24: 24,
  },
  
  shadows: {
    // Shadow colors
    base: '#a2a9b1',
    progressiveFocus: '#36c',
    progressiveActive: '#233566',
    progressiveSelected: '#36c',
    progressiveSelectedHover: '#3056a9',
    progressiveSelectedActive: '#233566',
    destructiveFocus: '#36c',
    inverted: '#fff',
    transparent: 'transparent',
    alphaBase: 'rgba(0, 0, 0, .06)',
  },
  
  sizes: {
    // Icon sizes
    iconXSmall: '12px',
    iconSmall: '16px',
    iconMedium: '20px',
    
    // Button sizes
    buttonSmall: '24px',
    buttonMedium: '32px',
    buttonLarge: '40px',
  },
  
  effects: {
    // Opacity
    iconBase: 0.87,
    iconDisabled: 0.51,
    iconPlaceholder: 0.51,
    
    // Transitions and timing
    debounceInterval: 120,
    pendingDelay: 500,
  },
};

/**
 * Utility functions for working with Codex tokens
 */
export class CodexTokenUtils {
  /**
   * Convert rem values to pixels (assuming 16px base font size)
   */
  static remToPx(remValue: string): number {
    const numValue = parseFloat(remValue.replace('rem', ''));
    return numValue * 16;
  }
  
  /**
   * Get a color with applied opacity
   */
  static colorWithOpacity(color: string, opacity: number): string {
    if (color.startsWith('#')) {
      // Convert hex to rgba
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color; // Return as-is if not hex
  }
  
  /**
   * Get font string for canvas context
   */
  static getFontString(size: string, weight: string = '400', family: string = codexTokens.typography.fontFamily): string {
    return `${weight} ${size} ${family}`;
  }
  
  /**
   * Get responsive spacing value based on screen size
   */
  static getResponsiveSpacing(baseValue: number, screenWidth: number): number {
    if (screenWidth < 768) {
      return Math.max(baseValue * 0.75, 4); // Minimum 4px on mobile
    }
    return baseValue;
  }
}

/**
 * Icon paths from Codex - common icons used in the design system
 */
export const codexIcons = {
  alert: 'M11.53 2.3A1.85 1.85 0 0010 1.21 1.85 1.85 0 008.48 2.3L.36 16.36C-.48 17.81.21 19 1.88 19h16.24c1.67 0 2.36-1.19 1.52-2.64zM11 16H9v-2h2zm0-4H9V6h2z',
  search: 'M12.2 13.6a7 7 0 111.4-1.4l5.4 5.4-1.4 1.4zM3 8a5 5 0 1010 0A5 5 0 003 8',
  check: 'M7 14.17 2.83 10l-1.41 1.41L7 17 19 5l-1.41-1.42z',
  close: 'M10 0a10 10 0 1010 10A10 10 0 0010 0m5.66 14.24-1.41 1.41L10 11.41l-4.24 4.25-1.42-1.42L8.59 10 4.34 5.76l1.42-1.42L10 8.59l4.24-4.24 1.41 1.41L11.41 10z',
  info: 'M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0M9 5h2v2H9zm0 4h2v6H9z',
  success: 'M10 20a10 10 0 010-20 10 10 0 110 20m-2-5 9-8.5L15.5 5 8 12 4.5 8.5 3 10z',
  chevronDown: 'm17.5 4.75-7.5 7.5-7.5-7.5L1 6.25l9 9 9-9z',
  chevronUp: 'm10 5 8 10H2z',
  arrowNext: 'M7 1 5.6 2.5 13 10l-7.4 7.5L7 19l9-9z',
  arrowPrevious: 'm4 10 9 9 1.4-1.5L7 10l7.4-7.5L13 1z'
};