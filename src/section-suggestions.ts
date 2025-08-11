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
        
        // Check for cached suggestions first to avoid unnecessary API calls
        console.log('Class-based manager: Checking cache before loading API data');
        
        // Load cached suggestions or fetch from Wikidata if needed
        this.loadCachedOrFreshSuggestions().catch(error => {
            console.error('Failed to load suggestions:', error);
        });
    }

    private async loadCachedOrFreshSuggestions(): Promise<void> {
        // First check if we have cached suggestions
        const cachedSuggestions = sessionStorage.getItem('wikidataSuggestionsCache');
        const cacheTimestamp = sessionStorage.getItem('wikidataCacheTimestamp');
        
        if (cachedSuggestions && cacheTimestamp) {
            const cacheAge = Date.now() - parseInt(cacheTimestamp);
            const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
            
            if (cacheAge < CACHE_DURATION) {
                console.log('Using cached Wikidata suggestions - rendering immediately without loading state');
                const suggestions = JSON.parse(cachedSuggestions);
                
                // Remove any existing loading state first
                this.hideLoadingState();
                
                // Render cached suggestions immediately
                this.renderSuggestions(suggestions);
                this.updateSuggestionCount(suggestions.length);
                return; // Exit early - no API call or loading needed
            } else {
                console.log('Cache expired - clearing old cache and fetching fresh data');
                sessionStorage.removeItem('wikidataSuggestionsCache');
                sessionStorage.removeItem('wikidataCacheTimestamp');
            }
        }
        
        // No valid cache found - fetch fresh data with loading state
        console.log('No valid cache found - fetching fresh Wikidata suggestions with loading state');
        await this.loadWikidataSuggestions();
    }

    private async loadWikidataSuggestions(): Promise<void> {
        this.isLoading = true;
        this.showLoadingState();

        try {
            // Get existing article content (we'll simulate this for now)
            const existingContent = this.getExistingArticleContent();
            
            // Fetch suggestions from Wikidata
            const suggestions = await this.wikidataService.getEnhancementSuggestions(existingContent);
            
            // Cache the suggestions for future visits
            sessionStorage.setItem('wikidataSuggestionsCache', JSON.stringify(suggestions));
            sessionStorage.setItem('wikidataCacheTimestamp', Date.now().toString());
            console.log('Cached Wikidata suggestions for future use');
            
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
        
        // Re-initialize apply and clear button listeners
        if (this.applyButton) {
            this.applyButton.removeEventListener('click', this.handleApplyClick);
            this.applyButton.addEventListener('click', this.handleApplyClick);
        }

        if (this.clearButton) {
            this.clearButton.removeEventListener('click', this.handleClearClick);
            this.clearButton.addEventListener('click', this.handleClearClick);
        }
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
        
        // Store Wikidata suggestions in background, but don't let it block navigation
        this.storeWikidataBackground();
        
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

    private async storeWikidataBackground(): Promise<void> {
        try {
            console.log('Starting background Wikidata storage...');
            const existingContent = this.getExistingArticleContent();
            const wikidataSuggestions = await this.wikidataService.getEnhancementSuggestions(existingContent);
            sessionStorage.setItem('wikidataSuggestions', JSON.stringify(wikidataSuggestions));
            console.log('Background: Stored Wikidata suggestions:', wikidataSuggestions);
        } catch (error) {
            console.error('Background: Error storing Wikidata suggestions:', error);
        }
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

// Initialize the suggestions page
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== INITIALIZING SUGGESTIONS PAGE ===');
    
    // Single, unified manager instance
    const suggestionsManager = new SuggestionsPageManager();
    
    // Initialize event listeners through the manager
    suggestionsManager.initializeEventListeners();
});