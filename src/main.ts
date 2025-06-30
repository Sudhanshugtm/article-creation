// ABOUTME: Main application entry point that coordinates all components
// ABOUTME: Initializes canvas, cursor, background text, manages rendering loop and workflow state

import { Canvas } from './Canvas';
import { Cursor } from './Cursor';
import { BackgroundText } from './BackgroundText';
import { Heading } from './Heading';
import { InputHandler } from './InputHandler';
import { TextRenderer } from './TextRenderer';
import { TopicList } from './TopicList';
import { CategorySelector } from './CategorySelector';
import { WikidataService } from './WikidataService';
import { getResponsiveValue, getResponsiveFontSize, getResponsiveSpacing, isMobileDevice } from './utils/responsive';
import { WorkflowState, ClickableArea, TopicSelection } from './types/workflow';
import { ArticleCategory } from './CategoryMapper';

class App {
    private canvas: Canvas;
    private cursor: Cursor;
    private backgroundText: BackgroundText;
    private heading: Heading;
    private inputHandler: InputHandler;
    private textRenderer: TextRenderer;
    private topicList: TopicList;
    private categorySelector: CategorySelector;
    private currentText: string = '';
    private workflowState: WorkflowState = WorkflowState.TOPIC_SELECTION;
    private selectedTopic: TopicSelection | null = null;

    constructor() {
        this.canvas = new Canvas('articleCanvas');
        this.cursor = new Cursor(20, 130);
        this.backgroundText = new BackgroundText('Type article title');
        this.heading = new Heading('New article');
        this.textRenderer = new TextRenderer();
        this.topicList = new TopicList();
        this.categorySelector = new CategorySelector();
        
        this.inputHandler = new InputHandler(
            (text) => this.handleTextChange(text),
            (key) => this.handleSpecialKey(key),
            (text) => this.handleSearchTrigger(text)
        );
        
        this.init();
    }

    private init(): void {
        this.restoreState();
        this.startRenderLoop();
        this.setupClickHandling();
        this.setupScrollHandling();
        this.setupViewportChangeHandling();
        // Auto-focus for better UX
        setTimeout(() => {
            this.inputHandler.focus();
        }, 100);
    }

    private handleTextChange(text: string): void {
        this.currentText = text;
        // Save to localStorage
        localStorage.setItem('articleCreator_currentText', text);
        // Reset workflow state when user types
        this.workflowState = WorkflowState.TOPIC_SELECTION;
        this.selectedTopic = null;
        this.topicList.hide();
        this.categorySelector.hide();
        // Save workflow state
        this.saveState();
    }

    private handleSpecialKey(key: string): void {
        // Handle special keys like Enter, Tab, etc.
        console.log('Special key:', key);
    }

    private async handleSearchTrigger(text: string): Promise<void> {
        if (!text || text.length < 3) {
            this.topicList.hide();
            return;
        }

        try {
            const topics = await WikidataService.searchTopics(text);
            this.workflowState = WorkflowState.TOPIC_SELECTION;
            this.topicList.setTopics(topics);
            this.categorySelector.hide();
        } catch (error) {
            console.error('Search error:', error);
            this.topicList.hide();
        }
    }

    private render(): void {
        this.canvas.clear();
        const ctx = this.canvas.getContext();
        
        this.heading.draw(ctx);
        
        // Only show background text if no text has been typed
        if (!this.currentText) {
            this.backgroundText.draw(ctx, this.canvas.getWidth(), this.canvas.getHeight());
        }
        
        // Render typed text and get cursor position
        const cursorX = this.textRenderer.draw(ctx, this.currentText);
        
        // Update cursor position - align Y with text top
        const textY = getResponsiveValue(130, 'height');
        this.cursor.setPosition(cursorX + 2, textY);
        this.cursor.draw(ctx);
        
        
        // Render based on workflow state
        if (this.workflowState === WorkflowState.TOPIC_SELECTION) {
            this.topicList.draw(ctx);
            this.canvas.setClickableAreas(this.topicList.getClickableAreas());
        } else if (this.workflowState === WorkflowState.MANUAL_CATEGORY_SELECTION) {
            this.categorySelector.draw(ctx);
            this.canvas.setClickableAreas(this.categorySelector.getClickableAreas());
        } else if (this.workflowState === WorkflowState.ARTICLE_CREATION) {
            // TODO: Render article creation interface
            this.renderArticleCreation(ctx);
        }
    }

    private setupClickHandling(): void {
        this.canvas.setClickHandler((area: ClickableArea) => {
            this.handleCanvasClick(area);
        });
    }

    private setupScrollHandling(): void {
        this.canvas.setScrollHandler((deltaY: number) => {
            this.handleCanvasScroll(deltaY);
        });
    }

    private setupViewportChangeHandling(): void {
        this.canvas.setViewportChangeHandler(() => {
            this.handleViewportChange();
        });
    }

    private handleCanvasScroll(deltaY: number): void {
        // Only handle scrolling when CategorySelector is visible
        if (this.categorySelector.isVisible()) {
            this.categorySelector.handleScroll(deltaY);
            // The redraw will happen automatically through the existing render loop
        }
    }

    private handleViewportChange(): void {
        // Notify CategorySelector when viewport changes occur
        this.categorySelector.updateViewportHeight();
    }

