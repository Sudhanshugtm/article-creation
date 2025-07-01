// ABOUTME: Canvas utility class that applies Wikimedia Codex design system to canvas operations  
// ABOUTME: Provides methods for drawing UI elements with consistent Codex styling, colors, and typography

import { codexTokens, CodexTokenUtils, codexIcons } from './CodexTokens';
import { CodexIconRenderer } from './CodexIconRenderer';

export type CodexButtonVariant = 'primary' | 'progressive' | 'destructive' | 'quiet';
export type CodexButtonSize = 'small' | 'medium' | 'large';
export type CodexTextSize = 'x-small' | 'small' | 'medium' | 'x-large';
export type CodexMessageType = 'notice' | 'warning' | 'error' | 'success';

export interface CodexDrawOptions {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface CodexButtonOptions extends CodexDrawOptions {
  text: string;
  variant?: CodexButtonVariant;
  size?: CodexButtonSize;
  disabled?: boolean;
  icon?: string;
}

export interface CodexTextOptions {
  x: number;
  y: number;
  text: string;
  size?: CodexTextSize;
  color?: string;
  weight?: string;
  maxWidth?: number;
  align?: CanvasTextAlign;
}

export interface CodexCardOptions extends CodexDrawOptions {
  title?: string;
  content?: string;
  elevated?: boolean;
}

export interface CodexIconOptions {
  x: number;
  y: number;
  icon: string;
  size?: 'x-small' | 'small' | 'medium';
  color?: string;
}

export interface CodexMessageOptions extends CodexDrawOptions {
  message: string;
  type?: CodexMessageType;
  inline?: boolean;
}

/**
 * Canvas utility class that applies Codex design system styling
 */
export class CodexCanvas {
  private ctx: CanvasRenderingContext2D;
  private devicePixelRatio: number;
  private iconRenderer: CodexIconRenderer;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.devicePixelRatio = window.devicePixelRatio || 1;
    this.iconRenderer = new CodexIconRenderer(ctx);
  }

  /**
   * Set canvas text properties using Codex typography tokens
   */
  private setTextStyle(size: CodexTextSize = 'medium', weight: string = '400', color: string = codexTokens.colors.base): void {
    let fontSize: string;
    let lineHeight: string;

    switch (size) {
      case 'x-small':
        fontSize = codexTokens.typography.fontSizeXSmall;
        lineHeight = codexTokens.typography.lineHeightSmall;
        break;
      case 'small':
        fontSize = codexTokens.typography.fontSizeSmall;
        lineHeight = codexTokens.typography.lineHeightSmall;
        break;
      case 'x-large':
        fontSize = codexTokens.typography.fontSizeXLarge;
        lineHeight = codexTokens.typography.lineHeightXLarge;
        break;
      default:
        fontSize = codexTokens.typography.fontSizeMedium;
        lineHeight = codexTokens.typography.lineHeightMedium;
    }

    this.ctx.font = CodexTokenUtils.getFontString(fontSize, weight, codexTokens.typography.fontFamily);
    this.ctx.fillStyle = color;
  }

  /**
   * Draw text with Codex typography
   */
  drawText(options: CodexTextOptions): void {
    const { x, y, text, size = 'medium', color = codexTokens.colors.base, weight = '400', maxWidth, align = 'left' } = options;
    
    this.setTextStyle(size, weight, color);
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'top';

    if (maxWidth) {
      this.ctx.fillText(text, x, y, maxWidth);
    } else {
      this.ctx.fillText(text, x, y);
    }
  }

  /**
   * Measure text width using Codex typography
   */
  measureText(text: string, size: CodexTextSize = 'medium', weight: string = '400'): number {
    this.setTextStyle(size, weight);
    return this.ctx.measureText(text).width;
  }

