// ABOUTME: Main HTML-based article creator application entry point
// ABOUTME: Manages workflow state, input handling, and component interactions

import { WikidataService } from './WikidataService';
import { CategoryMapper, ArticleCategory } from './CategoryMapper';
import { TopicSelection } from './types/workflow';
import { LeadTemplateEngine } from './LeadTemplateEngine';
import { IntelligentTemplateEngine } from './IntelligentTemplateEngine';
import { IntelligentSectionEngine } from './IntelligentSectionEngine';
import { IntelligentContentGenerator } from './IntelligentContentGenerator';
import { WikipediaLinkService, LinkSuggestion } from './WikipediaLinkService';
// import { SnippetModal } from './SnippetModal';
import {
    cdxIconAdd,
    cdxIconBold,
    cdxIconItalic,
    cdxIconLink,
    cdxIconUndo,
    cdxIconEllipsis,
    cdxIconClose,
    cdxIconNext,
    cdxIconPrevious
} from '@wikimedia/codex-icons';

enum WorkflowState {
    INPUT = 'input',
    CATEGORY_SELECTION = 'category-selection',
    ARTICLE_CREATION = 'article-creation',
    ARTICLE_EDITING = 'article-editing'
}

class HTMLArticleCreator {
    private currentState: WorkflowState = WorkflowState.INPUT;
    private searchTerm: string = '';
    private selectedTopic: TopicSelection | null = null;

    // DOM elements
    private titleInput!: HTMLInputElement;
    private inputSection!: HTMLElement;
    private categorySection!: HTMLElement;
    private creationSection!: HTMLElement;
    private editingSection!: HTMLElement;
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
    private contentGenerator!: IntelligentContentGenerator;
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
    // Link detection properties
    private currentLinkSuggestions: LinkSuggestion[] = [];
    private isLinkDetectionActive: boolean = false;

    constructor() {
        this.leadEngine = new LeadTemplateEngine(new WikidataService());
        this.intelligentEngine = new IntelligentTemplateEngine(new WikidataService());
        this.sectionEngine = new IntelligentSectionEngine(new WikidataService());
        this.contentGenerator = new IntelligentContentGenerator();
        
        this.initializeDOM();
        this.setupEventListeners();
        this.restoreState();

        // Expose a global handle for robustness/fallbacks
        try { (window as any).articleCreatorApp = this; } catch {}
    }

