// ABOUTME: WikidataService for searching topics using Wikidata API
// ABOUTME: Handles API calls and response processing for topic matching

import { CategoryMapper } from './CategoryMapper';

export interface WikidataTopic {
    id: string;
    title: string;
    description: string;
    category: string;
    instanceOf: string[];
}

export class WikidataService {
    private static readonly BASE_URL = 'https://www.wikidata.org/w/api.php';
    private static readonly SEARCH_LIMIT = 3;

    static async searchTopics(query: string): Promise<WikidataTopic[]> {
        if (!query || query.length < 3) {
            return [];
        }

        try {
            // Step 1: Search for entities
            const searchResults = await this.searchEntities(query);
            
            if (searchResults.length === 0) {
                return [];
            }

            // Step 2: Get detailed entity data including P31 properties
            const entityIds = searchResults.map(item => item.id);
            const entitiesWithCategories = await this.getEntitiesWithCategories(entityIds);
            
            // Step 3: Categorize and group by article type
            const categorizedTopics = CategoryMapper.categorizeTopics(entitiesWithCategories);
            
            return categorizedTopics;

        } catch (error) {
            console.error('Wikidata search error:', error);
            return [];
        }
    }

    private static async searchEntities(query: string): Promise<any[]> {
        const params = new URLSearchParams({
            action: 'wbsearchentities',
            search: query,
            language: 'en',
            format: 'json',
            limit: this.SEARCH_LIMIT.toString(),
            origin: '*'
        });

        const response = await fetch(`${this.BASE_URL}?${params}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.search || !Array.isArray(data.search)) {
            return [];
        }

        return data.search
            .filter((item: any) => item.label && item.description)
            .slice(0, this.SEARCH_LIMIT);
    }

    private static async getEntitiesWithCategories(entityIds: string[]): Promise<WikidataTopic[]> {
        const params = new URLSearchParams({
            action: 'wbgetentities',
            ids: entityIds.join('|'),
            format: 'json',
            languages: 'en',
            props: 'labels|descriptions|claims',
            origin: '*'
        });

        const response = await fetch(`${this.BASE_URL}?${params}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.entities) {
            return [];
        }

        const topics: WikidataTopic[] = [];
        
        for (const entityId of entityIds) {
            const entity = data.entities[entityId];
            if (!entity || !entity.labels?.en || !entity.descriptions?.en) {
                continue;
            }

            // Extract P31 (instance of) claims
            const instanceOfClaims = entity.claims?.P31 || [];
            const instanceOf = instanceOfClaims.map((claim: any) => {
                return claim.mainsnak?.datavalue?.value?.id || '';
            }).filter(Boolean);



            topics.push({
                id: entityId,
                title: entity.labels.en.value,
                description: entity.descriptions.en.value,
                category: 'Unknown', // Will be determined by CategoryMapper
                instanceOf: instanceOf
            });
        }

        return topics;
    }
}