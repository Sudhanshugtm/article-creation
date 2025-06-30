// ABOUTME: Heading class that renders the main heading text
// ABOUTME: Manages heading position, style, and responsive sizing

import { getResponsiveValue, getResponsiveSpacing, getResponsiveFontSize } from './utils/responsive';

export class Heading {
    private text: string;
    private baseFontSize: number;
    private fontFamily: string;
    private fontWeight: string;
    private color: string;

    constructor(text: string) {
        this.text = text;
        this.baseFontSize = 32;
        this.fontFamily = 'Arial, sans-serif';
        this.fontWeight = '700';
        this.color = '#333333';
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        
        const fontSize = getResponsiveFontSize(this.baseFontSize);
        const x = getResponsiveSpacing(20);
        const y = getResponsiveValue(100, 'height');
        
        ctx.font = `${this.fontWeight} ${fontSize}px ${this.fontFamily}`;
        ctx.fillStyle = this.color;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(this.text, x, y);
        ctx.restore();
    }

    setText(text: string): void {
        this.text = text;
    }
}