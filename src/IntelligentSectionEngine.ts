// ABOUTME: Intelligent section suggestion engine based on Wikidata context and article categories
// ABOUTME: Generates contextually relevant section suggestions and content templates for different article types

import { WikidataService, WikidataTopic } from './WikidataService';
import { ArticleCategory } from './CategoryMapper';
import { IntelligentContentGenerator } from './IntelligentContentGenerator';

interface SectionTemplate {
  title: string;
  description: string;
  icon: string;
  contentTemplate: string;
  templateVariations?: string[];
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
  private templateUsageCount: Map<string, number> = new Map();
  private contentGenerator: IntelligentContentGenerator;
  
  constructor(private wikidataService: WikidataService) {
    this.contentGenerator = new IntelligentContentGenerator();
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
            templateVariations: [
              '{{NAME}} entered the world {{BIRTH_DETAILS}}. {{FAMILY_BACKGROUND}} {{EDUCATIONAL_JOURNEY}} shaped their future pursuits.',
              'Born {{BIRTH_DETAILS}}, {{NAME}} showed early promise in academic endeavors. {{FAMILY_INFLUENCE}} {{EDUCATIONAL_FOUNDATION}} provided the groundwork for later achievements.',
              'The early years of {{NAME}} began {{BIRTH_DETAILS}}. {{CHILDHOOD_INFLUENCES}} {{ACADEMIC_DEVELOPMENT}} would prove instrumental in their career.',
              '{{NAME}}\'s formative years commenced {{BIRTH_DETAILS}}. {{EARLY_ENVIRONMENT}} {{EDUCATIONAL_PATH}} established the foundation for their scholarly pursuits.'
            ],
            wikidataProperties: ['P569', 'P19', 'P22', 'P25', 'P69', 'P512'],
            priority: 1,
            wikipediaEvidence: ['Standard section in scientist biographies like Einstein, Newton']
          },
          {
            title: 'Career and research',
            description: 'Professional career, research positions, and major work',
            icon: '🔬',
            contentTemplate: '{{NAME}} began {{CAREER_START}} at {{INSTITUTIONS}}. {{RESEARCH_FOCUS}} {{MAJOR_POSITIONS}} {{COLLABORATIONS}}',
            templateVariations: [
              '{{NAME}}\'s professional journey commenced {{CAREER_START}} with {{INSTITUTIONS}}. {{RESEARCH_SPECIALIZATION}} {{CAREER_PROGRESSION}} {{SCIENTIFIC_COLLABORATIONS}}',
              'The scientific career of {{NAME}} took shape {{CAREER_START}} at {{INSTITUTIONS}}. {{RESEARCH_DIRECTION}} {{PROFESSIONAL_DEVELOPMENT}} {{ACADEMIC_PARTNERSHIPS}}',
              '{{NAME}} embarked on their research path {{CAREER_START}} through {{INSTITUTIONS}}. {{INVESTIGATIVE_FOCUS}} {{CAREER_ADVANCEMENT}} {{COLLABORATIVE_EFFORTS}}'
            ],
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
    try {
      console.log('DEBUG: Section engine received topic:', topic);
      console.log('DEBUG: Topic title:', topic.title);
      console.log('DEBUG: Topic description:', topic.description);
      // Use IntelligentContentGenerator for contextual, meaningful content
      const suggestions = await this.contentGenerator.generateContentSuggestions(
        topic,
        category,
        section.title.toLowerCase()
      );

      // Generate intelligent template based on section type and suggestions
      const intelligentTemplate = await this.generateIntelligentTemplate(
        section,
        topic,
        category,
        suggestions
      );

      return intelligentTemplate;
    } catch (error) {
      console.error('Error generating intelligent section content:', error);
      // Fallback to simple contextual template
      return this.generateSimpleContextualTemplate(section, topic, category);
    }
  }

