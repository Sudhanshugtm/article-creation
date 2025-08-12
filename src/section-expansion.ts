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
        // Apply any user-selected suggestions immediately without blocking on network
        this.checkForAppliedSuggestions();
        this.updateSuggestionCount();

        // Load Wikidata suggestions in background with a short timeout so UI stays responsive
        this.loadWikidataSuggestionsWithTimeout(3000).catch(() => {
            // Silently ignore background load failures/timeouts for prototype smoothness
        });
    }

    private async loadWikidataSuggestionsWithTimeout(timeoutMs: number): Promise<void> {
        const timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));
        try {
            await Promise.race([
                this.loadWikidataSuggestions(),
                timeoutPromise
            ]);
        } catch (e) {
            // Ignore background load failures for prototype
        }
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
        // Get content from all current article sections
        const sections = document.querySelectorAll('.article-section .article-section__content');
        let content = '';
        sections.forEach(section => {
            content += section.textContent + ' ';
        });
        return content.trim();
    }

    private checkForAppliedSuggestions(): void {
        const selectedSuggestions = sessionStorage.getItem('selectedSuggestions');
        const wikidataSuggestionsData = sessionStorage.getItem('wikidataSuggestions');
        
        console.log('Checking for applied suggestions...');
        console.log('Selected suggestions from storage:', selectedSuggestions);
        console.log('Wikidata suggestions from storage:', wikidataSuggestionsData);
        
        if (selectedSuggestions) {
            // Load stored Wikidata suggestions first
            if (wikidataSuggestionsData) {
                const wikidataSuggestions = JSON.parse(wikidataSuggestionsData);
                console.log('Loading Wikidata suggestions:', wikidataSuggestions);
                wikidataSuggestions.forEach((suggestion: any) => {
                    this.wikidataSuggestions.set(suggestion.id, suggestion);
                });
            }
            
            const suggestions = JSON.parse(selectedSuggestions) as string[];
            console.log('Applying suggestions:', suggestions);
            this.applySuggestions(suggestions);
            sessionStorage.removeItem('selectedSuggestions');
            sessionStorage.removeItem('wikidataSuggestions');
        } else {
            console.log('No suggestions to apply');
        }
    }

    private applySuggestions(suggestions: string[]): void {
        const factsToAdd: string[] = [];
        const sectionsToAdd: string[] = [];

        suggestions.forEach(suggestionId => {
            // Preserve the full ID after the first hyphen so IDs like
            // 'section-awards-section' are handled correctly.
            const hyphenIndex = suggestionId.indexOf('-');
            if (hyphenIndex === -1) return;
            const type = suggestionId.slice(0, hyphenIndex);
            const id = suggestionId.slice(hyphenIndex + 1);
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
        
        // Counter removed from UI; keep method as no-op
        this.updateSuggestionCount();

        // Show success feedback
        this.showSuccessFeedback();
    }

    private addFact(factId: string): void {
        console.log(`Adding fact: ${factId}`);

        // Prefer a specific section if present; otherwise target the article body first paragraph
        const fallbackContainer = document.getElementById('articleBody');
        const content = document.getElementById('researchCareerContent') || fallbackContainer;
        if (!content) {
            console.warn('No suitable container found to insert fact');
            return;
        }

        let firstParagraph = content.querySelector('p');
        if (!firstParagraph) {
            firstParagraph = document.createElement('p');
            content.appendChild(firstParagraph);
        }

        // Check if this is a Wikidata-based suggestion
        const wikidataSuggestion = this.wikidataSuggestions.get(factId);
        if (wikidataSuggestion) {
            const span = document.createElement('span');
            span.className = 'fact-highlight';
            span.textContent = ' ' + wikidataSuggestion.content;
            firstParagraph.appendChild(span);
            console.log(`Added Wikidata fact: ${wikidataSuggestion.content}`);
            return;
        }

        // Fallback to hardcoded logic for backward compatibility
        if (factId === 'harvard') {
            const harvardText = firstParagraph.innerHTML;
            const replaced = harvardText.replace(
                'on the Event Horizon Telescope Imaging team',
                'on the Event Horizon Telescope Imaging team <span class="fact-highlight">(2018)</span>'
            );
            if (replaced !== harvardText) {
                firstParagraph.innerHTML = replaced;
            } else {
                const span = document.createElement('span');
                span.className = 'fact-highlight';
                span.textContent = ' (2018)';
                firstParagraph.appendChild(span);
            }
            console.log('Added Harvard fact');
        } else if (factId === 'caltech') {
            const newText = ' She then joined the California Institute of Technology (Caltech) as an assistant professor in June 2019, later promoted to associate professor.';
            const span = document.createElement('span');
            span.className = 'fact-highlight';
            span.textContent = newText;
            firstParagraph.appendChild(span);
            console.log('Added Caltech fact');
        }
    }

    private addSection(sectionId: string): void {
        const container = document.getElementById('newSectionsContainer')!;
        
        console.log(`Adding section: ${sectionId}`);
        console.log('Available Wikidata suggestions:', Array.from(this.wikidataSuggestions.keys()));
        
        // Check if this is a Wikidata-based suggestion
        let wikidataSuggestion = this.wikidataSuggestions.get(sectionId);
        // If not found, try normalizing '-section' suffix
        if (!wikidataSuggestion && sectionId.endsWith('-section')) {
            const baseId = sectionId.replace(/-section$/, '');
            wikidataSuggestion = this.wikidataSuggestions.get(baseId) || this.wikidataSuggestions.get(`${baseId}-section`);
        }
        // Fuzzy match by title if still not found (e.g., Education vs education-section)
        if (!wikidataSuggestion) {
            const fallbackKey = sectionId.endsWith('-section') ? sectionId.replace(/-section$/, '') : sectionId;
            const wantedTitle = fallbackKey.replace(/-/g, ' ').toLowerCase();
            for (const s of this.wikidataSuggestions.values() as any) {
                if (s?.type === 'section') {
                    const title = (s.title || '').toLowerCase();
                    if (title === wantedTitle || title.includes(wantedTitle) || wantedTitle.includes(title)) {
                        wikidataSuggestion = s;
                        break;
                    }
                }
            }
        }
        if (wikidataSuggestion) {
            console.log(`Found Wikidata suggestion for ${sectionId}:`, wikidataSuggestion);
            const section = document.createElement('section');
            section.className = 'article-section article-section--new';
            section.innerHTML = `
                <h2 class="article-section__title">${wikidataSuggestion.title}</h2>
                <div class="article-section__content">
                    ${wikidataSuggestion.content}
                </div>
            `;
            container.appendChild(section);
            console.log(`Added Wikidata section: ${wikidataSuggestion.title}`);
            return;
        }
        
        // Fallback to generic content for prototype fidelity (personalized by selected title)
        const subject = this.getSelectedArticleTitle();
        const sectionContent: Record<string, { title: string; content: string }> = {
            awards: {
                title: 'Awards',
                content: `<p>${subject} has received recognition for contributions in their field:</p>
                <ul>
                    <li>Year – Award or honor</li>
                    <li>Year – Award or honor</li>
                    <li>Year – Award or honor</li>
                </ul>`
            },
            works: {
                title: 'Notable works',
                content: `<p>Selected works and publications by ${subject}:</p>
                <ul>
                    <li>Year – Work title</li>
                    <li>Year – Work title</li>
                    <li>Year – Work title</li>
                </ul>`
            },
            education: {
                title: 'Education',
                content: `<p>Educational background for ${subject}:</p>
                <ul>
                    <li>Degree or program – Institution (Year)</li>
                    <li>Degree or program – Institution (Year)</li>
                </ul>`
            },
            personal: {
                title: 'Personal life',
                content: `<p>Personal background and notable life details for ${subject}.</p>`
            },
            career: {
                title: 'Career',
                content: `<p>Notable roles, appointments, and positions held by ${subject} across academia and industry.</p>`
            },
            research: {
                title: 'Research contributions',
                content: `<p>Key areas of research focus and significant contributions by ${subject}.</p>`
            },
            legacy: {
                title: 'Legacy',
                content: `<p>Long-term impact, influence, and recognition of ${subject} within their field.</p>`
            },
            'early-life': {
                title: 'Early life',
                content: `<p>Background, upbringing, and formative experiences of ${subject} leading to later career and research interests.</p>`
            }
        };

        // Normalize to fallback keys if needed
        const fallbackKey = sectionId.endsWith('-section') ? sectionId.replace(/-section$/, '') : sectionId;

        if (sectionContent[fallbackKey]) {
            console.log(`Found hardcoded content for ${fallbackKey}: ${sectionContent[fallbackKey].title}`);
            const section = document.createElement('section');
            section.className = 'article-section article-section--new';
            section.innerHTML = `
                <h2 class="article-section__title">${sectionContent[fallbackKey].title}</h2>
                <div class="article-section__content">
                    ${sectionContent[fallbackKey].content}
                </div>
            `;
            container.appendChild(section);
            console.log(`Added hardcoded section: ${sectionContent[fallbackKey].title}`);
        } else {
            console.warn(`No content found for section ID: ${sectionId}`);
            console.log('Available hardcoded sections:', Object.keys(sectionContent));
        }
    }

    private getSelectedArticleTitle(): string {
        try {
            const stored = sessionStorage.getItem('selectedArticle');
            if (!stored) return 'This topic';
            const parsed = JSON.parse(stored);
            return parsed?.title || 'This topic';
        } catch {
            return 'This topic';
        }
    }

    private updateSuggestionCount(): void {
        // No counter UI anymore; if legacy badge exists in DOM, remove it
        const badge = document.getElementById('suggestionCount');
        if (badge && badge.parentElement) {
            badge.parentElement.removeChild(badge);
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
