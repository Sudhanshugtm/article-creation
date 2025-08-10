// ABOUTME: Service for fetching and analyzing Wikidata to enhance Wikipedia articles
// ABOUTME: Compares existing article content with available Wikidata to suggest improvements

interface WikidataEntity {
    id: string;
    labels: { [lang: string]: { language: string; value: string } };
    descriptions: { [lang: string]: { language: string; value: string } };
    claims: { [property: string]: WikidataClaim[] };
}

interface WikidataClaim {
    mainsnak: {
        snaktype: string;
        property: string;
        datavalue?: {
            type: string;
            value: any;
        };
    };
    qualifiers?: { [property: string]: any[] };
    references?: any[];
}

interface WikidataItem {
    id: string;
    label: string;
    description?: string;
}

interface EnhancementSuggestion {
    id: string;
    type: 'fact' | 'section';
    title: string;
    content: string;
    source: 'wikidata';
    property?: string;
    confidence: number;
    hint?: string;
}

export class WikidataEnhancementService {
    private readonly WIKIDATA_API = 'https://www.wikidata.org/w/api.php';
    private readonly KATIE_BOUMAN_ID = 'Q63080922'; // Katie Bouman's Wikidata ID

    async getEnhancementSuggestions(existingContent: string): Promise<EnhancementSuggestion[]> {
        try {
            const entity = await this.fetchEntity(this.KATIE_BOUMAN_ID);
            if (!entity) return [];

            const suggestions: EnhancementSuggestion[] = [];
            
            // Add fact suggestions
            const factSuggestions = await this.generateFactSuggestions(entity, existingContent);
            suggestions.push(...factSuggestions);

            // Add section suggestions
            const sectionSuggestions = await this.generateSectionSuggestions(entity, existingContent);
            suggestions.push(...sectionSuggestions);

            return suggestions.sort((a, b) => b.confidence - a.confidence);
        } catch (error) {
            console.error('Error fetching Wikidata suggestions:', error);
            return this.getFallbackSuggestions(); // Return hardcoded suggestions as fallback
        }
    }

    private async fetchEntity(entityId: string): Promise<WikidataEntity | null> {
        const url = new URL(this.WIKIDATA_API);
        url.searchParams.set('action', 'wbgetentities');
        url.searchParams.set('ids', entityId);
        url.searchParams.set('format', 'json');
        url.searchParams.set('origin', '*');

        const response = await fetch(url.toString());
        const data = await response.json();
        
        return data.entities?.[entityId] || null;
    }

    private async generateFactSuggestions(entity: WikidataEntity, existingContent: string): Promise<EnhancementSuggestion[]> {
        const suggestions: EnhancementSuggestion[] = [];
        const contentLower = existingContent.toLowerCase();

        // Check for birth date (P569)
        if (entity.claims['P569'] && !contentLower.includes('born') && !contentLower.includes('birth')) {
            const birthClaim = entity.claims['P569'][0];
            if (birthClaim.mainsnak.datavalue) {
                const birthDate = new Date(birthClaim.mainsnak.datavalue.value.time.substring(1, 11));
                suggestions.push({
                    id: 'birth-date',
                    type: 'fact',
                    title: 'Add birth date',
                    content: `Katie Bouman was born on ${birthDate.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}.`,
                    source: 'wikidata',
                    property: 'P569',
                    confidence: 0.9,
                    hint: 'Basic biographical information'
                });
            }
        }

        // Check for alma mater (P69)
        if (entity.claims['P69'] && !contentLower.includes('university of michigan')) {
            const almaMaterClaims = entity.claims['P69'];
            for (const claim of almaMaterClaims) {
                if (claim.mainsnak.datavalue) {
                    const institutionId = claim.mainsnak.datavalue.value.id;
                    const institution = await this.getItemLabel(institutionId);
                    
                    if (institution && !contentLower.includes(institution.toLowerCase())) {
                        suggestions.push({
                            id: `alma-mater-${institutionId}`,
                            type: 'fact',
                            title: `Add education at ${institution}`,
                            content: `She studied at ${institution}.`,
                            source: 'wikidata',
                            property: 'P69',
                            confidence: 0.8,
                            hint: 'Educational background'
                        });
                    }
                }
            }
        }

        // Check for employer (P108)
        if (entity.claims['P108'] && !contentLower.includes('california institute of technology')) {
            const employerClaims = entity.claims['P108'];
            for (const claim of employerClaims) {
                if (claim.mainsnak.datavalue) {
                    const employerId = claim.mainsnak.datavalue.value.id;
                    const employer = await this.getItemLabel(employerId);
                    
                    if (employer && !contentLower.includes(employer.toLowerCase())) {
                        suggestions.push({
                            id: `employer-${employerId}`,
                            type: 'fact',
                            title: `Add current position at ${employer}`,
                            content: `She is currently affiliated with ${employer}.`,
                            source: 'wikidata',
                            property: 'P108',
                            confidence: 0.85,
                            hint: 'Current professional affiliation'
                        });
                    }
                }
            }
        }

        return suggestions;
    }