    private handleCanvasClick(area: ClickableArea): void {
        if (area.action === 'select-category' && area.data) {
            // User clicked on a Wikidata category
            this.selectedTopic = {
                topic: this.currentText,
                category: area.data.category as ArticleCategory,
                source: 'wikidata'
            };
            this.workflowState = WorkflowState.ARTICLE_CREATION;
            this.saveState();
            console.log('Selected Wikidata topic:', this.selectedTopic);
        } else if (area.action === 'new-topic') {
            // User clicked "+ New topic", show manual category selection
            this.workflowState = WorkflowState.MANUAL_CATEGORY_SELECTION;
            this.categorySelector.show(this.currentText, this.selectedTopic);
            this.topicList.hide();
            this.saveState();
        } else if (area.action === 'select-category' && area.data && (area.data as any).category) {
            // User selected a manual category
            this.selectedTopic = {
                topic: this.currentText,
                category: (area.data as any).category as ArticleCategory,
                source: 'manual'
            };
            this.workflowState = WorkflowState.ARTICLE_CREATION;
            this.saveState();
            console.log('Selected manual topic:', this.selectedTopic);
        }
    }

    private renderArticleCreation(ctx: CanvasRenderingContext2D): void {
        if (!this.selectedTopic) return;

        const isMobile = isMobileDevice();
        const x = getResponsiveSpacing(20);
        
        // Better spacing for mobile
        const chipY = isMobile ? getResponsiveValue(200, 'height') : getResponsiveValue(220, 'height');
        
        this.categorySelector.drawChips(ctx, x, chipY, this.selectedTopic);
        
        // Mobile-optimized spacing
        let currentY = isMobile ? getResponsiveValue(300, 'height') : getResponsiveValue(350, 'height');
        
        // Show confirmation message with responsive typography
        ctx.fillStyle = '#000000';
        const titleFontSize = getResponsiveFontSize(22);
        ctx.font = `600 ${titleFontSize}px Arial, sans-serif`;
        ctx.fillText('Article Creation', x, currentY);
        currentY += isMobile ? getResponsiveSpacing(40) : getResponsiveValue(70, 'height');

        ctx.fillStyle = '#666666';
        const bodyFontSize = getResponsiveFontSize(16);
        ctx.font = `400 ${bodyFontSize}px Arial, sans-serif`;
        
        // Better text wrapping for mobile
        const maxWidth = isMobile ? this.canvas.getWidth() - (x * 2) : 600;
        const text = `Creating ${this.selectedTopic.category} article about "${this.selectedTopic.topic}"`;
        this.drawWrappedText(ctx, text, x, currentY, maxWidth, bodyFontSize * 1.4);
        currentY += 40; // Reduced spacing

        // Draw primary button for article creation
        this.drawPrimaryButton(ctx, x, currentY, 'Start creating article');
    }

    private drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
        const words = text.split(' ');
        let line = '';
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && i > 0) {
                ctx.fillText(line, x, y);
                line = words[i] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y);
    }


    private drawPrimaryButton(ctx: CanvasRenderingContext2D, x: number, y: number, text: string): void {
        ctx.save();
        
        // Codex button specifications (cdx-button--action-progressive cdx-button--weight-primary)
        const buttonHeight = 32; // Codex standard button height
        const horizontalPadding = 12; // Codex horizontal padding
        const minWidth = 32; // Codex minimum width
        const borderRadius = 2; // Codex border radius
        
        // Measure text to calculate button width
        ctx.font = `700 14px Arial, sans-serif`; // Codex uses bold text for primary
        const textWidth = ctx.measureText(text).width;
        const buttonWidth = Math.max(minWidth, horizontalPadding + textWidth + horizontalPadding);
        
        // Draw Codex progressive primary button background
        ctx.fillStyle = '#36c'; // Codex progressive primary background
        this.drawRoundedRect(ctx, x, y, buttonWidth, buttonHeight, borderRadius);
        ctx.fill();
        
        // Draw Codex button border
        ctx.strokeStyle = '#447ff5'; // Slightly lighter border
        ctx.lineWidth = 1;
        this.drawRoundedRect(ctx, x, y, buttonWidth, buttonHeight, borderRadius);
        ctx.stroke();
        
        // Draw button text (Codex primary button has white text)
        ctx.fillStyle = '#fff'; // White text for primary button
        ctx.font = `700 14px Arial, sans-serif`; // Bold text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const textX = x + buttonWidth / 2;
        const textY = y + buttonHeight / 2;
        ctx.fillText(text, textX, textY);
        
        ctx.restore();
    }
    
    private drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    private startRenderLoop(): void {
        const loop = () => {
            this.render();
            requestAnimationFrame(loop);
        };
        loop();
    }

    private saveState(): void {
        const state = {
            currentText: this.currentText,
            workflowState: this.workflowState,
            selectedTopic: this.selectedTopic
        };
        localStorage.setItem('articleCreator_state', JSON.stringify(state));
    }

    private restoreState(): void {
        try {
            const savedText = localStorage.getItem('articleCreator_currentText');
            const savedState = localStorage.getItem('articleCreator_state');
            
            if (savedText) {
                this.currentText = savedText;
                this.inputHandler.setText(savedText);
            }
            
            if (savedState) {
                const state = JSON.parse(savedState);
                this.workflowState = state.workflowState || WorkflowState.TOPIC_SELECTION;
                this.selectedTopic = state.selectedTopic || null;
                
                // Restore UI state based on workflow state
                if (this.workflowState === WorkflowState.MANUAL_CATEGORY_SELECTION) {
                    this.categorySelector.show(this.currentText, this.selectedTopic);
                } else if (this.workflowState === WorkflowState.TOPIC_SELECTION && this.currentText.length >= 3) {
                    // Re-trigger search to restore topic list
                    this.handleSearchTrigger(this.currentText);
                }
            }
        } catch (error) {
            console.log('Could not restore state:', error);
            // Continue with fresh state if restoration fails
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});