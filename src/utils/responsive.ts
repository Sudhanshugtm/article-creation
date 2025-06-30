// ABOUTME: Utility functions for responsive calculations
// ABOUTME: Provides methods to scale values based on viewport size

import { codexResponsive } from '../design/CodexResponsive';

export const getResponsiveValue = (baseValue: number, type: 'width' | 'height' = 'width'): number => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    // Use Codex responsive system for better mobile experience
    if (codexResponsive.isMobile()) {
        // Mobile-optimized scaling
        if (type === 'width') {
            return codexResponsive.getSpacing(baseValue);
        } else {
            // Height values need more conservative scaling on mobile
            return Math.max(baseValue * 0.7, codexResponsive.getSpacing(baseValue * 0.8));
        }
    } else if (codexResponsive.matches('tablet')) {
        // Tablet scaling
        return baseValue * 0.9;
    }
    
    // Desktop and larger - use original logic with improvements
    const base = type === 'width' ? vw : vh;
    const scaleFactor = base / 1920; // Base design width
    const minScale = 0.6; // Slightly higher minimum
    return Math.max(baseValue * minScale, Math.min(baseValue * 1.2, baseValue * scaleFactor));
};

export const getViewportScale = (): number => {
    return Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
};

// New utility functions using Codex system
export const getResponsiveFontSize = (baseSize: number): number => {
    return codexResponsive.getFontSize(baseSize);
};

export const getResponsiveSpacing = (baseSpacing: number): number => {
    return codexResponsive.getSpacing(baseSpacing);
};

export const isMobileDevice = (): boolean => {
    return codexResponsive.isMobile();
};

export const getTouchTargetSize = (): number => {
    return codexResponsive.getTouchTargetSize();
};