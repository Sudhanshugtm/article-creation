// ABOUTME: TypeScript for full-screen suggestions page navigation
// ABOUTME: Handles selection and application of suggestions with navigation flow

import { WikidataEnhancementService } from './WikidataEnhancementService.js';

interface Suggestion {
    type: 'fact' | 'section';
    id: string;
    content: string;
    hint?: string;
}

class SuggestionsPageManager {
    private applyButton: HTMLButtonElement;
    private clearButton: HTMLButtonElement;
    private selectedSuggestions: Set<string> = new Set();
    private wikidataService: WikidataEnhancementService;
    private isLoading = false;

    constructor() {
        this.applyButton = document.getElementById('applyButton') as HTMLButtonElement;
        this.clearButton = document.getElementById('clearButton') as HTMLButtonElement;
        this.wikidataService = new WikidataEnhancementService();
        
        // No API calls needed - suggestions are static and handled by HTML
        console.log('Suggestions manager initialized - using static article-specific suggestions');

        // Prefetch Wikidata suggestions for the selected article to avoid delays on apply
        this.prefetchWikidataSuggestions().catch(() => {
            // Non-fatal for prototype
        });
    }

    // Removed API loading methods - using static article-specific suggestions from HTML

    // Removed render methods - suggestions are now static and rendered by HTML

    // Removed loading state methods - not needed for static suggestions

    private updateSuggestionCount(count: number): void {
        const countElement = document.getElementById('suggestionCount');
        if (countElement) {
            countElement.textContent = `${count} ideas`;
        }
    }

    public initializeEventListeners(): void {
        this.initializeFactCheckboxes();
        this.initializeSectionButtons();

        // Apply button (remove existing listener first)
        if (this.applyButton) {
            this.applyButton.removeEventListener('click', this.handleApplyClick);
            this.applyButton.addEventListener('click', this.handleApplyClick);
        }

        // Clear button (remove existing listener first)  
        if (this.clearButton) {
            this.clearButton.removeEventListener('click', this.handleClearClick);
            this.clearButton.addEventListener('click', this.handleClearClick);
        }
    }

    private async prefetchWikidataSuggestions(): Promise<void> {
        try {
            const stored = sessionStorage.getItem('selectedArticle');
            if (!stored) return;
            const article = JSON.parse(stored);
            const title = article?.wikipediaTitle || article?.title;
            if (!title) return;
            // Try to resolve entity by enwiki title
            const resolved = await this.wikidataService.fetchEntityByWikipediaTitle(title);
            const entityId = resolved?.id;
            if (!entityId) return;
            // Use empty existingContent for prefetch; expansion page performs its own filtering
            const suggestions = await this.wikidataService.getEnhancementSuggestions('', entityId);
            // Cache under a generic key the expansion page already reads
            sessionStorage.setItem('wikidataSuggestions', JSON.stringify(suggestions));
            console.log('Prefetched Wikidata suggestions for', title, '→', suggestions.length);
        } catch (e) {
            console.warn('Prefetch Wikidata failed:', e);
        }
    }

    private handleApplyClick = () => {
        this.applySuggestions();
    };

    private handleClearClick = () => {
        this.clearSelections();
    };

    private initializeFactCheckboxes(): void {
        // Handle fact checkboxes
        const factCheckboxes = document.querySelectorAll('.suggestion-item__checkbox');
        console.log(`Initializing ${factCheckboxes.length} fact checkboxes`);
        factCheckboxes.forEach(checkbox => {
            // Remove existing listeners to prevent duplicates
            checkbox.removeEventListener('change', this.handleFactCheckboxChange);
            checkbox.addEventListener('change', this.handleFactCheckboxChange);
        });
    }

    private initializeSectionButtons(): void {
        // Handle section add buttons
        const sectionButtons = document.querySelectorAll('.suggestion-item__add-btn');
        console.log(`Initializing ${sectionButtons.length} section buttons`);
        
        sectionButtons.forEach((button, index) => {
            const sectionItem = button.closest('.suggestion-item--section');
            const sectionId = sectionItem?.getAttribute('data-section');
            console.log(`Button ${index}: section-${sectionId}`);
            
            // Remove existing listeners to prevent duplicates
            button.removeEventListener('click', this.handleSectionButtonClick);
            button.addEventListener('click', this.handleSectionButtonClick);
        });
    }

    private handleFactCheckboxChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const factId = target.dataset.fact!;
        
