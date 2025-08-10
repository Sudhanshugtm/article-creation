// ABOUTME: CategoryMapper that classifies Wikidata entities into article types
// ABOUTME: Maps P31 instance-of values to meaningful Wikipedia article categories

import { WikidataTopic } from './WikidataService';
import { 
    cdxIconUserAvatar, 
    cdxIconGlobe, 
    cdxIconDie, 
    cdxIconHome, 
    cdxIconBook, 
    cdxIconImage, 
    cdxIconCalendar, 
    cdxIconArticle 
} from '@wikimedia/codex-icons';

export enum ArticleCategory {
    PERSON = 'Person/Biography',
    LOCATION = 'Geographic Location',
    SPECIES = 'Species/Biology',
    ORGANIZATION = 'Organization',
    CONCEPT = 'Academic/Concept',
    CREATIVE_WORK = 'Creative Work',
    EVENT = 'Event',
    OTHER = 'Other'
}

export class CategoryMapper {
    // Wikidata Q-IDs mapped to our article categories
    private static readonly CATEGORY_MAPPINGS = new Map<string, ArticleCategory>([
        // Person/Biography - People, names, characters
        ['Q5', ArticleCategory.PERSON],          // human
        ['Q95074', ArticleCategory.PERSON],      // fictional character
        ['Q215627', ArticleCategory.PERSON],     // person
        ['Q3409032', ArticleCategory.PERSON],    // unisex given name
        ['Q49614', ArticleCategory.PERSON],      // nickname
        ['Q202444', ArticleCategory.PERSON],     // given name
        ['Q12308941', ArticleCategory.PERSON],   // male given name
        ['Q11879590', ArticleCategory.PERSON],   // female given name
        ['Q37221', ArticleCategory.PERSON],      // surname
        ['Q101352', ArticleCategory.PERSON],     // family name
        ['Q4167410', ArticleCategory.PERSON],    // disambiguation page
        ['Q82799', ArticleCategory.PERSON],      // name
        
        // Geographic Location - Places, regions, buildings
        ['Q515', ArticleCategory.LOCATION],      // city
        ['Q6256', ArticleCategory.LOCATION],     // country
        ['Q35657', ArticleCategory.LOCATION],    // state
        ['Q3957', ArticleCategory.LOCATION],     // town
        ['Q1021', ArticleCategory.LOCATION],     // county
        ['Q5119', ArticleCategory.LOCATION],     // capital
        ['Q486972', ArticleCategory.LOCATION],   // human settlement
        ['Q618123', ArticleCategory.LOCATION],   // geographical object
        ['Q82794', ArticleCategory.LOCATION],    // geographic region
        ['Q41176', ArticleCategory.LOCATION],    // building
        ['Q23413', ArticleCategory.LOCATION],    // castle
        ['Q16560', ArticleCategory.LOCATION],    // house
        ['Q355304', ArticleCategory.LOCATION],   // watercourse
        ['Q4022', ArticleCategory.LOCATION],     // river
        ['Q23397', ArticleCategory.LOCATION],    // lake
        ['Q8502', ArticleCategory.LOCATION],     // mountain
        ['Q39594', ArticleCategory.LOCATION],    // island
        ['Q5107', ArticleCategory.LOCATION],     // continent
        ['Q1549591', ArticleCategory.LOCATION],  // big city
        ['Q15284', ArticleCategory.LOCATION],    // municipality
        ['Q532', ArticleCategory.LOCATION],      // village
        ['Q15343', ArticleCategory.LOCATION],    // district
        ['Q19953632', ArticleCategory.LOCATION], // territorial entity
        
        // Species/Biology - Animals, plants, organisms
        ['Q7432', ArticleCategory.SPECIES],      // species
        ['Q16521', ArticleCategory.SPECIES],     // taxon
        ['Q729', ArticleCategory.SPECIES],       // animal
        ['Q756', ArticleCategory.SPECIES],       // plant
        ['Q10876', ArticleCategory.SPECIES],     // bacteria
        ['Q19088', ArticleCategory.SPECIES],     // virus
        ['Q23038290', ArticleCategory.SPECIES],  // fossil taxon
        ['Q55983715', ArticleCategory.SPECIES],  // organism
        ['Q2382443', ArticleCategory.SPECIES],   // mammalian species
        ['Q23058834', ArticleCategory.SPECIES],  // bird species
        ['Q17487588', ArticleCategory.SPECIES],  // fish species
        ['Q55984869', ArticleCategory.SPECIES],  // insect species
        ['Q55428727', ArticleCategory.SPECIES],  // biological entity
        ['Q713623', ArticleCategory.SPECIES],    // living thing
        ['Q24238356', ArticleCategory.SPECIES],  // carnivoran species
        ['Q25367', ArticleCategory.SPECIES],     // carnivore
        ['Q25326', ArticleCategory.SPECIES],     // mammal
        ['Q7377', ArticleCategory.SPECIES],      // mammalia
        ['Q25329', ArticleCategory.SPECIES],     // animal class
        ['Q25314', ArticleCategory.SPECIES],     // animal order
        ['Q35409', ArticleCategory.SPECIES],     // animal family
        ['Q7432', ArticleCategory.SPECIES],      // species
        ['Q427626', ArticleCategory.SPECIES],    // taxonomic rank
        ['Q2382443', ArticleCategory.SPECIES],   // mammalian species
        ['Q50379085', ArticleCategory.SPECIES],  // plant species
        ['Q3978', ArticleCategory.SPECIES],      // breed
        
        // Organization - Companies, institutions, groups
        ['Q783794', ArticleCategory.ORGANIZATION], // company
        ['Q4830453', ArticleCategory.ORGANIZATION], // business
        ['Q43229', ArticleCategory.ORGANIZATION],   // organization
        ['Q3918', ArticleCategory.ORGANIZATION],    // university
        ['Q9842', ArticleCategory.ORGANIZATION],    // primary school
        ['Q875538', ArticleCategory.ORGANIZATION],  // public university
        ['Q31855', ArticleCategory.ORGANIZATION],   // research institute
        ['Q327333', ArticleCategory.ORGANIZATION],  // government agency
        ['Q163740', ArticleCategory.ORGANIZATION],  // nonprofit organization
        ['Q4830453', ArticleCategory.ORGANIZATION], // business
        ['Q6881511', ArticleCategory.ORGANIZATION], // enterprise
        ['Q1616075', ArticleCategory.ORGANIZATION], // corporation
        ['Q15911314', ArticleCategory.ORGANIZATION], // association
        ['Q484652', ArticleCategory.ORGANIZATION],  // international organization
        ['Q130019', ArticleCategory.ORGANIZATION],  // educational institution
        ['Q1371037', ArticleCategory.ORGANIZATION], // sports club
        ['Q215380', ArticleCategory.ORGANIZATION],  // band
        ['Q5373', ArticleCategory.ORGANIZATION],    // political party
        ['Q4830453', ArticleCategory.ORGANIZATION], // enterprise
        ['Q891723', ArticleCategory.ORGANIZATION],  // public company
        ['Q1616075', ArticleCategory.ORGANIZATION], // corporation
        
        // Academic/Concept - Ideas, theories, fields
        ['Q11862829', ArticleCategory.CONCEPT],  // academic discipline
        ['Q2996394', ArticleCategory.CONCEPT],   // biological process
        ['Q1914636', ArticleCategory.CONCEPT],   // academic term
        ['Q17108659', ArticleCategory.CONCEPT],  // field of study
        ['Q2725376', ArticleCategory.CONCEPT],   // mathematical concept
        ['Q11205', ArticleCategory.CONCEPT],     // mathematical object
        ['Q47574', ArticleCategory.CONCEPT],     // unit of measurement
        ['Q186588', ArticleCategory.CONCEPT],    // theory
        ['Q7725634', ArticleCategory.CONCEPT],   // literary work
        ['Q901', ArticleCategory.CONCEPT],       // science
        ['Q395', ArticleCategory.CONCEPT],       // mathematics
        ['Q11862829', ArticleCategory.CONCEPT],  // academic discipline
        ['Q1914636', ArticleCategory.CONCEPT],   // academic term
        ['Q11023', ArticleCategory.CONCEPT],     // engineering
        ['Q36754', ArticleCategory.CONCEPT],     // chemistry
        ['Q413', ArticleCategory.CONCEPT],       // physics
        ['Q420', ArticleCategory.CONCEPT],       // biology
        ['Q8134', ArticleCategory.CONCEPT],      // economics
        ['Q5891', ArticleCategory.CONCEPT],      // philosophy
        ['Q1071', ArticleCategory.CONCEPT],      // geography
        ['Q12473', ArticleCategory.CONCEPT],     // mythology
        ['Q9418', ArticleCategory.CONCEPT],      // psychology
        ['Q33999', ArticleCategory.CONCEPT],     // actor
        
        // Creative Work - Books, films, art, software
        ['Q571', ArticleCategory.CREATIVE_WORK], // book
        ['Q11424', ArticleCategory.CREATIVE_WORK], // film
        ['Q202866', ArticleCategory.CREATIVE_WORK], // animated film
        ['Q134556', ArticleCategory.CREATIVE_WORK], // single
        ['Q482994', ArticleCategory.CREATIVE_WORK], // album
        ['Q15416', ArticleCategory.CREATIVE_WORK],  // television program
        ['Q5398426', ArticleCategory.CREATIVE_WORK], // television series
        ['Q1060829', ArticleCategory.CREATIVE_WORK], // software
        ['Q7725634', ArticleCategory.CREATIVE_WORK], // literary work
        ['Q838948', ArticleCategory.CREATIVE_WORK],  // work of art
        ['Q7889', ArticleCategory.CREATIVE_WORK],    // video game
        ['Q17517', ArticleCategory.CREATIVE_WORK],   // mobile app
        ['Q1193514', ArticleCategory.CREATIVE_WORK], // painting
        ['Q11446', ArticleCategory.CREATIVE_WORK],   // ship
        ['Q3305213', ArticleCategory.CREATIVE_WORK], // painting
        ['Q17537576', ArticleCategory.CREATIVE_WORK], // creative work
        ['Q47461344', ArticleCategory.CREATIVE_WORK], // written work
        ['Q47461344', ArticleCategory.CREATIVE_WORK], // written work
        ['Q223393', ArticleCategory.CREATIVE_WORK],  // literary genre
        ['Q1344', ArticleCategory.CREATIVE_WORK],    // opera
        ['Q2088357', ArticleCategory.CREATIVE_WORK], // musical work
        ['Q105543609', ArticleCategory.CREATIVE_WORK], // podcast
        
        // Event - Wars, competitions, disasters
        ['Q1656682', ArticleCategory.EVENT],     // event
        ['Q198', ArticleCategory.EVENT],         // war
        ['Q645883', ArticleCategory.EVENT],      // military conflict
        ['Q3839081', ArticleCategory.EVENT],     // natural disaster
        ['Q18669875', ArticleCategory.EVENT],    // sports competition
        ['Q47566', ArticleCategory.EVENT],       // earthquake
        ['Q8065', ArticleCategory.EVENT],        // natural disaster
        ['Q1190554', ArticleCategory.EVENT],     // occurrence
        ['Q1656682', ArticleCategory.EVENT],     // event
        ['Q46855', ArticleCategory.EVENT],       // concert
        ['Q46855', ArticleCategory.EVENT],       // concert
        ['Q16510064', ArticleCategory.EVENT],    // festival
        ['Q1656682', ArticleCategory.EVENT],     // occurrence
        ['Q132241', ArticleCategory.EVENT],      // festival
        ['Q1190554', ArticleCategory.EVENT],     // occurrence
        ['Q1190554', ArticleCategory.EVENT],     // occurrence
        ['Q181278', ArticleCategory.EVENT],      // accident
        ['Q846570', ArticleCategory.EVENT],      // military operation
        ['Q1371037', ArticleCategory.EVENT],     // sports event
    ]);

