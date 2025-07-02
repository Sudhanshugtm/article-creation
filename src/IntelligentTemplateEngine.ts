// ABOUTME: Enhanced template engine using real Wikipedia patterns from featured articles
// ABOUTME: Creates context-aware templates based on analysis of Wikipedia editorial standards

import { WikidataService, WikidataTopic } from './WikidataService';
import { ArticleCategory } from './CategoryMapper';

interface WikipediaPattern {
  category: ArticleCategory;
  subcategory?: string;
  patterns: {
    opening: string[];
    biographical: string[];
    scientific: string[];
    geographical: string[];
  };
  contextualChips: string[];
  evidenceFromFeatured: string[];
}

interface IntelligentTemplate {
  category: ArticleCategory;
  subcategories: Map<string, SubcategoryTemplate>;
  defaultTemplate: TemplateVariations;
  intelligentProperties: string[];
}

interface SubcategoryTemplate {
  name: string;
  detectionKeywords: string[];
  templates: TemplateVariations;
  contextualChips: string[];
  wikipediaEvidence: string[];
}

interface TemplateVariations {
  formal: string;
  concise: string;
  detailed: string;
}

export class IntelligentTemplateEngine {
  private intelligentTemplates: Map<ArticleCategory, IntelligentTemplate> = new Map();
  private wikipediaPatterns: WikipediaPattern[] = [];
  
  constructor(private _wikidataService: WikidataService) {
    this.initializeWikipediaPatterns();
    this.initializeIntelligentTemplates();
  }
  
  private initializeWikipediaPatterns() {
    // Based on analysis of featured articles: Archimedes, Edison, Faraday, etc.
    this.wikipediaPatterns.push({
      category: ArticleCategory.PERSON,
      subcategory: 'scientist',
      patterns: {
        opening: [
          "{{NAME}} ({{DATES}}) was an {{NATIONALITY}} {{FIELD}} who {{MAIN_CONTRIBUTION}}",
          "{{NAME}} ({{DATES}}) was {{ARTICLE}} {{NATIONALITY}} {{PROFESSION}} and {{SECONDARY_FIELD}}"
        ],
        biographical: [
          "Although few details of {{PRONOUN_POSSESSIVE}} life are known, {{PRONOUN}} is considered one of {{ACHIEVEMENT_LEVEL}}",
          "{{PRONOUN}} developed many devices in fields such as {{FIELDS_LIST}}"
        ],
        scientific: [
          "{{PRONOUN}} anticipated modern {{FIELD}} by {{METHOD}}",
          "{{PRONOUN_POSSESSIVE}} main discoveries include {{DISCOVERIES_LIST}}"
        ],
        geographical: []
      },
      contextualChips: [
        '+ scientific field', '+ major discovery', '+ research method', 
        '+ theoretical contribution', '+ practical applications', '+ scientific impact'
      ],
      evidenceFromFeatured: [
        'Archimedes: "Ancient Greek mathematician, physicist, engineer"',
        'Edison: "American inventor and businessman who developed many devices"',
        'Faraday: "English chemist and physicist who contributed to electrochemistry"'
      ]
    });

    // Based on analysis of Birmingham, Naples
    this.wikipediaPatterns.push({
      category: ArticleCategory.LOCATION,
      subcategory: 'city',
      patterns: {
        opening: [
          "{{NAME}} is a {{TYPE}} and {{ADMINISTRATIVE_ROLE}} in {{REGION}}",
          "{{NAME}} is {{ARTICLE}} {{TYPE}} in {{REGION}} with a population of {{POPULATION}}"
        ],
        geographical: [
          "It is the {{RANKING}} city in {{COUNTRY}} by {{METRIC}}",
          "{{NAME}} borders {{NEIGHBORING_AREAS}} and forms {{METROPOLITAN_AREA}}"
        ],
        biographical: [],
        scientific: []
      },
      contextualChips: [
        '+ city type', '+ metropolitan status', '+ regional significance',
        '+ administrative role', '+ population ranking', '+ geographical features'
      ],
      evidenceFromFeatured: [
        'Birmingham: "city and metropolitan borough in the metropolitan county"',
        'Naples: "regional capital of Campania and third-largest city of Italy"'
      ]
    });

    // Based on analysis of Common Ostrich, Shoebill
    this.wikipediaPatterns.push({
      category: ArticleCategory.SPECIES,
      subcategory: 'bird',
      patterns: {
        opening: [
          "The {{COMMON_NAME}} ({{SCIENTIFIC_NAME}}) is {{ARTICLE}} {{TYPE}} native to {{HABITAT}}",
          "The {{COMMON_NAME}} ({{SCIENTIFIC_NAME}}) is {{ARTICLE}} species of {{BROADER_TYPE}}"
        ],
        scientific: [
          "It is one of {{NUMBER}} extant species of {{GROUP}}",
          "It derives its name from its {{DISTINCTIVE_FEATURE}}"
        ],
        geographical: [],
        biographical: []
      },
      contextualChips: [
        '+ bird type', '+ habitat', '+ distinctive features',
        '+ conservation status', '+ taxonomic classification', '+ behavioral traits'
      ],
      evidenceFromFeatured: [
        'Common Ostrich: "species of flightless bird native to certain areas of Africa"',
        'Shoebill: "large long-legged wading bird" with "enormous shoe-shaped bill"'
      ]
    });
  }

