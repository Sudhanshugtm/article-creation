// ABOUTME: Cursor class that creates and manages a blinking cursor
// ABOUTME: Handles cursor position, visibility, and blinking animation

import { getResponsiveValue } from './utils/responsive';

export class Cursor {
    private baseX: number;
    private baseY: number;
    private baseWidth: number;
    private baseHeight: number;
    private visible: boolean;
    private blinkInterval: number;

    constructor(x: number, y: number) {
        this.baseX = x;
        this.baseY = y;
        this.baseWidth = 2; // System default cursor width
        this.baseHeight = 32; // Increased height for better visibility
        this.visible = true;
        this.blinkInterval = 530; // System default blink rate (macOS/Windows standard)
        this.startBlinking();
    }

    private startBlinking(): void {
        setInterval(() => {
            this.visible = !this.visible;
        }, this.blinkInterval);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.visible) {
            // System default cursor appearance
            const width = this.baseWidth; // Use direct width, no responsive scaling for cursor
            const height = getResponsiveValue(this.baseHeight); // Keep height responsive to text size
            
            // System default cursor color - matches text input cursors
            ctx.fillStyle = '#333333'; // Slightly softer than pure black
            ctx.fillRect(this.baseX, this.baseY, width, height);
        }
    }

    setPosition(x: number, y: number): void {
        this.baseX = x;
        this.baseY = y;
    }
}