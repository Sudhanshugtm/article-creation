// LeadTemplateEngine.ts
import { WikidataService, WikidataTopic } from './WikidataService';
import { ArticleCategory } from './CategoryMapper';

export interface LeadTemplate {
  category: ArticleCategory;
  templates: {
    formal: string;
    concise: string;
    detailed: string;
  };
  requiredProperties: string[];
  optionalProperties: string[];
}

export class LeadTemplateEngine {
  private templates: Map<ArticleCategory, LeadTemplate> = new Map();
  
  constructor(private wikidataService: WikidataService) {
    this.initializeTemplates();
  }
  
  private initializeTemplates() {
    // Species/Biology Template
    this.templates.set(ArticleCategory.SPECIES, {
      category: ArticleCategory.SPECIES,
      templates: {
        formal: `The {{COMMON_NAME}} ({{SCIENTIFIC_NAME}}) is {{ARTICLE}} {{TAXON_RANK}} of {{PARENT_TAXON}}{{CONSERVATION_STATUS}}. {{RANGE_INFO}}{{CHARACTERISTICS}}{{DISCOVERY_INFO}}`,
        
        concise: `The {{COMMON_NAME}} ({{SCIENTIFIC_NAME}}) is {{ARTICLE}} {{TAXON_RANK}} of {{PARENT_TAXON}} native to {{HABITAT}}.`,
        
        detailed: `The {{COMMON_NAME}} ({{SCIENTIFIC_NAME}}) is {{ARTICLE}} {{TAXON_RANK}} of {{PARENT_TAXON}} in the {{FAMILY}} family{{CONSERVATION_STATUS}}. {{RANGE_INFO}} {{CHARACTERISTICS}} {{BEHAVIOR}} {{DISCOVERY_INFO}} {{SIGNIFICANCE}}`
      },
      requiredProperties: ['P225'], // taxon name
      optionalProperties: [
        'P171', // parent taxon
        'P105', // taxon rank
        'P141', // conservation status
        'P183', // endemic to
        'P181', // taxon range map
        'P1843', // common name
        'P935', // Commons gallery
      ]
    });
    
    // Person/Biography Template
    this.templates.set(ArticleCategory.PERSON, {
      category: ArticleCategory.PERSON,
      templates: {
        formal: `{{FULL_NAME}} ({{BIRTH_DATE}}{{DEATH_DATE}}) was {{ARTICLE}} {{NATIONALITY}} {{OCCUPATION}}{{NOTABLE_FOR}}. {{PRONOUN}} {{ACHIEVEMENT}}{{EDUCATION}}{{CAREER}}`,
        
        concise: `{{FULL_NAME}} ({{LIFE_SPAN}}) was {{ARTICLE}} {{NATIONALITY}} {{OCCUPATION}} known for {{MAIN_WORK}}.`,
        
        detailed: `{{FULL_NAME}} (born {{BIRTH_DETAILS}}{{DEATH_DETAILS}}) was {{ARTICLE}} {{NATIONALITY}} {{OCCUPATION}} who {{ACHIEVEMENT}}. {{EARLY_LIFE}} {{CAREER_DETAILS}} {{LEGACY}}`
      },
      requiredProperties: ['P31'], // instance of human
      optionalProperties: [
        'P569', // birth date
        'P570', // death date
        'P19',  // birthplace
        'P20',  // death place
        'P27',  // nationality
        'P106', // occupation
        'P69',  // educated at
        'P166', // awards
        'P800', // notable work
      ]
    });
    
    // Location Template
    this.templates.set(ArticleCategory.LOCATION, {
      category: ArticleCategory.LOCATION,
      templates: {
        formal: `{{NAME}} is {{ARTICLE}} {{TYPE}} in {{PARENT_LOCATION}}. {{POPULATION_INFO}}{{AREA_INFO}}{{SIGNIFICANCE}}{{HISTORY}}`,
        
        concise: `{{NAME}} is {{ARTICLE}} {{TYPE}} in {{PARENT_LOCATION}} with a population of {{POPULATION}}.`,
        
        detailed: `{{NAME}} is {{ARTICLE}} {{TYPE}} located in {{PARENT_LOCATION}}. {{ADMIN_INFO}} {{POPULATION_DETAILS}} {{GEOGRAPHY}} {{ECONOMY}} {{CULTURE}}`
      },
      requiredProperties: ['P31', 'P17'], // instance of, country
      optionalProperties: [
        'P131', // located in
        'P1082', // population
        'P2046', // area
        'P571', // inception
        'P421', // timezone
        'P281', // postal code
      ]
    });
    
    // Organization Template
    this.templates.set(ArticleCategory.ORGANIZATION, {
      category: ArticleCategory.ORGANIZATION,
      templates: {
        formal: `{{NAME}} is {{ARTICLE}} organization{{FOUNDER}}{{HQ}}{{FOUNDING_DATE}}{{DESCRIPTION}}`,
        concise: `{{NAME}} is {{ARTICLE}} organization founded on{{FOUNDING_DATE}}.`,
        detailed: `{{NAME}} is {{ARTICLE}} organization{{FOUNDER}}{{HQ}} founded on{{FOUNDING_DATE}}.{{DESCRIPTION}}`
      },
      requiredProperties: [],
      optionalProperties: ['P571', 'P112', 'P159']
    });
    // Concept Template
    this.templates.set(ArticleCategory.CONCEPT, {
      category: ArticleCategory.CONCEPT,
      templates: {
        formal: `{{NAME}} is {{ARTICLE}} {{SUBCLASS}} concept{{DESCRIPTION}}`,
        concise: `{{NAME}}: {{DESCRIPTION}}`,
        detailed: `{{NAME}} is {{ARTICLE}} {{SUBCLASS}} concept.{{DESCRIPTION}}`
      },
      requiredProperties: [],
      optionalProperties: ['P279']
    });
    // Creative Work Template
    this.templates.set(ArticleCategory.CREATIVE_WORK, {
      category: ArticleCategory.CREATIVE_WORK,
      templates: {
        formal: `{{NAME}} is {{ARTICLE}} {{TYPE}}{{AUTHOR}}{{DATE}}{{DESCRIPTION}}`,
        concise: `{{NAME}}: {{DESCRIPTION}}`,
        detailed: `{{NAME}} is {{ARTICLE}} {{TYPE}}{{AUTHOR}}{{DATE}}.{{DESCRIPTION}}`
      },
      requiredProperties: [],
      optionalProperties: ['P31', 'P50', 'P577']
    });
    // Event Template
    this.templates.set(ArticleCategory.EVENT, {
      category: ArticleCategory.EVENT,
      templates: {
        formal: `{{NAME}} was {{ARTICLE}} event{{LOCATION}} held on{{DATE}}{{DESCRIPTION}}`,
        concise: `{{NAME}}: {{DESCRIPTION}}`,
        detailed: `{{NAME}} was {{ARTICLE}} event{{LOCATION}} on{{DATE}}.{{DESCRIPTION}}`
      },
      requiredProperties: [],
      optionalProperties: ['P585', 'P131']
    });
  }
  
