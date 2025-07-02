// ABOUTME: Intelligent section suggestion engine based on Wikidata context and article categories
// ABOUTME: Generates contextually relevant section suggestions and content templates for different article types

import { WikidataService, WikidataTopic } from './WikidataService';
import { ArticleCategory } from './CategoryMapper';

interface SectionTemplate {
  title: string;
  description: string;
  icon: string;
  contentTemplate: string;
  wikidataProperties?: string[];
  priority: number;
  wikipediaEvidence?: string[];
}

interface CategorySections {
  category: ArticleCategory;
  subcategorySections: Map<string, SectionTemplate[]>;
  defaultSections: SectionTemplate[];
}

export class IntelligentSectionEngine {
  private categorySections: Map<ArticleCategory, CategorySections> = new Map();
  
  constructor(private wikidataService: WikidataService) {
    this.initializeSectionTemplates();
  }
  
  private initializeSectionTemplates() {
    // Person category sections
    const personSections: CategorySections = {
      category: ArticleCategory.PERSON,
      subcategorySections: new Map([
        ['scientist', [
          {
            title: 'Early life and education',
            description: 'Childhood, family background, and educational journey',
            icon: '🎓',
            contentTemplate: '{{NAME}} was born {{BIRTH_DETAILS}}. {{EARLY_EDUCATION}} {{FAMILY_BACKGROUND}} {{EDUCATIONAL_INSTITUTIONS}}',
            wikidataProperties: ['P569', 'P19', 'P22', 'P25', 'P69', 'P512'],
            priority: 1,
            wikipediaEvidence: ['Standard section in scientist biographies like Einstein, Newton']
          },
          {
            title: 'Career and research',
            description: 'Professional career, research positions, and major work',
            icon: '🔬',
            contentTemplate: '{{NAME}} began {{CAREER_START}} at {{INSTITUTIONS}}. {{RESEARCH_FOCUS}} {{MAJOR_POSITIONS}} {{COLLABORATIONS}}',
            wikidataProperties: ['P108', 'P101', 'P184', 'P185', 'P800'],
            priority: 2,
            wikipediaEvidence: ['Essential section in scientific biographies']
          },
          {
            title: 'Major discoveries',
            description: 'Key scientific contributions and breakthrough discoveries',
            icon: '💡',
            contentTemplate: '{{NAME}} is best known for {{MAJOR_DISCOVERY}}. {{DISCOVERY_DETAILS}} {{SCIENTIFIC_IMPACT}} {{RECOGNITION}}',
            wikidataProperties: ['P800', 'P166', 'P2184'],
            priority: 3,
            wikipediaEvidence: ['Core section highlighting scientific achievements']
          },
          {
            title: 'Legacy and influence',
            description: 'Long-term impact on science and society',
            icon: '🏛️',
            contentTemplate: '{{NAME}}\'s work has had lasting impact on {{FIELD}}. {{INFLUENCE_ON_OTHERS}} {{MODERN_APPLICATIONS}} {{COMMEMORATIONS}}',
            wikidataProperties: ['P166', 'P2184', 'P1411'],
            priority: 4,
            wikipediaEvidence: ['Standard conclusion section in notable scientist articles']
          }
        ]],
        ['artist', [
          {
            title: 'Early life',
            description: 'Childhood and formative experiences',
            icon: '👶',
            contentTemplate: '{{NAME}} was born {{BIRTH_DETAILS}}. {{EARLY_INFLUENCES}} {{FAMILY_ARTISTIC_BACKGROUND}}',
            wikidataProperties: ['P569', 'P19', 'P22', 'P25'],
            priority: 1
          },
          {
            title: 'Artistic development',
            description: 'Training, influences, and style evolution',
            icon: '🎨',
            contentTemplate: '{{NAME}} developed {{ARTISTIC_STYLE}} through {{TRAINING}}. {{INFLUENCES}} {{STYLE_EVOLUTION}}',
            wikidataProperties: ['P69', 'P184', 'P135'],
            priority: 2
          },
          {
            title: 'Major works',
            description: 'Notable creations and masterpieces',
            icon: '🖼️',
            contentTemplate: 'Among {{NAME}}\'s most celebrated works are {{MAJOR_WORKS}}. {{WORK_DESCRIPTIONS}} {{CRITICAL_RECEPTION}}',
            wikidataProperties: ['P800', 'P1441'],
            priority: 3
          }
        ]],
        ['politician', [
          {
            title: 'Political career',
            description: 'Rise to power and major political positions',
            icon: '🏛️',
            contentTemplate: '{{NAME}} entered politics {{CAREER_START}}. {{MAJOR_POSITIONS}} {{POLITICAL_ACHIEVEMENTS}}',
            wikidataProperties: ['P39', 'P102', 'P1365', 'P1366'],
            priority: 1
          },
          {
            title: 'Policies and reforms',
            description: 'Major policy initiatives and governmental reforms',
            icon: '📜',
            contentTemplate: 'During {{TENURE}}, {{NAME}} implemented {{MAJOR_POLICIES}}. {{POLICY_IMPACT}} {{REFORMS}}',
            wikidataProperties: ['P39', 'P793'],
            priority: 2
          }
        ]]
      ]),
      defaultSections: [
        {
          title: 'Personal life',
          description: 'Family, relationships, and personal interests',
          icon: '👥',
          contentTemplate: '{{NAME}} {{PERSONAL_DETAILS}}. {{FAMILY_INFO}} {{PERSONAL_INTERESTS}}',
          wikidataProperties: ['P26', 'P40', 'P551'],
          priority: 5
        },
        {
          title: 'Death and legacy',
          description: 'Final years and posthumous recognition',
          icon: '⚰️',
          contentTemplate: '{{NAME}} died {{DEATH_DETAILS}}. {{LEGACY}} {{MEMORIALS}} {{CONTINUING_INFLUENCE}}',
          wikidataProperties: ['P570', 'P20', 'P509'],
          priority: 6
        }
      ]
    };

    // Location category sections  
    const locationSections: CategorySections = {
      category: ArticleCategory.LOCATION,
      subcategorySections: new Map([
        ['city', [
          {
            title: 'History',
            description: 'Historical development and founding',
            icon: '📚',
            contentTemplate: '{{NAME}} was {{FOUNDING_DETAILS}}. {{HISTORICAL_DEVELOPMENT}} {{MAJOR_HISTORICAL_EVENTS}}',
            wikidataProperties: ['P571', 'P112', 'P793'],
            priority: 1,
            wikipediaEvidence: ['Standard section in city articles like Paris, London']
          },
          {
            title: 'Geography',
            description: 'Physical location, climate, and geographical features',
            icon: '🗺️',
            contentTemplate: '{{NAME}} is located {{GEOGRAPHICAL_POSITION}}. {{CLIMATE}} {{GEOGRAPHICAL_FEATURES}} {{TOPOGRAPHY}}',
            wikidataProperties: ['P625', 'P206', 'P706', 'P2044'],
            priority: 2,
            wikipediaEvidence: ['Essential geographical information section']
          },
          {
            title: 'Demographics',
            description: 'Population statistics and demographic composition',
            icon: '👥',
            contentTemplate: 'As of {{CENSUS_YEAR}}, {{NAME}} has a population of {{POPULATION}}. {{DEMOGRAPHIC_BREAKDOWN}} {{POPULATION_TRENDS}}',
            wikidataProperties: ['P1082', 'P6'],
            priority: 3,
            wikipediaEvidence: ['Standard demographic section in city articles']
          },
          {
            title: 'Economy',
            description: 'Economic activities and major industries',
            icon: '💼',
            contentTemplate: '{{NAME}}\'s economy is based on {{MAJOR_INDUSTRIES}}. {{ECONOMIC_INDICATORS}} {{MAJOR_EMPLOYERS}}',
            wikidataProperties: ['P1081', 'P2131'],
            priority: 4,
            wikipediaEvidence: ['Important section for understanding city significance']
          },
          {
            title: 'Culture and attractions',
            description: 'Cultural institutions, landmarks, and tourist attractions',
            icon: '🎭',
            contentTemplate: '{{NAME}} is known for {{CULTURAL_ATTRACTIONS}}. {{LANDMARKS}} {{CULTURAL_INSTITUTIONS}} {{FESTIVALS}}',
            wikidataProperties: ['P1435', 'P138'],
            priority: 5,
            wikipediaEvidence: ['Highlights what makes the city notable culturally']
          }
        ]],
        ['geographical_feature', [
          {
            title: 'Formation',
            description: 'Geological formation and natural history',
            icon: '🌋',
            contentTemplate: '{{NAME}} was formed {{FORMATION_PROCESS}}. {{GEOLOGICAL_HISTORY}} {{FORMATION_TIMELINE}}',
            wikidataProperties: ['P571', 'P2673'],
            priority: 1
          },
          {
            title: 'Physical characteristics',
            description: 'Size, elevation, and physical properties',
            icon: '📏',
            contentTemplate: '{{NAME}} {{PHYSICAL_DIMENSIONS}}. {{ELEVATION_DATA}} {{PHYSICAL_PROPERTIES}}',
            wikidataProperties: ['P2044', 'P2048', 'P2049', 'P2046'],
            priority: 2
          }
        ]]
      ]),
      defaultSections: [
        {
          title: 'Climate',
          description: 'Weather patterns and seasonal variations',
          icon: '🌡️',
          contentTemplate: '{{NAME}} experiences {{CLIMATE_TYPE}}. {{SEASONAL_PATTERNS}} {{WEATHER_EXTREMES}}',
          wikidataProperties: ['P2564'],
          priority: 6
        }
      ]
    };

    // Species category sections
    const speciesSections: CategorySections = {
      category: ArticleCategory.SPECIES,
      subcategorySections: new Map([
        ['bird', [
          {
            title: 'Description',
            description: 'Physical appearance and distinguishing features',
            icon: '🔍',
            contentTemplate: 'The {{COMMON_NAME}} {{PHYSICAL_DESCRIPTION}}. {{DISTINGUISHING_FEATURES}} {{SIZE_COMPARISON}}',
            wikidataProperties: ['P2067', 'P2048', 'P2049'],
            priority: 1,
            wikipediaEvidence: ['Standard opening section in bird articles']
          },
          {
            title: 'Distribution and habitat',
            description: 'Geographic range and preferred environments',
            icon: '🌍',
            contentTemplate: 'The {{COMMON_NAME}} is found in {{GEOGRAPHIC_RANGE}}. {{HABITAT_PREFERENCES}} {{SEASONAL_MOVEMENTS}}',
            wikidataProperties: ['P183', 'P1082'],
            priority: 2,
            wikipediaEvidence: ['Essential for understanding species ecology']
          },
          {
            title: 'Behavior',
            description: 'Feeding, breeding, and social behaviors',
            icon: '🐦',
            contentTemplate: '{{COMMON_NAME}} {{FEEDING_BEHAVIOR}}. {{BREEDING_BEHAVIOR}} {{SOCIAL_STRUCTURE}}',
            wikidataProperties: ['P1303', 'P1589'],
            priority: 3,
            wikipediaEvidence: ['Key behavioral information section']
          },
          {
            title: 'Conservation status',
            description: 'Population trends and conservation efforts',
            icon: '🛡️',
            contentTemplate: 'The {{COMMON_NAME}} is classified as {{CONSERVATION_STATUS}}. {{POPULATION_TRENDS}} {{CONSERVATION_EFFORTS}}',
            wikidataProperties: ['P141', 'P1843'],
            priority: 4,
            wikipediaEvidence: ['Important for species protection awareness']
          }
        ]],
        ['mammal', [
          {
            title: 'Physical characteristics',
            description: 'Size, appearance, and anatomical features',
            icon: '📐',
            contentTemplate: 'The {{COMMON_NAME}} {{PHYSICAL_DESCRIPTION}}. {{SIZE_DATA}} {{DISTINCTIVE_FEATURES}}',
            wikidataProperties: ['P2067', 'P2048'],
            priority: 1
          },
          {
            title: 'Ecology and behavior',
            description: 'Habitat use, diet, and behavioral patterns',
            icon: '🌿',
            contentTemplate: '{{COMMON_NAME}} {{HABITAT_USE}}. {{DIET}} {{BEHAVIORAL_PATTERNS}}',
            wikidataProperties: ['P183', 'P1303'],
            priority: 2
          }
        ]]
      ]),
      defaultSections: [
        {
          title: 'Taxonomy',
          description: 'Scientific classification and evolutionary relationships',
          icon: '🧬',
          contentTemplate: 'The {{COMMON_NAME}} belongs to {{TAXONOMIC_CLASSIFICATION}}. {{EVOLUTIONARY_RELATIONSHIPS}} {{SUBSPECIES}}',
          wikidataProperties: ['P171', 'P105', 'P225'],
          priority: 5
        }
      ]
    };

    this.categorySections.set(ArticleCategory.PERSON, personSections);
    this.categorySections.set(ArticleCategory.LOCATION, locationSections);
    this.categorySections.set(ArticleCategory.SPECIES, speciesSections);
  }

