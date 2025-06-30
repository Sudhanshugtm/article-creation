// ABOUTME: CategorySelector component for manual category selection
// ABOUTME: Shows all available categories when user clicks "+ New topic"

import { ArticleCategory, CategoryMapper } from './CategoryMapper';
import { getResponsiveValue } from './utils/responsive';
import { ClickableArea, TopicSelection } from './types/workflow';

export class CategorySelector {
    private baseX: number = 20;
    private baseY: number = 240;
    private visible: boolean = false;
    private searchTerm: string = '';
    private selectedTopic: TopicSelection | null = null;
    private clickableAreas: ClickableArea[] = [];
    private scrollOffset: number = 0;
    private maxScrollOffset: number = 0;
    private originalViewportHeight: number = window.innerHeight;
    private categories: ArticleCategory[] = [
        ArticleCategory.PERSON,
        ArticleCategory.LOCATION,
        ArticleCategory.SPECIES,
        ArticleCategory.ORGANIZATION,
        ArticleCategory.CONCEPT,
        ArticleCategory.CREATIVE_WORK,
        ArticleCategory.EVENT
    ];

    constructor() {}

    show(searchTerm: string, selectedTopic: TopicSelection | null = null): void {
        this.searchTerm = searchTerm;
        this.selectedTopic = selectedTopic;
        this.visible = true;
    }

    hide(): void {
        this.visible = false;
        this.searchTerm = '';
    }

    isVisible(): boolean {
        return this.visible;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (!this.visible) {
            return;
        }

        ctx.save();
        this.clickableAreas = []; // Reset clickable areas

        const x = getResponsiveValue(this.baseX);
        let currentY = getResponsiveValue(this.baseY, 'height') - this.scrollOffset;

        // Draw chips - position them side by side
        let chipX = x;
        
        // Draw selected category chip first (if exists)
        if (this.selectedTopic) {
            this.drawSelectedCategoryChip(ctx, chipX, currentY - getResponsiveValue(40, 'height'));
            chipX += getResponsiveValue(220); // More space between chips
        }
        
        // Draw "New Topic" chip
        this.drawNewTopicChip(ctx, chipX, currentY - getResponsiveValue(40, 'height'));

        // Draw section header
        ctx.fillStyle = '#000000';
        ctx.font = `600 ${getResponsiveValue(22)}px Arial, sans-serif`;
        ctx.fillText(`Help us categorize "${this.searchTerm}"`, x, currentY + getResponsiveValue(40, 'height'));
        currentY += getResponsiveValue(80, 'height');

        // Draw description
        ctx.fillStyle = '#666666';
        ctx.font = `400 ${getResponsiveValue(16)}px Arial, sans-serif`;
        ctx.fillText('Select the category that best fits your new article:', x, currentY);
        currentY += getResponsiveValue(80, 'height');

        // Draw category options
        this.categories.forEach((category) => {
            // Use original viewport height for stable rendering, not current innerHeight
            if (currentY > -100 && currentY < this.originalViewportHeight + 100) {
                this.drawCategoryOption(ctx, category, x, currentY);
                
                // Add clickable area for this category (adjust for scroll)
                this.clickableAreas.push({
                    x: x,
                    y: currentY - getResponsiveValue(15),
                    width: getResponsiveValue(400),
                    height: getResponsiveValue(40),
                    action: 'select-category',
                    data: { category: category } as any
                });
            }
            
            currentY += 60;
        });

        // Calculate max scroll offset using original viewport height (stable)
        const contentHeight = currentY + this.scrollOffset;
        this.calculateMaxScrollOffset(contentHeight, this.originalViewportHeight);

        ctx.restore();
    }

    private drawCategoryOption(ctx: CanvasRenderingContext2D, category: ArticleCategory, x: number, y: number): void {
        
        // Get category icon
        const categoryIcon = CategoryMapper.getCategoryIcon(category);
        
        // Draw emoji icon
        ctx.fillStyle = '#000000';
        ctx.font = `${getResponsiveValue(20)}px Arial, sans-serif`;
        ctx.fillText(categoryIcon, x, y - getResponsiveValue(2));

        // Draw category title with hover color
        ctx.fillStyle = '#007bff';
        ctx.font = `500 ${getResponsiveValue(18)}px Arial, sans-serif`;
        ctx.fillText(category, x + 32, y);

        // Draw description
        const description = this.getCategoryDescription(category);
        ctx.fillStyle = '#666666';
        ctx.font = `400 ${getResponsiveValue(14)}px Arial, sans-serif`;
        ctx.fillText(description, x + 32, y + getResponsiveValue(20));
        
    }

    private getCategoryDescription(category: ArticleCategory): string {
        switch (category) {
            case ArticleCategory.PERSON:
                return 'About a notable individual or character';
            case ArticleCategory.LOCATION:
                return 'About a place, city, country, or region';
            case ArticleCategory.SPECIES:
                return 'About an animal, plant, or biological organism';
            case ArticleCategory.ORGANIZATION:
                return 'About a company, institution, or group';
            case ArticleCategory.CONCEPT:
                return 'About an idea, theory, or academic concept';
            case ArticleCategory.CREATIVE_WORK:
                return 'About a book, film, artwork, or creative piece';
            case ArticleCategory.EVENT:
                return 'About a historical event or occurrence';
            default:
                return 'About a topic or concept';
        }
    }

