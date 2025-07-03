// ABOUTME: Wikipedia link detection service for automatic blue link suggestions
// ABOUTME: Uses Wikipedia's opensearch API to validate and suggest article links

export interface LinkSuggestion {
    text: string;
    wikipediaTitle: string;
    confidence: number;
    startIndex: number;
    endIndex: number;
    url: string;
    description?: string;
}

export class WikipediaLinkService {
    private static readonly WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';
    private static readonly MIN_CONFIDENCE = 0.7;
    
    // Common words that shouldn't be linked
    private static readonly SKIP_WORDS = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
        'of', 'with', 'by', 'is', 'was', 'are', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'can', 'must', 'shall', 'this', 'that',
        'these', 'those', 'he', 'she', 'it', 'they', 'we', 'you', 'i',
        'his', 'her', 'its', 'their', 'our', 'your', 'my', 'me', 'him',
        'them', 'us', 'who', 'what', 'when', 'where', 'why', 'how',
        'said', 'says', 'went', 'go', 'come', 'came', 'get', 'got', 'make',
        'made', 'take', 'took', 'see', 'saw', 'know', 'knew', 'think',
        'thought', 'look', 'looked', 'first', 'last', 'long', 'great',
        'little', 'own', 'other', 'old', 'right', 'big', 'high', 'different',
        'small', 'large', 'next', 'early', 'young', 'important', 'few',
        'public', 'bad', 'same', 'able'
    ]);

    static async detectLinksInText(text: string): Promise<LinkSuggestion[]> {
        if (!text || text.length < 10) return [];

        try {
            // Extract potential link candidates using multiple strategies
            const candidates = this.extractLinkCandidates(text);
            
            // Validate candidates against Wikipedia
            const validatedLinks: LinkSuggestion[] = [];
            
            for (const candidate of candidates) {
                const validation = await this.validateWikipediaLink(candidate.text);
                if (validation.exists) {
                    validatedLinks.push({
                        text: candidate.text,
                        wikipediaTitle: validation.title,
                        confidence: validation.confidence,
                        startIndex: candidate.startIndex,
                        endIndex: candidate.endIndex,
                        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(validation.title)}`,
                        description: validation.description
                    });
                }
            }
            
            // Remove overlapping suggestions (keep higher confidence ones)
            return this.removeOverlappingSuggestions(validatedLinks);
            
        } catch (error) {
            console.error('Error detecting links:', error);
            return [];
        }
    }

    private static extractLinkCandidates(text: string): Array<{text: string, startIndex: number, endIndex: number}> {
        const candidates: Array<{text: string, startIndex: number, endIndex: number}> = [];
        
        // Strategy 1: Proper nouns (capitalized words/phrases)
        const properNounRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
        let match;
        
        while ((match = properNounRegex.exec(text)) !== null) {
            const candidateText = match[0].trim();
            
            // Skip if too short, too long, or is a skip word
            if (candidateText.length < 3 || 
                candidateText.length > 60 || 
                this.SKIP_WORDS.has(candidateText.toLowerCase())) {
                continue;
            }
            
            candidates.push({
                text: candidateText,
                startIndex: match.index,
                endIndex: match.index + candidateText.length
            });
        }

        // Strategy 2: Multi-word capitalized phrases (institutions, places)
        const institutionRegex = /\b(?:University of|Institute of|College of|School of)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
        while ((match = institutionRegex.exec(text)) !== null) {
            const candidateText = match[0].trim();
            candidates.push({
                text: candidateText,
                startIndex: match.index,
                endIndex: match.index + candidateText.length
            });
        }

        // Strategy 3: Common patterns (years, countries, scientific terms)
        const commonPatterns = [
            /\b[A-Z][a-z]+\s+(?:University|Institute|College|Hospital|Museum|Library|Center|Centre)\b/g,
            /\b(?:United States|United Kingdom|New York|Los Angeles|San Francisco|Washington|London|Paris|Berlin|Tokyo|Beijing)\b/g,
            /\b[A-Z][a-z]+\s+(?:Award|Prize|Medal|Foundation|Society|Association|Organization)\b/g
        ];

        for (const pattern of commonPatterns) {
            while ((match = pattern.exec(text)) !== null) {
                const candidateText = match[0].trim();
                candidates.push({
                    text: candidateText,
                    startIndex: match.index,
                    endIndex: match.index + candidateText.length
                });
            }
        }

        return candidates;
    }

    private static async validateWikipediaLink(term: string): Promise<{exists: boolean, title: string, confidence: number, description?: string}> {
        try {
            // Use Wikipedia's opensearch API for validation
            const params = new URLSearchParams({
                action: 'opensearch',
                search: term,
                format: 'json',
                limit: '3',
                origin: '*'
            });

            const response = await fetch(`${this.WIKIPEDIA_API}?${params}`);
            if (!response.ok) {
                return { exists: false, title: term, confidence: 0 };
            }

            const data = await response.json();
            const [query, titles, descriptions, urls] = data;
            
            if (!titles || titles.length === 0) {
                return { exists: false, title: term, confidence: 0 };
            }

            // Check for exact or close matches
            const exactMatch = titles.find((title: string) => 
                title.toLowerCase() === term.toLowerCase()
            );

            if (exactMatch) {
                const index = titles.indexOf(exactMatch);
                return {
                    exists: true,
                    title: exactMatch,
                    confidence: 0.95,
                    description: descriptions[index]
                };
            }

            // Check for partial matches with high confidence
            const partialMatch = titles.find((title: string) => 
                title.toLowerCase().includes(term.toLowerCase()) ||
                term.toLowerCase().includes(title.toLowerCase())
            );

            if (partialMatch) {
                const index = titles.indexOf(partialMatch);
                // Calculate confidence based on similarity
                const similarity = this.calculateSimilarity(term, partialMatch);
                if (similarity >= this.MIN_CONFIDENCE) {
                    return {
                        exists: true,
                        title: partialMatch,
                        confidence: similarity,
                        description: descriptions[index]
                    };
                }
            }

            return { exists: false, title: term, confidence: 0 };

        } catch (error) {
            console.error(`Error validating Wikipedia link for "${term}":`, error);
            return { exists: false, title: term, confidence: 0 };
        }
    }

    private static calculateSimilarity(str1: string, str2: string): number {
        const longer = str1.length > str2.length ? str1.toLowerCase() : str2.toLowerCase();
        const shorter = str1.length > str2.length ? str2.toLowerCase() : str1.toLowerCase();
        
        if (longer.length === 0) return 1.0;
        
        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }

    private static levenshteinDistance(str1: string, str2: string): number {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
        
        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
        
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + cost
                );
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    private static removeOverlappingSuggestions(suggestions: LinkSuggestion[]): LinkSuggestion[] {
        // Sort by confidence (highest first)
        const sorted = suggestions.sort((a, b) => b.confidence - a.confidence);
        const filtered: LinkSuggestion[] = [];
        
        for (const suggestion of sorted) {
            // Check if this suggestion overlaps with any already accepted suggestion
            const overlaps = filtered.some(existing => 
                (suggestion.startIndex >= existing.startIndex && suggestion.startIndex < existing.endIndex) ||
                (suggestion.endIndex > existing.startIndex && suggestion.endIndex <= existing.endIndex) ||
                (suggestion.startIndex <= existing.startIndex && suggestion.endIndex >= existing.endIndex)
            );
            
            if (!overlaps) {
                filtered.push(suggestion);
            }
        }
        
        // Sort by position in text for consistent rendering
        return filtered.sort((a, b) => a.startIndex - b.startIndex);
    }

    // Utility method to create Wikipedia-style link HTML
    static createLinkHtml(suggestion: LinkSuggestion): string {
        return `<a href="${suggestion.url}" target="_blank" class="wikipedia-link" title="${suggestion.description || suggestion.wikipediaTitle}">${suggestion.text}</a>`;
    }
}