  async getSuggestedSections(
    topic: WikidataTopic, 
    category: ArticleCategory
  ): Promise<SectionTemplate[]> {
    const categoryData = this.categorySections.get(category);
    if (!categoryData) {
      return this.getGenericSections();
    }

    // Detect subcategory
    const subcategory = this.detectSubcategory(topic, category);
    
    // Get subcategory-specific sections and show options from ALL subcategories
    let sections: SectionTemplate[] = [];
    if (subcategory && categoryData.subcategorySections.has(subcategory)) {
      // Prioritize detected subcategory sections
      sections = categoryData.subcategorySections.get(subcategory)!;
      
      // Also add sections from other subcategories with lower priority
      for (const [otherSubcategory, otherSections] of categoryData.subcategorySections) {
        if (otherSubcategory !== subcategory) {
          const adjustedSections = otherSections.map(s => ({...s, priority: s.priority + 10}));
          sections = [...sections, ...adjustedSections];
        }
      }
    } else {
      // No specific subcategory detected, show all subcategory sections
      for (const [, subcategorySections] of categoryData.subcategorySections) {
        sections = [...sections, ...subcategorySections];
      }
    }
    
    // Add default sections for this category
    sections = [...sections, ...categoryData.defaultSections];
    
    // Sort by priority
    sections.sort((a, b) => a.priority - b.priority);
    
    return sections;
  }