    static categorizeTopics(topics: WikidataTopic[]): WikidataTopic[] {
        const categorizedTopics = topics.map(topic => ({
            ...topic,
            category: this.determineCategory(topic.instanceOf)
        }));

        // Group by category and return unique categories
        const categoryGroups = new Map<ArticleCategory, WikidataTopic[]>();
        
        categorizedTopics.forEach(topic => {
            const category = topic.category as ArticleCategory;
            if (!categoryGroups.has(category)) {
                categoryGroups.set(category, []);
            }
            categoryGroups.get(category)!.push(topic);
        });

        // Sort categories - prioritize specific categories over OTHER
        const sortedCategories = Array.from(categoryGroups.entries()).sort(([categoryA], [categoryB]) => {
            if (categoryA === ArticleCategory.OTHER && categoryB !== ArticleCategory.OTHER) {
                return 1; // OTHER goes to end
            }
            if (categoryA !== ArticleCategory.OTHER && categoryB === ArticleCategory.OTHER) {
                return -1; // Specific categories come first
            }
            return 0; // Keep original order for non-OTHER categories
        });

        // Return one representative topic per category
        return sortedCategories.map(([category, topicsInCategory]) => {
            const representative = topicsInCategory[0];
            return {
                ...representative,
                title: category,
                description: this.getCategoryDescription(category),
                category: category
            };
        });
    }

