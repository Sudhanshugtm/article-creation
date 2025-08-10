// ABOUTME: TypeScript for full-screen suggestions page navigation
// ABOUTME: Handles selection and application of suggestions with navigation flow

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

    constructor() {
        this.applyButton = document.getElementById('applyButton') as HTMLButtonElement;
        this.clearButton = document.getElementById('clearButton') as HTMLButtonElement;
        
        this.initializeEventListeners();
        this.updateActionButtons();
    }

    private initializeEventListeners(): void {
        // Handle fact checkboxes
        const factCheckboxes = document.querySelectorAll('.suggestion-item__checkbox');
        factCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement;
                const factId = target.dataset.fact!;
                
                if (target.checked) {
                    this.selectedSuggestions.add(`fact-${factId}`);
                } else {
                    this.selectedSuggestions.delete(`fact-${factId}`);
                }
                
                this.updateActionButtons();
            });
        });

        // Handle section add buttons
        const sectionButtons = document.querySelectorAll('.suggestion-item__add-btn');
        sectionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
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
            });
        });

        // Apply button
        this.applyButton.addEventListener('click', () => {
            this.applySuggestions();
        });

        // Clear button
        this.clearButton.addEventListener('click', () => {
            this.clearSelections();
        });
    }

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

    private applySuggestions(): void {
        // Store selections in sessionStorage for the expansion page
        sessionStorage.setItem('selectedSuggestions', JSON.stringify(Array.from(this.selectedSuggestions)));
        
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