  async generateSectionContent(
    section: SectionTemplate,
    topic: WikidataTopic,
    category: ArticleCategory
  ): Promise<string> {
    // Fetch relevant Wikidata properties for this section
    const properties = section.wikidataProperties || [];
    let entityData: Record<string, any> = {};
    
    if (topic.id && properties.length > 0) {
      entityData = await WikidataService.getEntityProperties(topic.id, properties);
      
      // Resolve entity references to names
      const entityIds = Object.values(entityData)
        .filter(value => typeof value === 'string' && value.match(/^Q\d+$/)) as string[];
      
      if (entityIds.length > 0) {
        const resolvedNames = await WikidataService.resolveEntityNames(entityIds);
        Object.entries(entityData).forEach(([key, value]) => {
          if (typeof value === 'string' && value.match(/^Q\d+$/)) {
            entityData[key] = resolvedNames[value] || value;
          }
        });
      }
    }

    // Map properties to template placeholders
    const placeholders = this.mapSectionPlaceholders(entityData, topic, category, section);
    
    // Fill template
    return this.fillSectionTemplate(section.contentTemplate, placeholders);
  }

  private detectSubcategory(topic: WikidataTopic, category: ArticleCategory): string | undefined {
    const description = topic.description.toLowerCase();
    const categoryData = this.categorySections.get(category);
    
    if (!categoryData) return undefined;
    
    // Check each subcategory's detection keywords
    for (const [subcategoryKey, sections] of categoryData.subcategorySections) {
      // Use similar detection logic as IntelligentTemplateEngine
      const keywords = this.getSubcategoryKeywords(subcategoryKey, category);
      if (keywords.some(keyword => description.includes(keyword.toLowerCase()))) {
        return subcategoryKey;
      }
    }
    
    return undefined;
  }