  private initializeIntelligentTemplates() {
    // Enhanced Person Template with subcategories
    const personTemplate: IntelligentTemplate = {
      category: ArticleCategory.PERSON,
      subcategories: new Map([
        ['scientist', {
          name: 'Scientist/Researcher',
          detectionKeywords: ['scientist', 'researcher', 'mathematician', 'physicist', 'chemist', 'biologist', 'engineer', 'inventor'],
          templates: {
            formal: '{{FULL_NAME}} ({{LIFE_SPAN}}) was {{ARTICLE}} {{NATIONALITY}} {{SCIENTIFIC_FIELD}} who {{MAJOR_CONTRIBUTION}}. {{PRONOUN_POSSESSIVE}} main discoveries include {{DISCOVERIES}}{{CAREER_CONTEXT}}{{LEGACY_IMPACT}}',
            concise: '{{FULL_NAME}} ({{LIFE_SPAN}}) was {{ARTICLE}} {{NATIONALITY}} {{SCIENTIFIC_FIELD}} known for {{PRIMARY_DISCOVERY}}.',
            detailed: '{{FULL_NAME}} ({{BIRTH_DETAILS}}{{DEATH_DETAILS}}) was {{ARTICLE}} {{NATIONALITY}} {{SCIENTIFIC_FIELD}} and {{SECONDARY_ROLES}}. {{EARLY_CAREER}} {{PRONOUN_POSSESSIVE}} major contributions include {{DETAILED_DISCOVERIES}}{{METHODOLOGY}}{{RECOGNITION}}{{HISTORICAL_IMPACT}}'
          },
          contextualChips: [
            '+ scientific field', '+ major discovery', '+ research method', '+ theoretical contribution',
            '+ practical applications', '+ scientific institutions', '+ awards received', '+ historical significance'
          ],
          wikipediaEvidence: [
            'Archimedes: mathematician, physicist, engineer, astronomer, and inventor',
            'Edison: inventor and businessman who developed many devices',
            'Faraday: chemist and physicist who contributed to electrochemistry and electromagnetism'
          ]
        }],
        ['artist', {
          name: 'Artist/Creative',
          detectionKeywords: ['artist', 'painter', 'sculptor', 'writer', 'author', 'composer', 'musician', 'director'],
          templates: {
            formal: '{{FULL_NAME}} ({{LIFE_SPAN}}) was {{ARTICLE}} {{NATIONALITY}} {{ARTISTIC_MEDIUM}} known for {{ARTISTIC_STYLE}}. {{PRONOUN_POSSESSIVE}} notable works include {{MAJOR_WORKS}}{{ARTISTIC_MOVEMENT}}{{CULTURAL_IMPACT}}',
            concise: '{{FULL_NAME}} ({{LIFE_SPAN}}) was {{ARTICLE}} {{NATIONALITY}} {{ARTISTIC_MEDIUM}} known for {{PRIMARY_WORK}}.',
            detailed: '{{FULL_NAME}} ({{BIRTH_DETAILS}}{{DEATH_DETAILS}}) was {{ARTICLE}} {{NATIONALITY}} {{ARTISTIC_MEDIUM}} who {{ARTISTIC_INNOVATION}}. {{EARLY_DEVELOPMENT}} {{PRONOUN_POSSESSIVE}} body of work spans {{ARTISTIC_RANGE}}{{CULTURAL_CONTEXT}}{{LASTING_INFLUENCE}}'
          },
          contextualChips: [
            '+ artistic medium', '+ artistic style', '+ notable works', '+ artistic movement',
            '+ cultural influence', '+ creative innovations', '+ exhibitions', '+ critical reception'
          ],
          wikipediaEvidence: ['Pattern to be developed from featured artist articles']
        }],
        ['politician', {
          name: 'Political Figure',
          detectionKeywords: ['politician', 'president', 'minister', 'senator', 'governor', 'mayor', 'leader'],
          templates: {
            formal: '{{FULL_NAME}} ({{LIFE_SPAN}}) was {{ARTICLE}} {{NATIONALITY}} {{POLITICAL_POSITION}} who {{MAJOR_POLICIES}}. {{PRONOUN}} served as {{OFFICES_HELD}}{{POLITICAL_ACHIEVEMENTS}}{{HISTORICAL_CONTEXT}}',
            concise: '{{FULL_NAME}} ({{LIFE_SPAN}}) was {{ARTICLE}} {{NATIONALITY}} {{POLITICAL_POSITION}} known for {{PRIMARY_POLICY}}.',
            detailed: '{{FULL_NAME}} ({{BIRTH_DETAILS}}{{DEATH_DETAILS}}) was {{ARTICLE}} {{NATIONALITY}} {{POLITICAL_POSITION}} and {{SECONDARY_ROLES}}. {{POLITICAL_CAREER}} {{PRONOUN_POSSESSIVE}} administration focused on {{POLICY_AREAS}}{{POLITICAL_LEGACY}}{{HISTORICAL_SIGNIFICANCE}}'
          },
          contextualChips: [
            '+ political position', '+ political party', '+ major policies', '+ political achievements',
            '+ offices held', '+ political reforms', '+ electoral history', '+ political legacy'
          ],
          wikipediaEvidence: ['Pattern to be developed from featured political figures']
        }]
      ]),
      defaultTemplate: {
        formal: '{{FULL_NAME}} ({{LIFE_SPAN}}) was {{ARTICLE}} {{NATIONALITY}} {{OCCUPATION}} who {{ACHIEVEMENT}}. {{PRONOUN}} {{CAREER_SUMMARY}}{{NOTABLE_CONTRIBUTIONS}}{{RECOGNITION}}',
        concise: '{{FULL_NAME}} ({{LIFE_SPAN}}) was {{ARTICLE}} {{NATIONALITY}} {{OCCUPATION}} known for {{MAIN_CONTRIBUTION}}.',
        detailed: '{{FULL_NAME}} ({{BIRTH_DETAILS}}{{DEATH_DETAILS}}) was {{ARTICLE}} {{NATIONALITY}} {{OCCUPATION}} who {{DETAILED_ACHIEVEMENT}}. {{BACKGROUND}} {{CAREER_DETAILS}}{{LEGACY}}'
      },
      intelligentProperties: [
        'P569', 'P570', 'P19', 'P20', 'P27', 'P106', 'P69', 'P166', 'P800',
        'P101', 'P108', 'P512', 'P184', 'P185' // Enhanced properties for context
      ]
    };

    // Enhanced Location Template with subcategories
    const locationTemplate: IntelligentTemplate = {
      category: ArticleCategory.LOCATION,
      subcategories: new Map([
        ['city', {
          name: 'City/Urban Area',
          detectionKeywords: ['city', 'town', 'municipality', 'urban', 'metropolitan'],
          templates: {
            formal: '{{NAME}} is {{ARTICLE}} {{CITY_TYPE}} and {{ADMINISTRATIVE_ROLE}} in {{REGION}}. {{POPULATION_CONTEXT}}{{GEOGRAPHICAL_SIGNIFICANCE}}{{ADMINISTRATIVE_DETAILS}}{{ECONOMIC_ROLE}}',
            concise: '{{NAME}} is {{ARTICLE}} {{CITY_TYPE}} in {{REGION}} with a population of {{POPULATION}}.',
            detailed: '{{NAME}} is {{ARTICLE}} {{CITY_TYPE}} located in {{DETAILED_LOCATION}}. {{ADMINISTRATIVE_STATUS}} {{DEMOGRAPHIC_DETAILS}}{{GEOGRAPHICAL_FEATURES}}{{ECONOMIC_OVERVIEW}}{{CULTURAL_SIGNIFICANCE}}{{HISTORICAL_CONTEXT}}'
          },
          contextualChips: [
            '+ city type', '+ metropolitan status', '+ administrative role', '+ population ranking',
            '+ regional significance', '+ economic importance', '+ cultural landmarks', '+ transportation hub'
          ],
          wikipediaEvidence: [
            'Birmingham: "city and metropolitan borough in the metropolitan county"',
            'Naples: "regional capital and third-largest city of Italy"'
          ]
        }],
        ['geographical_feature', {
          name: 'Natural Feature',
          detectionKeywords: ['mountain', 'river', 'lake', 'forest', 'desert', 'valley', 'island'],
          templates: {
            formal: '{{NAME}} is {{ARTICLE}} {{FEATURE_TYPE}} located in {{REGION}}. {{GEOGRAPHICAL_DETAILS}}{{FORMATION_INFO}}{{ECOLOGICAL_SIGNIFICANCE}}{{HUMAN_INTERACTION}}',
            concise: '{{NAME}} is {{ARTICLE}} {{FEATURE_TYPE}} in {{REGION}} known for {{PRIMARY_CHARACTERISTIC}}.',
            detailed: '{{NAME}} is {{ARTICLE}} {{FEATURE_TYPE}} situated in {{DETAILED_LOCATION}}. {{FORMATION_HISTORY}} {{PHYSICAL_CHARACTERISTICS}}{{ECOLOGICAL_ROLE}}{{CULTURAL_IMPORTANCE}}{{CONSERVATION_STATUS}}'
          },
          contextualChips: [
            '+ geographical type', '+ formation process', '+ physical characteristics', '+ ecological role',
            '+ conservation status', '+ human activities', '+ cultural significance', '+ scientific importance'
          ],
          wikipediaEvidence: ['Pattern to be developed from featured geographical articles']
        }]
      ]),
      defaultTemplate: {
        formal: '{{NAME}} is {{ARTICLE}} {{TYPE}} in {{PARENT_LOCATION}}. {{POPULATION_INFO}}{{AREA_INFO}}{{SIGNIFICANCE}}{{HISTORY}}',
        concise: '{{NAME}} is {{ARTICLE}} {{TYPE}} in {{PARENT_LOCATION}} with {{PRIMARY_STATISTIC}}.',
        detailed: '{{NAME}} is {{ARTICLE}} {{TYPE}} located in {{PARENT_LOCATION}}. {{ADMIN_INFO}} {{DETAILED_STATISTICS}}{{GEOGRAPHY}}{{ECONOMY}}{{CULTURE}}'
      },
      intelligentProperties: [
        'P31', 'P17', 'P131', 'P1082', 'P2046', 'P571', 'P421', 'P281',
        'P36', 'P610', 'P706', 'P206' // Enhanced properties for geographical context
      ]
    };

    // Enhanced Species Template with subcategories
    const speciesTemplate: IntelligentTemplate = {
      category: ArticleCategory.SPECIES,
      subcategories: new Map([
        ['bird', {
          name: 'Avian Species',
          detectionKeywords: ['bird', 'avian', 'eagle', 'hawk', 'duck', 'sparrow', 'owl', 'parrot'],
          templates: {
            formal: 'The {{COMMON_NAME}} ({{SCIENTIFIC_NAME}}) is {{ARTICLE}} {{BIRD_TYPE}} native to {{HABITAT_REGIONS}}. {{TAXONOMIC_CONTEXT}}{{PHYSICAL_CHARACTERISTICS}}{{BEHAVIORAL_TRAITS}}{{CONSERVATION_STATUS}}',
            concise: 'The {{COMMON_NAME}} ({{SCIENTIFIC_NAME}}) is {{ARTICLE}} {{BIRD_TYPE}} found in {{PRIMARY_HABITAT}}.',
            detailed: 'The {{COMMON_NAME}} ({{SCIENTIFIC_NAME}}) is {{ARTICLE}} species of {{DETAILED_TYPE}} belonging to {{TAXONOMIC_CLASSIFICATION}}. {{EVOLUTIONARY_CONTEXT}} {{DETAILED_MORPHOLOGY}}{{ECOLOGICAL_ROLE}}{{REPRODUCTION}}{{DISTRIBUTION}}{{CONSERVATION_EFFORTS}}'
          },
          contextualChips: [
            '+ bird type', '+ habitat', '+ migration patterns', '+ feeding behavior',
            '+ nesting habits', '+ conservation status', '+ distinctive features', '+ ecological role'
          ],
          wikipediaEvidence: [
            'Common Ostrich: "species of flightless bird native to certain areas of Africa"',
            'Shoebill: "large long-legged wading bird" with distinctive bill'
          ]
        }],
        ['mammal', {
          name: 'Mammalian Species',
          detectionKeywords: ['mammal', 'primate', 'carnivore', 'herbivore', 'rodent', 'cetacean'],
          templates: {
            formal: 'The {{COMMON_NAME}} ({{SCIENTIFIC_NAME}}) is {{ARTICLE}} {{MAMMAL_TYPE}} native to {{HABITAT_REGIONS}}. {{TAXONOMIC_POSITION}}{{SIZE_CHARACTERISTICS}}{{SOCIAL_BEHAVIOR}}{{CONSERVATION_STATUS}}',
            concise: 'The {{COMMON_NAME}} ({{SCIENTIFIC_NAME}}) is {{ARTICLE}} {{MAMMAL_TYPE}} found in {{PRIMARY_HABITAT}}.',
            detailed: 'The {{COMMON_NAME}} ({{SCIENTIFIC_NAME}}) is {{ARTICLE}} species of {{DETAILED_TYPE}} in the {{FAMILY}} family. {{EVOLUTIONARY_HISTORY}} {{PHYSICAL_DESCRIPTION}}{{BEHAVIORAL_ECOLOGY}}{{REPRODUCTION_LIFECYCLE}}{{DISTRIBUTION_RANGE}}{{HUMAN_INTERACTION}}'
          },
          contextualChips: [
            '+ mammal type', '+ habitat', '+ social structure', '+ diet', 
            '+ reproduction', '+ conservation status', '+ human interaction', '+ evolutionary significance'
          ],
          wikipediaEvidence: ['Pattern to be developed from featured mammal articles']
        }]
      ]),
      defaultTemplate: {
        formal: 'The {{COMMON_NAME}} ({{SCIENTIFIC_NAME}}) is {{ARTICLE}} {{TAXON_RANK}} of {{PARENT_TAXON}}{{CONSERVATION_STATUS}}. {{RANGE_INFO}}{{CHARACTERISTICS}}{{DISCOVERY_INFO}}',
        concise: 'The {{COMMON_NAME}} ({{SCIENTIFIC_NAME}}) is {{ARTICLE}} {{TAXON_RANK}} native to {{HABITAT}}.',
        detailed: 'The {{COMMON_NAME}} ({{SCIENTIFIC_NAME}}) is {{ARTICLE}} {{TAXON_RANK}} of {{PARENT_TAXON}} in the {{FAMILY}} family. {{DETAILED_CLASSIFICATION}} {{MORPHOLOGY}}{{ECOLOGY}}{{BEHAVIOR}}{{DISTRIBUTION}}'
      },
      intelligentProperties: [
        'P225', 'P171', 'P105', 'P141', 'P183', 'P181', 'P1843', 'P935',
        'P2067', 'P2048', 'P2049', 'P2044' // Enhanced properties for biological context
      ]
    };

    this.intelligentTemplates.set(ArticleCategory.PERSON, personTemplate);
    this.intelligentTemplates.set(ArticleCategory.LOCATION, locationTemplate);
    this.intelligentTemplates.set(ArticleCategory.SPECIES, speciesTemplate);
  }

