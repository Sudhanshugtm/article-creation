// ABOUTME: Main HTML-based article creator application entry point
// ABOUTME: Manages workflow state, input handling, and component interactions

import { DebounceHandler } from './DebounceHandler';
import { WikidataService } from './WikidataService';
import { CategoryMapper, ArticleCategory } from './CategoryMapper';
import { TopicSelection } from './types/workflow';
import { LeadTemplateEngine } from './LeadTemplateEngine';
import { IntelligentTemplateEngine } from './IntelligentTemplateEngine';
import { IntelligentSectionEngine } from './IntelligentSectionEngine';
// import { SnippetModal } from './SnippetModal';
import {
    cdxIconAdd,
    cdxIconBold,
    cdxIconItalic,
    cdxIconLink,
    cdxIconUndo,
    cdxIconEllipsis,
    cdxIconClose,
    cdxIconNext
} from '@wikimedia/codex-icons';

enum WorkflowState {
    INPUT = 'input',
    TOPIC_SELECTION = 'topic-selection',
    CATEGORY_SELECTION = 'category-selection',
    ARTICLE_CREATION = 'article-creation',
    ARTICLE_EDITING = 'article-editing'
}

class HTMLArticleCreator {
    private currentState: WorkflowState = WorkflowState.INPUT;
    private searchTerm: string = '';
    private selectedTopic: TopicSelection | null = null;
    private debounceHandler: DebounceHandler;

    // DOM elements
    private titleInput!: HTMLInputElement;
    private inputSection!: HTMLElement;
    private topicSection!: HTMLElement;
    private categorySection!: HTMLElement;
    private creationSection!: HTMLElement;
    private editingSection!: HTMLElement;
    private topicList!: HTMLElement;
    private categoryList!: HTMLElement;
    private categoryTitle!: HTMLElement;
    private creationTitle!: HTMLElement;
    private chipsContainer!: HTMLElement;
    private creationChipsContainer!: HTMLElement;
    private newTopicBtn!: HTMLElement;
    private startCreatingBtn!: HTMLElement;
    private articleTitleText!: HTMLElement;
    private boldBtn!: HTMLElement;
    private italicBtn!: HTMLElement;
    private linkBtn!: HTMLElement;
    private undoBtn!: HTMLElement;
    private moreBtn!: HTMLElement;
    private articleContent!: HTMLElement;
    // Snippet modal elements
    private snippetModal!: HTMLElement;
    private snippetTitleSpan!: HTMLElement;
    private snippetCardsContainer!: HTMLElement;
    private snippetCancelBtn!: HTMLElement;
    private closeBtn!: HTMLElement;
    private nextBtn!: HTMLElement;
    private globalToolbar!: HTMLElement;
    private leadEngine!: LeadTemplateEngine;
    private intelligentEngine!: IntelligentTemplateEngine;
    private sectionEngine!: IntelligentSectionEngine;
    // Reference dialog elements
    private referenceDialog!: HTMLElement;
    private referenceForm!: HTMLFormElement;
    private referenceUrlInput!: HTMLInputElement;
    private referenceAccessInput!: HTMLInputElement;
    private referencePreview!: HTMLElement;
    private referencePreviewContent!: HTMLElement;
    private referenceLoading!: HTMLElement;
    private referenceError!: HTMLElement;
    private referenceCancelBtn!: HTMLButtonElement;
    private referenceInsertBtn!: HTMLButtonElement;
    private referenceAccessField!: HTMLElement;
    private referenceCount: number = 0;
    // Add from Link dialog elements
    private addLinkDialog!: HTMLElement;
    private addLinkStep1!: HTMLElement;
    private addLinkStep2!: HTMLElement;
    private addLinkStep3!: HTMLElement;
    private addLinkUrlInput!: HTMLInputElement;
    private addLinkSubmitUrl!: HTMLButtonElement;
    private addLinkLoading!: HTMLElement;
    private addLinkError!: HTMLElement;
    private addLinkSourceTitle!: HTMLElement;
    private addLinkSourceDomain!: HTMLElement;
    private addLinkQuestion!: HTMLInputElement;
    private addLinkSuggestions!: HTMLElement;
    private addLinkPreview!: HTMLElement;
    private addLinkCancelBtn!: HTMLButtonElement;
    private addLinkNextBtn!: HTMLButtonElement;
    private addLinkInsertBtn!: HTMLButtonElement;
    private currentExtractedContent: any = null;

    constructor() {
        this.debounceHandler = new DebounceHandler(2500);
        this.leadEngine = new LeadTemplateEngine(new WikidataService());
        this.intelligentEngine = new IntelligentTemplateEngine(new WikidataService());
        this.sectionEngine = new IntelligentSectionEngine(new WikidataService());
        
        this.initializeDOM();
        this.setupEventListeners();
        this.restoreState();
    }

