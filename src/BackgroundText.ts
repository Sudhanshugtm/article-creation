// ABOUTME: BackgroundText class that renders placeholder text in the background
// ABOUTME: Manages text opacity, position, and rendering

import { getResponsiveValue, getResponsiveSpacing, getResponsiveFontSize } from './utils/responsive';

export class BackgroundText {
    private text: string;
    private opacity: number;
    private baseFontSize: number;
    private fontFamily: string;
    private fontWeight: string;
    private color: string;

    constructor(text: string) {
        this.text = text;
        this.opacity = 0.35;
        this.baseFontSize = 28;
        this.fontFamily = 'Arial, sans-serif';
        this.fontWeight = '700';
        this.color = '#999999';
    }

    draw(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        const fontSize = getResponsiveFontSize(this.baseFontSize);
        const x = getResponsiveSpacing(25);
        const y = getResponsiveValue(130, 'height');
        
        ctx.font = `${this.fontWeight} ${fontSize}px ${this.fontFamily}`;
        ctx.fillStyle = this.color;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(this.text, x, y);
        ctx.restore();
    }

    setText(text: string): void {
        this.text = text;
    }

    setOpacity(opacity: number): void {
        this.opacity = opacity;
    }
}