  async generateIntelligentLeads(
    topic: WikidataTopic,
    category: ArticleCategory
  ): Promise<{ formal: string; concise: string; detailed: string; contextualChips: string[] }> {
    const template = this.intelligentTemplates.get(category);
    if (!template) {
      return this.generateFallbackLeads(topic, category);
    }

    // Detect subcategory for more specific templates
    const subcategory = this.detectSubcategory(topic, template);
    const selectedTemplate = subcategory ? 
      template.subcategories.get(subcategory)?.templates || template.defaultTemplate :
      template.defaultTemplate;

    // Get contextual chips
    const contextualChips = subcategory ?
      template.subcategories.get(subcategory)?.contextualChips || [] :
      this.getDefaultChipsForCategory(category);

    // Fetch enhanced properties
    const entityData = await this.fetchIntelligentProperties(topic.id, template, topic, subcategory);

    return {
      formal: this.fillIntelligentTemplate(selectedTemplate.formal, entityData),
      concise: this.fillIntelligentTemplate(selectedTemplate.concise, entityData),
      detailed: this.fillIntelligentTemplate(selectedTemplate.detailed, entityData),
      contextualChips
    };
  }

  private detectSubcategory(topic: WikidataTopic, template: IntelligentTemplate): string | undefined {
    const description = topic.description.toLowerCase();
    
    for (const [subcategoryKey, subcategoryData] of template.subcategories) {
      if (subcategoryData.detectionKeywords.some(keyword => 
        description.includes(keyword.toLowerCase())
      )) {
        return subcategoryKey;
      }
    }
    
    return undefined;
  }

