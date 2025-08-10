// ABOUTME: Main TypeScript file for section expansion prototype
// ABOUTME: Handles smart widget, suggestions, and content integration

import { WikidataEnhancementService } from './WikidataEnhancementService.js';

interface Suggestion {
    type: 'fact' | 'section';
    id: string;
    content: string;
    hint?: string;
}

class SectionExpansionManager {
    private addedContent: Set<string> = new Set();
    private wikidataService: WikidataEnhancementService;
    private wikidataSuggestions: Map<string, any> = new Map();

    constructor() {
        this.wikidataService = new WikidataEnhancementService();
        this.initialize();
    }

    private async initialize(): Promise<void> {
        await this.loadWikidataSuggestions();
        this.checkForAppliedSuggestions();
        this.updateSuggestionCount();
    }

    private async loadWikidataSuggestions(): Promise<void> {
        try {
            const existingContent = this.getExistingArticleContent();
            const suggestions = await this.wikidataService.getEnhancementSuggestions(existingContent);
            
            // Store suggestions for later use
            suggestions.forEach(suggestion => {
                this.wikidataSuggestions.set(suggestion.id, suggestion);
            });
        } catch (error) {
            console.error('Error loading Wikidata suggestions:', error);
        }
    }

    private getExistingArticleContent(): string {
        // Get the actual content from the page
        const contentElement = document.getElementById('researchCareerContent');
        return contentElement?.textContent || '';
    }

    private checkForAppliedSuggestions(): void {
        const selectedSuggestions = sessionStorage.getItem('selectedSuggestions');
        const wikidataSuggestionsData = sessionStorage.getItem('wikidataSuggestions');
        
        if (selectedSuggestions) {
            // Load stored Wikidata suggestions first
            if (wikidataSuggestionsData) {
                const wikidataSuggestions = JSON.parse(wikidataSuggestionsData);
                wikidataSuggestions.forEach((suggestion: any) => {
                    this.wikidataSuggestions.set(suggestion.id, suggestion);
                });
            }
            
            const suggestions = JSON.parse(selectedSuggestions) as string[];
            this.applySuggestions(suggestions);
            sessionStorage.removeItem('selectedSuggestions');
            sessionStorage.removeItem('wikidataSuggestions');
        }
    }

    private applySuggestions(suggestions: string[]): void {
        const factsToAdd: string[] = [];
        const sectionsToAdd: string[] = [];

        suggestions.forEach(suggestionId => {
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
        suggestions.forEach(id => {
            this.addedContent.add(id);
        });
        
        // Update count
        this.updateSuggestionCount();

        // Show success feedback
        this.showSuccessFeedback();
    }

    private addFact(factId: string): void {
        const content = document.getElementById('researchCareerContent')!;
        const firstParagraph = content.querySelector('p')!;
        
        // Check if this is a Wikidata-based suggestion
        const wikidataSuggestion = this.wikidataSuggestions.get(factId);
        if (wikidataSuggestion) {
            // Add Wikidata fact to the content
            const newFactHTML = `<span class="fact-highlight"> ${wikidataSuggestion.content}</span>`;
            firstParagraph.innerHTML += newFactHTML;
            return;
        }
        
        // Fallback to hardcoded logic for backward compatibility
        if (factId === 'harvard-fallback') {
            const harvardText = firstParagraph.innerHTML;
            firstParagraph.innerHTML = harvardText.replace(
                'on the Event Horizon Telescope Imaging team',
                'on the Event Horizon Telescope Imaging team <span class="fact-highlight">(2018)</span>'
            );
        } else if (factId === 'caltech-fallback') {
            const newText = ' She then joined the California Institute of Technology (Caltech) as an assistant professor in June 2019, where she was later promoted to associate professor of computing and mathematical sciences, electrical engineering, and astronomy, as well as a Rosenberg Scholar in 2024.<sup class="reference">[21]</sup>';
            
            const currentHTML = firstParagraph.innerHTML;
            firstParagraph.innerHTML = currentHTML.replace(
                '</sup></p>',
                '</sup>' + '<span class="fact-highlight">' + newText + '</span></p>'
            );
        }
    }

    private addSection(sectionId: string): void {
        const container = document.getElementById('newSectionsContainer')!;
        
        // Check if this is a Wikidata-based suggestion
        const wikidataSuggestion = this.wikidataSuggestions.get(sectionId);
        if (wikidataSuggestion) {
            const section = document.createElement('section');
            section.className = 'article-section article-section--new';
            section.innerHTML = `
                <h2 class="article-section__title">${wikidataSuggestion.title}</h2>
                <div class="article-section__content">
                    ${wikidataSuggestion.content}
                </div>
            `;
            container.appendChild(section);
            return;
        }
        
        // Fallback to hardcoded content for backward compatibility
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
        
        if (remainingCount > 0) {
            badge.textContent = `${remainingCount} ideas`;
        } else {
            badge.textContent = 'All done!';
            const smartWidgetTrigger = document.getElementById('smartWidgetTrigger')!;
            smartWidgetTrigger.style.opacity = '0.6';
        }
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