    private drawSelectedCategoryChip(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        if (!this.selectedTopic) return;
        
        // Get category info
        const categoryIcon = CategoryMapper.getCategoryIcon(this.selectedTopic.category);
        const categoryName = this.selectedTopic.category;
        
        // Chip dimensions (wider for full category name)
        const chipWidth = getResponsiveValue(200);
        const chipHeight = getResponsiveValue(28);
        const borderRadius = getResponsiveValue(14);
        
        // Draw chip background (green theme for selected)
        ctx.fillStyle = '#f0fdf4'; // Light green background
        this.drawRoundedRect(ctx, x, y, chipWidth, chipHeight, borderRadius);
        ctx.fill();
        
        // Draw chip border
        ctx.strokeStyle = '#22c55e'; // Green border
        ctx.lineWidth = 1;
        this.drawRoundedRect(ctx, x, y, chipWidth, chipHeight, borderRadius);
        ctx.stroke();
        
        // Draw category icon
        ctx.fillStyle = '#22c55e';
        ctx.font = `${getResponsiveValue(14)}px Arial, sans-serif`;
        ctx.fillText(categoryIcon, x + getResponsiveValue(10), y + getResponsiveValue(18));
        
        // Draw category name (truncate if needed)
        const maxLength = 18;
        const displayName = categoryName.length > maxLength ? 
            categoryName.substring(0, maxLength - 3) + '...' : categoryName;
        
        ctx.fillStyle = '#22c55e';
        ctx.font = `500 ${getResponsiveValue(11)}px Arial, sans-serif`;
        ctx.fillText(displayName, x + getResponsiveValue(30), y + getResponsiveValue(18));
    }