  /**
   * Draw a Codex-styled button
   */
  drawButton(options: CodexButtonOptions): void {
    const { 
      x, y, text, 
      variant = 'quiet', 
      size = 'medium', 
      disabled = false,
      width = this.measureText(text, size as any, '600') + (size === 'large' ? 30 : size === 'small' ? 20 : 24),
      height = size === 'large' ? 40 : size === 'small' ? 24 : 32
    } = options;

    // Determine button colors based on variant and state
    let bgColor: string;
    let textColor: string;
    let borderColor: string;

    if (disabled) {
      bgColor = codexTokens.backgrounds.disabled;
      textColor = codexTokens.colors.disabled;
      borderColor = codexTokens.borders.disabled;
    } else {
      switch (variant) {
        case 'primary':
          bgColor = codexTokens.backgrounds.progressive;
          textColor = codexTokens.colors.inverted;
          borderColor = codexTokens.borders.progressive;
          break;
        case 'progressive':
          bgColor = codexTokens.backgrounds.progressiveSubtle;
          textColor = codexTokens.colors.progressive;
          borderColor = codexTokens.borders.progressive;
          break;
        case 'destructive':
          bgColor = codexTokens.backgrounds.destructiveSubtle;
          textColor = codexTokens.colors.destructive;
          borderColor = codexTokens.borders.destructive;
          break;
        default: // quiet
          bgColor = codexTokens.backgrounds.transparent;
          textColor = codexTokens.colors.base;
          borderColor = codexTokens.borders.transparent;
      }
    }

    // Draw button background
    this.ctx.fillStyle = bgColor;
    this.ctx.fillRect(x, y, width, height);

    // Draw button border
    if (borderColor !== codexTokens.borders.transparent) {
      this.ctx.strokeStyle = borderColor;
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x, y, width, height);
    }

