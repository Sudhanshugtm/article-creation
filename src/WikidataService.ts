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

    static async getEntityProperties(entityId: string, propertyIds: string[]): Promise<Record<string, any>> {
        const params = new URLSearchParams({
            action: 'wbgetentities',
            ids: entityId,
            format: 'json',
            languages: 'en',
            props: 'claims',
            origin: '*'
        });

        try {
            const response = await fetch(`${this.BASE_URL}?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const entity = data.entities?.[entityId];
            
            if (!entity || !entity.claims) {
                return {};
            }

            const properties: Record<string, any> = {};
            
            for (const propId of propertyIds) {
                const claims = entity.claims[propId];
                if (claims && claims.length > 0) {
                    const claim = claims[0];
                    const value = this.extractClaimValue(claim);
                    if (value) {
                        properties[propId] = value;
                    }
                }
            }

            return properties;
        } catch (error) {
            console.error(`Error fetching properties for ${entityId}:`, error);
            return {};
        }
    }

    private static extractClaimValue(claim: any): string | null {
        const datavalue = claim.mainsnak?.datavalue;
        if (!datavalue) return null;

        switch (datavalue.type) {
            case 'string':
                return datavalue.value;
            case 'wikibase-entityid':
                return datavalue.value.id;
            case 'time':
                return this.formatDate(datavalue.value.time);
            case 'quantity':
                return datavalue.value.amount;
            default:
                return datavalue.value?.toString() || null;
        }
    }

    static async resolveEntityNames(entityIds: string[]): Promise<Record<string, string>> {
        if (entityIds.length === 0) return {};

        const params = new URLSearchParams({
            action: 'wbgetentities',
            ids: entityIds.join('|'),
            format: 'json',
            languages: 'en',
            props: 'labels',
            origin: '*'
        });

        try {
            const response = await fetch(`${this.BASE_URL}?${params}`);
            if (!response.ok) return {};

            const data = await response.json();
            const resolved: Record<string, string> = {};

            for (const entityId of entityIds) {
                const entity = data.entities?.[entityId];
                if (entity?.labels?.en?.value) {
                    resolved[entityId] = entity.labels.en.value;
                }
            }

            return resolved;
        } catch {
            return {};
        }
    }

    private static formatDate(timeString: string): string {
        try {
            const match = timeString.match(/^([+-]?\d{4,})-(\d{2})-(\d{2})/);
            if (match) {
                const [, year, month, day] = match;
                return `${year}-${month}-${day}`;
            }
            return timeString;
        } catch {
            return timeString;
        }
    }
}