  private async fetchIntelligentProperties(
    entityId: string, 
    template: IntelligentTemplate, 
    topic: WikidataTopic,
    subcategory?: string
  ) {
    // If no entityId (manual topic), use intelligent templates with placeholders
    if (!entityId) {
      return this.mapIntelligentPlaceholders({}, template.category, topic, subcategory);
    }
    
    const properties = template.intelligentProperties;
    const rawProperties = await WikidataService.getEntityProperties(entityId, properties);
    
    // Enhanced entity resolution
    const entityIdsToResolve: string[] = [];
    Object.values(rawProperties).forEach(value => {
      if (typeof value === 'string' && value.match(/^Q\d+$/)) {
        entityIdsToResolve.push(value);
      }
    });
    
    const resolvedNames = await WikidataService.resolveEntityNames(entityIdsToResolve);
    
    const resolvedProperties: Record<string, any> = {};
    Object.entries(rawProperties).forEach(([key, value]) => {
      if (typeof value === 'string' && value.match(/^Q\d+$/)) {
        resolvedProperties[key] = resolvedNames[value] || value;
      } else {
        resolvedProperties[key] = value;
      }
    });
    
    return this.mapIntelligentPlaceholders(resolvedProperties, template.category, topic, subcategory);
  }

  private mapIntelligentPlaceholders(
    properties: Record<string, any>, 
    category: ArticleCategory, 
    topic: WikidataTopic,
    subcategory?: string
  ): Record<string, string> {
    switch (category) {
      case ArticleCategory.PERSON:
        return this.mapPersonPlaceholders(properties, topic, subcategory);
      case ArticleCategory.LOCATION:
        return this.mapLocationPlaceholders(properties, topic, subcategory);
      case ArticleCategory.SPECIES:
        return this.mapSpeciesPlaceholders(properties, topic, subcategory);
      default:
        return {};
    }
  }