  private async generateIntelligentTemplate(
    section: SectionTemplate,
    topic: WikidataTopic,
    category: ArticleCategory,
    suggestions: any[]
  ): Promise<string> {
    const categoryString = topic.category || category.toString() || 'unknown';
    const entityName = this.generateContextualEntityName(topic.title, categoryString);
    const sectionType = section.title.toLowerCase();

    // Generate content based on section type
    if (sectionType.includes('physical') || sectionType.includes('characteristics')) {
      return this.generatePhysicalCharacteristicsContent(entityName, category, suggestions);
    } else if (sectionType.includes('habitat') || sectionType.includes('distribution')) {
      return this.generateHabitatContent(entityName, category, suggestions);
    } else if (sectionType.includes('ecology') || sectionType.includes('behavior')) {
      return this.generateEcologyContent(entityName, category, suggestions);
    } else if (sectionType.includes('description')) {
      return this.generateDescriptionContent(entityName, category, suggestions);
    } else {
      return this.generateGenericSectionContent(entityName, category, suggestions, sectionType);
    }
  }

  private generatePhysicalCharacteristicsContent(entityName: string, category: ArticleCategory, suggestions: any[]): string {
    if (category === ArticleCategory.SPECIES) {
      // Generate comprehensive physical characteristics section
      let content = `${entityName} is a <span class="detail-chip" data-detail="size_category">medium to large-sized</span> species that typically measures <span class="detail-chip" data-detail="length_measurement">1.2 to 1.8 meters in length</span> and weighs between <span class="detail-chip" data-detail="weight_range">15 to 25 kilograms</span>. Adult specimens display <span class="detail-chip" data-detail="sexual_dimorphism">sexual dimorphism</span>, with males generally being <span class="detail-chip" data-detail="size_difference">10-15% larger</span> than females.\n\n`;

      content += `The most distinctive feature of ${entityName} is its <span class="detail-chip" data-detail="primary_distinguishing_feature">prominent physical characteristic</span>, which serves both <span class="detail-chip" data-detail="feature_function_1">defensive purposes</span> and <span class="detail-chip" data-detail="feature_function_2">communication functions</span>. The species possesses <span class="detail-chip" data-detail="body_covering">specialized body covering</span> that provides <span class="detail-chip" data-detail="protection_type">environmental protection</span> and aids in <span class="detail-chip" data-detail="adaptive_function">thermoregulation</span>.\n\n`;

      content += `The head structure of ${entityName} is characterized by <span class="detail-chip" data-detail="skull_features">distinctive cranial features</span>, including <span class="detail-chip" data-detail="sensory_organs">highly developed sensory organs</span>. The eyes are <span class="detail-chip" data-detail="eye_description">large and forward-facing</span>, adapted for <span class="detail-chip" data-detail="vision_type">keen visual acuity</span> in <span class="detail-chip" data-detail="lighting_conditions">various lighting conditions</span>. The limbs are <span class="detail-chip" data-detail="limb_structure">powerfully built</span> and equipped with <span class="detail-chip" data-detail="extremity_features">specialized appendages</span> that enable <span class="detail-chip" data-detail="locomotion_ability">efficient movement</span> across <span class="detail-chip" data-detail="terrain_types">diverse terrain types</span>.`;

      return content;
    } else {
      return this.generateGenericSectionContent(entityName, category, suggestions, 'physical characteristics');
    }
  }