    private initializeDOM(): void {
        this.titleInput = document.getElementById('articleTitleInput') as HTMLInputElement;
        this.inputSection = document.querySelector('.article-creator__input-section') as HTMLElement;
        this.categorySection = document.getElementById('categorySection') as HTMLElement;
        this.creationSection = document.getElementById('creationSection') as HTMLElement;
        this.editingSection = document.getElementById('editingSection') as HTMLElement;
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
            this.searchTerm = target.value.trim();
            this.saveState();
            
            if (this.searchTerm.length >= 3) {
                // Skip search, go directly to category selection
                this.showCategorySelection();
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

        // Formatting buttons
        this.boldBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.applyInlineFormat('bold');
        });
        this.italicBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.applyInlineFormat('italic');
        });
        this.undoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.applyUndo();
        });

        // Link button for manual Wikipedia link detection
        this.linkBtn.addEventListener('click', () => {
            this.detectLinksManually();
        });

        // Focus input on load
        this.titleInput.focus();
    }

    private getActiveEditable(): HTMLElement | null {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return null;
        const node = sel.anchorNode as Node | null;
        if (!node) return null;
        const el = (node.nodeType === 1 ? node as Element : node.parentElement) as HTMLElement | null;
        if (!el) return null;
        const editableRoot = el.closest('[contenteditable="true"]') as HTMLElement | null;
        return editableRoot;
    }

    private applyInlineFormat(command: 'bold' | 'italic'): void {
        // Ensure focus is within an editable region (title or body)
        const target = this.getActiveEditable() || this.articleContent || this.articleTitleText;
        if (target) target.focus();
        try {
            // Prefer execCommand for quick prototype formatting
            document.execCommand(command);
        } catch (e) {
            // Fallback: wrap selection
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;
            const range = sel.getRangeAt(0);
            const wrapper = document.createElement(command === 'bold' ? 'strong' : 'em');
            wrapper.appendChild(range.extractContents());
            range.insertNode(wrapper);
            sel.removeAllRanges();
            range.selectNodeContents(wrapper);
            sel.addRange(range);
        }
    }

    private applyUndo(): void {
        try {
            if (!document.execCommand('undo')) {
                // If execCommand is unavailable, rely on browser native undo via keybinding
                // no-op fallback
            }
        } catch {
            // no-op
        }
    }


    private showCategorySelection(): void {
        this.setState(WorkflowState.CATEGORY_SELECTION);
        this.categoryTitle.textContent = `What is ${this.searchTerm}?`;
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
        
        // Set up link detection for this editing session
        // Link detection will be manual via link button
        
        // Prepare title and body for a typical editing flow
        const titleEl = this.articleTitleText as HTMLElement;
        titleEl.setAttribute('contenteditable', 'true');
        titleEl.textContent = this.searchTerm;
        // Set contextual placeholder for the body
        const topic = this.searchTerm || (this.selectedTopic?.label ?? '');
        this.articleContent.setAttribute('data-placeholder', `${topic} is ...`);
        // Focus the body and place the caret at the beginning so the ghost placeholder remains visible
        this.articleContent.focus();
        const placeCaretAtStart = () => {
            try {
                // Ensure truly empty so :empty placeholder renders in all browsers
                this.articleContent.innerHTML = '';
                const range = document.createRange();
                range.selectNodeContents(this.articleContent);
                range.collapse(true);
                const sel = window.getSelection();
                if (sel) {
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            } catch {}
        };
        placeCaretAtStart();
        setTimeout(placeCaretAtStart, 0);
        // Removed confidence badge - focusing on cleaner UX with interactive chips
    }

    private exitArticleEditor(): void {
        // Hide the global toolbar and remove editing class
        this.globalToolbar.style.display = 'none';
        document.querySelector('.article-creator')?.classList.remove('article-creator--editing');
        // Reset all state so user sees a clean title-entry screen
        this.searchTerm = '';
        this.selectedTopic = null;
        try { localStorage.removeItem('articleCreatorState'); } catch {}
        this.titleInput.value = '';
        // Go to input state
        this.setState(WorkflowState.INPUT);
        // Focus the title input with blinking caret in an empty field
        setTimeout(() => {
            this.titleInput.focus();
        }, 0);
    }

    private setupArticleEditor(): void {
        if (!this.selectedTopic) return;
        
        // Clear any existing article content when setting up editor
        this.articleContent.innerHTML = '';
        const articleTitle = this.searchTerm;
        this.articleContent.setAttribute('data-placeholder', `${articleTitle} is ...`);
        
        // Do not prefill body; user starts with contextual placeholder and chips
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
                // Insert a detailed, chip-filled template by default (no modal for simpler UX)
                this.insertBasicIntro();
                break;
            case 'fact':
                this.openAddLinkDialog();
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
        const referenceChip = `
            <span class="cdx-info-chip cdx-info-chip--notice cdx-chip--reference" data-detail="reference">
                <span class="cdx-info-chip__text">📎 Reference</span>
            </span>`;
        const moreChip = `
            <span class="cdx-info-chip cdx-info-chip--notice cdx-chip--more" data-detail="more">
                <span class="cdx-info-chip__text">… More</span>
            </span>`;
        
        // Wikipedia-inspired lead generation with + placeholder chips
        const chip = (detail: string, label: string) => `
            <span class="cdx-info-chip cdx-info-chip--notice cdx-placeholder-chip" data-detail="${detail}">
                <span class="cdx-info-chip__text">+ ${label}</span>
            </span>`;
        
        switch (category) {
            case ArticleCategory.LOCATION:
                // Pattern: India, officially the Republic of India, is a country in South Asia.
                return {
                    formal: `${title} is ${article} ${chip('location_type', 'type')} in ${chip('parent_location', 'location')}.`,
                    concise: `${title}: ${chip('location_type', 'type')} in ${chip('parent_location', 'location')}.`,
                    detailed: `${title}, officially ${chip('official_name', 'official name')}, is ${article} ${chip('location_type', 'type')} in ${chip('parent_location', 'location')}. It is the ${chip('size_rank', 'rank')} ${chip('location_type', 'type')} by ${chip('area', 'area')} and has a population of ${chip('population', 'population')}. ${chip('notable_feature', 'notable feature')}.`
                };
            case ArticleCategory.PERSON:
                // Pattern: Albert Einstein (14 March 1879 – 18 April 1955) was a German-born theoretical physicist
                return {
                    formal: `${title} (${chip('birth_death', 'dates')}) was ${article} ${chip('nationality', 'nationality')} ${chip('profession', 'profession')}.`,
                    concise: `${title}: ${chip('nationality', 'nationality')} ${chip('profession', 'profession')} (${chip('period', 'period')}).`,
                    detailed: `${title} (${chip('birth_death', 'birth-death dates')}) was ${article} ${chip('nationality', 'nationality')} ${chip('profession', 'profession')} who is best known for ${chip('known_for', 'achievement')}. ${chip('additional_contribution', 'additional contribution')}. ${chip('recognition', 'recognition or award')}.`
                };
            case ArticleCategory.SPECIES:
                // Pattern: The tiger (Panthera tigris) is a large cat and a member of the genus Panthera native to Asia
                return {
                    formal: `The ${title.toLowerCase()} (${chip('scientific_name', 'scientific name')}) is ${article} ${chip('classification', 'classification')} native to ${chip('native_region', 'region')}.`,
                    concise: `${title}: ${chip('classification', 'type')} from ${chip('native_region', 'region')}.`,
                    detailed: `The ${title.toLowerCase()} (${chip('scientific_name', 'scientific name')}) is ${article} ${chip('size_description', 'size')} ${chip('classification', 'classification')} and a member of the genus ${chip('genus', 'genus')} native to ${chip('native_region', 'region')}. It has ${chip('physical_description', 'physical features')} and ${chip('behavior', 'behavior')}. ${chip('habitat', 'habitat')}.`
                };
            case ArticleCategory.ORGANIZATION:
                // Pattern: Microsoft Corporation is an American multinational corporation and technology company
                return {
                    formal: `${title} is ${article} ${chip('nationality', 'nationality')} ${chip('org_type', 'organization type')} founded in ${chip('founding_year', 'year')}.`,
                    concise: `${title}: ${chip('org_type', 'type')} founded in ${chip('founding_year', 'year')}.`,
                    detailed: `${title} is ${article} ${chip('nationality', 'nationality')} ${chip('org_type', 'organization type')} and ${chip('industry', 'industry')} headquartered in ${chip('headquarters', 'location')}. Founded in ${chip('founding_year', 'year')}, the company ${chip('primary_business', 'primary business')}. ${chip('current_status', 'current status')}.`
                };
            case ArticleCategory.EVENT:
                // Pattern: World War II was a global conflict between two coalitions: the Allies and the Axis powers
                return {
                    formal: `${title} was ${article} ${chip('event_type', 'event type')} that occurred ${chip('time_period', 'time period')}.`,
                    concise: `${title}: ${chip('event_type', 'type')} (${chip('dates', 'dates')}).`,
                    detailed: `${title} (${chip('dates', 'dates')}) was ${article} ${chip('scope', 'scope')} ${chip('event_type', 'event type')} between ${chip('participants', 'participants')}. ${chip('significance', 'significance')}. ${chip('impact', 'impact')}.`
                };
            case ArticleCategory.CREATIVE_WORK:
                return {
                    formal: `${title} is ${article} ${chip('work_type', 'work type')} by ${chip('creator', 'creator')} published in ${chip('year', 'year')}.`,
                    concise: `${title}: ${chip('work_type', 'type')} by ${chip('creator', 'creator')} (${chip('year', 'year')}).`,
                    detailed: `${title} is ${article} ${chip('work_type', 'work type')} created by ${chip('creator', 'creator')} and ${chip('publication_info', 'publication info')} in ${chip('year', 'year')}. ${chip('theme', 'theme')}. ${chip('reception', 'reception')}.`
                };
            case ArticleCategory.CONCEPT:
                return {
                    formal: `${title} is ${article} ${chip('concept_type', 'concept type')} in ${chip('field', 'field')}.`,
                    concise: `${title}: ${chip('concept_type', 'type')} in ${chip('field', 'field')}.`,
                    detailed: `${title} is ${article} ${chip('concept_type', 'concept type')} in ${chip('field', 'field')} that ${chip('definition', 'definition')}. ${chip('development', 'development')}. ${chip('applications', 'applications')}.`
                };
            default:
                return {
                    formal: `${title} is ${article} ${chip('type', 'type')} ${chip('description', 'description')}.`,
                    concise: `${title}: ${chip('type', 'type')} ${chip('context', 'context')}.`,
                    detailed: `${title} is ${article} ${chip('type', 'type')} ${categoryDescription} ${chip('significance', 'significance')}. ${chip('details', 'additional details')}.`
                };
        }
    }
    
    private getContextualChips(contextualChips: string[]): Record<string, string> {
        const chip = (detail: string, label: string) => `
            <span class="cdx-info-chip cdx-info-chip--notice cdx-placeholder-chip" data-detail="${detail}">
                <span class="cdx-info-chip__text">+ ${label}</span>
            </span>`;
        
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
        const chip = (detail: string, label: string) => `
            <span class="cdx-info-chip cdx-info-chip--notice cdx-placeholder-chip" data-detail="${detail}">
                <span class="cdx-info-chip__text">+ ${label}</span>
            </span>`;
        
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

        // Always include a template option with fillable chips so users can easily complete details
        const chipTemplate = this.getManualLeads(
            this.selectedTopic.label,
            this.selectedTopic.category as ArticleCategory,
            contextualChips
        ).formal;

        const variations = [
            { type: 'Template', content: chipTemplate, description: 'Fill-in with chips' },
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
        const detailChips = this.articleContent.querySelectorAll('.detail-chip, .cdx-info-chip[data-detail]');
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
                // Check if mobile device
                if (this.isMobileDevice()) {
                    this.createMobileModal(chipElement, detailType, currentText, originalText, suggestions);
                } else {
                    // Create dropdown with suggestions for desktop
                    this.createIntelligentDropdown(chipElement, detailType, currentText, originalText, suggestions);
                }
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
        input.className = 'cdx-info-chip__input';
        input.placeholder = `Enter ${detailType}`;
        
        // Replace chip content with input
        chipElement.innerHTML = '';
        chipElement.appendChild(input);
        chipElement.classList.add('cdx-info-chip--editing');
        
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
                chipElement.innerHTML = `<span class="cdx-info-chip__text">${newValue}</span>`;
                chipElement.classList.add('cdx-info-chip--filled');
            } else {
                chipElement.innerHTML = `<span class="cdx-info-chip__text">${originalText}</span>`;
            }
            chipElement.classList.remove('cdx-info-chip--editing');
        };
        
        const cancelEdit = () => {
            chipElement.innerHTML = `<span class="cdx-info-chip__text">${originalText}</span>`;
            chipElement.classList.remove('cdx-info-chip--editing');
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
                    
                case 'official_name':
                    return ['the Republic of India', 'the State of California', 'the Kingdom of Thailand', 'the United States of America', 'the People\'s Republic of China'];
                
                case 'location_type':
                    return ['country', 'city', 'state', 'province', 'region', 'territory', 'municipality', 'district'];
                
                case 'parent_location':
                    return ['South Asia', 'Southeast Asia', 'Western Europe', 'North America', 'East Africa', 'the Mediterranean', 'the Pacific Ocean'];
                
                case 'size_rank':
                    return ['largest', 'second-largest', 'third-largest', 'seventh-largest', 'tenth-largest', 'most populous', 'smallest'];
                
                case 'area':
                    return ['area', 'land area', 'total area', 'surface area'];
                
                case 'population':
                    return ['1.4 billion', '330 million', '67 million', '83 million', '126 million', '25 million', '10 million'];
                
                case 'notable_feature':
                    return ['It is known for its diverse culture', 'It is famous for its historical landmarks', 'It is renowned for its natural beauty', 'It is celebrated for its cuisine', 'It is recognized for its economic development'];
                    
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
                'habitat_details': ['tropical forests', 'temperate forests', 'freshwater lakes', 'coastal areas', 'mountain regions', 'Custom...'],
                // Physical characteristics
                'size_category': ['small', 'medium-sized', 'large', 'very large', 'tiny', 'compact', 'Custom...'],
                'length_measurement': ['30-50 cm', '1-2 meters', '2-3 meters', '50-100 cm', '10-30 cm', 'Custom...'],
                'weight_range': ['1-5 kg', '10-25 kg', '25-50 kg', '50-100 kg', '100-200 kg', 'Custom...'],
                'sexual_dimorphism': ['pronounced sexual dimorphism', 'minimal sexual dimorphism', 'no sexual dimorphism', 'males larger than females', 'females larger than males', 'Custom...'],
                'size_difference': ['10-15% larger', '20-30% larger', '50% larger', 'twice the size', 'similar sizes', 'Custom...'],
                'primary_distinguishing_feature': ['prominent crest', 'distinctive coloration', 'long tail', 'large ears', 'powerful build', 'unique markings', 'Custom...'],
                'feature_function_1': ['defensive purposes', 'territorial display', 'mating ritual', 'heat regulation', 'camouflage', 'Custom...'],
                'feature_function_2': ['communication', 'navigation', 'protection', 'hunting', 'social bonding', 'Custom...'],
                'body_covering': ['thick fur', 'smooth scales', 'feathers', 'tough skin', 'protective shell', 'Custom...'],
                'protection_type': ['weather protection', 'predator defense', 'UV protection', 'thermal insulation', 'Custom...'],
                'adaptive_function': ['thermoregulation', 'water conservation', 'energy efficiency', 'sensory enhancement', 'Custom...'],
                'skull_features': ['elongated skull', 'reinforced cranium', 'specialized jaw structure', 'enlarged brain case', 'Custom...'],
                'sensory_organs': ['acute hearing', 'enhanced vision', 'sensitive smell', 'specialized touch receptors', 'Custom...'],
                'eye_description': ['large round eyes', 'forward-facing eyes', 'small beady eyes', 'compound eyes', 'Custom...'],
                'vision_type': ['excellent night vision', 'color vision', 'motion detection', 'depth perception', 'Custom...'],
                'lighting_conditions': ['bright daylight', 'low light conditions', 'complete darkness', 'underwater', 'Custom...'],
                'limb_structure': ['muscular limbs', 'elongated limbs', 'short sturdy limbs', 'flexible appendages', 'Custom...'],
                'extremity_features': ['sharp claws', 'webbed feet', 'opposable thumbs', 'suction cups', 'hooves', 'Custom...'],
                'locomotion_ability': ['rapid running', 'precise climbing', 'efficient swimming', 'sustained flight', 'Custom...'],
                'terrain_types': ['rocky surfaces', 'sandy terrain', 'muddy ground', 'tree branches', 'water surfaces', 'Custom...'],
                // Taxonomy and classification
                'taxonomic_classification': ['vertebrate species', 'invertebrate species', 'flowering plant', 'coniferous tree', 'Custom...'],
                'family_classification': ['Felidae family', 'Canidae family', 'Ursidae family', 'Corvidae family', 'Custom...'],
                'order_classification': ['Carnivora', 'Primates', 'Rodentia', 'Passeriformes', 'Lepidoptera', 'Custom...'],
                'discovery_year': ['1758', '1859', '1901', '1950', '1975', '2000', 'Custom...'],
                'describing_scientist': ['Carl Linnaeus', 'Charles Darwin', 'Alfred Wallace', 'John Smith', 'Custom...'],
                'type_locality': ['Madagascar', 'Amazon rainforest', 'Galápagos Islands', 'Australian Outback', 'Custom...'],
                'distinguishing_feature_1': ['unique coloration pattern', 'distinctive size', 'specialized appendages', 'unusual behavior', 'Custom...'],
                'distinguishing_feature_2': ['vocal characteristics', 'mating displays', 'feeding habits', 'seasonal changes', 'Custom...'],
                'distinguishing_feature_3': ['habitat preferences', 'social structure', 'reproductive cycle', 'migration patterns', 'Custom...'],
                'phenotypic_variation': ['significant color variation', 'size polymorphism', 'seasonal dimorphism', 'geographic variation', 'Custom...'],
                'subspecies_number': ['three recognized subspecies', 'five distinct populations', 'no subspecies', 'numerous local variants', 'Custom...'],
                // Ecology and behavior
                'ecological_role': ['apex predator', 'keystone species', 'pollinator', 'seed disperser', 'decomposer', 'Custom...'],
                'predator_role': ['top predator', 'secondary predator', 'opportunistic hunter', 'ambush predator', 'Custom...'],
                'prey_role': ['primary prey', 'occasional prey', 'rarely preyed upon', 'protected by defenses', 'Custom...'],
                'seasonal_behaviors': ['winter hibernation', 'spring migration', 'summer breeding', 'autumn feeding', 'Custom...'],
                'life_stages': ['juvenile development', 'adult maturity', 'elderly decline', 'metamorphosis stages', 'Custom...'],
                'feeding_classification': ['strict carnivore', 'herbivore', 'omnivore', 'insectivore', 'filter feeder', 'Custom...'],
                'primary_food_sources': ['small mammals', 'insects', 'fruits and seeds', 'aquatic plants', 'nectar', 'Custom...'],
                'secondary_diet': ['seasonal fruits', 'emergency protein sources', 'mineral supplements', 'occasional scavenging', 'Custom...'],
                'resource_scarcity': ['winter months', 'drought periods', 'territorial competition', 'climate changes', 'Custom...'],
                'social_organization': ['matriarchal groups', 'alpha-dominated packs', 'loose aggregations', 'solitary individuals', 'Custom...'],
                'group_size': ['small family units', 'large flocks', 'mated pairs', 'temporary gatherings', 'Custom...'],
                'group_composition': ['mixed-age groups', 'age-segregated clusters', 'breeding pairs only', 'female-dominated groups', 'Custom...'],
                'communication_methods': ['complex vocalizations', 'visual displays', 'chemical signals', 'tactile interactions', 'Custom...'],
                'communication_complexity': ['15+ distinct calls', '30+ vocalizations', 'simple sound repertoire', 'elaborate signal system', 'Custom...'],
                'call_functions': ['alarm calls', 'mating songs', 'territorial warnings', 'parent-offspring communication', 'Custom...'],
                'breeding_pattern': ['annual breeding cycle', 'biannual reproduction', 'opportunistic breeding', 'continuous reproduction', 'Custom...'],
                'breeding_season': ['spring months', 'late summer', 'dry season', 'year-round', 'Custom...'],
                'courtship_behavior': ['complex dances', 'vocal performances', 'gift presentations', 'territorial displays', 'Custom...'],
                'courtship_duration': ['several days', 'multiple weeks', 'brief encounters', 'extended seasons', 'Custom...'],
                'parental_strategy': ['biparental care', 'female-only care', 'male-only care', 'communal raising', 'Custom...'],
                'care_activities': ['nest building', 'food provisioning', 'protection duties', 'teaching behaviors', 'Custom...'],
                'care_duration': ['2-3 months', '6 months', 'one year', 'until independence', 'Custom...'],
                // Habitat details
                'primary_habitat': ['dense forests', 'open grasslands', 'wetland areas', 'rocky mountains', 'coastal regions', 'Custom...'],
                'geographic_distribution': ['widespread across continents', 'limited to specific regions', 'island populations', 'fragmented habitats', 'Custom...'],
                'habitat_types': ['diverse ecosystems', 'specialized niches', 'edge environments', 'transitional zones', 'Custom...'],
                'secondary_habitats': ['agricultural areas', 'urban parks', 'secondary forests', 'disturbed habitats', 'Custom...'],
                'vegetation_type': ['old-growth forests', 'deciduous woodlands', 'coniferous stands', 'mixed vegetation', 'Custom...'],
                'canopy_coverage': ['dense canopy (80-90%)', 'moderate coverage (50-70%)', 'open canopy (30-50%)', 'sparse coverage', 'Custom...'],
                'shelter_benefits': ['predator avoidance', 'weather protection', 'nesting sites', 'roosting locations', 'Custom...'],
                'resource_availability': ['year-round food sources', 'seasonal abundance', 'water access', 'nesting materials', 'Custom...'],
                'terrain_features': ['river valleys', 'steep slopes', 'plateau areas', 'cave systems', 'Custom...'],
                'landscape_elements': ['natural clearings', 'fallen logs', 'boulder fields', 'stream corridors', 'Custom...'],
                'seasonal_range_1': ['northern breeding areas', 'mountain highlands', 'tropical regions', 'coastal zones', 'Custom...'],
                'seasonal_range_2': ['southern wintering grounds', 'lowland areas', 'temperate zones', 'inland regions', 'Custom...'],
                'migration_distance': ['short local movements', 'medium-distance travel', 'transcontinental journeys', 'no migration', 'Custom...'],
                'climate_adaptations': ['temperature tolerance', 'drought resistance', 'flood adaptations', 'seasonal adjustments', 'Custom...'],
                'alternative_habitats': ['human-modified landscapes', 'protected reserves', 'restoration areas', 'corridor habitats', 'Custom...'],
                'elevation_changes': ['higher altitudes', 'lower elevations', 'sea level areas', 'mountain peaks', 'Custom...']
            }
        };
        
        return fallbacks[category]?.[detailType] || ['Custom...'];
    }

    private isMobileDevice(): boolean {
        return window.innerWidth <= 768 || 'ontouchstart' in window;
    }

    private createMobileModal(
        chipElement: HTMLElement,
        detailType: string,
        currentText: string,
        originalText: string,
        suggestions: string[]
    ): void {
        // Create mobile modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'mobile-chip-overlay';
        
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'mobile-chip-modal';
        
        // Modal header
        const header = document.createElement('div');
        header.className = 'mobile-chip-header';
        header.innerHTML = `
            <h3>${detailType.replace(/_/g, ' ')}</h3>
            <button class="mobile-chip-close">×</button>
        `;
        
        // Input section
        const inputSection = document.createElement('div');
        inputSection.className = 'mobile-chip-input-section';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'mobile-chip-input';
        input.placeholder = `Enter ${detailType.replace(/_/g, ' ')}`;
        
        inputSection.appendChild(input);
        
        // Suggestions section
        const suggestionsSection = document.createElement('div');
        suggestionsSection.className = 'mobile-chip-suggestions';
        
        const suggestionsTitle = document.createElement('h4');
        suggestionsTitle.textContent = 'Quick options:';
        suggestionsSection.appendChild(suggestionsTitle);
        
        suggestions.forEach(suggestion => {
            const suggestionBtn = document.createElement('button');
            suggestionBtn.className = 'mobile-chip-suggestion';
            suggestionBtn.textContent = suggestion;
            suggestionBtn.addEventListener('click', () => {
                input.value = suggestion;
            });
            suggestionsSection.appendChild(suggestionBtn);
        });
        
        // Action buttons
        const actions = document.createElement('div');
        actions.className = 'mobile-chip-actions';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'mobile-chip-cancel';
        cancelBtn.textContent = 'Cancel';
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'mobile-chip-save';
        saveBtn.textContent = 'Save';
        
        actions.appendChild(cancelBtn);
        actions.appendChild(saveBtn);
        
        // Assemble modal
        modal.appendChild(header);
        modal.appendChild(inputSection);
        modal.appendChild(suggestionsSection);
        modal.appendChild(actions);
        overlay.appendChild(modal);
        
        // Add event listeners
        const closeModal = () => {
            document.body.removeChild(overlay);
            document.body.style.overflow = '';
        };
        
        const saveValue = () => {
            const value = input.value.trim();
            if (value) {
                chipElement.textContent = value;
                chipElement.classList.remove('detail-chip--placeholder');
            }
            closeModal();
        };
        
        header.querySelector('.mobile-chip-close')?.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        saveBtn.addEventListener('click', saveValue);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
        
        // Focus input and show modal
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden'; // Prevent background scroll
        input.focus();
        input.select();
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
        
        // Create inline expandable section (only "Add a new section" with cards)
        moreSection = document.createElement('div');
        moreSection.id = 'editorMoreSection';
        moreSection.className = 'editor-more-section';
        moreSection.innerHTML = `
            <div class="editor-more-subsection">
                <h3 class="editor-more-subsection__title">Add a new section</h3>
                <div id="intelligentSectionsContainer">
                    <!-- Intelligent sections will be populated here -->
                </div>
            </div>
        `;
        
        // Add click handlers to any cards that get rendered (intelligent sections)
        const bindCardHandlers = () => {
            const cards = moreSection.querySelectorAll('.editor-more-card');
            cards.forEach(card => {
                card.addEventListener('click', () => {
                    const action = card.getAttribute('data-action') || '';
                    this.handleEditorMoreCardClick(action);
                });
            });
        };
        
        // Insert after the chips container
        editorChipsContainer.parentNode?.insertBefore(moreSection, editorChipsContainer.nextSibling);
        
        // Populate intelligent sections and then bind handlers
        this.populateIntelligentSections().then(() => bindCardHandlers());
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
            
            // Convert TopicSelection to WikidataTopic format
            const wikidataTopic = {
                id: this.selectedTopic.wikidataId || '',
                title: this.selectedTopic.label,
                description: this.selectedTopic.description,
                category: this.selectedTopic.category,
                instanceOf: [] as string[]
            };
            
            const sectionSuggestions = await this.sectionEngine.getSuggestedSections(wikidataTopic, category);
            
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
            const category = this.selectedTopic?.category as ArticleCategory;
            console.log('Generating section content for:', section.title, 'category:', category);
            
            if (!this.selectedTopic) {
                throw new Error('No selected topic available');
            }
            
            console.log('DEBUG: selectedTopic structure:', this.selectedTopic);
            
            // Convert TopicSelection to WikidataTopic format
            const wikidataTopic = {
                id: this.selectedTopic.wikidataId || '',
                title: this.selectedTopic.label,
                description: this.selectedTopic.description,
                category: this.selectedTopic.category,
                instanceOf: [] as string[]
            };
            console.log('DEBUG: Topic title:', wikidataTopic.title);
            
            const sectionContent = await this.sectionEngine.generateSectionContent(section, wikidataTopic, category);
            console.log('Generated section content:', sectionContent);
            
            // Ensure we have content with chips, not empty/undefined
            const finalContent = sectionContent && sectionContent.trim() ? 
                sectionContent : 
                await this.createFallbackSectionWithChips(section.title);
            
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
            const chipContent = await this.createFallbackSectionWithChips(section.title);
            this.insertSectionWithFormatting(section.title, chipContent);
            this.closeEditorMoreSection();
            this.articleContent.focus();
        }
    }

    private async createFallbackSectionWithChips(sectionTitle: string): Promise<string> {
        // Create intelligent fallback content with chips based on section type
        const lowerTitle = sectionTitle.toLowerCase();
        console.log('Creating intelligent fallback section for:', sectionTitle, 'lowercased:', lowerTitle);
        
        // Get the entity name and category from the current topic
        const entityName = this.selectedTopic?.label || 'entity';
        const category = this.selectedTopic?.category as ArticleCategory || ArticleCategory.PERSON;
        
        // Create a mock topic for content generation
        const mockTopic = {
            id: '',
            title: entityName,
            label: entityName,
            description: this.getCategoryContextualDescription(category, entityName),
            category: this.selectedTopic?.category || 'person',
            instanceOf: [] as string[]
        };

        try {
            // Generate intelligent content suggestions
            const suggestions = await this.contentGenerator.generateContentSuggestions(
                mockTopic,
                category,
                lowerTitle
            );

            // Get contextual entity name instead of generic "Entity name"
            const entityChip = this.getIntelligentEntityChip(entityName, category);
            
            // Early Life & Education
            if (lowerTitle.includes('early life') || lowerTitle.includes('education') || lowerTitle.includes('childhood') || lowerTitle.includes('youth')) {
                return `${entityChip} was born <span class="detail-chip" data-detail="birth_date">birth date</span> in <span class="detail-chip" data-detail="birth_place">birth place</span>. <span class="detail-chip" data-detail="family_background">Family background</span> and <span class="detail-chip" data-detail="early_education">early education</span> shaped their development.`;
            } 
            // Career & Research  
            else if (lowerTitle.includes('career') || lowerTitle.includes('research') || lowerTitle.includes('work') || lowerTitle.includes('profession')) {
                return `${entityChip} began their career at <span class="detail-chip" data-detail="career_start_institution">institution</span> in <span class="detail-chip" data-detail="career_start_year">year</span>. Their work focused on <span class="detail-chip" data-detail="primary_research">research area</span> and <span class="detail-chip" data-detail="major_contributions">key contributions</span>.`;
            }
            // Political Career
            else if (lowerTitle.includes('political') || lowerTitle.includes('government') || lowerTitle.includes('office') || lowerTitle.includes('leadership')) {
                return `${entityChip} entered politics in <span class="detail-chip" data-detail="political_start_year">year</span> as <span class="detail-chip" data-detail="first_office">first position</span>. They later served as <span class="detail-chip" data-detail="major_offices">major positions</span> and achieved <span class="detail-chip" data-detail="political_achievements">key accomplishments</span>.`;
            }
            // Personal Life
            else if (lowerTitle.includes('personal') || lowerTitle.includes('family') || lowerTitle.includes('private')) {
                return `${entityChip} married <span class="detail-chip" data-detail="spouse_name">spouse</span> in <span class="detail-chip" data-detail="marriage_year">year</span>. They have <span class="detail-chip" data-detail="children_details">children information</span> and <span class="detail-chip" data-detail="personal_interests">personal interests</span>.`;
            }
            // Legacy & Death
            else if (lowerTitle.includes('legacy') || lowerTitle.includes('death') || lowerTitle.includes('later life') || lowerTitle.includes('impact')) {
                return `${entityChip} passed away <span class="detail-chip" data-detail="death_date">date</span> in <span class="detail-chip" data-detail="death_place">place</span>. Their legacy includes <span class="detail-chip" data-detail="lasting_impact">lasting contributions</span> and <span class="detail-chip" data-detail="commemorations">commemorations</span>.`;
            }
            // Awards & Recognition
            else if (lowerTitle.includes('awards') || lowerTitle.includes('recognition') || lowerTitle.includes('honors') || lowerTitle.includes('achievements')) {
                return `${entityChip} received <span class="detail-chip" data-detail="major_awards">major awards</span> including <span class="detail-chip" data-detail="prestigious_honors">prestigious honors</span>. Their work was recognized by <span class="detail-chip" data-detail="recognition_institutions">institutions</span> and <span class="detail-chip" data-detail="peer_recognition">peers</span>.`;
            }
            // Publications & Works
            else if (lowerTitle.includes('publications') || lowerTitle.includes('works') || lowerTitle.includes('writings') || lowerTitle.includes('books')) {
                return `${entityChip} published <span class="detail-chip" data-detail="major_publications">major works</span> including <span class="detail-chip" data-detail="notable_books">notable books</span>. Their <span class="detail-chip" data-detail="publication_themes">key themes</span> influenced <span class="detail-chip" data-detail="field_impact">field impact</span>.`;
            }
            // Generic fallback - but make it contextual
            else {
                console.log('Using intelligent generic fallback for section:', sectionTitle);
                return `${entityChip} <span class="detail-chip" data-detail="section_context">section context</span>. <span class="detail-chip" data-detail="key_information">Key information</span> about <span class="detail-chip" data-detail="specific_details">specific details</span> and <span class="detail-chip" data-detail="relevant_facts">relevant facts</span>.`;
            }
        } catch (error) {
            console.error('Error generating intelligent section content:', error);
            // Fallback to simple entity name
            const simpleEntityChip = `<span class="detail-chip" data-detail="entity_name">${entityName}</span>`;
            return `${simpleEntityChip} <span class="detail-chip" data-detail="section_context">section context</span>. <span class="detail-chip" data-detail="key_information">Key information</span> about <span class="detail-chip" data-detail="specific_details">specific details</span> and <span class="detail-chip" data-detail="relevant_facts">relevant facts</span>.`;
        }
    }

    private getIntelligentEntityChip(entityName: string, category: ArticleCategory): string {
        // Generate contextual entity chip instead of generic "Entity name"
        const chipText = this.generateContextualEntityName(entityName, category);
        return `<span class="detail-chip" data-detail="entity_name">${chipText}</span>`;
    }

    private generateContextualEntityName(entityName: string, category: ArticleCategory): string {
        // For fictional/unknown entities, create contextual descriptions
        switch (category) {
            case ArticleCategory.SPECIES:
                if (entityName.toLowerCase().includes('saurus')) {
                    return `The ${entityName}`;
                } else if (entityName.toLowerCase().includes('bird') || entityName.toLowerCase().includes('fly')) {
                    return `The ${entityName}`;
                } else {
                    return `**${entityName}**`;
                }
            case ArticleCategory.PERSON:
                return `**${entityName}**`;
            case ArticleCategory.LOCATION:
                return `**${entityName}**`;
            default:
                return `**${entityName}**`;
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
        
        // Assemble section - add heading first
        sectionElement.appendChild(heading);
        
        // Process content to handle multiple paragraphs
        const paragraphs = sectionContent.split('\n\n').filter(p => p.trim().length > 0);
        
        // Create multiple paragraph elements for better formatting
        paragraphs.forEach(paragraphText => {
            const contentParagraph = document.createElement('p');
            contentParagraph.className = 'article-section__content';
            contentParagraph.innerHTML = paragraphText.trim();
            sectionElement.appendChild(contentParagraph);
        });
        
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
        
        console.log('Generating intelligent intro for:', this.selectedTopic.label);
        
        // Use improved Wikipedia-style manual templates (they're better than the intelligent engine now)
        const manual = this.getManualLeads(
            this.selectedTopic.label,
            this.selectedTopic.category as ArticleCategory
        ).detailed;
        this.insertSelectedSnippet(manual);
        console.log('Wikipedia-style template intro inserted');
    }

    private chipifyPlaceholders(text: string): string {
        try {
            // Convert occurrences of "+ label" into Codex chips
            return text.replace(/\+\s([A-Za-z][A-Za-z _-]+)/g, (_m, label) => {
                const key = String(label).toLowerCase().trim().replace(/\s+/g, '_');
                return `
                    <span class="cdx-info-chip cdx-info-chip--notice cdx-placeholder-chip" data-detail="${key}">
                        <span class="cdx-info-chip__text">+ ${label}</span>
                    </span>`;
            });
        } catch {
            return text;
        }
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
    
    // Wikipedia Link Detection Methods
    // Manual Wikipedia Link Detection triggered by link button
    private detectLinksManually(): void {
        if (this.isLinkDetectionActive) return;
        
        // Clear any existing suggestions first
        this.clearLinkSuggestions();
        
        // Check if there's content to analyze
        const textContent = this.getTextContentForLinkDetection();
        if (!textContent || textContent.length < 20) {
            this.showLinkDetectionMessage('No content available for link detection. Please add some text first.');
            return;
        }
        
        // Show detection is happening
        this.showLinkDetectionMessage('Scanning for potential Wikipedia links...');
        this.detectAndShowLinkSuggestions();
    }
    
    private showLinkDetectionMessage(message: string): void {
        // Create a temporary message element
        const messageElement = document.createElement('div');
        messageElement.className = 'link-detection-message';
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #3366cc;
            color: white;
            padding: 12px 16px;
            border-radius: 4px;
            font-size: 0.875rem;
            z-index: 1006;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        `;
        
        document.body.appendChild(messageElement);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 3000);
    }
    
    
    private async detectAndShowLinkSuggestions(): Promise<void> {
        if (this.isLinkDetectionActive) return;
        
        // Get current text content excluding existing links and chips
        const textContent = this.getTextContentForLinkDetection();
        
        if (!textContent || textContent.length < 20) return;
        
        // Don't detect links if we already have potential links showing
        if (this.articleContent.querySelectorAll('.potential-link').length > 0) {
            return;
        }
        
        this.isLinkDetectionActive = true;
        
        try {
            console.log('Detecting links in text:', textContent.substring(0, 100) + '...');
            const suggestions = await WikipediaLinkService.detectLinksInText(textContent);
            console.log('Found suggestions:', suggestions.length);
            this.currentLinkSuggestions = suggestions;
            
            if (suggestions.length > 0) {
                this.renderLinkSuggestions(suggestions);
                this.showLinkDetectionMessage(`Found ${suggestions.length} potential Wikipedia link${suggestions.length > 1 ? 's' : ''}. Click to review.`);
            } else {
                this.showLinkDetectionMessage('No potential Wikipedia links found in the current text.');
            }
            
        } catch (error) {
            console.error('Error detecting links:', error);
        } finally {
            this.isLinkDetectionActive = false;
        }
    }
    
    private getTextContentForLinkDetection(): string {
        // Get clean text content for analysis, excluding existing links and chips
        const clone = this.articleContent.cloneNode(true) as HTMLElement;
        
        // Remove existing links and chips from the clone
        clone.querySelectorAll('.wikipedia-link, .detail-chip, .potential-link').forEach(el => {
            el.replaceWith(el.textContent || '');
        });
        
        return clone.textContent || '';
    }
    
    private renderLinkSuggestions(suggestions: LinkSuggestion[]): void {
        // Clear previous suggestions
        this.clearLinkSuggestions();
        
        // Use a safer approach to add link suggestions
        this.addLinkSuggestionsToDOM(suggestions);
        
        // Add event listeners to the new potential links
        this.setupPotentialLinkListeners();
    }
    
    private addLinkSuggestionsToDOM(suggestions: LinkSuggestion[]): void {
        // Get all text nodes in the content
        const walker = document.createTreeWalker(
            this.articleContent,
            NodeFilter.SHOW_TEXT,
            null
        );
        
        const textNodes: Node[] = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        // Build a complete text map
        let fullText = '';
        const nodeMap: Array<{node: Node, start: number, end: number}> = [];
        
        for (const textNode of textNodes) {
            const nodeText = textNode.textContent || '';
            const start = fullText.length;
            const end = start + nodeText.length;
            nodeMap.push({node: textNode, start, end});
            fullText += nodeText;
        }
        
        // Sort suggestions by position (reverse order to maintain indices)
        const sortedSuggestions = [...suggestions].sort((a, b) => b.startIndex - a.startIndex);
        
        // Apply each suggestion
        for (const suggestion of sortedSuggestions) {
            this.applySuggestionToDOM(suggestion, nodeMap, fullText);
        }
    }
    
    private applySuggestionToDOM(suggestion: LinkSuggestion, nodeMap: Array<{node: Node, start: number, end: number}>, fullText: string): void {
        // Find which text node(s) contain this suggestion
        const suggestedText = fullText.substring(suggestion.startIndex, suggestion.endIndex);
        
        // Find the node that contains the start of this suggestion
        const targetNode = nodeMap.find(mapping => 
            mapping.start <= suggestion.startIndex && mapping.end > suggestion.startIndex
        );
        
        if (!targetNode) return;
        
        const nodeText = targetNode.node.textContent || '';
        const relativeStart = suggestion.startIndex - targetNode.start;
        const relativeEnd = suggestion.endIndex - targetNode.start;
        
        // Make sure the text matches what we expect
        const actualText = nodeText.substring(relativeStart, relativeEnd);
        if (actualText.toLowerCase() !== suggestedText.toLowerCase()) {
            return; // Skip if text doesn't match
        }
        
        // Create the suggestion element
        const suggestionElement = document.createElement('span');
        suggestionElement.className = 'potential-link';
        suggestionElement.setAttribute('data-wikipedia-title', suggestion.wikipediaTitle);
        suggestionElement.setAttribute('data-confidence', suggestion.confidence.toString());
        suggestionElement.setAttribute('data-url', suggestion.url);
        suggestionElement.setAttribute('data-original-text', suggestion.text);
        suggestionElement.setAttribute('title', `Suggested link: ${suggestion.wikipediaTitle}`);
        
        // Add content
        suggestionElement.innerHTML = `
            ${suggestion.text}
            <span class="link-suggestion-tooltip">${this.escapeHtml(suggestion.description || suggestion.wikipediaTitle)}</span>
            <div class="link-suggestion-actions">
                <button class="link-action-btn link-action-btn--primary" data-action="accept">Link</button>
                <button class="link-action-btn" data-action="reject">Ignore</button>
            </div>
        `;
        
        // Split the text node and insert the suggestion
        const beforeText = nodeText.substring(0, relativeStart);
        const afterText = nodeText.substring(relativeEnd);
        
        const parentNode = targetNode.node.parentNode;
        if (!parentNode) return;
        
        // Create new text nodes
        const beforeNode = document.createTextNode(beforeText);
        const afterNode = document.createTextNode(afterText);
        
        // Replace the original node with the new structure
        if (beforeText) {
            parentNode.insertBefore(beforeNode, targetNode.node);
        }
        parentNode.insertBefore(suggestionElement, targetNode.node);
        if (afterText) {
            parentNode.insertBefore(afterNode, targetNode.node);
        }
        parentNode.removeChild(targetNode.node);
    }
    
    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    private escapeRegex(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    private setupPotentialLinkListeners(): void {
        const potentialLinks = this.articleContent.querySelectorAll('.potential-link');
        
        potentialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from other links
                potentialLinks.forEach(otherLink => {
                    otherLink.classList.remove('potential-link--active');
                });
                
                // Toggle active state
                link.classList.toggle('potential-link--active');
            });
            
            // Handle action buttons
            const actionBtns = link.querySelectorAll('.link-action-btn');
            actionBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const action = (btn as HTMLElement).dataset.action;
                    
                    if (action === 'accept') {
                        this.acceptLinkSuggestion(link as HTMLElement);
                    } else if (action === 'reject') {
                        this.rejectLinkSuggestion(link as HTMLElement);
                    }
                });
            });
        });
    }
    
    private acceptLinkSuggestion(linkElement: HTMLElement): void {
        const wikipediaTitle = linkElement.dataset.wikipediaTitle || '';
        const url = linkElement.dataset.url || '';
        const originalText = linkElement.dataset.originalText || '';
        
        // Create actual Wikipedia link
        const actualLink = document.createElement('a');
        actualLink.href = url;
        actualLink.target = '_blank';
        actualLink.className = 'wikipedia-link';
        actualLink.textContent = originalText;
        actualLink.title = wikipediaTitle;
        
        // Replace the suggestion with the actual link
        linkElement.parentNode?.replaceChild(actualLink, linkElement);
    }
    
    private rejectLinkSuggestion(linkElement: HTMLElement): void {
        const originalText = linkElement.dataset.originalText || '';
        
        // Replace with plain text
        const textNode = document.createTextNode(originalText);
        linkElement.parentNode?.replaceChild(textNode, linkElement);
    }
    
    private clearLinkSuggestions(): void {
        // Remove any existing potential links
        const existingSuggestions = this.articleContent.querySelectorAll('.potential-link');
        existingSuggestions.forEach(suggestion => {
            const text = suggestion.textContent?.replace(/LinkIgnore/, '').trim() || '';
            suggestion.outerHTML = text;
        });
        
        this.currentLinkSuggestions = [];
    }
    
}

// Initialize the application
new HTMLArticleCreator();