  private mapPersonPlaceholders(properties: Record<string, any>, topic: WikidataTopic, subcategory?: string): Record<string, string> {
    const placeholders: Record<string, string> = {};
    
    // Common person placeholders
    placeholders.FULL_NAME = topic.title;
    placeholders.LIFE_SPAN = this.formatLifeSpan(properties.P569, properties.P570);
    placeholders.BIRTH_DETAILS = this.formatBirthDetails(properties.P569, properties.P19);
    placeholders.DEATH_DETAILS = this.formatDeathDetails(properties.P570, properties.P20);
    placeholders.NATIONALITY = properties.P27 || this.extractNationalityFromDescription(topic.description);
    placeholders.ARTICLE = this.getArticle(placeholders.NATIONALITY);
    placeholders.PRONOUN = this.getPersonPronoun(properties);
    placeholders.PRONOUN_POSSESSIVE = this.getPossessivePronoun(properties);

    // Subcategory-specific placeholders
    if (subcategory === 'scientist') {
      placeholders.SCIENTIFIC_FIELD = this.extractScientificField(properties.P106, topic.description);
      placeholders.MAJOR_CONTRIBUTION = this.extractMajorContribution(topic.description);
      placeholders.DISCOVERIES = this.formatDiscoveries(properties.P800);
      placeholders.PRIMARY_DISCOVERY = this.extractPrimaryDiscovery(topic.description);
      placeholders.CAREER_CONTEXT = this.generateCareerContext(properties);
      placeholders.LEGACY_IMPACT = this.generateLegacyImpact(topic.description);
    } else if (subcategory === 'artist') {
      placeholders.ARTISTIC_MEDIUM = this.extractArtisticMedium(properties.P106, topic.description);
      placeholders.ARTISTIC_STYLE = this.extractArtisticStyle(topic.description);
      placeholders.MAJOR_WORKS = this.formatMajorWorks(properties.P800);
      // Add more artistic placeholders...
    }
    
    return placeholders;
  }