    private drawNewTopicChip(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        // Codex Info Chip dimensions (cdx-info-chip)
        const chipHeight = 20; // Codex info chip height
        const horizontalPadding = 6; // Codex info chip padding
        const iconSize = 12; // Codex info chip icon size
        const iconTextGap = 4; // Gap between icon and text
        const borderRadius = 10; // Fully rounded (pill shape)
        
        // Measure text to calculate chip width dynamically
        ctx.font = `400 12px Arial, sans-serif`; // Codex info chip font
        const textWidth = ctx.measureText('New topic').width;
        const chipWidth = horizontalPadding + iconSize + iconTextGap + textWidth + horizontalPadding;
        
        // Draw Codex info chip background
        ctx.fillStyle = '#eaecf0'; // Codex base80 (neutral background)
        this.drawRoundedRect(ctx, x, y, chipWidth, chipHeight, borderRadius);
        ctx.fill();
        
        // Draw Codex info chip border
        ctx.strokeStyle = '#a2a9b1'; // Codex base70 (subtle border)
        ctx.lineWidth = 1;
        this.drawRoundedRect(ctx, x, y, chipWidth, chipHeight, borderRadius);
        ctx.stroke();
        
        // Draw plus icon (Codex icon style)
        const iconX = x + horizontalPadding;
        const iconY = y + (chipHeight / 2) + 4; // Center vertically
        ctx.fillStyle = '#54595d'; // Codex base20 (icon color)
        ctx.font = '400 12px Arial, sans-serif';
        ctx.fillText('+', iconX, iconY);
        
        // Draw chip text
        const textX = iconX + iconSize + iconTextGap;
        const textY = y + (chipHeight / 2) + 4; // Center vertically
        ctx.fillStyle = '#202122'; // Codex base10 (text color)
        ctx.font = '400 12px Arial, sans-serif';
        ctx.fillText('New topic', textX, textY);
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

    // Public method to draw chips from external components
    drawChips(ctx: CanvasRenderingContext2D, x: number, y: number, selectedTopic: TopicSelection | null): void {
        ctx.save(); // Save canvas state
        
        let chipX = x;
        
        // Draw "New Topic" chip first
        // Calculate the actual width of the "New topic" chip
        ctx.font = `400 14px Arial, sans-serif`;
        const newTopicTextWidth = ctx.measureText('New topic').width;
        const newTopicChipWidth = 8 + 16 + 4 + newTopicTextWidth + 8; // padding + icon + gap + text + padding
        
        this.drawNewTopicChipStatic(ctx, chipX, y);
        chipX += newTopicChipWidth + 4; // New topic chip width + 8px gap
        
        // Draw selected category chip second (if exists)
        if (selectedTopic) {
            this.drawSelectedCategoryChipStatic(ctx, chipX, y, selectedTopic);
        }
        
        ctx.restore(); // Restore canvas state
    }

    private drawSelectedCategoryChipStatic(ctx: CanvasRenderingContext2D, x: number, y: number, selectedTopic: TopicSelection): void {
        // Get category info
        const categoryIcon = CategoryMapper.getCategoryIcon(selectedTopic.category);
        const categoryName = selectedTopic.category;
        
        // Codex Info Chip dimensions (cdx-info-chip) - same as New Topic chip
        const chipHeight = 20; // Codex info chip height
        const horizontalPadding = 6; // Codex info chip padding
        const iconSize = 12; // Codex info chip icon size (matching '+' icon)
        const iconTextGap = 4; // Gap between icon and text
        const borderRadius = 10; // Fully rounded (pill shape)
        
        // Measure text to calculate chip width dynamically
        ctx.font = `400 12px Arial, sans-serif`; // Codex info chip font
        const textWidth = ctx.measureText(categoryName).width;
        const chipWidth = horizontalPadding + iconSize + iconTextGap + textWidth + horizontalPadding;
        
        // Draw Codex info chip background
        ctx.fillStyle = '#eaecf0'; // Codex base80 (neutral background)
        this.drawRoundedRect(ctx, x, y, chipWidth, chipHeight, borderRadius);
        ctx.fill();
        
        // Draw Codex info chip border
        ctx.strokeStyle = '#a2a9b1'; // Codex base70 (subtle border)
        ctx.lineWidth = 1;
        this.drawRoundedRect(ctx, x, y, chipWidth, chipHeight, borderRadius);
        ctx.stroke();
        
        // Draw category icon (Codex icon style)
        const iconX = x + horizontalPadding;
        const iconY = y + (chipHeight / 2) + 4; // Center vertically
        ctx.fillStyle = '#54595d'; // Codex base20 (icon color)
        ctx.font = '400 12px Arial, sans-serif';
        ctx.fillText(categoryIcon, iconX, iconY);
        
        // Draw chip text
        const textX = iconX + iconSize + iconTextGap;
        const textY = y + (chipHeight / 2) + 4; // Center vertically
        ctx.fillStyle = '#202122'; // Codex base10 (text color)
        ctx.font = '400 12px Arial, sans-serif';
        ctx.fillText(categoryName, textX, textY);
    }

    private drawNewTopicChipStatic(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        // Codex Info Chip dimensions (cdx-info-chip)
        const chipHeight = 20; // Codex info chip height
        const horizontalPadding = 6; // Codex info chip padding
        const iconSize = 12; // Codex info chip icon size
        const iconTextGap = 4; // Gap between icon and text
        const borderRadius = 10; // Fully rounded (pill shape)
        
        // Measure text to calculate chip width dynamically
        ctx.font = `400 12px Arial, sans-serif`; // Codex info chip font
        const textWidth = ctx.measureText('New topic').width;
        const chipWidth = horizontalPadding + iconSize + iconTextGap + textWidth + horizontalPadding;
        
        // Draw Codex info chip background
        ctx.fillStyle = '#eaecf0'; // Codex base80 (neutral background)
        this.drawRoundedRect(ctx, x, y, chipWidth, chipHeight, borderRadius);
        ctx.fill();
        
        // Draw Codex info chip border
        ctx.strokeStyle = '#a2a9b1'; // Codex base70 (subtle border)
        ctx.lineWidth = 1;
        this.drawRoundedRect(ctx, x, y, chipWidth, chipHeight, borderRadius);
        ctx.stroke();
        
        // Draw plus icon (Codex icon style)
        const iconX = x + horizontalPadding;
        const iconY = y + (chipHeight / 2) + 4; // Center vertically
        ctx.fillStyle = '#54595d'; // Codex base20 (icon color)
        ctx.font = '400 12px Arial, sans-serif';
        ctx.fillText('+', iconX, iconY);
        
        // Draw chip text
        const textX = iconX + iconSize + iconTextGap;
        const textY = y + (chipHeight / 2) + 4; // Center vertically
        ctx.fillStyle = '#202122'; // Codex base10 (text color)
        ctx.font = '400 12px Arial, sans-serif';
        ctx.fillText('New topic', textX, textY);
    }

    getClickableAreas(): ClickableArea[] {
        return this.clickableAreas;
    }

    handleScroll(deltaY: number): void {
        const scrollSpeed = 30;
        this.scrollOffset += deltaY * scrollSpeed;
        
        // Clamp scroll offset
        this.scrollOffset = Math.max(0, Math.min(this.scrollOffset, this.maxScrollOffset));
    }

    private calculateMaxScrollOffset(contentHeight: number, viewportHeight: number): void {
        this.maxScrollOffset = Math.max(0, contentHeight - viewportHeight + 100); // 100px padding
    }

    // Method to update viewport height if window is resized (not just keyboard)
    updateViewportHeight(): void {
        // Only update if it's a significant change (not just keyboard)
        const currentHeight = window.innerHeight;
        const heightDiff = Math.abs(currentHeight - this.originalViewportHeight);
        
        // Update only if height difference is > 150px (likely device rotation, not keyboard)
        if (heightDiff > 150) {
            this.originalViewportHeight = currentHeight;
            this.scrollOffset = 0; // Reset scroll on major viewport changes
        }
    }
}