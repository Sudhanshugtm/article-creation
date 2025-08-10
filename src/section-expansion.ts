// ABOUTME: Main TypeScript file for section expansion prototype
// ABOUTME: Handles smart widget, suggestions, and content integration

interface Suggestion {
    type: 'fact' | 'section';
    id: string;
    content: string;
    hint?: string;
}

class SectionExpansionManager {
    private smartWidget: HTMLElement;
    private smartWidgetTrigger: HTMLElement;
    private suggestionPanel: HTMLElement;
    private applyButton: HTMLButtonElement;
    private clearButton: HTMLButtonElement;
    private closePanelButton: HTMLElement;
    private selectedSuggestions: Set<string> = new Set();
    private addedContent: Set<string> = new Set();

    constructor() {
        this.smartWidget = document.getElementById('smartWidget')!;
        this.smartWidgetTrigger = document.getElementById('smartWidgetTrigger')!;
        this.suggestionPanel = document.getElementById('suggestionPanel')!;
        this.applyButton = document.getElementById('applyButton') as HTMLButtonElement;
        this.clearButton = document.getElementById('clearButton') as HTMLButtonElement;
        this.closePanelButton = document.getElementById('closeSuggestionPanel')!;
        
        this.initializeEventListeners();
        this.updateSuggestionCount();
    }