  private mapLocationPlaceholders(properties: Record<string, any>, topic: WikidataTopic, subcategory?: string): Record<string, string> {
    const placeholders: Record<string, string> = {};
    
    placeholders.NAME = topic.title;
    placeholders.REGION = properties.P131 || properties.P17 || this.inferRegionFromTitle(topic.title);
    placeholders.ARTICLE = this.getArticle('city');
    
    // Auto-detect as city if no subcategory specified
    const detectedSubcategory = subcategory || 'city';
    
    if (detectedSubcategory === 'city') {
      placeholders.CITY_TYPE = this.extractCityType(properties.P31, topic.description) || 'city';
      placeholders.ADMINISTRATIVE_ROLE = this.extractAdministrativeRole(properties, topic.description) || 'city';
      placeholders.POPULATION = properties.P1082 || '+ population';
      placeholders.POPULATION_CONTEXT = this.generatePopulationContext(properties.P1082, properties) || ' with a population of + population';
      placeholders.GEOGRAPHICAL_SIGNIFICANCE = this.extractGeographicalSignificance(topic.description) || '';
      placeholders.DETAILED_LOCATION = properties.P131 || properties.P17 || '+ state/province, + country';
      placeholders.ADMINISTRATIVE_STATUS = 'It serves as + administrative role';
      placeholders.DEMOGRAPHIC_DETAILS = 'The population is + population as of + year';
      placeholders.GEOGRAPHICAL_FEATURES = 'The city is known for + geographical features';
      placeholders.ECONOMIC_OVERVIEW = 'The economy is based on + economic sectors';
      placeholders.CULTURAL_SIGNIFICANCE = 'It is notable for + cultural aspects';
      placeholders.HISTORICAL_CONTEXT = 'The city was + historical information';
    }
    
    return placeholders;
  }