  private generateHabitatContent(entityName: string, category: ArticleCategory, suggestions: any[]): string {
    if (category === ArticleCategory.SPECIES) {
      let content = `${entityName} inhabits a diverse range of ecosystems, primarily found in <span class="detail-chip" data-detail="primary_habitat">temperate forest regions</span> across <span class="detail-chip" data-detail="geographic_distribution">continental areas</span>. The species demonstrates remarkable adaptability to various environmental conditions, thriving in <span class="detail-chip" data-detail="habitat_types">multiple habitat types</span> including <span class="detail-chip" data-detail="secondary_habitats">woodland areas, grasslands, and riparian zones</span>.\n\n`;

      content += `The preferred habitat consists of <span class="detail-chip" data-detail="vegetation_type">dense canopy forests</span> with <span class="detail-chip" data-detail="canopy_coverage">60-80% canopy coverage</span>, providing both <span class="detail-chip" data-detail="shelter_benefits">protection from predators</span> and <span class="detail-chip" data-detail="resource_availability">abundant food resources</span>. ${entityName} typically establishes territories in areas with <span class="detail-chip" data-detail="terrain_features">specific topographical features</span>, such as <span class="detail-chip" data-detail="landscape_elements">rocky outcrops, water sources, and elevated positions</span> that offer strategic advantages.\n\n`;

      content += `Seasonal migrations occur between <span class="detail-chip" data-detail="seasonal_range_1">breeding grounds</span> and <span class="detail-chip" data-detail="seasonal_range_2">winter refugia</span>, with populations traveling distances of up to <span class="detail-chip" data-detail="migration_distance">several hundred kilometers</span>. Climate change has begun to impact traditional habitat ranges, forcing populations to adapt to <span class="detail-chip" data-detail="climate_adaptations">changing environmental conditions</span> and seek <span class="detail-chip" data-detail="alternative_habitats">alternative suitable areas</span> at <span class="detail-chip" data-detail="elevation_changes">higher elevations or different latitudes</span>.`;

      return content;
    } else {
      return this.generateGenericSectionContent(entityName, category, suggestions, 'habitat and distribution');
    }
  }

  private generateEcologyContent(entityName: string, category: ArticleCategory, suggestions: any[]): string {
    if (category === ArticleCategory.SPECIES) {
      let content = `${entityName} exhibits complex behavioral patterns that vary significantly between <span class="detail-chip" data-detail="seasonal_behaviors">seasonal periods</span> and <span class="detail-chip" data-detail="life_stages">different life stages</span>. As a <span class="detail-chip" data-detail="feeding_classification">dietary specialist</span>, the species primarily feeds on <span class="detail-chip" data-detail="primary_food_sources">specific food sources</span>, supplemented by <span class="detail-chip" data-detail="secondary_diet">opportunistic feeding</span> during periods of <span class="detail-chip" data-detail="resource_scarcity">food scarcity</span>.\n\n`;

      content += `Social structure within ${entityName} populations is characterized by <span class="detail-chip" data-detail="social_organization">hierarchical organization</span>, with individuals forming <span class="detail-chip" data-detail="group_size">stable groups</span> of <span class="detail-chip" data-detail="group_composition">mixed age and sex composition</span>. Communication occurs through a combination of <span class="detail-chip" data-detail="communication_methods">vocalizations, visual displays, and chemical signals</span>, with <span class="detail-chip" data-detail="communication_complexity">over 20 distinct calls</span> documented for different contexts including <span class="detail-chip" data-detail="call_functions">territory defense, mating, and alarm signals</span>.\n\n`;

      content += `Reproductive behavior follows a <span class="detail-chip" data-detail="breeding_pattern">seasonal breeding pattern</span>, with courtship rituals beginning in <span class="detail-chip" data-detail="breeding_season">early spring</span>. Mating pairs engage in <span class="detail-chip" data-detail="courtship_behavior">elaborate courtship displays</span> that can last for <span class="detail-chip" data-detail="courtship_duration">several weeks</span>. Parental care is <span class="detail-chip" data-detail="parental_strategy">biparental</span>, with both adults participating in <span class="detail-chip" data-detail="care_activities">nest construction, incubation, and offspring protection</span> for approximately <span class="detail-chip" data-detail="care_duration">3-4 months</span> post-hatching.`;

      return content;
    } else {
      return this.generateGenericSectionContent(entityName, category, suggestions, 'ecology and behavior');
    }
  }

