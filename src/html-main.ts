// ABOUTME: Main HTML-based article creator application entry point
// ABOUTME: Manages workflow state, input handling, and component interactions

import { DebounceHandler } from './DebounceHandler';
import { WikidataService } from './WikidataService';
import { CategoryMapper, ArticleCategory } from './CategoryMapper';
import { TopicSelection } from './types/workflow';
import { cdxIconAdd, cdxIconArticle } from '@wikimedia/codex-icons';
import { CdxInfoChip } from '@wikimedia/codex';

enum WorkflowState {
    INPUT = 'input',
    TOPIC_SELECTION = 'topic-selection',
    CATEGORY_SELECTION = 'category-selection',
    ARTICLE_CREATION = 'article-creation'
}

class HTMLArticleCreator {
    private currentState: WorkflowState = WorkflowState.INPUT;
    private searchTerm: string = '';
    private selectedTopic: TopicSelection | null = null;
    private debounceHandler: DebounceHandler;

    // DOM elements
    private titleInput!: HTMLInputElement;
    private topicSection!: HTMLElement;
    private categorySection!: HTMLElement;
    private creationSection!: HTMLElement;
    private topicList!: HTMLElement;
    private categoryList!: HTMLElement;
    private categoryTitle!: HTMLElement;
    private creationTitle!: HTMLElement;
    private chipsContainer!: HTMLElement;
    private creationChipsContainer!: HTMLElement;
    private newTopicBtn!: HTMLElement;
    private startCreatingBtn!: HTMLElement;

    constructor() {
        this.debounceHandler = new DebounceHandler(2500);
        
        this.initializeDOM();
        this.setupEventListeners();
        this.restoreState();
    }

    private initializeDOM(): void {
        this.titleInput = document.getElementById('articleTitleInput') as HTMLInputElement;
        this.topicSection = document.getElementById('topicSection') as HTMLElement;
        this.categorySection = document.getElementById('categorySection') as HTMLElement;
        this.creationSection = document.getElementById('creationSection') as HTMLElement;
        this.topicList = document.getElementById('topicList') as HTMLElement;
        this.categoryList = document.getElementById('categoryList') as HTMLElement;
        this.categoryTitle = document.getElementById('categoryTitle') as HTMLElement;
        this.creationTitle = document.getElementById('creationTitle') as HTMLElement;
        this.chipsContainer = document.getElementById('chipsContainer') as HTMLElement;
        this.creationChipsContainer = document.getElementById('creationChipsContainer') as HTMLElement;
        this.newTopicBtn = document.getElementById('newTopicBtn') as HTMLElement;
        this.startCreatingBtn = document.getElementById('startCreatingBtn') as HTMLElement;

        if (!this.titleInput) {
            throw new Error('Required DOM elements not found');
        }
        
        // Inject Codex add icon into the New Topic button
        const iconSpan = this.newTopicBtn.querySelector('.cdx-button__icon');
        if (iconSpan) {
            iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">${cdxIconAdd}</svg>`;
        }
    }