  private mapSpeciesPlaceholders(properties: Record<string, any>, topic: WikidataTopic, subcategory?: string): Record<string, string> {
    const placeholders: Record<string, string> = {};
    
    placeholders.COMMON_NAME = properties.P1843 || topic.title;
    placeholders.SCIENTIFIC_NAME = properties.P225 || '';
    placeholders.ARTICLE = this.getArticle(placeholders.COMMON_NAME);
    
    if (subcategory === 'bird') {
      placeholders.BIRD_TYPE = this.extractBirdType(properties.P105, topic.description);
      placeholders.HABITAT_REGIONS = this.formatHabitatRegions(properties.P183);
      placeholders.TAXONOMIC_CONTEXT = this.generateTaxonomicContext(properties);
      placeholders.PHYSICAL_CHARACTERISTICS = this.extractPhysicalCharacteristics(topic.description);
    }
    
    return placeholders;
  }

  // Utility methods for intelligent placeholder mapping
  private formatLifeSpan(birthDate: string, deathDate: string): string {
    if (!birthDate && !deathDate) return 'dates unknown';
    if (birthDate && deathDate) return `${birthDate}–${deathDate}`;
    if (birthDate) return `born ${birthDate}`;
    return 'dates unknown';
  }

  private formatBirthDetails(birthDate: string, birthPlace: string): string {
    if (!birthDate) return '';
    return birthPlace ? `${birthDate} in ${birthPlace}` : birthDate;
  }

  private formatDeathDetails(deathDate: string, deathPlace: string): string {
    if (!deathDate) return '';
    return deathPlace ? `, died ${deathDate} in ${deathPlace}` : `, died ${deathDate}`;
  }

  private extractScientificField(occupation: string, description: string): string {
    const fields = ['mathematician', 'physicist', 'chemist', 'biologist', 'engineer', 'astronomer'];
    for (const field of fields) {
      if (description.toLowerCase().includes(field) || occupation?.toLowerCase().includes(field)) {
        return field;
      }
    }
    return occupation || 'scientist';
  }

  private extractMajorContribution(description: string): string {
    if (description.includes('discovered')) return 'made significant discoveries';
    if (description.includes('invented')) return 'created important inventions';
    if (description.includes('theory')) return 'developed important theories';
    return 'made notable contributions to science';
  }

  private getDefaultChipsForCategory(category: ArticleCategory): string[] {
    switch (category) {
      case ArticleCategory.PERSON:
        return ['+ nationality', '+ occupation', '+ birth year', '+ achievements', '+ education'];
      case ArticleCategory.LOCATION:
        return ['+ location type', '+ population', '+ geographical features', '+ administrative status'];
      case ArticleCategory.SPECIES:
        return ['+ scientific classification', '+ habitat', '+ conservation status', '+ physical description'];
      default:
        return ['+ description', '+ category', '+ significance'];
    }
  }