    private static determineCategory(instanceOfIds: string[]): ArticleCategory {
        // Define priority order for categories to resolve conflicts
        const categoryPriority = [
            ArticleCategory.PERSON,
            ArticleCategory.LOCATION, 
            ArticleCategory.SPECIES,
            ArticleCategory.ORGANIZATION,
            ArticleCategory.CONCEPT,
            ArticleCategory.EVENT,
            ArticleCategory.CREATIVE_WORK,  // Lower priority than biological/factual content
            ArticleCategory.OTHER
        ];

        // Find all matching categories
        const matchedCategories = new Set<ArticleCategory>();
        for (const id of instanceOfIds) {
            if (this.CATEGORY_MAPPINGS.has(id)) {
                matchedCategories.add(this.CATEGORY_MAPPINGS.get(id)!);
            }
        }

        // Return the highest priority category found
        for (const category of categoryPriority) {
            if (matchedCategories.has(category)) {
                return category;
            }
        }

        return ArticleCategory.OTHER;
    }

    private static getCategoryDescription(category: ArticleCategory): string {
        switch (category) {
            case ArticleCategory.PERSON:
                return 'About a notable individual or character';
            case ArticleCategory.LOCATION:
                return 'About a place, city, country, or region';
            case ArticleCategory.SPECIES:
                return 'About an animal, plant, or biological organism';
            case ArticleCategory.ORGANIZATION:
                return 'About a company, institution, or group';
            case ArticleCategory.CONCEPT:
                return 'About an idea, theory, or academic concept';
            case ArticleCategory.CREATIVE_WORK:
                return 'About a book, film, artwork, or creative piece';
            case ArticleCategory.EVENT:
                return 'About a historical event or occurrence';
            case ArticleCategory.OTHER:
                return 'About a general topic or concept';
            default:
                return 'About a topic or concept';
        }
    }

