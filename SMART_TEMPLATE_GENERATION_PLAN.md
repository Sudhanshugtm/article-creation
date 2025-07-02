# Smart Template Generation Plan

## Objective
Create intelligent, context-aware templates for all Wikipedia article categories by analyzing real featured/good articles and extracting their lead section patterns.

## Current Problem

### Generic Template System
- All categories use one-size-fits-all templates
- Same person template for scientists, artists, politicians, athletes
- No contextual awareness or category-specific intelligence
- Templates don't reflect real Wikipedia editorial standards

### Example of Current Limitation
**Current Generic Person Template:**
```
"${title} (+ birth year–+ death year) was a + nationality + occupation known for + main achievement. 📎 Reference"
```

**Result:** Marie Curie, Leonardo da Vinci, and Abraham Lincoln all get identical template structures, despite being completely different types of people with different information needs.

## Proposed Solution: Hybrid Smart Analysis

### Phase 1: Research & Pattern Discovery

#### 1.1 Featured Article Analysis
- **Objective**: Identify Wikipedia's highest quality content patterns
- **Method**: Use Wikidata MCP to find featured/good articles by category
- **Categories to analyze**:
  - Person/Biography
  - Geographic Location  
  - Species/Biology
  - Organization
  - Academic/Concept
  - Creative Work
  - Event

#### 1.2 Lead Section Pattern Extraction
- **Process**: Extract and analyze lead section structures from featured articles
- **Analysis targets**:
  - Common sentence patterns
  - Information hierarchy
  - Category-specific elements
  - Typical information flow

#### 1.3 Property Pattern Discovery
- **Dual approach**: Combine structural analysis with property frequency analysis
- **Wikidata integration**: Find which properties appear in 70%+ of category articles
- **Pattern mapping**: Connect narrative structures to underlying data properties

### Phase 2: Context-Aware Template System

#### 2.1 Enhanced Category Detection
**Current:**
```javascript
getCategorySpecificChips(category: ArticleCategory)
```

**Enhanced:**
```javascript
getIntelligentChips(title: string, category: ArticleCategory, wikidataContext?: any)
```

#### 2.2 Contextual Chip Generation
**Scientists Example:**
- Instead of: `+ occupation`
- Generate: `+ research field`, `+ major discovery`, `+ scientific contribution`

**Artists Example:**
- Instead of: `+ occupation`  
- Generate: `+ artistic medium`, `+ artistic style`, `+ notable works`

**Politicians Example:**
- Instead of: `+ occupation`
- Generate: `+ political position`, `+ political party`, `+ major policies`

#### 2.3 Smart Template Adaptation
- **Context detection**: Analyze topic to determine subcategory
- **Template selection**: Choose appropriate template based on context
- **Chip customization**: Generate relevant chips for specific topic type

### Phase 3: Implementation & Integration

#### 3.1 Research Integration
- Connect research findings to existing `generateChipBasedLeads()` function
- Enhance `getCategorySpecificChips()` with intelligence
- Maintain backward compatibility with current system

#### 3.2 Quality Assurance
- **Testing matrix**: Test with diverse topics across all categories
- **Validation**: Compare generated templates against actual Wikipedia patterns
- **Refinement**: Iterative improvement based on results

#### 3.3 User Experience
- **Transparency**: Users understand why certain chips are suggested
- **Flexibility**: Maintain ability to customize and add chips
- **Performance**: Fast generation without sacrificing quality

## Expected Outcomes

### Before (Current System)
```
"Jaipur is a + location type in + parent location with a population of + population. 📎 Reference"
```

### After (Smart System)
**For Historical City:**
```
"Jaipur is a + city type founded in + founding year by + founder in + region. Known for its + architectural feature and + cultural significance, it serves as + administrative role. 📎 Reference"
```

**For Scientist:**
```
"Marie Curie (+ birth year–+ death year) was a + nationality + scientific field researcher who + major discovery. She was the first + achievement and won + awards for her work in + research area. 📎 Reference"
```

## Technical Requirements

### Wikidata MCP Dependencies
- `wikidata_analyze_class_patterns` - Analyze common properties
- `wikidata_get_wikipedia_lead` - Extract lead section patterns  
- `wikidata_sparql_query` - Find featured articles
- `wikidata_search_entities` - Context detection

### Implementation Components
1. **Pattern Analysis Engine**: Analyze Wikipedia content patterns
2. **Context Detection System**: Determine topic subcategory
3. **Smart Chip Generator**: Create contextual chips
4. **Template Engine Enhancement**: Upgrade existing system

## Success Metrics

### Quality Indicators
- **Relevance**: Templates match actual Wikipedia patterns for category
- **Contextual accuracy**: Chips are appropriate for specific topic type
- **User adoption**: Users find templates helpful and accurate

### Technical Metrics
- **Coverage**: All major categories have intelligent templates
- **Performance**: Template generation remains fast (<500ms)
- **Maintainability**: System can be easily updated with new patterns

## Next Steps

1. **MCP Fix Phase**: Wait for Wikidata MCP error fixes (see WIKIDATA_MCP_ERROR_REPORT.md)
2. **Research Phase**: Begin pattern analysis once MCP tools work
3. **Prototype Phase**: Implement enhanced template system
4. **Testing Phase**: Validate against real Wikipedia content
5. **Integration Phase**: Deploy to production system

## Future Enhancements

### Advanced Features
- **Machine learning**: Improve pattern detection over time
- **User feedback**: Learn from user modifications to templates
- **Multilingual support**: Extend to other language Wikipedias
- **Real-time updates**: Keep templates current with Wikipedia standards

### Integration Possibilities
- **Citation assistance**: Suggest appropriate source types
- **Category recommendations**: Improve category detection
- **Content suggestions**: Recommend additional sections based on patterns

---

This plan transforms our current generic template system into an intelligent, context-aware system that reflects real Wikipedia editorial standards and practices.