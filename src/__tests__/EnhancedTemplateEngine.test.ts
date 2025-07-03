// ABOUTME: Comprehensive test suite for the Enhanced Template Engine
// ABOUTME: Tests template generation quality, Wikidata integration, and edge cases

import { EnhancedTemplateEngine } from '../EnhancedTemplateEngine';
import { WikidataService, WikidataTopic } from '../WikidataService';
import { ArticleCategory } from '../CategoryMapper';

// Mock WikidataService
jest.mock('../WikidataService');
const MockedWikidataService = WikidataService as jest.Mocked<typeof WikidataService>;

describe('EnhancedTemplateEngine', () => {
  let templateEngine: EnhancedTemplateEngine;
  let mockWikidataService: jest.Mocked<WikidataService>;

  beforeEach(() => {
    mockWikidataService = new WikidataService() as jest.Mocked<WikidataService>;
    templateEngine = new EnhancedTemplateEngine(mockWikidataService);
  });

  describe('Template Generation Quality', () => {
    test('generates high-quality template for well-known scientist', async () => {
      // Setup test data for Marie Curie
      const marieCurieTopic: WikidataTopic = {
        id: 'Q7186',
        title: 'Marie Curie',
        description: 'Polish-French physicist and chemist',
        category: 'person',
        instanceOf: ['Q5'] // human
      };

      // Mock Wikidata responses
      MockedWikidataService.getEntityProperties.mockResolvedValue({
        P569: '1867-11-07', // birth date
        P570: '1934-07-04', // death date
        P19: 'Q270', // birth place (Warsaw)
        P27: 'Q36', // nationality (Poland)
        P106: 'Q593644', // occupation (chemist)
        P166: 'Q44585', // Nobel Prize
        P800: 'Q2995' // notable work (radioactivity)
      });

      MockedWikidataService.resolveEntityNames.mockResolvedValue({
        'Q270': 'Warsaw',
        'Q36': 'Polish',
        'Q593644': 'chemist',
        'Q44585': 'Nobel Prize in Physics',
        'Q2995': 'radioactivity research'
      });

      const result = await templateEngine.generateEnhancedTemplate(
        marieCurieTopic,
        ArticleCategory.PERSON,
        'production'
      );

      // Assertions for quality
      expect(result.template).toContain('Marie Curie');
      expect(result.template).toContain('1867');
      expect(result.template).toContain('1934');
      expect(result.template).toContain('Polish');
      expect(result.template).toContain('physicist');
      expect(result.template).not.toContain('{{'); // No unfilled placeholders
      expect(result.qualityMetrics.overallScore).toBeGreaterThan(0.8);
    });

    test('generates appropriate template for unknown entity', async () => {
      const unknownTopic: WikidataTopic = {
        id: '',
        title: 'John Doe',
        description: 'Unknown person',
        category: 'person',
        instanceOf: []
      };

      const result = await templateEngine.generateEnhancedTemplate(
        unknownTopic,
        ArticleCategory.PERSON,
        'skeleton'
      );

      // Should create skeleton template with smart chips
      expect(result.template).toContain('John Doe');
      expect(result.template).toContain('detail-chip');
      expect(result.contextualChips.length).toBeGreaterThan(0);
      expect(result.qualityMetrics.overallScore).toBeLessThan(0.5);
    });

    test('detects scientist subcategory correctly', async () => {
      const scientistTopic: WikidataTopic = {
        id: 'Q1234',
        title: 'Albert Einstein',
        description: 'German theoretical physicist',
        category: 'person',
        instanceOf: ['Q5']
      };

      MockedWikidataService.getEntityProperties.mockResolvedValue({
        P106: 'Q169470' // theoretical physicist
      });

      MockedWikidataService.resolveEntityNames.mockResolvedValue({
        'Q169470': 'theoretical physicist'
      });

      const result = await templateEngine.generateEnhancedTemplate(
        scientistTopic,
        ArticleCategory.PERSON
      );

      // Should include scientist-specific chips
      const scientificChips = result.contextualChips.filter(chip => 
        chip.id === 'scientific_field' || chip.id === 'major_discovery'
      );
      expect(scientificChips.length).toBeGreaterThan(0);
    });
  });

  describe('Data Validation', () => {
    test('validates birth/death date consistency', async () => {
      const invalidTopic: WikidataTopic = {
        id: 'Q9999',
        title: 'Invalid Person',
        description: 'Person with invalid dates',
        category: 'person',
        instanceOf: ['Q5']
      };

      MockedWikidataService.getEntityProperties.mockResolvedValue({
        P569: '1950-01-01', // birth date
        P570: '1940-01-01', // death date (before birth - invalid!)
      });

      const result = await templateEngine.generateEnhancedTemplate(
        invalidTopic,
        ArticleCategory.PERSON
      );

      expect(result.validationStatus.validationErrors.length).toBeGreaterThan(0);
      expect(result.validationStatus.validationErrors[0].message).toContain('date');
    });

    test('warns about low data completeness', async () => {
      const incompleteTopic: WikidataTopic = {
        id: 'Q8888',
        title: 'Incomplete Person',
        description: 'Person with minimal data',
        category: 'person',
        instanceOf: ['Q5']
      };

      MockedWikidataService.getEntityProperties.mockResolvedValue({
        P569: '1980-01-01' // Only birth date, missing many other properties
      });

      const result = await templateEngine.generateEnhancedTemplate(
        incompleteTopic,
        ArticleCategory.PERSON
      );

      expect(result.qualityMetrics.completenessScore).toBeLessThan(0.5);
      expect(result.validationStatus.warnings).toContain('Low data completeness - consider adding more information');
    });
  });

  describe('Template Quality Levels', () => {
    test('selects appropriate quality level based on data', async () => {
      const topic: WikidataTopic = {
        id: 'Q7777',
        title: 'Test Person',
        description: 'Test description',
        category: 'person',
        instanceOf: ['Q5']
      };

      // High quality data
      MockedWikidataService.getEntityProperties.mockResolvedValue({
        P569: '1980-01-01',
        P570: '2020-01-01',
        P19: 'Q1234',
        P27: 'Q5678',
        P106: 'Q9999',
        P166: 'Q1111',
        P800: 'Q2222'
      });

      MockedWikidataService.resolveEntityNames.mockResolvedValue({
        'Q1234': 'Test City',
        'Q5678': 'Test Nationality',
        'Q9999': 'Test Profession',
        'Q1111': 'Test Award',
        'Q2222': 'Test Work'
      });

      const productionResult = await templateEngine.generateEnhancedTemplate(topic, ArticleCategory.PERSON, 'production');
      const skeletonResult = await templateEngine.generateEnhancedTemplate(topic, ArticleCategory.PERSON, 'skeleton');

      expect(productionResult.template).not.toContain('detail-chip');
      expect(skeletonResult.template).toContain('detail-chip');
      expect(productionResult.qualityMetrics.overallScore).toBeGreaterThan(skeletonResult.qualityMetrics.overallScore);
    });
  });

  describe('Error Handling', () => {
    test('handles Wikidata API failures gracefully', async () => {
      const topic: WikidataTopic = {
        id: 'Q6666',
        title: 'Test Person',
        description: 'Test description',
        category: 'person',
        instanceOf: ['Q5']
      };

      MockedWikidataService.getEntityProperties.mockRejectedValue(new Error('API Error'));

      const result = await templateEngine.generateEnhancedTemplate(topic, ArticleCategory.PERSON);

      expect(result.template).toContain('Test Person');
      expect(result.validationStatus.warnings).toContain('Fallback template used');
    });

    test('handles malformed entity data', async () => {
      const malformedTopic: WikidataTopic = {
        id: 'Q5555',
        title: '',
        description: '',
        category: 'person',
        instanceOf: []
      };

      const result = await templateEngine.generateEnhancedTemplate(malformedTopic, ArticleCategory.PERSON);

      expect(result.template).toContain('detail-chip');
      expect(result.contextualChips.length).toBeGreaterThan(0);
    });
  });

  describe('Location Templates', () => {
    test('generates appropriate city template', async () => {
      const cityTopic: WikidataTopic = {
        id: 'Q3333',
        title: 'Test City',
        description: 'A major city in Test Country',
        category: 'location',
        instanceOf: ['Q515'] // city
      };

      MockedWikidataService.getEntityProperties.mockResolvedValue({
        P17: 'Q1111', // country
        P131: 'Q2222', // located in
        P1082: '1000000', // population
        P2046: '500' // area
      });

      MockedWikidataService.resolveEntityNames.mockResolvedValue({
        'Q1111': 'Test Country',
        'Q2222': 'Test State'
      });

      const result = await templateEngine.generateEnhancedTemplate(cityTopic, ArticleCategory.LOCATION);

      expect(result.template).toContain('Test City');
      expect(result.template).toContain('city');
      expect(result.template).toContain('Test Country');
      expect(result.contextualChips.some(chip => chip.id === 'population')).toBe(true);
    });
  });

  describe('Species Templates', () => {
    test('generates appropriate species template', async () => {
      const speciesTopic: WikidataTopic = {
        id: 'Q4444',
        title: 'Test Bird',
        description: 'A species of bird found in tropical regions',
        category: 'species',
        instanceOf: ['Q16521'] // taxon
      };

      MockedWikidataService.getEntityProperties.mockResolvedValue({
        P225: 'Testus birdus', // scientific name
        P171: 'Q3333', // parent taxon
        P105: 'Q7432', // species
        P183: 'Q2222' // native to
      });

      MockedWikidataService.resolveEntityNames.mockResolvedValue({
        'Q3333': 'Test Family',
        'Q7432': 'species',
        'Q2222': 'Tropical Regions'
      });

      const result = await templateEngine.generateEnhancedTemplate(speciesTopic, ArticleCategory.SPECIES);

      expect(result.template).toContain('Test Bird');
      expect(result.template).toContain('Testus birdus');
      expect(result.template).toContain('bird');
      expect(result.contextualChips.some(chip => chip.id === 'habitat')).toBe(true);
    });
  });

  describe('Performance', () => {
    test('generates template within acceptable time limit', async () => {
      const topic: WikidataTopic = {
        id: 'Q1000',
        title: 'Performance Test',
        description: 'Test for performance',
        category: 'person',
        instanceOf: ['Q5']
      };

      MockedWikidataService.getEntityProperties.mockResolvedValue({});

      const startTime = Date.now();
      await templateEngine.generateEnhancedTemplate(topic, ArticleCategory.PERSON);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('Integration with Real Data', () => {
    test('works with actual Wikidata entity structure', async () => {
      // This test would use actual Wikidata responses for integration testing
      const realTopic: WikidataTopic = {
        id: 'Q7186', // Marie Curie
        title: 'Marie Curie',
        description: 'Polish-French physicist and chemist',
        category: 'person',
        instanceOf: ['Q5']
      };

      // Use actual Wikidata service (not mocked) for integration test
      if (process.env.RUN_INTEGRATION_TESTS === 'true') {
        const realWikidataService = new WikidataService();
        const realTemplateEngine = new EnhancedTemplateEngine(realWikidataService);

        const result = await realTemplateEngine.generateEnhancedTemplate(realTopic, ArticleCategory.PERSON);

        expect(result.template).toContain('Marie Curie');
        expect(result.qualityMetrics.overallScore).toBeGreaterThan(0.5);
      }
    });
  });
});

// Additional utility tests
describe('EnhancedTemplateEngine Utilities', () => {
  let templateEngine: EnhancedTemplateEngine;

  beforeEach(() => {
    const mockWikidataService = new WikidataService() as jest.Mocked<WikidataService>;
    templateEngine = new EnhancedTemplateEngine(mockWikidataService);
  });

  test('calculates quality metrics correctly', () => {
    // This would test the internal quality calculation methods
    // Implementation depends on exposing these methods for testing
  });

  test('handles edge cases in data formatting', () => {
    // Test various edge cases in date formatting, name formatting, etc.
  });
});