    static getCategoryIcon(category: ArticleCategory, size: number = 20): string {
        const iconSize = size === 12 ? '12' : '20';
        
        switch (category) {
            case ArticleCategory.PERSON:
                return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 20 20" aria-hidden="true">${cdxIconUserAvatar}</svg>`;
            case ArticleCategory.LOCATION:
                return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 20 20" aria-hidden="true">${cdxIconGlobe}</svg>`;
            case ArticleCategory.SPECIES:
                return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 20 20" aria-hidden="true">${cdxIconDie}</svg>`;
            case ArticleCategory.ORGANIZATION:
                return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 20 20" aria-hidden="true">${cdxIconHome}</svg>`;
            case ArticleCategory.CONCEPT:
                return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 20 20" aria-hidden="true">${cdxIconBook.ltr}</svg>`;
            case ArticleCategory.CREATIVE_WORK:
                return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 20 20" aria-hidden="true">${cdxIconImage}</svg>`;
            case ArticleCategory.EVENT:
                return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 20 20" aria-hidden="true">${cdxIconCalendar}</svg>`;
            case ArticleCategory.OTHER:
                return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 20 20" aria-hidden="true">${cdxIconArticle.ltr}</svg>`;
            default:
                return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 20 20" aria-hidden="true">${cdxIconArticle.ltr}</svg>`;
        }
    }
}