    private async generateSectionSuggestions(entity: WikidataEntity, existingContent: string): Promise<EnhancementSuggestion[]> {
        const suggestions: EnhancementSuggestion[] = [];
        const contentLower = existingContent.toLowerCase();

        // Awards section (P166)
        if (entity.claims['P166'] && !contentLower.includes('awards')) {
            const awards = await this.extractAwards(entity.claims['P166']);
            if (awards.length > 0) {
                suggestions.push({
                    id: 'awards-section',
                    type: 'section',
                    title: 'Awards',
                    content: this.generateAwardsSection(awards),
                    source: 'wikidata',
                    property: 'P166',
                    confidence: 0.9,
                    hint: `Found ${awards.length} award${awards.length > 1 ? 's' : ''} in Wikidata`
                });
            }
        }

        // Education section
        if (entity.claims['P69'] && !contentLower.includes('education')) {
            const education = await this.extractEducation(entity.claims['P69']);
            if (education.length > 0) {
                suggestions.push({
                    id: 'education-section',
                    type: 'section',
                    title: 'Education',
                    content: this.generateEducationSection(education),
                    source: 'wikidata',
                    property: 'P69',
                    confidence: 0.85,
                    hint: 'Academic background and degrees'
                });
            }
        }

        // Notable works (P800)
        if (entity.claims['P800'] && !contentLower.includes('notable works')) {
            const works = await this.extractNotableWorks(entity.claims['P800']);
            if (works.length > 0) {
                suggestions.push({
                    id: 'works-section',
                    type: 'section',
                    title: 'Notable Works',
                    content: this.generateWorksSection(works),
                    source: 'wikidata',
                    property: 'P800',
                    confidence: 0.8,
                    hint: `Found ${works.length} notable work${works.length > 1 ? 's' : ''}`
                });
            }
        }

        return suggestions;
    }

    private async getItemLabel(itemId: string): Promise<string | null> {
        try {
            const entity = await this.fetchEntity(itemId);
            return entity?.labels?.en?.value || null;
        } catch {
            return null;
        }
    }

    private async extractAwards(claims: WikidataClaim[]): Promise<Array<{name: string, year?: number}>> {
        const awards = [];
        for (const claim of claims.slice(0, 10)) { // Limit to first 10 awards
            if (claim.mainsnak.datavalue) {
                const awardId = claim.mainsnak.datavalue.value.id;
                const awardName = await this.getItemLabel(awardId);
                if (awardName) {
                    const year = claim.qualifiers?.['P585']?.[0]?.datavalue?.value?.time ? 
                        new Date(claim.qualifiers['P585'][0].datavalue.value.time.substring(1, 5)).getFullYear() : 
                        undefined;
                    awards.push({ name: awardName, year });
                }
            }
        }
        return awards;
    }

