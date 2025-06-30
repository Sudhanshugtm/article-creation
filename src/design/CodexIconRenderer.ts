// ABOUTME: SVG path renderer for Codex icons on HTML5 Canvas
// ABOUTME: Converts SVG path data from Codex design system into canvas drawing operations

import { codexIcons } from './CodexTokens';

export interface IconRenderOptions {
  x: number;
  y: number;
  size?: number;
  color?: string;
  scale?: number;
}

/**
 * Simple SVG path renderer for canvas
 * Handles basic SVG path commands used in Codex icons
 */
export class CodexIconRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Render a Codex icon by name
   */
  renderIcon(iconName: keyof typeof codexIcons, options: IconRenderOptions): void {
    const pathData = codexIcons[iconName];
    if (!pathData) {
      console.warn(`Icon "${iconName}" not found in Codex icons`);
      return;
    }

    this.renderPath(pathData, options);
  }

  /**
   * Render an SVG path on canvas
   */
  renderPath(pathData: string, options: IconRenderOptions): void {
    const { x, y, size = 20, color = '#000000', scale = 1 } = options;

    this.ctx.save();
    
    // Set up transformation
    this.ctx.translate(x, y);
    
    // Scale the icon - Codex icons are designed for 20x20 viewBox
    const finalScale = (size / 20) * scale;
    this.ctx.scale(finalScale, finalScale);
    
    // Set fill color
    this.ctx.fillStyle = color;
    
    // Create and fill the path
    const path = new Path2D(pathData);
    this.ctx.fill(path);
    
    this.ctx.restore();
  }

  /**
   * Get all available icon names
   */
  static getAvailableIcons(): string[] {
    return Object.keys(codexIcons);
  }

  /**
   * Check if an icon exists
   */
  static hasIcon(iconName: string): boolean {
    return iconName in codexIcons;
  }

  /**
   * Render an icon with a background circle (useful for status icons)
   */
  renderIconWithBackground(
    iconName: keyof typeof codexIcons, 
    options: IconRenderOptions & { 
      backgroundColor?: string; 
      backgroundRadius?: number;
      padding?: number;
    }
  ): void {
    const { 
      backgroundColor = 'rgba(255, 255, 255, 0.9)', 
      backgroundRadius, 
      padding = 2,
      size = 20
    } = options;

    const radius = backgroundRadius || (size + padding * 2) / 2;

    this.ctx.save();
    
    // Draw background circle
    this.ctx.fillStyle = backgroundColor;
    this.ctx.beginPath();
    this.ctx.arc(options.x + size / 2, options.y + size / 2, radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw icon
    this.renderIcon(iconName, {
      ...options,
      x: options.x + padding,
      y: options.y + padding,
      size: size - padding * 2
    });
    
    this.ctx.restore();
  }

  /**
   * Render multiple icons in a row
   */
  renderIconRow(
    icons: Array<{ name: keyof typeof codexIcons; color?: string }>,
    options: IconRenderOptions & { spacing?: number }
  ): void {
    const { spacing = 24, size = 20 } = options;
    let currentX = options.x;

    icons.forEach((icon) => {
      this.renderIcon(icon.name, {
        ...options,
        x: currentX,
        color: icon.color || options.color
      });
      currentX += size + spacing;
    });
  }

  /**
   * Create a composite icon (icon with badge)
   */
  renderIconWithBadge(
    iconName: keyof typeof codexIcons,
    badgeIconName: keyof typeof codexIcons,
    options: IconRenderOptions & {
      badgeColor?: string;
      badgeSize?: number;
      badgePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    }
  ): void {
    const {
      badgeColor = '#f54739',
      badgeSize = 8,
      badgePosition = 'top-right',
      size = 20
    } = options;

    // Draw main icon
    this.renderIcon(iconName, options);

    // Calculate badge position
    let badgeX = options.x;
    let badgeY = options.y;

    switch (badgePosition) {
      case 'top-right':
        badgeX += size - badgeSize;
        break;
      case 'top-left':
        break;
      case 'bottom-right':
        badgeX += size - badgeSize;
        badgeY += size - badgeSize;
        break;
      case 'bottom-left':
        badgeY += size - badgeSize;
        break;
    }

    // Draw badge icon
    this.renderIcon(badgeIconName, {
      x: badgeX,
      y: badgeY,
      size: badgeSize,
      color: badgeColor
    });
  }

  /**
   * Render an animated icon (for loading states)
   */
  renderSpinningIcon(iconName: keyof typeof codexIcons, options: IconRenderOptions & { rotation?: number }): void {
    const { rotation = 0 } = options;

    this.ctx.save();
    
    // Move to center point
    const centerX = options.x + (options.size || 20) / 2;
    const centerY = options.y + (options.size || 20) / 2;
    
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(rotation);
    this.ctx.translate(-centerX, -centerY);
    
    this.renderIcon(iconName, options);
    
    this.ctx.restore();
  }

  /**
   * Measure icon bounds (useful for layout calculations)
   */
  measureIcon(iconName: keyof typeof codexIcons, size: number = 20): { width: number; height: number } {
    // Codex icons are designed for 20x20 viewBox, so we can calculate proportionally
    const scale = size / 20;
    return {
      width: 20 * scale,
      height: 20 * scale
    };
  }

  /**
   * Create an icon button visual
   */
  renderIconButton(
    iconName: keyof typeof codexIcons,
    options: IconRenderOptions & {
      buttonSize?: number;
      buttonColor?: string;
      borderColor?: string;
      pressed?: boolean;
      hover?: boolean;
    }
  ): void {
    const {
      buttonSize = 32,
      buttonColor = 'transparent',
      borderColor = '#a2a9b1',
      pressed = false,
      hover = false,
      size = 16
    } = options;

    this.ctx.save();

    // Draw button background
    if (buttonColor !== 'transparent') {
      this.ctx.fillStyle = buttonColor;
      this.ctx.fillRect(options.x, options.y, buttonSize, buttonSize);
    }

    // Draw button border
    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(options.x, options.y, buttonSize, buttonSize);

    // Apply pressed or hover state
    if (pressed) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      this.ctx.fillRect(options.x, options.y, buttonSize, buttonSize);
    } else if (hover) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      this.ctx.fillRect(options.x, options.y, buttonSize, buttonSize);
    }

    // Center the icon in the button
    const iconX = options.x + (buttonSize - size) / 2;
    const iconY = options.y + (buttonSize - size) / 2;

    this.renderIcon(iconName, {
      ...options,
      x: iconX,
      y: iconY,
      size
    });

    this.ctx.restore();
  }
}