    private initializeEventListeners(): void {
        // Toggle panel
        this.smartWidgetTrigger.addEventListener('click', () => {
            this.togglePanel();
        });

        // Close panel
        this.closePanelButton.addEventListener('click', () => {
            this.closePanel();
        });

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

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!this.smartWidget.contains(e.target as Node) && 
                !this.suggestionPanel.contains(e.target as Node) &&
                this.suggestionPanel.style.display !== 'none') {
                this.closePanel();
            }
        });
    }

    private togglePanel(): void {
        if (this.suggestionPanel.style.display === 'none') {
            this.suggestionPanel.style.display = 'flex';
            this.smartWidgetTrigger.style.display = 'none';
        } else {
            this.closePanel();
        }
    }

    private closePanel(): void {
        this.suggestionPanel.style.display = 'none';
        this.smartWidgetTrigger.style.display = 'flex';
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
        const factsToAdd: string[] = [];
        const sectionsToAdd: string[] = [];

        this.selectedSuggestions.forEach(suggestionId => {
            const [type, id] = suggestionId.split('-');
            if (type === 'fact') {
                factsToAdd.push(id);
            } else if (type === 'section') {
                sectionsToAdd.push(id);
            }
        });

        // Apply facts
        factsToAdd.forEach(factId => {
            this.addFact(factId);
        });

        // Apply sections
        sectionsToAdd.forEach(sectionId => {
            this.addSection(sectionId);
        });

        // Mark as added
        this.selectedSuggestions.forEach(id => {
            this.addedContent.add(id);
        });

        // Clear selections
        this.clearSelections();
        
        // Update count
        this.updateSuggestionCount();
        
        // Close panel
        this.closePanel();

        // Show success feedback
        this.showSuccessFeedback();
    }

    private addFact(factId: string): void {
        const content = document.getElementById('researchCareerContent')!;
        const firstParagraph = content.querySelector('p')!;
        
        if (factId === 'harvard') {
            // This fact is already in the article, so we'll just highlight it
            const harvardText = firstParagraph.innerHTML;
            firstParagraph.innerHTML = harvardText.replace(
                'on the Event Horizon Telescope Imaging team',
                'on the Event Horizon Telescope Imaging team <span class="fact-highlight">(2018)</span>'
            );
        } else if (factId === 'caltech') {
            // Add Caltech information to the first paragraph
            const newText = ' She then joined the California Institute of Technology (Caltech) as an assistant professor in June 2019, where she was later promoted to associate professor of computing and mathematical sciences, electrical engineering, and astronomy, as well as a Rosenberg Scholar in 2024.<sup class="reference">[21]</sup>';
            
            const firstParagraph = content.querySelector('p')!;
            const currentHTML = firstParagraph.innerHTML;
            firstParagraph.innerHTML = currentHTML.replace(
                '</sup></p>',
                '</sup>' + '<span class="fact-highlight">' + newText + '</span></p>'
            );
        }
    }

    private addSection(sectionId: string): void {
        const container = document.getElementById('newSectionsContainer')!;
        
        const sectionContent: Record<string, { title: string; content: string }> = {
            awards: {
                title: 'Awards',
                content: `<p>Bouman has received numerous awards and honors for her contributions to computational imaging and the Event Horizon Telescope project:</p>
                <ul>
                    <li>2019 - Breakthrough Prize in Fundamental Physics (shared with EHT collaboration)</li>
                    <li>2020 - Diamond Achievement Award from Purdue University</li>
                    <li>2021 - Royal Photographic Society Progress Medal</li>
                    <li>2022 - Named to MIT Technology Review's Innovators Under 35</li>
                </ul>`
            },
            works: {
                title: 'Notable Works',
                content: `<p>Bouman has published extensively in the fields of computational imaging and black hole visualization:</p>
                <ul>
                    <li>"Computational Imaging for VLBI Image Reconstruction" (2016) - PhD thesis</li>
                    <li>"CHIRP: Continuous High-resolution Image Reconstruction using Patch priors" (2016)</li>
                    <li>"First M87 Event Horizon Telescope Results" (2019) - series of papers with EHT collaboration</li>
                    <li>"Reconstructing Video from Interferometric Measurements of Time-Varying Sources" (2019)</li>
                </ul>`
            },
            education: {
                title: 'Education',
                content: `<p>Bouman completed her education at prestigious institutions:</p>
                <ul>
                    <li>B.S. in Electrical Engineering - University of Michigan (2011)</li>
                    <li>M.S. in Electrical Engineering - Massachusetts Institute of Technology (2013)</li>
                    <li>Ph.D. in Electrical Engineering and Computer Science - Massachusetts Institute of Technology (2017)</li>
                </ul>
                <p>Her doctoral advisor was William T. Freeman, and her thesis focused on "Computational Imaging for VLBI Image Reconstruction".</p>`
            },
            personal: {
                title: 'Personal life',
                content: `<p>Katie Bouman was born in 1989 in West Lafayette, Indiana. She grew up in an academic environment, with her father being a professor of electrical and computer engineering at Purdue University.</p>
                <p>Bouman has spoken about the importance of interdisciplinary collaboration in science and has been an advocate for encouraging young women to pursue careers in STEM fields. She frequently gives talks at universities and conferences about computational imaging and the process behind capturing the first image of a black hole.</p>`
            }
        };

        if (sectionContent[sectionId]) {
            const section = document.createElement('section');
            section.className = 'article-section article-section--new';
            section.innerHTML = `
                <h2 class="article-section__title">${sectionContent[sectionId].title}</h2>
                <div class="article-section__content">
                    ${sectionContent[sectionId].content}
                </div>
            `;
            container.appendChild(section);
        }
    }

    private updateSuggestionCount(): void {
        const totalSuggestions = 6; // 2 facts + 4 sections
        const addedCount = this.addedContent.size;
        const remainingCount = totalSuggestions - addedCount;
        
        const badge = document.getElementById('suggestionCount')!;
        const panelCount = document.querySelector('.suggestion-panel__count')!;
        
        if (remainingCount > 0) {
            badge.textContent = `${remainingCount} ideas`;
            panelCount.textContent = `${remainingCount} ideas`;
        } else {
            badge.textContent = 'All done!';
            panelCount.textContent = 'All done!';
            this.smartWidgetTrigger.style.opacity = '0.6';
        }

        // Hide already added suggestions
        this.addedContent.forEach(id => {
            const [type, itemId] = id.split('-');
            if (type === 'fact') {
                const checkbox = document.querySelector(`[data-fact="${itemId}"]`) as HTMLInputElement;
                if (checkbox) {
                    checkbox.closest('.suggestion-item')?.remove();
                }
            } else if (type === 'section') {
                const sectionItem = document.querySelector(`[data-section="${itemId}"]`);
                if (sectionItem) {
                    sectionItem.remove();
                }
            }
        });
    }

    private showSuccessFeedback(): void {
        const feedback = document.createElement('div');
        feedback.className = 'success-feedback';
        feedback.textContent = '✓ Changes applied successfully!';
        feedback.style.cssText = `
            position: fixed;
            bottom: 32px;
            left: 50%;
            transform: translateX(-50%);
            background: #00af89;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            font-weight: 500;
            z-index: 1000;
            animation: fadeInOut 3s ease;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SectionExpansionManager();
});