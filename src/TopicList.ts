// ABOUTME: TopicList renders topic selection UI after title input with icons, titles, descriptions
// ABOUTME: Manages clickable areas for category selection and "New topic" creation option

import { WikidataTopic } from './WikidataService';
import { CategoryMapper } from './CategoryMapper';
import { getResponsiveValue, getResponsiveSpacing, isMobileDevice } from './utils/responsive';
import { ClickableArea } from './types/workflow';
import { codexTokens } from './design/CodexTokens';

export class TopicList {
    private topics: WikidataTopic[] = [];
    private visible: boolean = false;
    private clickableAreas: ClickableArea[] = [];

    constructor() {}

    setTopics(topics: WikidataTopic[]): void {
        this.topics = topics;
        this.visible = true; // Always show when search is triggered, even with no results
    }

    hide(): void {
        this.visible = false;
        this.topics = [];
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

        // Consistent responsive spacing
        const x = getResponsiveSpacing(20);
        let currentY = getResponsiveValue(220, 'height');

        // Draw section header - consistent sizing
        ctx.fillStyle = codexTokens.colors.emphasized;
        ctx.font = `600 ${getResponsiveValue(18)}px ${codexTokens.typography.fontFamily}`;
        ctx.fillText('Select the exact topic for this page', x, currentY);
        currentY += 20;

        // Draw description - consistent sizing
        ctx.fillStyle = codexTokens.colors.subtle;
        ctx.font = `400 ${getResponsiveValue(16)}px ${codexTokens.typography.fontFamily}`;
        ctx.fillText('This page is about...', x, currentY);
        currentY += 40;

        // Draw topic items with clickable areas
        this.topics.forEach((topic) => {
            this.drawTopicItem(ctx, topic, x, currentY);
            
            // Add clickable area for this topic - consistent sizing
            this.clickableAreas.push({
                x: x,
                y: currentY - getResponsiveSpacing(8),
                width: getResponsiveValue(400),
                height: getResponsiveSpacing(35),
                action: 'select-category',
                data: topic
            });
            
            currentY += 40;
        });

        // Always show "New topic" option when visible
        this.drawNewTopicOption(ctx, x, currentY);
        
        // Add clickable area for "New topic" - consistent sizing
        this.clickableAreas.push({
            x: x,
            y: currentY - getResponsiveSpacing(8),
            width: getResponsiveValue(400),
            height: getResponsiveSpacing(35),
            action: 'new-topic',
            data: null
        });

        ctx.restore();
    }

    private drawTopicItem(ctx: CanvasRenderingContext2D, topic: WikidataTopic, x: number, y: number): void {
        
        // Get category icon
        const categoryIcon = CategoryMapper.getCategoryIcon(topic.category as any);
        
        // Draw emoji icon - consistent sizing
        ctx.fillStyle = codexTokens.colors.base;
        ctx.font = `${getResponsiveValue(18)}px ${codexTokens.typography.fontFamily}`;
        ctx.fillText(categoryIcon, x + getResponsiveSpacing(4), y);

        // Draw topic title - consistent sizing
        ctx.fillStyle = codexTokens.colors.progressive;
        ctx.font = `600 ${getResponsiveValue(16)}px ${codexTokens.typography.fontFamily}`;
        ctx.fillText(topic.title, x + 32, y);

        // Draw description - consistent sizing and mobile adaptation
        const isMobile = isMobileDevice();
        const maxDescLength = isMobile ? 45 : 65;
        const description = topic.description.length > maxDescLength 
            ? topic.description.substring(0, maxDescLength) + '...'
            : topic.description;
        
        ctx.fillStyle = codexTokens.colors.subtle;
        ctx.font = `400 ${getResponsiveValue(13)}px ${codexTokens.typography.fontFamily}`;
        ctx.fillText(description, x + 32, y + getResponsiveSpacing(16));
        
    }

    private drawNewTopicOption(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        // Draw plus icon - consistent sizing
        ctx.fillStyle = codexTokens.colors.progressive;
        ctx.font = `${getResponsiveValue(18)}px ${codexTokens.typography.fontFamily}`;
        ctx.fillText('➕', x, y);

        // Draw "New topic" text - consistent sizing
        ctx.fillStyle = codexTokens.colors.progressive;
        ctx.font = `600 ${getResponsiveValue(16)}px ${codexTokens.typography.fontFamily}`;
        ctx.fillText('New topic', x + 32, y);

        // Draw subtitle description
        ctx.fillStyle = codexTokens.colors.subtle;
        ctx.font = `400 ${getResponsiveValue(13)}px ${codexTokens.typography.fontFamily}`;
        ctx.fillText('Create a new article type', x + 32, y + getResponsiveSpacing(16));
    }

    getTopics(): WikidataTopic[] {
        return this.topics;
    }

    getClickableAreas(): ClickableArea[] {
        return this.clickableAreas;
    }
}