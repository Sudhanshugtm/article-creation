// ABOUTME: TextRenderer class that renders typed text on the canvas
// ABOUTME: Manages text position, style, and responsive sizing

import { getResponsiveValue, getResponsiveFontSize, getResponsiveSpacing, isMobileDevice } from './utils/responsive';

export class TextRenderer {
    private baseFontSize: number;
    private fontFamily: string;
    private fontWeight: string;
    private color: string;
    private baseX: number;
    private baseY: number;

    constructor() {
        this.baseFontSize = this.getOptimalFontSize();
        this.fontFamily = 'Arial, sans-serif';
        this.fontWeight = '400';
        this.color = '#000000';
        this.baseX = 20;
        this.baseY = 130;
    }

    private getOptimalFontSize(): number {
        // Use Codex-based responsive font sizing
        const isMobile = isMobileDevice();
        return isMobile ? 24 : 28; // Slightly smaller for mobile readability
    }

    draw(ctx: CanvasRenderingContext2D, text: string): number {
        const x = getResponsiveSpacing(this.baseX);
        
        if (!text) return x;

        ctx.save();
        
        // Use responsive font sizing
        const fontSize = getResponsiveFontSize(this.baseFontSize);
        const y = getResponsiveValue(this.baseY, 'height');
        
        ctx.font = `${this.fontWeight} ${fontSize}px ${this.fontFamily}`;
        ctx.fillStyle = this.color;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(text, x, y);
        
        // Draw responsive bottom border as separator below typed text
        const isMobile = isMobileDevice();
        const borderOffset = isMobile ? getResponsiveSpacing(6) : 8;
        const borderY = y + fontSize + borderOffset;
        const borderWidth = isMobile ? Math.min(300, window.innerWidth - (x * 2)) : 400;
        
        ctx.strokeStyle = '#d3d3d3';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, borderY);
        ctx.lineTo(x + borderWidth, borderY);
        ctx.stroke();
        
        const textWidth = ctx.measureText(text).width;
        ctx.restore();
        
        return x + textWidth;
    }

    measureText(ctx: CanvasRenderingContext2D, text: string): number {
        const fontSize = getResponsiveFontSize(this.baseFontSize);
        ctx.font = `${this.fontWeight} ${fontSize}px ${this.fontFamily}`;
        return ctx.measureText(text).width;
    }
}