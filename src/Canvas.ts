// ABOUTME: Canvas class that manages canvas element and drawing context
// ABOUTME: Provides methods for clearing, setup, and click detection on canvas

import { ClickableArea } from './types/workflow';
import { getTouchTargetSize } from './utils/responsive';

export class Canvas {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private clickableAreas: ClickableArea[] = [];
    private onCanvasClick?: (area: ClickableArea) => void;
    private onCanvasScroll?: (deltaY: number) => void;
    private onViewportChange?: () => void;

    constructor(canvasId: string) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) {
            throw new Error(`Canvas element with id "${canvasId}" not found`);
        }
        this.canvas = canvas;
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get 2D context');
        }
        this.ctx = ctx;
        this.setupCanvas();
        this.setupResizeHandler();
        this.setupClickHandling();
        this.setupScrollHandling();
    }

    private setupCanvas(): void {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.ctx.scale(dpr, dpr);
    }

    private setupResizeHandler(): void {
        window.addEventListener('resize', () => {
            this.setupCanvas();
            if (this.onViewportChange) {
                this.onViewportChange();
            }
        });
    }

    clear(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    getContext(): CanvasRenderingContext2D {
        return this.ctx;
    }

    getWidth(): number {
        return this.canvas.width;
    }

    getHeight(): number {
        return this.canvas.height;
    }

    private setupClickHandling(): void {
        // Enhanced event handling for both mouse and touch
        this.canvas.addEventListener('click', (event) => {
            this.handleInteraction(event.clientX, event.clientY);
        });
        
        // Add touch support for mobile devices
        this.canvas.addEventListener('touchend', (event) => {
            if (event.changedTouches.length > 0) {
                const touch = event.changedTouches[0];
                
                // Focus hidden input first for mobile keyboard activation
                const hiddenInput = document.getElementById('hiddenInput') as HTMLInputElement;
                if (hiddenInput) {
                    // iOS Safari hack: temporarily make input visible at touch point
                    const rect = this.canvas.getBoundingClientRect();
                    const touchX = touch.clientX - rect.left;
                    const touchY = touch.clientY - rect.top;
                    
                    hiddenInput.style.left = touchX + 'px';
                    hiddenInput.style.top = touchY + 'px';
                    hiddenInput.style.opacity = '0.01'; // Barely visible but still there
                    
                    hiddenInput.focus();
                    
                    // Hide it again after focus
                    setTimeout(() => {
                        hiddenInput.style.left = '-9999px';
                        hiddenInput.style.top = '50%';
                        hiddenInput.style.opacity = '0';
                    }, 100);
                }
                
                // Small delay to ensure focus happens, then handle interaction
                setTimeout(() => {
                    this.handleInteraction(touch.clientX, touch.clientY);
                }, 10);
                
                // Prevent default only after handling focus
                event.preventDefault();
            }
        });
        
        // Prevent context menu on long press (mobile)
        this.canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }
    
    private handleInteraction(clientX: number, clientY: number): void {
        const rect = this.canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        console.log('Canvas interaction at:', x, y);
        console.log('Available clickable areas:', this.clickableAreas);
        
        // Find clicked area with enhanced touch target detection
        const clickedArea = this.findClickedArea(x, y);
        console.log('Found clicked area:', clickedArea);
        
        if (clickedArea && this.onCanvasClick) {
            this.onCanvasClick(clickedArea);
        }
    }

    private findClickedArea(x: number, y: number): ClickableArea | null {
        const touchTargetSize = getTouchTargetSize();
        const expandedHitArea = 8; // Additional pixels for easier touch targeting
        
        for (const area of this.clickableAreas) {
            // Expand hit area for better mobile interaction
            const expandedX = area.x - expandedHitArea;
            const expandedY = area.y - expandedHitArea;
            const expandedWidth = area.width + (expandedHitArea * 2);
            const expandedHeight = Math.max(area.height + (expandedHitArea * 2), touchTargetSize);
            
            if (x >= expandedX && x <= expandedX + expandedWidth &&
                y >= expandedY && y <= expandedY + expandedHeight) {
                return area;
            }
        }
        return null;
    }

    setClickableAreas(areas: ClickableArea[]): void {
        this.clickableAreas = areas;
    }

    setClickHandler(handler: (area: ClickableArea) => void): void {
        this.onCanvasClick = handler;
    }

    setScrollHandler(handler: (deltaY: number) => void): void {
        this.onCanvasScroll = handler;
    }

    setViewportChangeHandler(handler: () => void): void {
        this.onViewportChange = handler;
    }

    private setupScrollHandling(): void {
        this.canvas.addEventListener('wheel', (event) => {
            event.preventDefault();
            if (this.onCanvasScroll) {
                // Normalize deltaY across different browsers/devices
                const deltaY = event.deltaY > 0 ? 1 : -1;
                this.onCanvasScroll(deltaY);
            }
        });
    }
}