  private getSubcategoryKeywords(subcategory: string, category: ArticleCategory): string[] {
    // Return detection keywords for each subcategory
    const keywordMap: Record<string, Record<string, string[]>> = {
      [ArticleCategory.PERSON]: {
        'scientist': ['scientist', 'researcher', 'mathematician', 'physicist', 'chemist', 'biologist', 'engineer'],
        'artist': ['artist', 'painter', 'sculptor', 'writer', 'author', 'composer', 'musician'],
        'politician': ['politician', 'president', 'minister', 'senator', 'governor', 'mayor']
      },
      [ArticleCategory.LOCATION]: {
        'city': ['city', 'town', 'municipality', 'urban', 'metropolitan'],
        'geographical_feature': ['mountain', 'river', 'lake', 'forest', 'desert', 'valley']
      },
      [ArticleCategory.SPECIES]: {
        'bird': ['bird', 'avian', 'eagle', 'hawk', 'duck', 'sparrow'],
        'mammal': ['mammal', 'primate', 'carnivore', 'herbivore', 'rodent']
      }
    };
    
    return keywordMap[category]?.[subcategory] || [];
  }

  private mapSectionPlaceholders(
    properties: Record<string, any>,
    topic: WikidataTopic,
    category: ArticleCategory,
    section: SectionTemplate
  ): Record<string, string> {
    const placeholders: Record<string, string> = {};
    
    // Common placeholders
    placeholders.NAME = topic.title;
    placeholders.COMMON_NAME = properties.P1843 || topic.title;
    
    // Category-specific placeholder mapping
    switch (category) {
      case ArticleCategory.PERSON:
        this.mapPersonSectionPlaceholders(placeholders, properties, topic, section);
        break;
      case ArticleCategory.LOCATION:
        this.mapLocationSectionPlaceholders(placeholders, properties, topic, section);
        break;
      case ArticleCategory.SPECIES:
        this.mapSpeciesSectionPlaceholders(placeholders, properties, topic, section);
        break;
    }
    
    return placeholders;
  }