  async generateLeadVariations(
    topic: WikidataTopic, 
    category: ArticleCategory
  ): Promise<{ formal: string; concise: string; detailed: string }> {
    const template = this.templates.get(category);
    if (!template) {
      // Fallback for categories without a dedicated template: include instanceOf details if available
      const { title, description, instanceOf } = topic;
      let instanceText = '';
      if (instanceOf && instanceOf.length > 0) {
        try {
          const namesMap = await WikidataService.resolveEntityNames(instanceOf);
          const names = instanceOf.map(id => namesMap[id] || id);
          if (names.length > 0) {
            instanceText = ` It is an instance of ${names.join(', ')}.`;
          }
        } catch {
          // ignore resolution errors
        }
      }
      const formal = `The ${title} is ${description}.${instanceText}`;
      const concise = `${title}: ${description}.`;
      const detailed = `${title} is ${description}.${instanceText}`;
      return { formal, concise, detailed };
    }
    
    // Fetch additional properties from Wikidata
    const entityData = await this.fetchEntityProperties(topic.id, template, topic);
    
    return {
      formal: this.fillTemplate(template.templates.formal, entityData),
      concise: this.fillTemplate(template.templates.concise, entityData),
      detailed: this.fillTemplate(template.templates.detailed, entityData)
    };
  }
  
  private async fetchEntityProperties(entityId: string, template: LeadTemplate, topic: WikidataTopic) {
    const properties = [...template.requiredProperties, ...template.optionalProperties];
    const rawProperties = await WikidataService.getEntityProperties(entityId, properties);
    
    // Collect entity IDs that need to be resolved to names
    const entityIdsToResolve: string[] = [];
    Object.values(rawProperties).forEach(value => {
      if (typeof value === 'string' && value.match(/^Q\d+$/)) {
        entityIdsToResolve.push(value);
      }
    });
    
    // Resolve entity IDs to human-readable names
    const resolvedNames = await WikidataService.resolveEntityNames(entityIdsToResolve);
    
    // Replace entity IDs with resolved names
    const resolvedProperties: Record<string, any> = {};
    Object.entries(rawProperties).forEach(([key, value]) => {
      if (typeof value === 'string' && value.match(/^Q\d+$/)) {
        resolvedProperties[key] = resolvedNames[value] || value;
      } else {
        resolvedProperties[key] = value;
      }
    });
    
    // Convert raw property data to template placeholders
    return this.mapPropertiesToPlaceholders(resolvedProperties, template.category, topic);
  }

