// ABOUTME: Workflow-related types and interfaces for article creation
// ABOUTME: Defines states, clickable areas, and user interaction types

import { WikidataTopic } from '../WikidataService';
import { ArticleCategory } from '../CategoryMapper';

export enum WorkflowState {
    TOPIC_SELECTION = 'topic_selection',
    MANUAL_CATEGORY_SELECTION = 'manual_category_selection', 
    ARTICLE_CREATION = 'article_creation'
}

export interface ClickableArea {
    x: number;
    y: number;
    width: number;
    height: number;
    action: 'select-category' | 'new-topic';
    data?: WikidataTopic | null;
}

export interface TopicSelection {
    topic: string;
    category: ArticleCategory;
    source: 'wikidata' | 'manual';
}