    private initializeDOM(): void {
        this.titleInput = document.getElementById('articleTitleInput') as HTMLInputElement;
        this.inputSection = document.querySelector('.article-creator__input-section') as HTMLElement;
        this.topicSection = document.getElementById('topicSection') as HTMLElement;
        this.categorySection = document.getElementById('categorySection') as HTMLElement;
        this.creationSection = document.getElementById('creationSection') as HTMLElement;
        this.editingSection = document.getElementById('editingSection') as HTMLElement;
        this.topicList = document.getElementById('topicList') as HTMLElement;
        this.categoryList = document.getElementById('categoryList') as HTMLElement;
        this.categoryTitle = document.getElementById('categoryTitle') as HTMLElement;
        this.creationTitle = document.getElementById('creationTitle') as HTMLElement;
        this.chipsContainer = document.getElementById('chipsContainer') as HTMLElement;
        this.creationChipsContainer = document.getElementById('creationChipsContainer') as HTMLElement;
        this.newTopicBtn = document.getElementById('newTopicBtn') as HTMLElement;
        this.startCreatingBtn = document.getElementById('startCreatingBtn') as HTMLElement;
        this.articleTitleText = document.getElementById('articleTitleText') as HTMLElement;
        this.boldBtn = document.getElementById('boldBtn') as HTMLElement;
        this.italicBtn = document.getElementById('italicBtn') as HTMLElement;
        this.linkBtn = document.getElementById('linkBtn') as HTMLElement;
        this.undoBtn = document.getElementById('undoBtn') as HTMLElement;
        this.moreBtn = document.getElementById('moreBtn') as HTMLElement;
        // Editable content area for article body
        this.articleContent = document.getElementById('articleContent') as HTMLElement;
        this.closeBtn = document.getElementById('closeBtn') as HTMLElement;
        this.nextBtn = document.getElementById('nextBtn') as HTMLElement;
        this.globalToolbar = document.getElementById('globalToolbar') as HTMLElement;
        // Snippet modal elements
        this.snippetModal = document.getElementById('snippetModal') as HTMLElement;
        this.snippetTitleSpan = document.getElementById('snippetTitle') as HTMLElement;
        this.snippetCardsContainer = document.getElementById('snippetSuggestionCards') as HTMLElement;
        this.snippetCancelBtn = document.getElementById('snippetCancelBtn') as HTMLElement;
        this.snippetCancelBtn.addEventListener('click', () => this.closeSnippetModal());
        
        // Reference dialog elements
        this.referenceDialog = document.getElementById('referenceDialog') as HTMLElement;
        this.referenceForm = document.getElementById('referenceForm') as HTMLFormElement;
        this.referenceUrlInput = document.getElementById('referenceUrl') as HTMLInputElement;
        this.referenceAccessInput = document.getElementById('referenceAccess') as HTMLInputElement;
        this.referencePreview = document.getElementById('referencePreview') as HTMLElement;
        this.referencePreviewContent = document.getElementById('referencePreviewContent') as HTMLElement;
        this.referenceLoading = document.getElementById('referenceLoading') as HTMLElement;
        this.referenceError = document.getElementById('referenceError') as HTMLElement;
        this.referenceCancelBtn = document.getElementById('referenceCancelBtn') as HTMLButtonElement;
        this.referenceInsertBtn = document.getElementById('referenceInsertBtn') as HTMLButtonElement;
        this.referenceAccessField = document.getElementById('referenceAccessField') as HTMLElement;
        
        // Add from Link dialog elements
        this.addLinkDialog = document.getElementById('addLinkDialog') as HTMLElement;
        this.addLinkStep1 = document.getElementById('addLinkStep1') as HTMLElement;
        this.addLinkStep2 = document.getElementById('addLinkStep2') as HTMLElement;
        this.addLinkStep3 = document.getElementById('addLinkStep3') as HTMLElement;
        this.addLinkUrlInput = document.getElementById('addLinkUrl') as HTMLInputElement;
        this.addLinkSubmitUrl = document.getElementById('addLinkSubmitUrl') as HTMLButtonElement;
        this.addLinkLoading = document.getElementById('addLinkLoading') as HTMLElement;
        this.addLinkError = document.getElementById('addLinkError') as HTMLElement;
        this.addLinkSourceTitle = document.getElementById('addLinkSourceTitle') as HTMLElement;
        this.addLinkSourceDomain = document.getElementById('addLinkSourceDomain') as HTMLElement;
        this.addLinkQuestion = document.getElementById('addLinkQuestion') as HTMLInputElement;
        this.addLinkSuggestions = document.getElementById('addLinkSuggestions') as HTMLElement;
        this.addLinkPreview = document.getElementById('addLinkPreview') as HTMLElement;
        this.addLinkCancelBtn = document.getElementById('addLinkCancelBtn') as HTMLButtonElement;
        this.addLinkNextBtn = document.getElementById('addLinkNextBtn') as HTMLButtonElement;
        this.addLinkInsertBtn = document.getElementById('addLinkInsertBtn') as HTMLButtonElement;

        if (!this.titleInput) {
            throw new Error('Required DOM elements not found');
        }
        
        // Inject Codex add icon into the New Topic button
        const iconSpan = this.newTopicBtn.querySelector('.cdx-button__icon');
        if (iconSpan) {
            iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">${cdxIconAdd}</svg>`;
        }
        
        // Initialize toolbar icons
        this.initializeToolbarIcons();
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
            this.showArticleEditor();
        });


        // Close button to return to article creation
        this.closeBtn.addEventListener('click', () => {
            this.exitArticleEditor();
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
        
        // Clear existing article content when switching categories
        this.articleContent.innerHTML = '';
        
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
        this.editingSection.style.display = 'none';
        
        // Show/hide input section and header based on state
        const header = document.querySelector('.article-creator__header') as HTMLElement;
        if (this.currentState === WorkflowState.ARTICLE_EDITING) {
            this.inputSection.style.display = 'none';
            if (header) header.style.display = 'none';
        } else {
            this.inputSection.style.display = 'block';
            if (header) header.style.display = 'block';
        }
        
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
            case WorkflowState.ARTICLE_EDITING:
                this.editingSection.style.display = 'block';
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
                        case WorkflowState.ARTICLE_EDITING:
                            this.showArticleEditor();
                            break;
                    }
                }
            } catch (error) {
                console.error('Failed to restore state:', error);
            }
        }
    }

    private showArticleEditor(): void {
        this.setState(WorkflowState.ARTICLE_EDITING);
        this.setupArticleEditor();
        
        // Show the global toolbar and add editing class
        this.globalToolbar.style.display = 'flex';
        document.querySelector('.article-creator')?.classList.add('article-creator--editing');
        // Focus the editable article body to enable typing
        this.articleContent.focus();
    }

    private exitArticleEditor(): void {
        // Hide the global toolbar and remove editing class
        this.globalToolbar.style.display = 'none';
        document.querySelector('.article-creator')?.classList.remove('article-creator--editing');
        
        // Return to article creation state
        this.showArticleCreation();
        
        // Focus the title input to provide clear visual indicator of where user is
        // Small delay to ensure DOM has updated after state change
        setTimeout(() => {
            this.titleInput.focus();
            this.titleInput.select(); // Also select the text for easy editing
        }, 100);
    }

    private setupArticleEditor(): void {
        if (!this.selectedTopic) return;
        
        // Clear any existing article content when setting up editor
        this.articleContent.innerHTML = '';
        
        // Set the article title
        const articleTitle = this.searchTerm;
        this.articleTitleText.textContent = articleTitle;
        
        // Set the background text using existing CategoryMapper method
        const categoryDescription = this.selectedTopic.category.toLowerCase().replace('/', ' or ');
        const backgroundText = `${articleTitle} is a ${categoryDescription}.`;
        // Set placeholder text via data attribute
        this.articleContent.dataset.placeholder = backgroundText;
        // Render editor action chips below the content area
        const editorChipsContainer = document.getElementById('editorChipsContainer') as HTMLElement;
        if (editorChipsContainer) {
            editorChipsContainer.innerHTML = '';
            const chipDefs = [
                { type: 'snippet', icon: cdxIconAdd, label: 'Snippet' },
                { type: 'fact', icon: cdxIconAdd, label: 'Fact' },
                { type: 'more', icon: cdxIconEllipsis, label: 'More' }
            ];
            chipDefs.forEach(def => {
                const chip = document.createElement('div');
                chip.className = 'cdx-info-chip cdx-info-chip--notice';
                chip.setAttribute('data-chip-type', def.type);
                chip.innerHTML = `
                    <span class="editor-chip-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 20 20" aria-hidden="true">${def.icon}</svg>
                    </span>
                    <span class="cdx-info-chip__text">${def.label}</span>
                `;
                chip.addEventListener('click', () => this.handleEditorChipClick(def.type));
                editorChipsContainer.appendChild(chip);
            });
        }
    }
    
    private handleEditorChipClick(type: string): void {
        switch (type) {
            case 'snippet':
                // TODO: implement new snippet interaction (modal disabled)
                console.log('Snippet clicked - modal disabled for now');
                break;
            case 'fact':
                // TODO: implement fact insertion
                break;
            case 'more':
                this.showEditorMoreMenu();
                break;
        }
    }

    // Generate contextual leads for manual topics (no Wikidata entity)
    private getManualLeads(title: string, category: ArticleCategory, contextualChips?: string[]): { formal: string; concise: string; detailed: string } {
        // Enhanced contextual generation based on title patterns
        // const lowerTitle = title.toLowerCase(); // Reserved for future pattern detection
        
        // No hardcoded special cases - let category-based generation handle all topics
        
        // Default contextual leads based on category
        const article = this.getArticleForWord(title);
        const categoryDescription = this.getCategoryContextualDescription(category, title);
        
        return this.generateChipBasedLeads(title, category, categoryDescription, article, contextualChips);
    }
    
    private getArticleForWord(word: string): string {
        if (!word) return 'a';
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        return vowels.includes(word.toLowerCase().charAt(0)) ? 'an' : 'a';
    }
    
    private generateChipBasedLeads(title: string, category: ArticleCategory, categoryDescription: string, article: string, contextualChips?: string[]): { formal: string; concise: string; detailed: string } {
        // Use contextual chips if available, otherwise fall back to category-specific chips
        const baseChips = contextualChips && contextualChips.length > 0 ? 
            this.getContextualChips(contextualChips) : 
            this.getCategorySpecificChips(category);
        const referenceChip = '<span class="detail-chip detail-chip--reference" data-detail="reference">📎 Reference</span>';
        const moreChip = '<span class="detail-chip detail-chip--more" data-detail="more">...more</span>';
        
        switch (category) {
            case ArticleCategory.SPECIES:
                return {
                    formal: `${title} is ${article} ${baseChips.type} that ${baseChips.description}. ${baseChips.additional} ${referenceChip}`,
                    concise: `${title} is ${article} ${baseChips.type} from ${baseChips.location}.`,
                    detailed: `${title} is ${article} ${baseChips.type} that ${baseChips.description}. ${baseChips.habitat} ${baseChips.additional} ${moreChip} ${referenceChip}`
                };
            case ArticleCategory.PERSON:
                return {
                    formal: `${title} (${baseChips.lifespan}) was ${article} ${baseChips.nationality} ${baseChips.occupation} known for ${baseChips.achievement}. ${referenceChip}`,
                    concise: `${title}: ${baseChips.nationality} ${baseChips.occupation} (${baseChips.period}).`,
                    detailed: `${title} (${baseChips.lifespan}) was ${article} ${baseChips.nationality} ${baseChips.occupation} who ${baseChips.achievement}. ${baseChips.education} ${moreChip} ${referenceChip}`
                };
            case ArticleCategory.LOCATION:
                return {
                    formal: `${title} is ${article} ${baseChips.type} in ${baseChips.location} with a population of ${baseChips.population}. ${referenceChip}`,
                    concise: `${title}: ${baseChips.type} in ${baseChips.location}.`,
                    detailed: `${title} is ${article} ${baseChips.type} located in ${baseChips.location}. ${baseChips.demographics} ${baseChips.significance} ${referenceChip}`
                };
            case ArticleCategory.ORGANIZATION:
                return {
                    formal: `${title} is ${article} ${baseChips.type} founded in ${baseChips.foundingYear} by ${baseChips.founder}. ${referenceChip}`,
                    concise: `${title}: ${baseChips.type} founded in ${baseChips.foundingYear}.`,
                    detailed: `${title} is ${article} ${baseChips.type} established in ${baseChips.foundingYear} by ${baseChips.founder}. ${baseChips.mission} ${referenceChip}`
                };
            case ArticleCategory.CONCEPT:
                return {
                    formal: `${title} is ${article} ${baseChips.type} in the field of ${baseChips.field}. ${referenceChip}`,
                    concise: `${title}: ${baseChips.type} in ${baseChips.field}.`,
                    detailed: `${title} is ${article} ${baseChips.type} that ${baseChips.description}. ${baseChips.applications} ${referenceChip}`
                };
            case ArticleCategory.CREATIVE_WORK:
                return {
                    formal: `${title} is ${article} ${baseChips.type} by ${baseChips.creator} published in ${baseChips.year}. ${referenceChip}`,
                    concise: `${title}: ${baseChips.type} by ${baseChips.creator} (${baseChips.year}).`,
                    detailed: `${title} is ${article} ${baseChips.type} created by ${baseChips.creator} and published in ${baseChips.year}. ${baseChips.significance} ${referenceChip}`
                };
            case ArticleCategory.EVENT:
                return {
                    formal: `${title} was ${article} ${baseChips.type} that occurred in ${baseChips.location} on ${baseChips.date}. ${referenceChip}`,
                    concise: `${title}: ${baseChips.type} in ${baseChips.location} (${baseChips.year}).`,
                    detailed: `${title} was ${article} ${baseChips.type} that took place in ${baseChips.location} on ${baseChips.date}. ${baseChips.significance} ${referenceChip}`
                };
            default:
                return {
                    formal: `${title} is ${article} ${categoryDescription}. ${referenceChip}`,
                    concise: `${title}: ${categoryDescription}.`,
                    detailed: `${title} is ${article} ${categoryDescription}. This article provides comprehensive information about ${title}. ${referenceChip}`
                };
        }
    }
    
    private getContextualChips(contextualChips: string[]): Record<string, string> {
        const chip = (detail: string, label: string) => `<span class="detail-chip" data-detail="${detail}">${label}</span>`;
        
        // Convert contextual chips array to the expected format
        const chips: Record<string, string> = {};
        
        contextualChips.forEach((chipText, index) => {
            const cleanText = chipText.replace(/^\+\s*/, ''); // Remove + prefix
            const detailKey = cleanText.toLowerCase().replace(/\s+/g, '_');
            chips[`chip_${index}`] = chip(detailKey, chipText);
        });
        
        // Add some default structure for common patterns
        if (contextualChips.length >= 3) {
            chips.type = chip('type', contextualChips[0]);
            chips.description = chip('description', contextualChips[1]);
            chips.additional = chip('additional', contextualChips[2]);
        }
        
        return chips;
    }
    
    private getCategorySpecificChips(category: ArticleCategory): Record<string, string> {
        const chip = (detail: string, label: string) => `<span class="detail-chip" data-detail="${detail}">+ ${label}</span>`;
        
        switch (category) {
            case ArticleCategory.SPECIES:
                return {
                    type: chip('species_type', 'species type'),
                    description: `lives in ${chip('habitat', 'habitat')}`,
                    location: chip('native_region', 'region'),
                    habitat: `It inhabits ${chip('habitat_details', 'habitat type')}.`,
                    additional: `The species is ${chip('conservation_status', 'conservation status')}.`
                };
            case ArticleCategory.PERSON:
                return {
                    lifespan: `${chip('birth_year', 'birth year')}`,
                    nationality: chip('nationality', 'nationality'),
                    occupation: chip('occupation', 'occupation'),
                    achievement: chip('main_achievement', 'main achievement'),
                    period: chip('active_period', 'period'),
                    education: `They studied at ${chip('education', 'institution')}.`
                };
            case ArticleCategory.LOCATION:
                return {
                    type: chip('location_type', 'type'),
                    location: chip('parent_location', 'location'),
                    population: chip('population', 'population'),
                    demographics: `The area is ${chip('area', 'area')} square kilometers.`,
                    significance: `It is known for ${chip('known_for', 'notable feature')}.`
                };
            case ArticleCategory.ORGANIZATION:
                return {
                    type: chip('org_type', 'type'),
                    foundingYear: chip('founding_year', 'year'),
                    founder: chip('founder', 'founder'),
                    mission: `The organization focuses on ${chip('mission', 'mission')}.`
                };
            case ArticleCategory.CONCEPT:
                return {
                    type: chip('concept_type', 'concept type'),
                    field: chip('field', 'field'),
                    description: `${chip('description', 'describes')}`,
                    applications: `It is applied in ${chip('applications', 'applications')}.`
                };
            case ArticleCategory.CREATIVE_WORK:
                return {
                    type: chip('work_type', 'type'),
                    creator: chip('creator', 'creator'),
                    year: chip('publication_year', 'year'),
                    significance: `The work is notable for ${chip('significance', 'significance')}.`
                };
            case ArticleCategory.EVENT:
                return {
                    type: chip('event_type', 'event type'),
                    location: chip('location', 'location'),
                    date: chip('date', 'date'),
                    year: chip('year', 'year'),
                    significance: `The event was significant because ${chip('significance', 'significance')}.`
                };
            default:
                return {
                    type: chip('type', 'type'),
                    description: chip('description', 'description')
                };
        }
    }

    private getCategoryContextualDescription(category: ArticleCategory, title: string): string {
        const lowerTitle = title.toLowerCase();
        
        switch (category) {
            case ArticleCategory.SPECIES:
                if (lowerTitle.includes('saurus') || lowerTitle.includes('dinosaur')) {
                    return 'extinct dinosaur species';
                }
                return 'biological species';
            case ArticleCategory.PERSON:
                return 'notable individual';
            case ArticleCategory.LOCATION:
                if (lowerTitle.includes('city')) return 'city';
                if (lowerTitle.includes('country')) return 'country';
                return 'geographic location';
            case ArticleCategory.ORGANIZATION:
                return 'organization';
            case ArticleCategory.CONCEPT:
                if (lowerTitle.includes('theory')) return 'theoretical concept';
                if (lowerTitle.includes('principle')) return 'scientific principle';
                return 'conceptual framework';
            case ArticleCategory.CREATIVE_WORK:
                if (lowerTitle.includes('book')) return 'literary work';
                if (lowerTitle.includes('film')) return 'cinematic work';
                return 'creative work';
            case ArticleCategory.EVENT:
                return 'historical event';
            default:
                return category.toLowerCase();
        }
    }

    
    private async openSnippetModal(): Promise<void> {
        if (!this.selectedTopic) return;
        
        // Set modal title using topic label
        this.snippetTitleSpan.textContent = this.selectedTopic.label;

        // Prepare lead variations: use IntelligentTemplateEngine for enhanced context-aware templates
        let leadVariations: { formal: string; concise: string; detailed: string };
        let contextualChips: string[] = [];
        
        if (this.selectedTopic.wikidataId) {
            const wdTopic = {
                id: this.selectedTopic.wikidataId,
                title: this.selectedTopic.label,
                description: this.selectedTopic.description,
                category: this.selectedTopic.category,
                instanceOf: [] as string[]
            };
            try {
                // Use intelligent template engine for enhanced context awareness
                const intelligentResult = await this.intelligentEngine.generateIntelligentLeads(
                    wdTopic,
                    this.selectedTopic.category as ArticleCategory
                );
                leadVariations = {
                    formal: intelligentResult.formal,
                    concise: intelligentResult.concise,
                    detailed: intelligentResult.detailed
                };
                contextualChips = intelligentResult.contextualChips;
                
                console.log('Generated intelligent leads with contextual chips:', contextualChips);
            } catch (error) {
                console.error('Error generating intelligent leads, falling back to basic templates:', error);
                // Fallback to original template engine
                try {
                    leadVariations = await this.leadEngine.generateLeadVariations(
                        wdTopic,
                        this.selectedTopic.category as ArticleCategory
                    );
                } catch (fallbackError) {
                    console.error('Error with fallback template engine:', fallbackError);
                    leadVariations = this.getManualLeads(this.selectedTopic.label, this.selectedTopic.category as ArticleCategory, contextualChips);
                }
            }
        } else {
            // For manual topics, still use intelligent templates based on category analysis
            try {
                const mockTopic = {
                    id: '',
                    title: this.selectedTopic.label,
                    description: this.getCategoryContextualDescription(this.selectedTopic.category as ArticleCategory, this.selectedTopic.label),
                    category: this.selectedTopic.category,
                    instanceOf: [] as string[]
                };
                
                const intelligentResult = await this.intelligentEngine.generateIntelligentLeads(
                    mockTopic,
                    this.selectedTopic.category as ArticleCategory
                );
                leadVariations = {
                    formal: intelligentResult.formal,
                    concise: intelligentResult.concise,
                    detailed: intelligentResult.detailed
                };
                contextualChips = intelligentResult.contextualChips;
                
                console.log('Generated intelligent leads for manual topic with contextual chips:', contextualChips);
            } catch (error) {
                console.error('Error generating intelligent leads for manual topic:', error);
                leadVariations = this.getManualLeads(this.selectedTopic.label, this.selectedTopic.category as ArticleCategory, contextualChips);
            }
        }

        // Clear container and create cards for each lead variation
        this.snippetCardsContainer.innerHTML = '';

        const variations = [
            { type: 'Professional', content: leadVariations.formal, description: 'Formal tone' },
            { type: 'Concise', content: leadVariations.concise, description: 'Brief & clear' },
            { type: 'Comprehensive', content: leadVariations.detailed, description: 'Detailed coverage' }
        ];
            
            variations.forEach((variation, _index) => {
                if (variation.content.trim()) {
                    const card = document.createElement('div');
                    card.className = 'snippet-modal__card';
                    card.innerHTML = `
                        <div class="snippet-card__header">
                            <h3 class="snippet-card__title">${variation.type}</h3>
                            <span class="snippet-card__description">${variation.description}</span>
                        </div>
                        <p class="snippet-card__content">${variation.content}</p>
                        <div class="snippet-card__footer">
                            <span class="snippet-card__length">${variation.content.split(' ').length} words</span>
                        </div>
                    `;
                    card.addEventListener('click', () => {
                        this.insertSelectedSnippet(variation.content);
                        this.closeSnippetModal();
                    });
                    this.snippetCardsContainer.appendChild(card);
                }
            });
            
            // If no variations were generated, show fallback
            if (this.snippetCardsContainer.children.length === 0) {
                this.snippetCardsContainer.innerHTML = `
                    <div class="snippet-modal__card">
                        <p>${this.selectedTopic.label} is ${this.selectedTopic.description}.</p>
                    </div>
                `;
            }
        
        // Show modal
        this.snippetModal.style.display = 'flex';
    }

    private insertSelectedSnippet(text: string): void {
        // Insert selected snippet into the editor (supports HTML content)
        this.articleContent.innerHTML = text;
        
        // Add click handlers to detail chips
        const detailChips = this.articleContent.querySelectorAll('.detail-chip');
        console.log('Found chips:', detailChips.length);
        detailChips.forEach(chip => {
            const detail = chip.getAttribute('data-detail');
            console.log('Attaching handler to chip:', detail, chip);
            chip.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Chip clicked:', detail);
                this.handleDetailChipClick(detail || '', chip as HTMLElement);
            });
        });
        
        // Place caret at end
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(this.articleContent);
        range.collapse(false);
        if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
        }
        this.articleContent.focus();
    }
    
    private handleDetailChipClick(detailType: string, chipElement: HTMLElement): void {
        console.log('handleDetailChipClick called with:', detailType);
        
        // Handle "reference" chip specially - show reference dialog
        if (detailType === 'reference') {
            console.log('Opening reference dialog');
            this.openReferenceDialog();
            return;
        }
        
        // Handle "more" chip specially - show inline menu
        if (detailType === 'more') {
            console.log('Showing more chip menu');
            this.showMoreChipMenu(chipElement);
            return;
        }
        
        // Prevent multiple inline editors
        if (chipElement.querySelector('input')) return;
        
        const currentText = chipElement.textContent?.replace(/^\+\s*/, '') || '';
        const originalText = chipElement.textContent || '';
        
        // Check if this chip type has intelligent suggestions (async)
        this.getIntelligentSuggestions(detailType).then(suggestions => {
            if (suggestions.length > 0) {
                // Create dropdown with suggestions
                this.createIntelligentDropdown(chipElement, detailType, currentText, originalText, suggestions);
            } else {
                // Create inline input (existing behavior)
                this.createStandardInput(chipElement, detailType, currentText, originalText);
            }
        }).catch(error => {
            console.error('Error getting suggestions:', error);
            // Fallback to standard input
            this.createStandardInput(chipElement, detailType, currentText, originalText);
        });
    }
    
    private createStandardInput(chipElement: HTMLElement, detailType: string, currentText: string, originalText: string): void {
        // Create inline input (existing behavior)
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'detail-chip__input';
        input.placeholder = `Enter ${detailType}`;
        
        // Replace chip content with input
        chipElement.innerHTML = '';
        chipElement.appendChild(input);
        chipElement.classList.add('detail-chip--editing');
        
        // Focus and select text
        input.focus();
        input.select();
        
        this.setupInputHandlers(input, chipElement, originalText);
    }
    
    private setupInputHandlers(input: HTMLInputElement, chipElement: HTMLElement, originalText: string): void {
        // Handle save/cancel
        const saveValue = () => {
            const newValue = input.value.trim();
            if (newValue) {
                chipElement.textContent = newValue;
                chipElement.classList.add('detail-chip--filled');
            } else {
                chipElement.textContent = originalText;
            }
            chipElement.classList.remove('detail-chip--editing');
        };
        
        const cancelEdit = () => {
            chipElement.textContent = originalText;
            chipElement.classList.remove('detail-chip--editing');
        };
        
        // Event listeners
        input.addEventListener('blur', saveValue);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveValue();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        });
    }
    
    private async getIntelligentSuggestions(detailType: string): Promise<string[]> {
        const category = this.selectedTopic?.category as ArticleCategory;
        console.log(`Getting suggestions for detailType: ${detailType}, category: ${category}`);
        
        // Use Wikidata MCP to get real suggestions based on similar entities
        try {
            const suggestions = await this.fetchDynamicSuggestions(detailType, category);
            console.log(`Dynamic suggestions for ${detailType}:`, suggestions);
            if (suggestions.length > 0) {
                return [...suggestions, 'Custom...'];
            } else {
                // Fall back to hardcoded suggestions if no dynamic ones found
                const fallbackSuggestions = this.getFallbackSuggestions(detailType, category);
                console.log(`Fallback suggestions for ${detailType}:`, fallbackSuggestions);
                return fallbackSuggestions;
            }
        } catch (error) {
            console.error('Error fetching dynamic suggestions:', error);
            const fallbackSuggestions = this.getFallbackSuggestions(detailType, category);
            console.log(`Error fallback suggestions for ${detailType}:`, fallbackSuggestions);
            return fallbackSuggestions;
        }
    }
    
    private async fetchDynamicSuggestions(detailType: string, category: ArticleCategory): Promise<string[]> {
        switch (category) {
            case ArticleCategory.LOCATION:
                return await this.getLocationSuggestions(detailType);
            case ArticleCategory.PERSON:
                return await this.getPersonSuggestions(detailType);
            case ArticleCategory.SPECIES:
                return await this.getSpeciesSuggestions(detailType);
            default:
                return [];
        }
    }
    
    private async getLocationSuggestions(detailType: string): Promise<string[]> {
        try {
            switch (detailType) {
                case 'population':
                    // Get population data from similar cities
                    const populationQuery = `
                        SELECT DISTINCT ?population WHERE {
                            ?city wdt:P31/wdt:P279* wd:Q515 .
                            ?city wdt:P17 wd:Q668 .
                            ?city wdt:P1082 ?population .
                            FILTER(?population > 100000)
                        } ORDER BY DESC(?population) LIMIT 10
                    `;
                    const popResult = await this.queryWikidata(populationQuery);
                    return this.formatPopulationSuggestions(popResult);
                    
                case 'administrative_role':
                    // Get administrative roles from similar cities
                    const adminQuery = `
                        SELECT DISTINCT ?roleLabel WHERE {
                            ?city wdt:P31/wdt:P279* wd:Q515 .
                            ?city wdt:P31 ?role .
                            ?role rdfs:label ?roleLabel .
                            FILTER(LANG(?roleLabel) = "en")
                            FILTER(CONTAINS(LCASE(?roleLabel), "capital") || CONTAINS(LCASE(?roleLabel), "city"))
                        } LIMIT 8
                    `;
                    const adminResult = await this.queryWikidata(adminQuery);
                    return this.extractLabels(adminResult);
                    
                case 'geographical_features':
                    // Get common geographical features
                    const geoQuery = `
                        SELECT DISTINCT ?featureLabel WHERE {
                            ?city wdt:P31/wdt:P279* wd:Q515 .
                            ?city wdt:P138 ?feature .
                            ?feature rdfs:label ?featureLabel .
                            FILTER(LANG(?featureLabel) = "en")
                        } LIMIT 10
                    `;
                    const geoResult = await this.queryWikidata(geoQuery);
                    return this.extractLabels(geoResult);
                    
                default:
                    return [];
            }
        } catch (error) {
            console.error('Error fetching location suggestions:', error);
            return [];
        }
    }
    
    private async getPersonSuggestions(detailType: string): Promise<string[]> {
        try {
            switch (detailType) {
                case 'nationality':
                    const nationalityQuery = `
                        SELECT DISTINCT ?nationalityLabel WHERE {
                            ?person wdt:P31 wd:Q5 .
                            ?person wdt:P27 ?nationality .
                            ?nationality rdfs:label ?nationalityLabel .
                            FILTER(LANG(?nationalityLabel) = "en")
                        } GROUP BY ?nationalityLabel ORDER BY DESC(COUNT(?person)) LIMIT 15
                    `;
                    const natResult = await this.queryWikidata(nationalityQuery);
                    return this.extractLabels(natResult);
                    
                case 'occupation':
                    const occupationQuery = `
                        SELECT DISTINCT ?occupationLabel WHERE {
                            ?person wdt:P31 wd:Q5 .
                            ?person wdt:P106 ?occupation .
                            ?occupation rdfs:label ?occupationLabel .
                            FILTER(LANG(?occupationLabel) = "en")
                        } GROUP BY ?occupationLabel ORDER BY DESC(COUNT(?person)) LIMIT 15
                    `;
                    const occResult = await this.queryWikidata(occupationQuery);
                    return this.extractLabels(occResult);
                    
                case 'scientific_field':
                    const fieldQuery = `
                        SELECT DISTINCT ?fieldLabel WHERE {
                            ?person wdt:P31 wd:Q5 .
                            ?person wdt:P106 wd:Q901 .
                            ?person wdt:P101 ?field .
                            ?field rdfs:label ?fieldLabel .
                            FILTER(LANG(?fieldLabel) = "en")
                        } LIMIT 10
                    `;
                    const fieldResult = await this.queryWikidata(fieldQuery);
                    return this.extractLabels(fieldResult);
                    
                default:
                    return [];
            }
        } catch (error) {
            console.error('Error fetching person suggestions:', error);
            return [];
        }
    }
    
    private async getSpeciesSuggestions(detailType: string): Promise<string[]> {
        try {
            switch (detailType) {
                case 'habitat':
                    const habitatQuery = `
                        SELECT DISTINCT ?habitatLabel WHERE {
                            ?species wdt:P31 wd:Q16521 .
                            ?species wdt:P183 ?habitat .
                            ?habitat rdfs:label ?habitatLabel .
                            FILTER(LANG(?habitatLabel) = "en")
                        } LIMIT 10
                    `;
                    const habResult = await this.queryWikidata(habitatQuery);
                    return this.extractLabels(habResult);
                    
                case 'conservation_status':
                    const conservationQuery = `
                        SELECT DISTINCT ?statusLabel WHERE {
                            ?species wdt:P31 wd:Q16521 .
                            ?species wdt:P141 ?status .
                            ?status rdfs:label ?statusLabel .
                            FILTER(LANG(?statusLabel) = "en")
                        } LIMIT 8
                    `;
                    const consResult = await this.queryWikidata(conservationQuery);
                    return this.extractLabels(consResult);
                    
                default:
                    return [];
            }
        } catch (error) {
            console.error('Error fetching species suggestions:', error);
            return [];
        }
    }
    
    private async queryWikidata(query: string): Promise<any> {
        try {
            // TODO: Use Wikidata MCP for SPARQL queries
            // For now, return empty results to maintain functionality
            console.log('SPARQL query (placeholder):', query);
            return { results: { bindings: [] } };
        } catch (error) {
            console.error('SPARQL query failed:', error);
            throw error;
        }
    }
    
    private extractLabels(result: any): string[] {
        if (!result?.results?.bindings) return [];
        
        return result.results.bindings
            .map((binding: any) => {
                const keys = Object.keys(binding);
                const labelKey = keys.find(key => key.includes('Label')) || keys[0];
                return binding[labelKey]?.value;
            })
            .filter((label: string) => label && label.length > 0)
            .slice(0, 8); // Limit to 8 suggestions
    }
    
    private formatPopulationSuggestions(result: any): string[] {
        if (!result?.results?.bindings) return [];
        
        return result.results.bindings
            .map((binding: any) => {
                const pop = parseInt(binding.population?.value);
                if (pop > 1000000) {
                    return `${(pop / 1000000).toFixed(1)} million`;
                } else if (pop > 1000) {
                    return `${(pop / 1000).toFixed(0)},000`;
                }
                return pop.toString();
            })
            .filter((pop: string) => pop)
            .slice(0, 6);
    }
    
    private getFallbackSuggestions(detailType: string, category: ArticleCategory): string[] {
        // Minimal fallback suggestions if Wikidata fails
        const fallbacks: Record<string, Record<string, string[]>> = {
            [ArticleCategory.LOCATION]: {
                'location_type': ['city', 'town', 'village', 'region', 'country', 'Custom...'],
                'population': ['over 1 million', 'about 500,000', 'about 100,000', 'about 50,000', 'Custom...'],
                'administrative_role': ['capital city', 'major city', 'municipality', 'administrative center', 'Custom...'],
                'parent_location': ['United States', 'United Kingdom', 'India', 'Canada', 'Australia', 'Custom...']
            },
            [ArticleCategory.PERSON]: {
                'nationality': ['American', 'British', 'Indian', 'Canadian', 'Australian', 'German', 'French', 'Custom...'],
                'occupation': ['writer', 'scientist', 'artist', 'politician', 'musician', 'actor', 'engineer', 'Custom...'],
                'birth_year': ['1950', '1960', '1970', '1980', '1990', '2000', 'Custom...'],
                'main_achievement': ['notable works', 'scientific discoveries', 'artistic contributions', 'political reforms', 'Custom...'],
                'birth_date': ['January 1, 1970', 'March 15, 1965', 'June 10, 1980', 'Custom...'],
                'birth_place': ['New York', 'London', 'Paris', 'Mumbai', 'Toronto', 'Sydney', 'Custom...'],
                'family_background': ['middle-class family', 'academic family', 'working-class origins', 'aristocratic lineage', 'Custom...'],
                'early_education': ['local schools', 'private tutoring', 'prestigious academy', 'public education', 'Custom...'],
                'career_start_institution': ['Harvard University', 'Oxford University', 'MIT', 'Stanford University', 'Custom...'],
                'career_start_year': ['1990', '1995', '2000', '2005', '2010', 'Custom...'],
                'primary_research': ['theoretical physics', 'molecular biology', 'computer science', 'political theory', 'Custom...'],
                'major_contributions': ['groundbreaking research', 'innovative policies', 'artistic innovations', 'technological advances', 'Custom...'],
                'political_start_year': ['1990', '1995', '2000', '2005', '2010', 'Custom...'],
                'first_office': ['city councilor', 'state representative', 'mayor', 'senator', 'Custom...'],
                'major_offices': ['Governor', 'Senator', 'Prime Minister', 'President', 'Cabinet Minister', 'Custom...'],
                'political_achievements': ['landmark legislation', 'policy reforms', 'international agreements', 'social programs', 'Custom...'],
                'spouse_name': ['Jane Smith', 'John Doe', 'Custom...'],
                'marriage_year': ['1990', '1995', '2000', '2005', 'Custom...'],
                'children_details': ['two children', 'three sons', 'one daughter', 'no children', 'Custom...'],
                'personal_interests': ['reading', 'music', 'sports', 'travel', 'gardening', 'Custom...']
            },
            [ArticleCategory.SPECIES]: {
                'species_type': ['bird', 'mammal', 'reptile', 'fish', 'amphibian', 'insect', 'plant', 'fungus', 'Custom...'],
                'habitat': ['forests', 'grasslands', 'wetlands', 'deserts', 'mountains', 'rivers', 'oceans', 'Custom...'],
                'conservation_status': ['Least Concern', 'Near Threatened', 'Vulnerable', 'Endangered', 'Critically Endangered', 'Custom...'],
                'native_region': ['North America', 'South America', 'Europe', 'Asia', 'Africa', 'Australia', 'Custom...'],
                'habitat_details': ['tropical forests', 'temperate forests', 'freshwater lakes', 'coastal areas', 'mountain regions', 'Custom...']
            }
        };
        
        return fallbacks[category]?.[detailType] || ['Custom...'];
    }
    
    private createIntelligentDropdown(
        chipElement: HTMLElement, 
        detailType: string, 
        currentText: string, 
        originalText: string, 
        suggestions: string[]
    ): void {
        // Create dropdown container
        const dropdown = document.createElement('div');
        dropdown.className = 'detail-chip__dropdown';
        
        // Create input with autocomplete
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'detail-chip__input detail-chip__input--dropdown';
        input.placeholder = `Enter ${detailType} or select below`;
        
        // Create suggestions list
        const suggestionsList = document.createElement('div');
        suggestionsList.className = 'detail-chip__suggestions';
        
        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'detail-chip__suggestion';
            if (suggestion === 'Custom...') {
                suggestionItem.className += ' detail-chip__suggestion--custom';
            }
            suggestionItem.textContent = suggestion;
            
            suggestionItem.addEventListener('click', () => {
                if (suggestion === 'Custom...') {
                    input.focus();
                    input.value = '';
                    input.placeholder = `Enter custom ${detailType}...`;
                } else {
                    this.applySuggestion(chipElement, suggestion, originalText);
                }
            });
            
            suggestionsList.appendChild(suggestionItem);
        });
        
        // Add input and suggestions to dropdown
        dropdown.appendChild(input);
        dropdown.appendChild(suggestionsList);
        
        // Replace chip content with dropdown
        chipElement.innerHTML = '';
        chipElement.appendChild(dropdown);
        chipElement.classList.add('detail-chip--editing', 'detail-chip--dropdown');
        
        // Focus input
        input.focus();
        input.select();
        
        // Setup input handlers
        this.setupDropdownHandlers(input, chipElement, originalText);
    }
    
    private applySuggestion(chipElement: HTMLElement, suggestion: string, _originalText: string): void {
        chipElement.textContent = suggestion;
        // Remove all chip styling to make it look like normal text
        chipElement.classList.remove('detail-chip', 'detail-chip--editing', 'detail-chip--dropdown', 'detail-chip--filled');
        chipElement.style.background = 'transparent';
        chipElement.style.border = 'none';
        chipElement.style.padding = '0';
        chipElement.style.cursor = 'text';
    }
    
    private setupDropdownHandlers(input: HTMLInputElement, chipElement: HTMLElement, originalText: string): void {
        const saveValue = () => {
            const newValue = input.value.trim();
            if (newValue) {
                chipElement.textContent = newValue;
                // Remove all chip styling to make it look like normal text
                chipElement.classList.remove('detail-chip', 'detail-chip--editing', 'detail-chip--dropdown', 'detail-chip--filled');
                chipElement.style.background = 'transparent';
                chipElement.style.border = 'none';
                chipElement.style.padding = '0';
                chipElement.style.cursor = 'text';
            } else {
                chipElement.textContent = originalText;
                chipElement.classList.remove('detail-chip--editing', 'detail-chip--dropdown');
            }
        };
        
        const cancelEdit = () => {
            chipElement.textContent = originalText;
            chipElement.classList.remove('detail-chip--editing', 'detail-chip--dropdown');
        };
        
        // Event listeners
        input.addEventListener('blur', (_e) => {
            // Delay to allow suggestion clicks to register
            setTimeout(() => {
                if (!chipElement.contains(document.activeElement)) {
                    saveValue();
                }
            }, 150);
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveValue();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        });
    }
    
    private showMoreChipMenu(chipElement: HTMLElement): void {
        console.log('showMoreChipMenu called');
        // Remove any existing menus
        document.querySelectorAll('.detail-chip__menu').forEach(menu => menu.remove());
        
        // Create inline menu
        const menu = document.createElement('div');
        menu.className = 'detail-chip__menu';
        
        // Menu options based on category
        const options = this.getMoreChipOptions();
        
        options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'detail-chip__menu-option';
            optionElement.textContent = option.label;
            optionElement.addEventListener('click', () => {
                this.insertMoreChip(chipElement, option);
                menu.remove();
            });
            menu.appendChild(optionElement);
        });
        
        // Position menu next to chip
        const rect = chipElement.getBoundingClientRect();
        menu.style.position = 'absolute';
        menu.style.top = `${rect.bottom + 5}px`;
        menu.style.left = `${rect.left}px`;
        menu.style.zIndex = '1001';
        
        document.body.appendChild(menu);
        
        // Close menu on outside click
        const closeMenu = (e: Event) => {
            if (!menu.contains(e.target as Node) && e.target !== chipElement) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 0);
    }
    
    private getMoreChipOptions(): Array<{label: string, detail: string}> {
        // Return contextual options based on current category
        return [
            { label: 'Etymology', detail: 'etymology' },
            { label: 'History', detail: 'history' },
            { label: 'Related topics', detail: 'related' },
            { label: 'Notable features', detail: 'features' },
            { label: 'Cultural impact', detail: 'impact' },
            { label: 'Current status', detail: 'status' }
        ];
    }
    
    private insertMoreChip(moreChip: HTMLElement, option: {label: string, detail: string}): void {
        // Create new chip
        const newChip = document.createElement('span');
        newChip.className = 'detail-chip';
        newChip.setAttribute('data-detail', option.detail);
        newChip.textContent = `+ ${option.label.toLowerCase()}`;
        
        // Add click handler
        newChip.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleDetailChipClick(option.detail, newChip);
        });
        
        // Insert before the more chip
        moreChip.parentNode?.insertBefore(newChip, moreChip);
    }

    private showEditorMoreMenu(): void {
        console.log('showEditorMoreMenu called');
        
        // Check if more section already exists
        let moreSection = document.getElementById('editorMoreSection');
        if (moreSection) {
            // Toggle visibility
            if (moreSection.style.display === 'none') {
                moreSection.style.display = 'block';
            } else {
                moreSection.style.display = 'none';
            }
            return;
        }
        
        // Find the editor chips container
        const editorChipsContainer = document.getElementById('editorChipsContainer');
        if (!editorChipsContainer) {
            console.log('Editor chips container not found');
            return;
        }
        
        // Create inline expandable section
        moreSection = document.createElement('div');
        moreSection.id = 'editorMoreSection';
        moreSection.className = 'editor-more-section';
        
        // Create the structure matching the user's image
        moreSection.innerHTML = `
            <div class="editor-more-subsection">
                <h3 class="editor-more-subsection__title">Add...</h3>
            </div>
            
            <div class="editor-more-subsection">
                <h3 class="editor-more-subsection__title">Snippets</h3>
                <div class="editor-more-card" data-action="snippet-intro">
                    <div class="editor-more-card__title">The basic intro</div>
                    <div class="editor-more-card__subtitle">Wikisaurus (...) is a genus of...</div>
                </div>
            </div>
            
            <div class="editor-more-subsection">
                <h3 class="editor-more-subsection__title">New fact</h3>
                <div class="editor-more-card" data-action="add-from-link">
                    <div class="editor-more-card__title">Add from link</div>
                </div>
            </div>
            
            <div class="editor-more-subsection">
                <h3 class="editor-more-subsection__title">New section</h3>
                <div id="intelligentSectionsContainer">
                    <!-- Intelligent sections will be populated here -->
                </div>
            </div>
        `;
        
        // Add click handlers to cards
        const cards = moreSection.querySelectorAll('.editor-more-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const action = card.getAttribute('data-action');
                this.handleEditorMoreCardClick(action || '');
            });
        });
        
        // Insert after the chips container
        editorChipsContainer.parentNode?.insertBefore(moreSection, editorChipsContainer.nextSibling);
        
        // Populate intelligent sections
        this.populateIntelligentSections();
    }
    
    private async populateIntelligentSections(): Promise<void> {
        if (!this.selectedTopic) {
            console.log('No selected topic for section suggestions');
            return;
        }
        
        const container = document.getElementById('intelligentSectionsContainer');
        if (!container) {
            console.log('Intelligent sections container not found');
            return;
        }
        
        try {
            const category = this.selectedTopic.category as ArticleCategory;
            const sectionSuggestions = await this.sectionEngine.getSuggestedSections(this.selectedTopic, category);
            
            // Limit to top 4 suggestions to avoid overwhelming the UI
            const topSuggestions = sectionSuggestions.slice(0, 4);
            
            topSuggestions.forEach((section, index) => {
                const card = document.createElement('div');
                card.className = 'editor-more-card';
                card.setAttribute('data-action', `intelligent-section-${index}`);
                card.setAttribute('data-section-title', section.title);
                card.innerHTML = `
                    <div class="editor-more-card__title">${section.icon} ${section.title}</div>
                    <div class="editor-more-card__subtitle">${section.description}</div>
                `;
                
                card.addEventListener('click', () => {
                    this.handleIntelligentSectionClick(section);
                });
                
                container.appendChild(card);
            });
            
            if (topSuggestions.length === 0) {
                // Fallback to generic sections
                container.innerHTML = `
                    <div class="editor-more-card" data-action="origin-name">
                        <div class="editor-more-card__title">📚 Origin of the name</div>
                        <div class="editor-more-card__subtitle">Historical background and etymology</div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading section suggestions:', error);
            // Show fallback
            container.innerHTML = `
                <div class="editor-more-card" data-action="origin-name">
                    <div class="editor-more-card__title">📚 Origin of the name</div>
                    <div class="editor-more-card__subtitle">Historical background and etymology</div>
                </div>
            `;
        }
    }
    
    private async handleIntelligentSectionClick(section: any): Promise<void> {
        console.log('Intelligent section clicked:', section.title);
        
        if (!this.selectedTopic) {
            console.log('No selected topic for section generation');
            // Create a fallback topic to ensure chips are still generated
            this.selectedTopic = {
                id: '',
                title: 'Entity Name',
                description: 'A person, place, or thing',
                category: 'Person'
            } as any;
        }
        
        try {
            const category = this.selectedTopic.category as ArticleCategory;
            console.log('Generating section content for:', section.title, 'category:', category);
            
            const sectionContent = await this.sectionEngine.generateSectionContent(section, this.selectedTopic, category);
            console.log('Generated section content:', sectionContent);
            
            // Ensure we have content with chips, not empty/undefined
            const finalContent = sectionContent && sectionContent.trim() ? 
                sectionContent : 
                this.createFallbackSectionWithChips(section.title);
            
            // Add section to article with proper HTML formatting
            this.insertSectionWithFormatting(section.title, finalContent);
            
            // Close the more section
            this.closeEditorMoreSection();
            
            // Focus back to content
            this.articleContent.focus();
            
        } catch (error) {
            console.error('Error generating section content:', error);
            console.error('Error details:', error);
            
            // Fallback with interactive chips instead of static text
            const chipContent = this.createFallbackSectionWithChips(section.title);
            this.insertSectionWithFormatting(section.title, chipContent);
            this.closeEditorMoreSection();
            this.articleContent.focus();
        }
    }

    private createFallbackSectionWithChips(sectionTitle: string): string {
        // Create intelligent fallback content with chips based on section type
        const lowerTitle = sectionTitle.toLowerCase();
        console.log('Creating fallback section for:', sectionTitle, 'lowercased:', lowerTitle);
        
        // Early Life & Education
        if (lowerTitle.includes('early life') || lowerTitle.includes('education') || lowerTitle.includes('childhood') || lowerTitle.includes('youth')) {
            return `<span class="detail-chip" data-detail="entity_name">Entity name</span> was born <span class="detail-chip" data-detail="birth_date">birth date</span> in <span class="detail-chip" data-detail="birth_place">birth place</span>. <span class="detail-chip" data-detail="family_background">Family background</span> and <span class="detail-chip" data-detail="early_education">early education</span> shaped their development.`;
        } 
        // Career & Research  
        else if (lowerTitle.includes('career') || lowerTitle.includes('research') || lowerTitle.includes('work') || lowerTitle.includes('profession')) {
            return `<span class="detail-chip" data-detail="entity_name">Entity name</span> began their career at <span class="detail-chip" data-detail="career_start_institution">institution</span> in <span class="detail-chip" data-detail="career_start_year">year</span>. Their work focused on <span class="detail-chip" data-detail="primary_research">research area</span> and <span class="detail-chip" data-detail="major_contributions">key contributions</span>.`;
        }
        // Political Career
        else if (lowerTitle.includes('political') || lowerTitle.includes('government') || lowerTitle.includes('office') || lowerTitle.includes('leadership')) {
            return `<span class="detail-chip" data-detail="entity_name">Entity name</span> entered politics in <span class="detail-chip" data-detail="political_start_year">year</span> as <span class="detail-chip" data-detail="first_office">first position</span>. They later served as <span class="detail-chip" data-detail="major_offices">major positions</span> and achieved <span class="detail-chip" data-detail="political_achievements">key accomplishments</span>.`;
        }
        // Personal Life
        else if (lowerTitle.includes('personal') || lowerTitle.includes('family') || lowerTitle.includes('private')) {
            return `<span class="detail-chip" data-detail="entity_name">Entity name</span> married <span class="detail-chip" data-detail="spouse_name">spouse</span> in <span class="detail-chip" data-detail="marriage_year">year</span>. They have <span class="detail-chip" data-detail="children_details">children information</span> and <span class="detail-chip" data-detail="personal_interests">personal interests</span>.`;
        }
        // Legacy & Death
        else if (lowerTitle.includes('legacy') || lowerTitle.includes('death') || lowerTitle.includes('later life') || lowerTitle.includes('impact')) {
            return `<span class="detail-chip" data-detail="entity_name">Entity name</span> passed away <span class="detail-chip" data-detail="death_date">date</span> in <span class="detail-chip" data-detail="death_place">place</span>. Their legacy includes <span class="detail-chip" data-detail="lasting_impact">lasting contributions</span> and <span class="detail-chip" data-detail="commemorations">commemorations</span>.`;
        }
        // Awards & Recognition
        else if (lowerTitle.includes('awards') || lowerTitle.includes('recognition') || lowerTitle.includes('honors') || lowerTitle.includes('achievements')) {
            return `<span class="detail-chip" data-detail="entity_name">Entity name</span> received <span class="detail-chip" data-detail="major_awards">major awards</span> including <span class="detail-chip" data-detail="prestigious_honors">prestigious honors</span>. Their work was recognized by <span class="detail-chip" data-detail="recognition_institutions">institutions</span> and <span class="detail-chip" data-detail="peer_recognition">peers</span>.`;
        }
        // Publications & Works
        else if (lowerTitle.includes('publications') || lowerTitle.includes('works') || lowerTitle.includes('writings') || lowerTitle.includes('books')) {
            return `<span class="detail-chip" data-detail="entity_name">Entity name</span> published <span class="detail-chip" data-detail="major_publications">major works</span> including <span class="detail-chip" data-detail="notable_books">notable books</span>. Their <span class="detail-chip" data-detail="publication_themes">key themes</span> influenced <span class="detail-chip" data-detail="field_impact">field impact</span>.`;
        }
        // Generic fallback - but make it better
        else {
            console.log('Using generic fallback for section:', sectionTitle);
            return `<span class="detail-chip" data-detail="entity_name">Entity name</span> <span class="detail-chip" data-detail="section_context">section context</span>. <span class="detail-chip" data-detail="key_information">Key information</span> about <span class="detail-chip" data-detail="specific_details">specific details</span> and <span class="detail-chip" data-detail="relevant_facts">relevant facts</span>.`;
        }
    }
    
    private insertSectionWithFormatting(sectionTitle: string, sectionContent: string): void {
        // Create proper HTML structure for section like Wikipedia
        const sectionElement = document.createElement('div');
        sectionElement.className = 'article-section';
        
        // Create section heading
        const heading = document.createElement('h2');
        heading.className = 'article-section__heading';
        heading.textContent = sectionTitle;
        
        // Create section content paragraph
        const contentParagraph = document.createElement('p');
        contentParagraph.className = 'article-section__content';
        contentParagraph.innerHTML = sectionContent;
        
        // Assemble section
        sectionElement.appendChild(heading);
        sectionElement.appendChild(contentParagraph);
        
        // Insert into article
        this.articleContent.appendChild(sectionElement);
        
        // Add click handlers to any detail chips in the new section
        const detailChips = sectionElement.querySelectorAll('.detail-chip');
        detailChips.forEach(chip => {
            const detail = chip.getAttribute('data-detail');
            chip.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleDetailChipClick(detail || '', chip as HTMLElement);
            });
        });
        
        // Scroll section into view
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    private handleEditorMoreCardClick(action: string): void {
        console.log('Editor more card clicked:', action);
        
        switch (action) {
            case 'snippet-intro':
                // Generate and insert basic intro directly (no modal)
                this.insertBasicIntro();
                break;
            case 'add-from-link':
                // Open Add from Link dialog
                this.openAddLinkDialog();
                break;
            case 'origin-name':
                // Add origin section
                const originSection = '\n\n## Origin of the name\n\n[Add information about the name origin]';
                this.articleContent.innerHTML += originSection;
                break;
            default:
                console.log('Unknown card action:', action);
        }
        
        // Close the entire more section after insertion
        this.closeEditorMoreSection();
        
        // Focus back to content
        this.articleContent.focus();
    }
    
    private closeEditorMoreSection(): void {
        const existingSection = document.getElementById('editorMoreSection');
        if (existingSection) {
            existingSection.remove();
        }
    }
    
    
    private async insertBasicIntro(): Promise<void> {
        if (!this.selectedTopic) {
            console.log('No selected topic for intro generation');
            return;
        }
        
        console.log('Generating template-based intro for:', this.selectedTopic.label);
        
        // Always use template-based generation for new article creation
        // This creates fillable templates rather than pre-filled content
        const leadVariations = this.getManualLeads(this.selectedTopic.label, this.selectedTopic.category as ArticleCategory);
        
        // Use the formal version as the "basic intro" template
        const basicIntro = leadVariations.formal;
        
        // Insert directly using the same method as snippet modal
        this.insertSelectedSnippet(basicIntro);
        
        console.log('Template-based intro inserted:', basicIntro);
    }
    
    private _handleEditorMoreOption(action: string): void {
        console.log('Editor more option selected:', action);
        // For now, just insert placeholder text
        const placeholders: Record<string, string> = {
            image: '[Image placeholder]',
            list: '\n• Item 1\n• Item 2\n• Item 3',
            table: '\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |',
            quote: '\n> Quote text here',
            citation: '[Citation needed]',
            infobox: '[Infobox placeholder]'
        };
        
        const placeholder = placeholders[action] || `[${action}]`;
        
        // Insert at current cursor position or append to content
        const currentContent = this.articleContent.innerHTML;
        this.articleContent.innerHTML = currentContent + placeholder;
        
        // Focus back to content
        this.articleContent.focus();
    }

    private closeSnippetModal(): void {
        this.snippetModal.style.display = 'none';
    }


    private initializeToolbarIcons(): void {
        // Inject inline SVG icons into toolbar button icon spans
        const iconSize = 20;
        
        // Close button (string)
        const closeIconSpan = this.closeBtn.querySelector('.cdx-button__icon');
        if (closeIconSpan) {
            closeIconSpan.innerHTML =
                `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 20 20" aria-hidden="true">${cdxIconClose}</svg>`;
        }
        
        // Bold button (object with langCodeMap)
        const boldIconSpan = this.boldBtn.querySelector('.cdx-button__icon');
        if (boldIconSpan) {
            const boldPath = (cdxIconBold as any).langCodeMap?.en || (cdxIconBold as any).default;
            boldIconSpan.innerHTML =
                `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 20 20" aria-hidden="true">${boldPath}</svg>`;
        }
        
        // Italic button (object with langCodeMap)
        const italicIconSpan = this.italicBtn.querySelector('.cdx-button__icon');
        if (italicIconSpan) {
            const italicPath = (cdxIconItalic as any).langCodeMap?.en || (cdxIconItalic as any).default;
            italicIconSpan.innerHTML =
                `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 20 20" aria-hidden="true">${italicPath}</svg>`;
        }
        
        // Link button (string)
        const linkIconSpan = this.linkBtn.querySelector('.cdx-button__icon');
        if (linkIconSpan) {
            linkIconSpan.innerHTML =
                `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 20 20" aria-hidden="true">${cdxIconLink}</svg>`;
        }
        
        // Undo button (object with ltr property)
        const undoIconSpan = this.undoBtn.querySelector('.cdx-button__icon');
        if (undoIconSpan) {
            const undoPath = (cdxIconUndo as any).ltr;
            undoIconSpan.innerHTML =
                `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 20 20" aria-hidden="true">${undoPath}</svg>`;
        }
        
        // More (ellipsis) button (string)
        const moreIconSpan = this.moreBtn.querySelector('.cdx-button__icon');
        if (moreIconSpan) {
            moreIconSpan.innerHTML =
                `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 20 20" aria-hidden="true">${cdxIconEllipsis}</svg>`;
        }
        
        // Next button (object with ltr property)
        const nextIconSpan = this.nextBtn.querySelector('.cdx-button__icon');
        if (nextIconSpan) {
            const nextPath = (cdxIconNext as any).ltr;
            nextIconSpan.innerHTML =
                `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 20 20" aria-hidden="true">${nextPath}</svg>`;
        }
    }
    
    // Reference Dialog Methods
    private openReferenceDialog(): void {
        this.referenceDialog.style.display = 'flex';
        this.referenceUrlInput.focus();
        this.setupReferenceDialogEventListeners();
        
        // Set today's date as default access date
        const today = new Date().toISOString().split('T')[0];
        this.referenceAccessInput.value = today;
    }
    
    private closeReferenceDialog(): void {
        this.referenceDialog.style.display = 'none';
        this.resetReferenceDialog();
    }
    
    private resetReferenceDialog(): void {
        this.referenceForm.reset();
        this.referencePreview.style.display = 'none';
        this.referenceLoading.style.display = 'none';
        this.referenceError.style.display = 'none';
        this.referenceAccessField.style.display = 'none';
        this.referenceInsertBtn.disabled = true;
    }
    
    private setupReferenceDialogEventListeners(): void {
        // Remove existing listeners to prevent duplicates
        this.referenceCancelBtn.removeEventListener('click', this.closeReferenceDialog);
        this.referenceInsertBtn.removeEventListener('click', this.insertReference);
        this.referenceUrlInput.removeEventListener('input', this.validateReference);
        
        // Add listeners
        this.referenceCancelBtn.addEventListener('click', () => this.closeReferenceDialog());
        this.referenceInsertBtn.addEventListener('click', () => this.insertReference());
        this.referenceUrlInput.addEventListener('input', () => this.validateReference());
        
        // Close dialog when clicking outside
        this.referenceDialog.addEventListener('click', (e) => {
            if (e.target === this.referenceDialog) {
                this.closeReferenceDialog();
            }
        });
    }
    
    private async validateReference(): Promise<void> {
        const url = this.referenceUrlInput.value.trim();
        
        if (!url) {
            this.referencePreview.style.display = 'none';
            this.referenceInsertBtn.disabled = true;
            this.referenceError.style.display = 'none';
            return;
        }
        
        this.referenceLoading.style.display = 'flex';
        this.referenceError.style.display = 'none';
        this.referencePreview.style.display = 'none';
        
        try {
            // Simulate validation delay (replace with actual validation)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            let referenceData;
            
            if (this.isValidUrl(url)) {
                // Handle URL reference
                referenceData = await this.fetchUrlMetadata(url);
                this.referenceAccessField.style.display = 'block';
            } else {
                // Handle article title reference
                referenceData = this.createTitleReference(url);
                this.referenceAccessField.style.display = 'none';
            }
            
            this.showReferencePreview(referenceData);
            this.referenceInsertBtn.disabled = false;
            
        } catch (error) {
            this.showReferenceError('Unable to validate reference. Please check the URL or article title.');
            this.referenceInsertBtn.disabled = true;
        } finally {
            this.referenceLoading.style.display = 'none';
        }
    }
    
    private isValidUrl(string: string): boolean {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    private async fetchUrlMetadata(url: string): Promise<any> {
        // Simulate URL metadata fetching (replace with actual implementation)
        return new Promise((resolve) => {
            setTimeout(() => {
                const domain = new URL(url).hostname;
                resolve({
                    type: 'web',
                    title: `Article from ${domain}`,
                    url: url,
                    domain: domain,
                    accessDate: this.referenceAccessInput.value
                });
            }, 500);
        });
    }
    
    private createTitleReference(title: string): any {
        return {
            type: 'article',
            title: title,
            accessDate: null
        };
    }
    
    private showReferencePreview(data: any): void {
        let previewHtml = '';
        
        if (data.type === 'web') {
            previewHtml = `
                <strong>${data.title}</strong><br>
                <em>${data.domain}</em><br>
                ${data.accessDate ? `Retrieved ${data.accessDate}` : ''}
            `;
        } else {
            previewHtml = `<strong>${data.title}</strong>`;
        }
        
        this.referencePreviewContent.innerHTML = previewHtml;
        this.referencePreview.style.display = 'block';
    }
    
    private showReferenceError(message: string): void {
        this.referenceError.textContent = message;
        this.referenceError.style.display = 'block';
        this.referencePreview.style.display = 'none';
    }
    
    private insertReference(): void {
        const url = this.referenceUrlInput.value.trim();
        if (!url) return;
        
        // Increment reference count
        this.referenceCount++;
        
        // Create Wikipedia-style reference link
        const referenceLink = document.createElement('a');
        referenceLink.href = '#';
        referenceLink.className = 'wiki-reference';
        referenceLink.textContent = `[${this.referenceCount}]`;
        referenceLink.title = url;
        
        // Find the reference chip and replace it with the reference link
        const referenceChips = this.articleContent.querySelectorAll('[data-detail="reference"]');
        if (referenceChips.length > 0) {
            const referenceChip = referenceChips[0] as HTMLElement;
            referenceChip.parentNode?.replaceChild(referenceLink, referenceChip);
        }
        
        this.closeReferenceDialog();
        
        console.log(`Inserted reference [${this.referenceCount}] for: ${url}`);
    }
    
    // Add from Link Dialog Methods
    private openAddLinkDialog(): void {
        this.addLinkDialog.style.display = 'flex';
        this.resetAddLinkDialog();
        this.addLinkUrlInput.focus();
        this.setupAddLinkEventListeners();
    }
    
    private closeAddLinkDialog(): void {
        this.addLinkDialog.style.display = 'none';
        this.resetAddLinkDialog();
    }
    
    private resetAddLinkDialog(): void {
        // Reset to step 1
        this.addLinkStep1.style.display = 'block';
        this.addLinkStep2.style.display = 'none';
        this.addLinkStep3.style.display = 'none';
        
        // Clear inputs
        this.addLinkUrlInput.value = '';
        this.addLinkQuestion.value = '';
        
        // Reset buttons
        this.addLinkSubmitUrl.disabled = true;
        this.addLinkNextBtn.style.display = 'none';
        this.addLinkInsertBtn.style.display = 'none';
        
        // Hide loading and error states
        this.addLinkLoading.style.display = 'none';
        this.addLinkError.style.display = 'none';
        
        // Clear content
        this.addLinkSuggestions.innerHTML = '';
        this.addLinkPreview.innerHTML = '';
        this.currentExtractedContent = null;
    }
    
    private setupAddLinkEventListeners(): void {
        // URL input validation
        this.addLinkUrlInput.addEventListener('input', () => {
            const url = this.addLinkUrlInput.value.trim();
            this.addLinkSubmitUrl.disabled = !this.isValidUrl(url);
        });
        
        // Submit URL button
        this.addLinkSubmitUrl.addEventListener('click', () => {
            this.extractContentFromUrl();
        });
        
        // Cancel button
        this.addLinkCancelBtn.addEventListener('click', () => {
            this.closeAddLinkDialog();
        });
        
        // Next button (Step 2 -> Step 3)
        this.addLinkNextBtn.addEventListener('click', () => {
            this.generateContentFromQuestion();
        });
        
        // Insert button
        this.addLinkInsertBtn.addEventListener('click', () => {
            this.insertGeneratedContent();
        });
        
        // Question input
        this.addLinkQuestion.addEventListener('input', () => {
            const hasQuestion = this.addLinkQuestion.value.trim().length > 0;
            this.addLinkNextBtn.style.display = hasQuestion ? 'block' : 'none';
        });
        
        // Close dialog when clicking outside
        this.addLinkDialog.addEventListener('click', (e) => {
            if (e.target === this.addLinkDialog) {
                this.closeAddLinkDialog();
            }
        });
        
        // Enter key handling
        this.addLinkUrlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !this.addLinkSubmitUrl.disabled) {
                this.extractContentFromUrl();
            }
        });
    }
    
    private async extractContentFromUrl(): Promise<void> {
        const url = this.addLinkUrlInput.value.trim();
        if (!url) return;
        
        this.addLinkLoading.style.display = 'flex';
        this.addLinkError.style.display = 'none';
        
        try {
            // Simulate content extraction (replace with actual implementation)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const domain = new URL(url).hostname;
            this.currentExtractedContent = {
                url: url,
                title: `Research Article from ${domain}`,
                domain: domain,
                content: `This article discusses important findings related to ${this.selectedTopic?.label || 'the topic'}. The research provides valuable insights that could enhance understanding of the subject matter.`,
                suggestions: [
                    'Who made the discovery?',
                    'What was the research method?',
                    'When was this discovery made?',
                    'What are the implications?'
                ]
            };
            
            this.showExtractedContent();
            
        } catch (error) {
            this.showAddLinkError('Unable to extract content from the provided URL. Please check the URL and try again.');
        } finally {
            this.addLinkLoading.style.display = 'none';
        }
    }
    
    private showExtractedContent(): void {
        if (!this.currentExtractedContent) return;
        
        // Move to step 2
        this.addLinkStep1.style.display = 'none';
        this.addLinkStep2.style.display = 'block';
        
        // Show source info
        this.addLinkSourceTitle.textContent = this.currentExtractedContent.title;
        this.addLinkSourceDomain.textContent = this.currentExtractedContent.domain;
        
        // Populate suggestions
        this.addLinkSuggestions.innerHTML = '';
        this.currentExtractedContent.suggestions.forEach((suggestion: string) => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'add-link-dialog__suggestion-item';
            suggestionItem.innerHTML = `
                <div class="add-link-dialog__suggestion-icon">🔍</div>
                <div class="add-link-dialog__suggestion-text">${suggestion}</div>
            `;
            
            suggestionItem.addEventListener('click', () => {
                // Remove selected class from all suggestions
                this.addLinkSuggestions.querySelectorAll('.add-link-dialog__suggestion-item').forEach(item => {
                    item.classList.remove('selected');
                });
                
                // Add selected class to clicked suggestion
                suggestionItem.classList.add('selected');
                
                // Set the question input
                this.addLinkQuestion.value = suggestion;
                this.addLinkNextBtn.style.display = 'block';
            });
            
            this.addLinkSuggestions.appendChild(suggestionItem);
        });
    }
    
    private async generateContentFromQuestion(): Promise<void> {
        const question = this.addLinkQuestion.value.trim();
        if (!question || !this.currentExtractedContent) return;
        
        this.addLinkLoading.style.display = 'flex';
        
        try {
            // Simulate AI content generation (replace with actual implementation)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Generate Wikipedia-style content based on question
            let generatedContent = '';
            
            if (question.toLowerCase().includes('who made') || question.toLowerCase().includes('discovery')) {
                generatedContent = `According to research published on ${this.currentExtractedContent.domain}, recent discoveries have provided new insights into ${this.selectedTopic?.label || 'the subject'}. The findings suggest that previous understanding may need to be revised in light of these new observations.`;
            } else if (question.toLowerCase().includes('method') || question.toLowerCase().includes('how')) {
                generatedContent = `Research methodology described in the ${this.currentExtractedContent.domain} publication indicates that advanced techniques were employed to analyze ${this.selectedTopic?.label || 'the subject'}. The study utilized both theoretical frameworks and empirical data to reach its conclusions.`;
            } else if (question.toLowerCase().includes('when') || question.toLowerCase().includes('date')) {
                generatedContent = `Recent studies published on ${this.currentExtractedContent.domain} have established a timeline for events related to ${this.selectedTopic?.label || 'the subject'}. This chronological framework helps researchers better understand the sequence of developments.`;
            } else {
                generatedContent = `Research from ${this.currentExtractedContent.domain} provides valuable context for understanding ${this.selectedTopic?.label || 'the subject'}. The study's findings contribute to the broader academic discourse and offer new perspectives on the topic.`;
            }
            
            // Add reference
            generatedContent += ` [${this.referenceCount + 1}]`;
            
            this.showGeneratedContent(generatedContent);
            
        } catch (error) {
            this.showAddLinkError('Unable to generate content. Please try again.');
        } finally {
            this.addLinkLoading.style.display = 'none';
        }
    }
    
    private showGeneratedContent(content: string): void {
        // Move to step 3
        this.addLinkStep2.style.display = 'none';
        this.addLinkStep3.style.display = 'block';
        
        // Show generated content
        this.addLinkPreview.innerHTML = content;
        
        // Show insert button
        this.addLinkInsertBtn.style.display = 'block';
        this.addLinkNextBtn.style.display = 'none';
    }
    
    private insertGeneratedContent(): void {
        if (!this.currentExtractedContent) return;
        
        const generatedContent = this.addLinkPreview.textContent || '';
        if (!generatedContent) return;
        
        // Increment reference count for the citation
        this.referenceCount++;
        
        // Add the generated paragraph to the article
        const paragraphElement = document.createElement('p');
        paragraphElement.innerHTML = generatedContent.replace(`[${this.referenceCount}]`, `<a href="#" class="wiki-reference" title="${this.currentExtractedContent.url}">[${this.referenceCount}]</a>`);
        
        // Insert after the current content
        this.articleContent.appendChild(paragraphElement);
        
        this.closeAddLinkDialog();
        
        console.log(`Inserted generated content with reference [${this.referenceCount}] from: ${this.currentExtractedContent.url}`);
    }
    
    private showAddLinkError(message: string): void {
        this.addLinkError.textContent = message;
        this.addLinkError.style.display = 'block';
    }
}

// Initialize the application
new HTMLArticleCreator();