  private generateDescriptionContent(entityName: string, category: ArticleCategory, suggestions: any[]): string {
    let content = '';
    
    if (category === ArticleCategory.SPECIES) {
      content += `${entityName} is <span class="detail-chip" data-detail="taxonomic_classification">a species</span> belonging to the <span class="detail-chip" data-detail="family_classification">family classification</span> within the order <span class="detail-chip" data-detail="order_classification">taxonomic order</span>. The species was first scientifically described in <span class="detail-chip" data-detail="discovery_year">year of description</span> by <span class="detail-chip" data-detail="describing_scientist">taxonomist name</span>, based on specimens collected from <span class="detail-chip" data-detail="type_locality">type locality</span>.\n\n`;

      content += `${entityName} is distinguished from closely related species by several key morphological features, including <span class="detail-chip" data-detail="distinguishing_feature_1">primary distinguishing characteristic</span>, <span class="detail-chip" data-detail="distinguishing_feature_2">secondary feature</span>, and <span class="detail-chip" data-detail="distinguishing_feature_3">tertiary diagnostic trait</span>. The species exhibits <span class="detail-chip" data-detail="phenotypic_variation">phenotypic variation</span> across its range, with <span class="detail-chip" data-detail="subspecies_number">multiple recognized subspecies</span> adapted to different environmental conditions.\n\n`;

      content += `Ecologically, ${entityName} plays a crucial role as <span class="detail-chip" data-detail="ecological_role">keystone species</span> in its ecosystem, serving as both <span class="detail-chip" data-detail="predator_role">predator</span> and <span class="detail-chip" data-detail="prey_role">prey species</span> in complex food webs. The species' conservation status is currently classified as <span class="detail-chip" data-detail="conservation_status">conservation classification</span> due to <span class="detail-chip" data-detail="threat_factors">primary threats</span> including <span class="detail-chip" data-detail="specific_threats">habitat loss, climate change, and human activities</span>.`;
    } else if (category === ArticleCategory.PERSON) {
      content += `${entityName} is <span class="detail-chip" data-detail="profession">professional role</span> known for <span class="detail-chip" data-detail="major_achievements">groundbreaking contributions</span> to <span class="detail-chip" data-detail="field_of_work">area of expertise</span>. Born in <span class="detail-chip" data-detail="birth_year">year</span> in <span class="detail-chip" data-detail="birthplace">location</span>, they pursued <span class="detail-chip" data-detail="education">educational background</span> before establishing themselves as <span class="detail-chip" data-detail="career_description">prominent figure in their field</span>.\n\n`;

      content += `Throughout their career, ${entityName} has been recognized for <span class="detail-chip" data-detail="specific_contributions">specific achievements</span>, earning numerous accolades including <span class="detail-chip" data-detail="awards">prestigious awards</span> and <span class="detail-chip" data-detail="honors">professional honors</span>. Their work has had lasting impact on <span class="detail-chip" data-detail="impact_areas">areas of influence</span>, influencing <span class="detail-chip" data-detail="influenced_fields">related disciplines</span> and inspiring <span class="detail-chip" data-detail="legacy">future generations</span>.`;
    } else {
      content += `${entityName} is <span class="detail-chip" data-detail="primary_description">comprehensive description</span> characterized by <span class="detail-chip" data-detail="key_features">distinctive features</span> and <span class="detail-chip" data-detail="notable_aspects">significant aspects</span>. <span class="detail-chip" data-detail="historical_context">Historical background</span> and <span class="detail-chip" data-detail="contemporary_relevance">modern significance</span> contribute to its <span class="detail-chip" data-detail="overall_importance">overall importance</span> in <span class="detail-chip" data-detail="relevant_context">relevant field or context</span>.`;
    }

    return content;
  }

  private generateGenericSectionContent(entityName: string, category: ArticleCategory, suggestions: any[], sectionType: string): string {
    return `${entityName} <span class="detail-chip" data-detail="section_content">${sectionType} information</span>. <span class="detail-chip" data-detail="details">Additional details</span> about <span class="detail-chip" data-detail="specific_information">specific aspects</span>.`;
  }