  private mapPropertiesToPlaceholders(properties: Record<string, any>, category: ArticleCategory, topic: WikidataTopic): Record<string, string> {
    const placeholders: Record<string, string> = {};
    
    switch (category) {
      case ArticleCategory.SPECIES:
        placeholders.SCIENTIFIC_NAME = properties.P225 || '';
        placeholders.COMMON_NAME = properties.P1843 || topic.title;
        placeholders.PARENT_TAXON = properties.P171 || 'animals';
        placeholders.TAXON_RANK = properties.P105 || 'species';
        placeholders.CONSERVATION_STATUS = properties.P141 ? ` (conservation status: ${properties.P141})` : '';
        placeholders.RANGE_INFO = properties.P183 ? ` It is found in ${properties.P183}.` : '';
        placeholders.CHARACTERISTICS = this.getCharacteristicsFromDescription(topic.description);
        placeholders.DISCOVERY_INFO = '';
        placeholders.ARTICLE = this.getArticle(placeholders.TAXON_RANK);
        placeholders.HABITAT = properties.P183 || 'various habitats';
        placeholders.FAMILY = properties.P171 || '';
        placeholders.BEHAVIOR = '';
        placeholders.SIGNIFICANCE = this.getSignificanceFromDescription(topic.description);
        break;
        
      case ArticleCategory.PERSON:
        placeholders.FULL_NAME = properties.P1477 || topic.title;
        placeholders.BIRTH_DATE = properties.P569 || '';
        placeholders.DEATH_DATE = properties.P570 ? ` – ${properties.P570}` : '';
        placeholders.LIFE_SPAN = `${properties.P569 || 'birth year unknown'}${properties.P570 ? ` – ${properties.P570}` : ''}`;
        placeholders.BIRTH_DETAILS = properties.P569 ? `${properties.P569}${properties.P19 ? ` in ${properties.P19}` : ''}` : '';
        placeholders.DEATH_DETAILS = properties.P570 ? `, died ${properties.P570}${properties.P20 ? ` in ${properties.P20}` : ''}` : '';
        placeholders.NATIONALITY = properties.P27 || this.extractNationalityFromDescription(topic.description);
        placeholders.OCCUPATION = properties.P106 || this.extractOccupationFromDescription(topic.description);
        placeholders.NOTABLE_FOR = properties.P800 ? ` known for ${properties.P800}` : '';
        placeholders.PRONOUN = 'They';
        placeholders.ACHIEVEMENT = this.extractAchievementFromDescription(topic.description);
        placeholders.EDUCATION = properties.P69 ? ` ${placeholders.PRONOUN} studied at ${properties.P69}.` : '';
        placeholders.CAREER = '';
        placeholders.MAIN_WORK = properties.P800 || this.extractMainWorkFromDescription(topic.description);
        placeholders.EARLY_LIFE = '';
        placeholders.CAREER_DETAILS = '';
        placeholders.LEGACY = '';
        placeholders.ARTICLE = this.getArticle(placeholders.NATIONALITY);
        break;
        
      case ArticleCategory.LOCATION:
        placeholders.NAME = '';
        placeholders.TYPE = '';
        placeholders.PARENT_LOCATION = properties.P131 || properties.P17 || '';
        placeholders.POPULATION = properties.P1082 || '';
        placeholders.POPULATION_INFO = properties.P1082 ? ` It has a population of ${properties.P1082}.` : '';
        placeholders.POPULATION_DETAILS = properties.P1082 ? `The population is ${properties.P1082}.` : '';
        placeholders.AREA_INFO = properties.P2046 ? ` The area is ${properties.P2046} square kilometers.` : '';
        placeholders.SIGNIFICANCE = '';
        placeholders.HISTORY = properties.P571 ? ` It was established in ${properties.P571}.` : '';
        placeholders.ADMIN_INFO = '';
        placeholders.GEOGRAPHY = '';
        placeholders.ECONOMY = '';
        placeholders.CULTURE = '';
        placeholders.ARTICLE = 'a';
        break;
      case ArticleCategory.ORGANIZATION:
        placeholders.NAME = topic.title;
        placeholders.FOUNDING_DATE = properties.P571 ? ` ${properties.P571}` : '';
        placeholders.FOUNDER = properties.P112 ? ` founded by ${properties.P112}` : '';
        placeholders.HQ = properties.P159 ? ` headquartered in ${properties.P159}` : '';
        placeholders.DESCRIPTION = topic.description ? ` ${topic.description}` : '';
        placeholders.ARTICLE = this.getArticle('organization');
        break;
      case ArticleCategory.CONCEPT:
        placeholders.NAME = topic.title;
        placeholders.SUBCLASS = properties.P279 || 'concept';
        placeholders.DESCRIPTION = topic.description ? ` ${topic.description}` : '';
        placeholders.ARTICLE = this.getArticle('concept');
        break;
      case ArticleCategory.CREATIVE_WORK:
        placeholders.NAME = topic.title;
        placeholders.TYPE = properties.P31 || '';
        placeholders.AUTHOR = properties.P50 ? ` by ${properties.P50}` : '';
        placeholders.DATE = properties.P577 ? ` published in ${properties.P577}` : '';
        placeholders.DESCRIPTION = topic.description ? ` ${topic.description}` : '';
        placeholders.ARTICLE = this.getArticle('work');
        break;
      case ArticleCategory.EVENT:
        placeholders.NAME = topic.title;
        placeholders.DATE = properties.P585 || '';
        placeholders.LOCATION = properties.P131 ? ` in ${properties.P131}` : '';
        placeholders.DESCRIPTION = topic.description ? ` ${topic.description}` : '';
        placeholders.ARTICLE = this.getArticle('event');
        break;
    }
    
    return placeholders;
  }