  private fillIntelligentTemplate(template: string, data: Record<string, string>): string {
    let filled = template;
    
    Object.entries(data).forEach(([key, value]) => {
      filled = filled.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
    });
    
    // Clean up unfilled placeholders and extra spaces
    filled = filled.replace(/{{[^}]+}}/g, '');
    filled = filled.replace(/\s+/g, ' ').trim();
    filled = filled.replace(/\s+([.,;!?])/g, '$1');
    
    return filled;
  }

  private generateFallbackLeads(topic: WikidataTopic, category: ArticleCategory): 
    { formal: string; concise: string; detailed: string; contextualChips: string[] } {
    return {
      formal: `${topic.title} is ${topic.description}.`,
      concise: `${topic.title}: ${topic.description}.`,
      detailed: `${topic.title} is ${topic.description}.`,
      contextualChips: this.getDefaultChipsForCategory(category)
    };
  }

  // Additional utility methods would be implemented here...
  private getArticle(word: string): string {
    if (!word) return 'a';
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    return vowels.includes(word.toLowerCase().charAt(0)) ? 'an' : 'a';
  }

  private extractNationalityFromDescription(description: string): string {
    const nationalities = ['American', 'British', 'German', 'French', 'Italian', 'Spanish', 'Indian', 'Chinese', 'Japanese'];
    for (const nationality of nationalities) {
      if (description.includes(nationality.toLowerCase())) {
        return nationality;
      }
    }
    return '';
  }

  private getPersonPronoun(_properties: Record<string, any>): string {
    // Could be enhanced with gender detection from Wikidata
    return 'They';
  }

  private getPossessivePronoun(_properties: Record<string, any>): string {
    return 'Their';
  }

  // Utility methods for placeholder mapping
  private extractCityType(_instanceOf: string, description: string): string { 
    if (description.toLowerCase().includes('capital')) return 'capital city';
    if (description.toLowerCase().includes('port')) return 'port city';
    return 'city'; 
  }
  
  private extractAdministrativeRole(_properties: Record<string, any>, description: string): string { 
    if (description.toLowerCase().includes('capital')) return 'capital and administrative center';
    return 'administrative center'; 
  }
  
  private generatePopulationContext(population: string, _properties: Record<string, any>): string { 
    return population ? ` It has a population of ${population}.` : ''; 
  }
  
  private extractGeographicalSignificance(_description: string): string { return ''; }
  
  private extractBirdType(_taxonRank: string, description: string): string { 
    if (description.toLowerCase().includes('flightless')) return 'flightless bird';
    if (description.toLowerCase().includes('wading')) return 'wading bird';
    return 'bird'; 
  }
  
  private formatHabitatRegions(habitat: string): string { return habitat || 'various regions'; }
  private generateTaxonomicContext(_properties: Record<string, any>): string { return ''; }
  private extractPhysicalCharacteristics(_description: string): string { return ''; }
  private formatDiscoveries(notableWork: string): string { return notableWork || ''; }
  private extractPrimaryDiscovery(_description: string): string { return 'their work'; }
  private generateCareerContext(_properties: Record<string, any>): string { return ''; }
  private generateLegacyImpact(_description: string): string { return ''; }
  private extractArtisticMedium(_occupation: string, _description: string): string { return 'artist'; }
  private extractArtisticStyle(_description: string): string { return 'their distinctive style'; }
  private formatMajorWorks(notableWork: string): string { return notableWork || ''; }
  
  private inferRegionFromTitle(title: string): string {
    // Smart region inference for common cities
    const cityRegions: Record<string, string> = {
      'jaipur': 'Rajasthan, India',
      'mumbai': 'Maharashtra, India', 
      'delhi': 'Delhi, India',
      'bangalore': 'Karnataka, India',
      'chennai': 'Tamil Nadu, India',
      'kolkata': 'West Bengal, India',
      'hyderabad': 'Telangana, India',
      'pune': 'Maharashtra, India',
      'ahmedabad': 'Gujarat, India',
      'surat': 'Gujarat, India'
    };
    
    const lowerTitle = title.toLowerCase();
    return cityRegions[lowerTitle] || '+ region/state, + country';
  }
}