    // Draw button text
    const textSize = size === 'large' ? 'medium' : size === 'small' ? 'small' : 'medium';
    this.drawText({
      x: x + width / 2,
      y: y + (height - parseInt(codexTokens.typography.fontSizeMedium)) / 2,
      text,
      size: textSize,
      color: textColor,
      weight: '600',
      align: 'center'
    });
  }

  /**
   * Draw a Codex-styled card
   */
  drawCard(options: CodexCardOptions): void {
    const { x, y, width = 300, height = 200, title, content, elevated = false } = options;

    // Card background
    this.ctx.fillStyle = codexTokens.backgrounds.base;
    this.ctx.fillRect(x, y, width, height);

    // Card border
    this.ctx.strokeStyle = codexTokens.borders.subtle;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);

    // Elevation shadow (simplified)
    if (elevated) {
      this.ctx.fillStyle = CodexTokenUtils.colorWithOpacity(codexTokens.shadows.alphaBase, 0.1);
      this.ctx.fillRect(x + 2, y + 2, width, height);
    }

    // Card content
    let currentY = y + codexTokens.spacing.px12;

    if (title) {
      this.drawText({
        x: x + codexTokens.spacing.px12,
        y: currentY,
        text: title,
        size: 'medium',
        weight: '600',
        maxWidth: width - (codexTokens.spacing.px12 * 2)
      });
      currentY += parseInt(codexTokens.typography.lineHeightMedium) + codexTokens.spacing.px8;
    }

    if (content) {
      this.drawText({
        x: x + codexTokens.spacing.px12,
        y: currentY,
        text: content,
        size: 'small',
        color: codexTokens.colors.subtle,
        maxWidth: width - (codexTokens.spacing.px12 * 2)
      });
    }
  }

  /**
   * Draw a Codex icon using SVG path
   */
  drawIcon(options: CodexIconOptions): void {
    const { x, y, icon, size = 'medium', color = codexTokens.colors.base } = options;
    
    let iconSize: number;
    switch (size) {
      case 'x-small':
        iconSize = 12;
        break;
      case 'small':
        iconSize = 16;
        break;
      default:
        iconSize = 20;
    }

    this.iconRenderer.renderIcon(icon as keyof typeof codexIcons, {
      x,
      y,
      size: iconSize,
      color
    });
  }

  /**
   * Draw a Codex message/notification
   */
  drawMessage(options: CodexMessageOptions): void {
    const { x, y, width = 400, height = 60, message, type = 'notice', inline = false } = options;

    let bgColor: string;
    let borderColor: string;
    let textColor: string;
    let iconColor: string;

    switch (type) {
      case 'error':
        bgColor = codexTokens.backgrounds.errorSubtle;
        borderColor = codexTokens.borders.error;
        textColor = codexTokens.colors.base;
        iconColor = codexTokens.colors.iconError;
        break;
      case 'warning':
        bgColor = codexTokens.backgrounds.warningSubtle;
        borderColor = codexTokens.borders.warning;
        textColor = codexTokens.colors.base;
        iconColor = codexTokens.colors.iconWarning;
        break;
      case 'success':
        bgColor = codexTokens.backgrounds.successSubtle;
        borderColor = codexTokens.borders.success;
        textColor = codexTokens.colors.base;
        iconColor = codexTokens.colors.iconSuccess;
        break;
      default: // notice
        bgColor = codexTokens.backgrounds.noticeSubtle;
        borderColor = codexTokens.borders.notice;
        textColor = codexTokens.colors.base;
        iconColor = codexTokens.colors.iconNotice;
    }

    // Message background
    this.ctx.fillStyle = bgColor;
    this.ctx.fillRect(x, y, width, height);

    // Message border (left edge)
    this.ctx.fillStyle = borderColor;
    this.ctx.fillRect(x, y, 4, height);

    // Message icon (simplified)
    const iconX = x + codexTokens.spacing.px12;
    const iconY = y + (height - 16) / 2;
    this.drawIcon({
      x: iconX,
      y: iconY,
      icon: type === 'error' ? 'alert' : type === 'success' ? 'success' : 'info',
      size: 'small',
      color: iconColor
    });

    // Message text
    this.drawText({
      x: iconX + 20 + codexTokens.spacing.px8,
      y: y + (height - parseInt(codexTokens.typography.fontSizeSmall)) / 2,
      text: message,
      size: 'small',
      color: textColor,
      maxWidth: width - (iconX + 20 + codexTokens.spacing.px8 + codexTokens.spacing.px12)
    });
  }

  /**
   * Draw a Codex input field
   */
  drawInput(options: CodexDrawOptions & { 
    placeholder?: string; 
    value?: string; 
    focused?: boolean; 
    error?: boolean;
  }): void {
    const { x, y, width = 200, height = 32, placeholder = '', value = '', focused = false, error = false } = options;

    // Input background
    this.ctx.fillStyle = codexTokens.backgrounds.base;
    this.ctx.fillRect(x, y, width, height);

    // Input border
    let borderColor = codexTokens.borders.base;
    if (error) {
      borderColor = codexTokens.borders.error;
    } else if (focused) {
      borderColor = codexTokens.borders.progressiveFocus;
    }

    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = focused ? 2 : 1;
    this.ctx.strokeRect(x, y, width, height);

    // Input text
    const textToShow = value || placeholder;
    const textColor = value ? codexTokens.colors.base : codexTokens.colors.placeholder;
    
    if (textToShow) {
      this.drawText({
        x: x + codexTokens.spacing.px8,
        y: y + (height - parseInt(codexTokens.typography.fontSizeSmall)) / 2,
        text: textToShow,
        size: 'small',
        color: textColor,
        maxWidth: width - (codexTokens.spacing.px8 * 2)
      });
    }
  }

  /**
   * Create a gradient using Codex colors
   */
  createGradient(x1: number, y1: number, x2: number, y2: number, colors: string[]): CanvasGradient {
    const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
    
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });
    
    return gradient;
  }

  /**
   * Apply Codex-compliant drop shadow
   */
  applyShadow(color: string = codexTokens.shadows.alphaBase, blur: number = 4, offsetX: number = 0, offsetY: number = 2): void {
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = blur;
    this.ctx.shadowOffsetX = offsetX;
    this.ctx.shadowOffsetY = offsetY;
  }

  /**
   * Clear shadow
   */
  clearShadow(): void {
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
  }

  /**
   * Get responsive value based on screen size using Codex breakpoints
   */
  getResponsiveValue(baseValue: number): number {
    return CodexTokenUtils.getResponsiveSpacing(baseValue, window.innerWidth);
  }

  /**
   * Draw a divider line using Codex border colors
   */
  drawDivider(x1: number, y1: number, x2: number, y2: number, type: 'subtle' | 'base' | 'muted' = 'subtle'): void {
    this.ctx.strokeStyle = codexTokens.borders[type];
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }
}