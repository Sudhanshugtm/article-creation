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
        
        this.initializeEventListeners();
        this.loadWikidataSuggestions();
        this.updateActionButtons();
    }

    private async loadWikidataSuggestions(): Promise<void> {
        this.isLoading = true;
        this.showLoadingState();

        try {
            // Get existing article content (we'll simulate this for now)
            const existingContent = this.getExistingArticleContent();
            
            // Fetch suggestions from Wikidata
            const suggestions = await this.wikidataService.getEnhancementSuggestions(existingContent);
            
            // Replace hardcoded suggestions with Wikidata suggestions
            this.renderSuggestions(suggestions);
            this.updateSuggestionCount(suggestions.length);
            
        } catch (error) {
            console.error('Error loading Wikidata suggestions:', error);
            // Keep the existing hardcoded suggestions as fallback
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    private getExistingArticleContent(): string {
        // For now, return a simplified version of the current Katie Bouman article content
        // In a real implementation, this would fetch the actual article content
        return `
            Katie Bouman is an American computer scientist and engineer.
            After earning her doctorate, Bouman joined Harvard University as a postdoctoral fellow 
            on the Event Horizon Telescope Imaging team. Bouman joined Event Horizon Telescope project in 2013.
            She led the development of an algorithm for imaging black holes, known as Continuous High-resolution 
            Image Reconstruction using Patch priors (CHIRP). Bouman received significant media attention after 
            a photo, showing her reaction to the detection of the black hole shadow in the EHT images, went viral.
        `;
    }

    private renderSuggestions(suggestions: any[]): void {
        // Group suggestions by type
        const factSuggestions = suggestions.filter(s => s.type === 'fact');
        const sectionSuggestions = suggestions.filter(s => s.type === 'section');

        // Render fact suggestions
        if (factSuggestions.length > 0) {
            this.renderFactSuggestions(factSuggestions);
        }

        // Render section suggestions
        if (sectionSuggestions.length > 0) {
            this.renderSectionSuggestions(sectionSuggestions);
        }

        // Re-initialize event listeners for new elements
        this.reinitializeEventListeners();
    }

    private renderFactSuggestions(suggestions: any[]): void {
        const factSection = document.querySelector('.suggestion-section');
        if (!factSection) return;

        const suggestionList = factSection.querySelector('.suggestion-list');
        if (!suggestionList) return;

        // Clear existing suggestions
        suggestionList.innerHTML = '';

        // Add new suggestions
        suggestions.forEach(suggestion => {
            const item = document.createElement('label');
            item.className = 'suggestion-item';
            item.innerHTML = `
                <input type="checkbox" class="suggestion-item__checkbox" data-fact="${suggestion.id}">
                <div class="suggestion-item__content">
                    <div class="suggestion-item__text">${suggestion.content}</div>
                    ${suggestion.hint ? `<div class="suggestion-item__hint">${suggestion.hint}</div>` : ''}
                </div>
            `;
            suggestionList.appendChild(item);
        });
    }

    private renderSectionSuggestions(suggestions: any[]): void {
        const sectionSuggestions = document.querySelectorAll('.suggestion-section');
        const sectionSection = sectionSuggestions[1]; // Second section is for new sections
        if (!sectionSection) return;

        const suggestionList = sectionSection.querySelector('.suggestion-list');
        if (!suggestionList) return;

        // Clear existing suggestions
        suggestionList.innerHTML = '';

        // Add new suggestions
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item suggestion-item--section';
            item.dataset.section = suggestion.id;
            item.innerHTML = `
                <button class="suggestion-item__add-btn">+</button>
                <div class="suggestion-item__content">
                    <div class="suggestion-item__text">${suggestion.title}</div>
                    <div class="suggestion-item__hint">${suggestion.hint || 'From Wikidata'}</div>
                </div>
            `;
            suggestionList.appendChild(item);
        });
    }

    private reinitializeEventListeners(): void {
        // Re-initialize event listeners for dynamically created elements
        this.initializeFactCheckboxes();
        this.initializeSectionButtons();
    }

    private showLoadingState(): void {
        const loadingMessage = document.createElement('div');
        loadingMessage.id = 'loading-suggestions';
        loadingMessage.className = 'suggestions-loading';
        loadingMessage.innerHTML = `
            <div class="suggestions-loading__content">
                <div class="suggestions-loading__spinner"></div>
                <p>Loading suggestions from Wikidata...</p>
            </div>
        `;
        document.querySelector('.suggestions-page__main')?.prepend(loadingMessage);
    }

    private hideLoadingState(): void {
        const loading = document.getElementById('loading-suggestions');
        if (loading) {
            loading.remove();
        }
    }

    private updateSuggestionCount(count: number): void {
        const countElement = document.getElementById('suggestionCount');
        if (countElement) {
            countElement.textContent = `${count} ideas`;
        }
    }

    private initializeEventListeners(): void {
        this.initializeFactCheckboxes();
        this.initializeSectionButtons();

        // Apply button
        this.applyButton.addEventListener('click', () => {
            this.applySuggestions();
        });

        // Clear button
        this.clearButton.addEventListener('click', () => {
            this.clearSelections();
        });
    }

    private initializeFactCheckboxes(): void {
        // Handle fact checkboxes
        const factCheckboxes = document.querySelectorAll('.suggestion-item__checkbox');
        factCheckboxes.forEach(checkbox => {
            // Remove existing listeners to prevent duplicates
            checkbox.removeEventListener('change', this.handleFactCheckboxChange);
            checkbox.addEventListener('change', this.handleFactCheckboxChange.bind(this));
        });
    }

    private initializeSectionButtons(): void {
        // Handle section add buttons
        const sectionButtons = document.querySelectorAll('.suggestion-item__add-btn');
        sectionButtons.forEach(button => {
            // Remove existing listeners to prevent duplicates
            button.removeEventListener('click', this.handleSectionButtonClick);
            button.addEventListener('click', this.handleSectionButtonClick.bind(this));
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
        
        if (this.selectedSuggestions.has(suggestionId)) {
            this.selectedSuggestions.delete(suggestionId);
            target.classList.remove('selected');
            sectionItem.classList.remove('selected');
        } else {
            this.selectedSuggestions.add(suggestionId);
            target.classList.add('selected');
            sectionItem.classList.add('selected');
        }
        
        this.updateActionButtons();
    };

    private updateActionButtons(): void {
        const count = this.selectedSuggestions.size;
        this.applyButton.disabled = count === 0;
        
        const selectionCount = document.getElementById('selectionCount')!;
        const pluralS = document.getElementById('pluralS')!;
        
        selectionCount.textContent = count.toString();
        pluralS.style.display = count === 1 ? 'none' : 'inline';
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
        // Store selections in sessionStorage for the expansion page
        sessionStorage.setItem('selectedSuggestions', JSON.stringify(Array.from(this.selectedSuggestions)));
        
        // Also store the Wikidata suggestions for reference
        const existingContent = this.getExistingArticleContent();
        const wikidataSuggestions = await this.wikidataService.getEnhancementSuggestions(existingContent);
        sessionStorage.setItem('wikidataSuggestions', JSON.stringify(wikidataSuggestions));
        
        // Show success feedback
        this.showSuccessFeedback();
        
        // Navigate back to expansion page after brief delay
        setTimeout(() => {
            window.location.href = './section-expansion.html';
        }, 1000);
    }

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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SuggestionsPageManager();
});