  private generateSimpleContextualTemplate(section: SectionTemplate, topic: WikidataTopic, category: ArticleCategory): string {
    const categoryString = topic.category || category.toString() || 'unknown';
    const entityName = this.generateContextualEntityName(topic.title, categoryString);
    return this.generateGenericSectionContent(entityName, category, [], section.title.toLowerCase());
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
    
    // Safety check for topic parameter
    if (!topic) {
      console.warn('mapSectionPlaceholders: topic is undefined, using fallback');
      topic = {
        id: '',
        title: 'Entity Name',
        description: 'A person, place, or thing',
        category: category
      } as WikidataTopic;
    }
    
    // Common placeholders with smart entity name detection
    placeholders.NAME = this.getSmartEntityName(topic);
    placeholders.COMMON_NAME = properties.P1843 || this.getSmartEntityName(topic);
    
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
    
    // Additional placeholders for template variations
    placeholders.EDUCATIONAL_JOURNEY = properties.P69 ? `Their academic journey through ${properties.P69}` : 'Their educational path';
    placeholders.FAMILY_INFLUENCE = properties.P22 || properties.P25 ? 'Family connections' : 'Personal motivation';
    placeholders.EDUCATIONAL_FOUNDATION = properties.P512 ? `earning ${properties.P512}` : 'building academic credentials';
    placeholders.CHILDHOOD_INFLUENCES = 'Early exposure to intellectual pursuits';
    placeholders.ACADEMIC_DEVELOPMENT = properties.P69 ? `Studies at ${properties.P69}` : 'Academic preparation';
    placeholders.EARLY_ENVIRONMENT = 'The intellectual climate of their youth';
    placeholders.EDUCATIONAL_PATH = properties.P69 ? `formal education at ${properties.P69}` : 'scholarly preparation';
    placeholders.CAREER_START = properties.P108 ? `their career at ${properties.P108}` : 'their professional career';
    placeholders.INSTITUTIONS = properties.P108 || '+ institutions';
    placeholders.RESEARCH_FOCUS = `${placeholders.NAME} focused on + research areas.`;
    placeholders.MAJOR_POSITIONS = properties.P39 ? `holding positions including ${properties.P39}` : 'advancing through various positions';
    
    // Additional career-related placeholders for variations
    placeholders.RESEARCH_SPECIALIZATION = `Their work concentrated on + specialized field`;
    placeholders.CAREER_PROGRESSION = `They advanced through + career stages`;
    placeholders.SCIENTIFIC_COLLABORATIONS = `working alongside + collaborators`;
    placeholders.RESEARCH_DIRECTION = `Their investigations centered on + research focus`;
    placeholders.PROFESSIONAL_DEVELOPMENT = `progressing through + professional roles`;
    placeholders.ACADEMIC_PARTNERSHIPS = `collaborating with + research partners`;
    placeholders.INVESTIGATIVE_FOCUS = `concentrating on + investigation areas`;
    placeholders.CAREER_ADVANCEMENT = `rising through + academic positions`;
    placeholders.COLLABORATIVE_EFFORTS = `partnering with + fellow researchers`;
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

  private selectTemplateVariation(section: SectionTemplate): string {
    // If no variations available, use the main template
    if (!section.templateVariations || section.templateVariations.length === 0) {
      return section.contentTemplate;
    }
    
    // Get usage counts for all templates including main one
    const allTemplates = [section.contentTemplate, ...section.templateVariations];
    const templateKey = section.title.toLowerCase().replace(/\s+/g, '_');
    
    // Find the least used template
    let leastUsedTemplate = allTemplates[0];
    let minUsage = this.templateUsageCount.get(`${templateKey}_0`) || 0;
    
    allTemplates.forEach((template, index) => {
      const usageKey = `${templateKey}_${index}`;
      const usage = this.templateUsageCount.get(usageKey) || 0;
      if (usage < minUsage) {
        minUsage = usage;
        leastUsedTemplate = template;
      }
    });
    
    // Update usage count for selected template
    const selectedIndex = allTemplates.indexOf(leastUsedTemplate);
    const usageKey = `${templateKey}_${selectedIndex}`;
    this.templateUsageCount.set(usageKey, (this.templateUsageCount.get(usageKey) || 0) + 1);
    
    return leastUsedTemplate;
  }

  private fillSectionTemplate(template: string, placeholders: Record<string, string>): string {
    let filled = template;
    
    Object.entries(placeholders).forEach(([key, value]) => {
      if (value && value.trim() && value !== 'undefined') {
        filled = filled.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
    });
    
    // Convert unfilled placeholders to interactive chips with intelligent text
    filled = filled.replace(/{{([^}]+)}}/g, (match, placeholder) => {
      const chipText = this.getIntelligentPlaceholderText(placeholder);
      return `<span class="detail-chip" data-detail="${placeholder.toLowerCase()}">${chipText}</span>`;
    });
    
    // Convert existing + [info] patterns to chips  
    filled = filled.replace(/\+\s*\[([^\]]+)\]/g, (match, content) => {
      const detailType = content.toLowerCase().replace(/\s+/g, '_');
      return `<span class="detail-chip" data-detail="${detailType}">+ ${content}</span>`;
    });
    
    // Convert standalone + patterns to chips
    filled = filled.replace(/\+\s+([a-zA-Z\s]+?)(?=\s*[.!?]|$)/g, (match, content) => {
      const detailType = content.trim().toLowerCase().replace(/\s+/g, '_');
      return `<span class="detail-chip" data-detail="${detailType}">+ ${content.trim()}</span>`;
    });
    
    // Clean up extra spaces
    filled = filled.replace(/\s+/g, ' ').trim();
    
    return filled;
  }