        if (target.checked) {
            this.selectedSuggestions.add(`fact-${factId}`);
        } else {
            this.selectedSuggestions.delete(`fact-${factId}`);
        }
        
        this.updateActionButtons();
    };

    private handleSectionButtonClick = (e: Event) => {
        const target = e.currentTarget as HTMLElement;
        const sectionItem = target.closest('.suggestion-item--section') as HTMLElement;
        const sectionId = sectionItem.dataset.section!;
        const suggestionId = `section-${sectionId}`;
        
        console.log(`Section clicked: ${sectionId}, ID: ${suggestionId}`);
        console.log(`Currently selected:`, Array.from(this.selectedSuggestions));
        
        if (this.selectedSuggestions.has(suggestionId)) {
            console.log(`Deselecting ${suggestionId}`);
            this.selectedSuggestions.delete(suggestionId);
            target.classList.remove('selected');
            sectionItem.classList.remove('selected');
        } else {
            console.log(`Selecting ${suggestionId}`);
            this.selectedSuggestions.add(suggestionId);
            target.classList.add('selected');
            sectionItem.classList.add('selected');
        }
        
        console.log(`New selection count: ${this.selectedSuggestions.size}`);
        console.log(`Button has selected class: ${target.classList.contains('selected')}`);
        this.updateActionButtons();
    };

    private updateActionButtons(): void {
        console.log(`updateActionButtons called with count: ${this.selectedSuggestions.size}`);
        const count = this.selectedSuggestions.size;
        
        if (!this.applyButton) {
            console.error('Apply button not found!');
            return;
        }
        
        this.applyButton.disabled = count === 0;
        
        const selectionCount = document.getElementById('selectionCount');
        const pluralS = document.getElementById('pluralS');
        
        if (!selectionCount || !pluralS) {
            console.error('Selection count elements not found!', { selectionCount: !!selectionCount, pluralS: !!pluralS });
            return;
        }
        
        selectionCount.textContent = count.toString();
        pluralS.style.display = count === 1 ? 'none' : 'inline';
        
        console.log(`Updated UI: count=${count}, buttonDisabled=${this.applyButton.disabled}`);
    }

    private clearSelections(): void {
        // Clear checkboxes
        const checkboxes = document.querySelectorAll('.suggestion-item__checkbox') as NodeListOf<HTMLInputElement>;
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        // Clear section buttons
        const sectionButtons = document.querySelectorAll('.suggestion-item__add-btn');
        sectionButtons.forEach(button => {
            button.classList.remove('selected');
        });

        // Clear section items
        const sectionItems = document.querySelectorAll('.suggestion-item--section');
        sectionItems.forEach(item => {
            item.classList.remove('selected');
        });

        this.selectedSuggestions.clear();
        this.updateActionButtons();
    }

    private async applySuggestions(): Promise<void> {
        console.log('=== APPLY SUGGESTIONS CALLED ===');
        console.log('Selected suggestions:', Array.from(this.selectedSuggestions));
        
        if (this.selectedSuggestions.size === 0) {
            console.warn('No suggestions selected');
            return;
        }
        
        // Store selections in sessionStorage for the expansion page
        const selectedArray = Array.from(this.selectedSuggestions);
        sessionStorage.setItem('selectedSuggestions', JSON.stringify(selectedArray));
        console.log('Stored in sessionStorage:', selectedArray);
        
        // Show success feedback immediately
        this.showSuccessFeedback();
        
        // No API calls needed - suggestions are static
        
        // Navigate immediately with shorter delay
        setTimeout(() => {
            console.log('Navigating to expansion page...');
            try {
                window.location.assign('./section-expansion.html');
            } catch (error) {
                console.error('Navigation failed, trying alternative:', error);
                window.location.replace('./section-expansion.html');
            }
        }, 500);
    }

    // Removed background API storage - not needed for static suggestions

    private showSuccessFeedback(): void {
        const count = this.selectedSuggestions.size;
        const feedback = document.createElement('div');
        feedback.className = 'success-feedback';
        feedback.textContent = `✓ ${count} suggestion${count === 1 ? '' : 's'} will be applied!`;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 3000);
    }
}

// Initialize the suggestions page
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== INITIALIZING SUGGESTIONS PAGE ===');
    
    // Single, unified manager instance
    const suggestionsManager = new SuggestionsPageManager();
    
    // Expose globally so inline renderer can rebind after dynamic DOM updates
    try { (window as any).suggestionsManager = suggestionsManager; } catch {}

    // Initialize event listeners through the manager
    suggestionsManager.initializeEventListeners();
});