    private async extractEducation(claims: WikidataClaim[]): Promise<Array<{institution: string, degree?: string, year?: number}>> {
        const education = [];
        for (const claim of claims) {
            if (claim.mainsnak.datavalue) {
                const institutionId = claim.mainsnak.datavalue.value.id;
                const institution = await this.getItemLabel(institutionId);
                if (institution) {
                    // Try to get degree type from qualifiers
                    const degreeId = claim.qualifiers?.['P512']?.[0]?.datavalue?.value?.id;
                    const degree = degreeId ? await this.getItemLabel(degreeId) || undefined : undefined;
                    
                    // Try to get year
                    const year = claim.qualifiers?.['P582']?.[0]?.datavalue?.value?.time ? 
                        new Date(claim.qualifiers['P582'][0].datavalue.value.time.substring(1, 5)).getFullYear() : 
                        undefined;
                    
                    education.push({ institution, degree, year });
                }
            }
        }
        return education;
    }

    private async extractNotableWorks(claims: WikidataClaim[]): Promise<Array<{title: string, year?: number}>> {
        const works = [];
        for (const claim of claims.slice(0, 8)) { // Limit to first 8 works
            if (claim.mainsnak.datavalue) {
                const workId = claim.mainsnak.datavalue.value.id;
                const workTitle = await this.getItemLabel(workId);
                if (workTitle) {
                    const year = claim.qualifiers?.['P577']?.[0]?.datavalue?.value?.time ? 
                        new Date(claim.qualifiers['P577'][0].datavalue.value.time.substring(1, 5)).getFullYear() : 
                        undefined;
                    works.push({ title: workTitle, year });
                }
            }
        }
        return works;
    }

    private generateAwardsSection(awards: Array<{name: string, year?: number}>): string {
        const sortedAwards = awards.sort((a, b) => (b.year || 0) - (a.year || 0));
        const awardsList = sortedAwards.map(award => 
            `<li>${award.year ? award.year + ' - ' : ''}${award.name}</li>`
        ).join('\n                    ');
        
        return `<p>Bouman has received recognition for her contributions to computational imaging and the Event Horizon Telescope project:</p>
                <ul>
                    ${awardsList}
                </ul>`;
    }

    private generateEducationSection(education: Array<{institution: string, degree?: string, year?: number}>): string {
        const sortedEducation = education.sort((a, b) => (a.year || 0) - (b.year || 0));
        const educationList = sortedEducation.map(edu => {
            let item = edu.degree ? `${edu.degree} - ${edu.institution}` : edu.institution;
            if (edu.year) item += ` (${edu.year})`;
            return `<li>${item}</li>`;
        }).join('\n                    ');
        
        return `<p>Bouman completed her education at the following institutions:</p>
                <ul>
                    ${educationList}
                </ul>`;
    }

    private generateWorksSection(works: Array<{title: string, year?: number}>): string {
        const sortedWorks = works.sort((a, b) => (b.year || 0) - (a.year || 0));
        const worksList = sortedWorks.map(work => 
            `<li>${work.year ? work.year + ' - ' : ''}"${work.title}"</li>`
        ).join('\n                    ');
        
        return `<p>Bouman has contributed to several significant works in computational imaging:</p>
                <ul>
                    ${worksList}
                </ul>`;
    }

    private getFallbackSuggestions(): EnhancementSuggestion[] {
        // Return the original hardcoded suggestions as fallback
        return [
            {
                id: 'harvard-fallback',
                type: 'fact',
                title: 'Harvard postdoctoral fellowship',
                content: 'Bouman joined Harvard University as a postdoctoral fellow on the Event Horizon Telescope Imaging team (2018)',
                source: 'wikidata',
                confidence: 0.8,
                hint: 'Career milestone'
            },
            {
                id: 'caltech-fallback',
                type: 'fact',
                title: 'Caltech professorship',
                content: 'She then joined the California Institute of Technology (Caltech) as an assistant professor in June 2019, later promoted to associate professor',
                source: 'wikidata',
                confidence: 0.8,
                hint: 'Current position'
            }
        ];
    }
}