  private mapPersonSectionPlaceholders(
    placeholders: Record<string, string>,
    properties: Record<string, any>,
    topic: WikidataTopic,
    section: SectionTemplate
  ) {
    placeholders.BIRTH_DETAILS = this.formatBirthDetails(properties.P569, properties.P19);
    placeholders.DEATH_DETAILS = this.formatDeathDetails(properties.P570, properties.P20);
    placeholders.EARLY_EDUCATION = properties.P69 ? `${placeholders.NAME} studied at ${properties.P69}.` : `${placeholders.NAME} pursued education in relevant fields.`;
    placeholders.FAMILY_BACKGROUND = properties.P22 || properties.P25 ? 'Coming from an educated family, ' : '';
    placeholders.EDUCATIONAL_INSTITUTIONS = properties.P69 || '+ educational institutions';
    placeholders.CAREER_START = properties.P108 ? `their career at ${properties.P108}` : 'their professional career';
    placeholders.INSTITUTIONS = properties.P108 || '+ institutions';
    placeholders.RESEARCH_FOCUS = `${placeholders.NAME} focused on + research areas.`;
    placeholders.MAJOR_POSITIONS = properties.P39 ? `holding positions including ${properties.P39}` : 'advancing through various positions';
    placeholders.MAJOR_DISCOVERY = properties.P800 || 'their groundbreaking work';
    placeholders.DISCOVERY_DETAILS = `This ${section.title.includes('discover') ? 'discovery' : 'work'} demonstrated + key findings.`;
    placeholders.SCIENTIFIC_IMPACT = 'The implications of this work were significant for the field.';
    placeholders.FIELD = this.extractFieldFromDescription(topic.description);
    placeholders.INFLUENCE_ON_OTHERS = `${placeholders.NAME}'s work influenced subsequent researchers and practitioners.`;
    placeholders.MODERN_APPLICATIONS = 'Modern applications of this work can be seen in + current examples.';
    placeholders.PERSONAL_DETAILS = properties.P26 ? `was married to ${properties.P26}` : 'maintained + personal life';
    placeholders.FAMILY_INFO = properties.P40 ? `and had ${properties.P40} children` : '';
  }