    private setupEventListeners(): void {
        // Input handling with debounced search
        this.titleInput.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            this.searchTerm = target.value;
            this.saveState();
            
            if (this.searchTerm.length >= 3) {
                this.debounceHandler.debounce(() => {
                    this.performSearch(this.searchTerm);
                });
            } else {
                this.setState(WorkflowState.INPUT);
            }
        });

        // New topic button
        this.newTopicBtn.addEventListener('click', () => {
            this.showCategorySelection();
        });

        // Start creating button
        this.startCreatingBtn.addEventListener('click', () => {
            this.startArticleCreation();
        });

        // Focus input on load
        this.titleInput.focus();
    }

    private async performSearch(searchTerm: string): Promise<void> {
        try {
            const results = await WikidataService.searchTopics(searchTerm);
            this.displayTopicResults(results);
            this.setState(WorkflowState.TOPIC_SELECTION);
        } catch (error) {
            console.error('Search failed:', error);
        }
    }

    private displayTopicResults(results: any[]): void {
        this.topicList.innerHTML = '';
        
        results.forEach((result) => {
            const topicItem = this.createTopicItem(result);
            this.topicList.appendChild(topicItem);
        });
    }

    private createTopicItem(result: any): HTMLElement {
        const icon = CategoryMapper.getCategoryIcon(result.category);
        
        const item = document.createElement('div');
        item.className = 'topic-item';
        item.innerHTML = `
            <div class="topic-item__icon">${icon}</div>
            <div class="topic-item__content">
                <h3 class="topic-item__title">${result.title}</h3>
                <p class="topic-item__description">${result.description || 'No description available'}</p>
            </div>
        `;
        
        item.addEventListener('click', () => {
            this.selectTopic({
                wikidataId: result.id,
                label: result.title,
                description: result.description,
                category: result.category
            });
        });
        
        return item;
    }

    private selectTopic(topic: TopicSelection): void {
        this.selectedTopic = topic;
        this.saveState();
        this.showArticleCreation();
    }

    private showCategorySelection(): void {
        this.setState(WorkflowState.CATEGORY_SELECTION);
        this.categoryTitle.textContent = `Help us categorize "${this.searchTerm}"`;
        this.displayCategories();
        this.renderChips(this.chipsContainer, null);
    }

    private displayCategories(): void {
        this.categoryList.innerHTML = '';
        
        const categories = [
            ArticleCategory.PERSON,
            ArticleCategory.LOCATION,
            ArticleCategory.SPECIES,
            ArticleCategory.ORGANIZATION,
            ArticleCategory.CONCEPT,
            ArticleCategory.CREATIVE_WORK,
            ArticleCategory.EVENT
        ];
        
        categories.forEach((category) => {
            const categoryItem = this.createCategoryItem(category);
            this.categoryList.appendChild(categoryItem);
        });
    }

    private createCategoryItem(category: ArticleCategory): HTMLElement {
        const icon = CategoryMapper.getCategoryIcon(category);
        const description = this.getCategoryDescription(category);
        
        const item = document.createElement('div');
        item.className = 'category-item';
        item.innerHTML = `
            <div class="category-item__icon">${icon}</div>
            <div class="category-item__content">
                <h3 class="category-item__title">${category}</h3>
                <p class="category-item__description">${description}</p>
            </div>
        `;
        
        item.addEventListener('click', () => {
            this.selectCategory(category);
        });
        
        return item;
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

    private selectCategory(category: ArticleCategory): void {
        this.selectedTopic = {
            wikidataId: null,
            label: this.searchTerm,
            description: '',
            category: category
        };
        this.saveState();
        this.showArticleCreation();
    }

    private showArticleCreation(): void {
        this.setState(WorkflowState.ARTICLE_CREATION);
        if (this.selectedTopic) {
            this.creationTitle.textContent = `Creating ${this.selectedTopic.category} article about "${this.searchTerm}"`;
            this.renderChips(this.creationChipsContainer, this.selectedTopic);
        }
    }

    private renderChips(container: HTMLElement, selectedTopic: TopicSelection | null): void {
        container.innerHTML = '';
        
        // New topic chip
        const newTopicChip = this.createNewTopicChip();
        container.appendChild(newTopicChip);
        
        // Selected category chip (if exists)
        if (selectedTopic) {
            const categoryChip = this.createCategoryChip(selectedTopic);
            container.appendChild(categoryChip);
        }
    }

    private createNewTopicChip(): HTMLElement {
        const chip = document.createElement('div');
        chip.className = 'cdx-info-chip cdx-info-chip--notice';
        chip.innerHTML = `
            <span class="cdx-demo-css-icon--article"></span>
            <span class="cdx-info-chip__text">New topic</span>
        `;
        return chip;
    }

    private createCategoryChip(selectedTopic: TopicSelection): HTMLElement {
        const chip = document.createElement('div');
        chip.className = 'cdx-info-chip cdx-info-chip--notice';
        
        // Get CSS class for the category icon
        const iconClass = this.getCategoryIconClass(selectedTopic.category);
        
        chip.innerHTML = `
            <span class="${iconClass}"></span>
            <span class="cdx-info-chip__text">${selectedTopic.category}</span>
        `;
        return chip;
    }

    private getCategoryIconClass(category: ArticleCategory): string {
        switch (category) {
            case ArticleCategory.PERSON:
                return 'cdx-demo-css-icon--user-avatar';
            case ArticleCategory.LOCATION:
                return 'cdx-demo-css-icon--globe';
            case ArticleCategory.SPECIES:
                return 'cdx-demo-css-icon--die';
            case ArticleCategory.ORGANIZATION:
                return 'cdx-demo-css-icon--home';
            case ArticleCategory.CONCEPT:
                return 'cdx-demo-css-icon--book';
            case ArticleCategory.CREATIVE_WORK:
                return 'cdx-demo-css-icon--image';
            case ArticleCategory.EVENT:
                return 'cdx-demo-css-icon--calendar';
            case ArticleCategory.OTHER:
            default:
                return 'cdx-demo-css-icon--article';
        }
    }

    private setState(state: WorkflowState): void {
        this.currentState = state;
        this.updateDisplay();
        this.saveState();
    }

    private updateDisplay(): void {
        // Hide all sections
        this.topicSection.style.display = 'none';
        this.categorySection.style.display = 'none';
        this.creationSection.style.display = 'none';
        
        // Show current section
        switch (this.currentState) {
            case WorkflowState.TOPIC_SELECTION:
                this.topicSection.style.display = 'block';
                break;
            case WorkflowState.CATEGORY_SELECTION:
                this.categorySection.style.display = 'block';
                break;
            case WorkflowState.ARTICLE_CREATION:
                this.creationSection.style.display = 'block';
                break;
        }
    }

    private saveState(): void {
        const state = {
            currentState: this.currentState,
            searchTerm: this.searchTerm,
            selectedTopic: this.selectedTopic
        };
        localStorage.setItem('articleCreatorState', JSON.stringify(state));
    }

    private restoreState(): void {
        const savedState = localStorage.getItem('articleCreatorState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                this.searchTerm = state.searchTerm || '';
                this.selectedTopic = state.selectedTopic || null;
                this.titleInput.value = this.searchTerm;
                
                if (this.searchTerm) {
                    switch (state.currentState) {
                        case WorkflowState.TOPIC_SELECTION:
                            this.performSearch(this.searchTerm);
                            break;
                        case WorkflowState.CATEGORY_SELECTION:
                            this.showCategorySelection();
                            break;
                        case WorkflowState.ARTICLE_CREATION:
                            this.showArticleCreation();
                            break;
                    }
                }
            } catch (error) {
                console.error('Failed to restore state:', error);
            }
        }
    }

    private startArticleCreation(): void {
        // TODO: Implement article creation flow
        console.log('Starting article creation for:', this.selectedTopic);
    }
}

// Initialize the application
new HTMLArticleCreator();