  private getIntelligentPlaceholderText(placeholder: string): string {
    // Provide more meaningful placeholder text based on the placeholder type
    const placeholderLower = placeholder.toLowerCase();
    
    switch (placeholderLower) {
      case 'name':
      case 'common_name':
        return 'entity name';
      case 'physical_description':
        return 'physical description';
      case 'size_data':
        return 'size information';
      case 'distinctive_features':
        return 'distinctive features';
      case 'habitat_use':
        return 'habitat preferences';
      case 'diet':
        return 'dietary habits';
      case 'behavioral_patterns':
        return 'behavioral characteristics';
      case 'physical_dimensions':
        return 'dimensions';
      case 'elevation_data':
        return 'elevation details';
      case 'physical_properties':
        return 'physical properties';
      case 'birth_details':
        return 'birth information';
      case 'family_background':
        return 'family background';
      case 'educational_journey':
        return 'education details';
      default:
        return placeholder.toLowerCase().replace(/_/g, ' ');
    }
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

  // Smart entity name detection
  private getSmartEntityName(topic: WikidataTopic): string {
    // Safety check: ensure topic and topic.title exist
    if (!topic || !topic.title || typeof topic.title !== 'string') {
      return '<span class="detail-chip" data-detail="entity_name">entity name</span>';
    }
    
    // If the topic title looks like a placeholder (contains brackets, plus signs, etc), make it a chip
    if (topic.title.includes('[') || topic.title.includes('+') || topic.title.match(/^(new topic|untitled|article)/i)) {
      return '<span class="detail-chip" data-detail="entity_name">entity name</span>';
    }
    
    // Check if it's a user-created placeholder title
    if (topic.title.toLowerCase().includes('example') || topic.title.toLowerCase().includes('placeholder')) {
      return '<span class="detail-chip" data-detail="entity_name">entity name</span>';
    }
    
    // Generate contextual entity name based on category and name patterns
    return this.generateContextualEntityName(topic.title, topic.category);
  }

  private generateContextualEntityName(entityName: string, category: string): string {
    // Handle undefined/null category
    if (!category || !entityName) {
      return `**${entityName || 'Entity'}**`;
    }

    const categoryLower = category.toLowerCase();
    const entityLower = entityName.toLowerCase();

    // For species, use appropriate articles
    if (categoryLower === 'species' || categoryLower.includes('biology')) {
      if (entityLower.includes('saurus')) {
        return `**The ${entityName}**`;
      } else if (entityLower.includes('bird') || entityLower.includes('fly')) {
        return `**The ${entityName}**`;
      } else {
        return `**${entityName}**`;
      }
    } else if (categoryLower === 'person') {
      return `**${entityName}**`;
    } else if (categoryLower === 'location') {
      return `**${entityName}**`;
    } else {
      return `**${entityName}**`;
    }
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