  private mapLocationSectionPlaceholders(
    placeholders: Record<string, string>,
    properties: Record<string, any>,
    topic: WikidataTopic,
    section: SectionTemplate
  ) {
    placeholders.FOUNDING_DETAILS = properties.P571 ? `founded in ${properties.P571}` : 'established in + founding year';
    placeholders.HISTORICAL_DEVELOPMENT = `Over the centuries, ${placeholders.NAME} grew from + early settlement to + modern status.`;
    placeholders.GEOGRAPHICAL_POSITION = properties.P625 ? `at coordinates ${properties.P625}` : 'in + geographical region';
    placeholders.CLIMATE = properties.P2564 || `${placeholders.NAME} experiences + climate type`;
    placeholders.POPULATION = properties.P1082 || '+ population number';
    placeholders.CENSUS_YEAR = '+ census year';
    placeholders.DEMOGRAPHIC_BREAKDOWN = 'The population consists of + demographic groups.';
    placeholders.MAJOR_INDUSTRIES = '+ primary industries and + secondary industries';
    placeholders.CULTURAL_ATTRACTIONS = '+ major attractions and + cultural sites';
  }

  private mapSpeciesSectionPlaceholders(
    placeholders: Record<string, string>,
    properties: Record<string, any>,
    topic: WikidataTopic,
    section: SectionTemplate
  ) {
    placeholders.SCIENTIFIC_NAME = properties.P225 || '+ scientific name';
    placeholders.PHYSICAL_DESCRIPTION = `measures + size and is characterized by + physical features`;
    placeholders.DISTINGUISHING_FEATURES = `Key identifying features include + distinctive characteristics.`;
    placeholders.GEOGRAPHIC_RANGE = properties.P183 || '+ geographical regions';
    placeholders.HABITAT_PREFERENCES = `preferring + habitat types`;
    placeholders.CONSERVATION_STATUS = properties.P141 || '+ conservation status';
    placeholders.TAXONOMIC_CLASSIFICATION = properties.P171 || '+ taxonomic family';
  }

  private fillSectionTemplate(template: string, placeholders: Record<string, string>): string {
    let filled = template;
    
    Object.entries(placeholders).forEach(([key, value]) => {
      filled = filled.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
    });
    
    // Clean up unfilled placeholders and convert to interactive chips
    filled = filled.replace(/{{[^}]+}}/g, (match) => {
      const placeholder = match.replace(/[{}]/g, '').toLowerCase().replace(/_/g, ' ');
      return `<span class="detail-chip" data-detail="${placeholder}">+ ${placeholder}</span>`;
    });
    
    // Convert existing + [info] patterns to chips  
    filled = filled.replace(/\+\s*\[([^\]]+)\]/g, (match, content) => {
      const detailType = content.toLowerCase().replace(/\s+/g, '_');
      return `<span class="detail-chip" data-detail="${detailType}">+ ${content}</span>`;
    });
    
    // Clean up extra spaces
    filled = filled.replace(/\s+/g, ' ').trim();
    
    return filled;
  }

  private getGenericSections(): SectionTemplate[] {
    return [
      {
        title: 'Overview',
        description: 'General introduction and background',
        icon: '📋',
        contentTemplate: '{{NAME}} is + description. + Additional context and background information.',
        priority: 1
      },
      {
        title: 'History',
        description: 'Historical background and development',
        icon: '📚',
        contentTemplate: 'The history of {{NAME}} + historical information. + Key historical events and developments.',
        priority: 2
      }
    ];
  }

  // Utility methods
  private formatBirthDetails(birthDate: string, birthPlace: string): string {
    if (!birthDate) return '+ birth information';
    return birthPlace ? `on ${birthDate} in ${birthPlace}` : `on ${birthDate}`;
  }

  private formatDeathDetails(deathDate: string, deathPlace: string): string {
    if (!deathDate) return '+ death information';
    return deathPlace ? `on ${deathDate} in ${deathPlace}` : `on ${deathDate}`;
  }

  private extractFieldFromDescription(description: string): string {
    const fields = ['mathematics', 'physics', 'chemistry', 'biology', 'engineering', 'medicine'];
    for (const field of fields) {
      if (description.toLowerCase().includes(field)) {
        return field;
      }
    }
    return 'their field';
  }
}