  private getArticle(word: string): string {
    if (!word) return 'a';
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    return vowels.includes(word.toLowerCase().charAt(0)) ? 'an' : 'a';
  }

  private getCharacteristicsFromDescription(description: string): string {
    if (description.includes('large')) return ' It is known for its large size.';
    if (description.includes('small')) return ' It is a small species.';
    if (description.includes('carnivorous')) return ' It is a carnivorous animal.';
    return '';
  }

  private getSignificanceFromDescription(description: string): string {
    if (description.includes('endangered')) return ' It is considered an endangered species.';
    if (description.includes('apex predator')) return ' It is an apex predator in its ecosystem.';
    return '';
  }

  private extractNationalityFromDescription(description: string): string {
    const nationalities = ['American', 'British', 'German', 'French', 'Indian', 'Chinese', 'Japanese'];
    for (const nationality of nationalities) {
      if (description.includes(nationality.toLowerCase())) {
        return nationality;
      }
    }
    return '';
  }

  private extractOccupationFromDescription(description: string): string {
    const occupations = ['scientist', 'writer', 'politician', 'artist', 'musician', 'actor', 'director', 'philosopher', 'mathematician'];
    for (const occupation of occupations) {
      if (description.includes(occupation)) {
        return occupation;
      }
    }
    return '';
  }

  private extractAchievementFromDescription(description: string): string {
    if (description.includes('Nobel')) return 'won the Nobel Prize';
    if (description.includes('discovered')) return 'made significant discoveries';
    if (description.includes('invented')) return 'made important inventions';
    return 'made notable contributions to their field';
  }

  private extractMainWorkFromDescription(description: string): string {
    if (description.includes('theory')) return 'theoretical work';
    if (description.includes('novel')) return 'literary works';
    if (description.includes('film')) return 'cinematic works';
    return 'their professional work';
  }
  
  private fillTemplate(template: string, data: any): string {
    let filled = template;
    
    // Replace placeholders with actual data
    Object.entries(data).forEach(([key, value]) => {
      filled = filled.replace(new RegExp(`{{${key}}}`, 'g'), value as string);
    });
    
    // Clean up unfilled placeholders
    filled = filled.replace(/{{[^}]+}}/g, '');
    
    // Clean up extra spaces and punctuation
    filled = filled.replace(/\s+/g, ' ').trim();
    filled = filled.replace(/\s+([.,;!?])/g, '$1');
    
    return filled;
  }
  
  private getDefaultLeads(topic: WikidataTopic) {
    return {
      formal: `${topic.title} is ${topic.description}.`,
      concise: `${topic.title} is ${topic.description}.`,
      detailed: `${topic.title} is ${topic.description}.`
    };
  }
}
