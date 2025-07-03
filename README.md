# Wikipedia Article Creator

An intelligent article creation tool that helps users generate Wikipedia-style articles with proper structure and formatting. The tool integrates with Wikidata to provide contextual suggestions and topic-specific templates.

## Features

- **Smart Topic Search**: Search and select topics using Wikidata integration
- **Intelligent Category Detection**: Automatically categorizes topics (Person, Location, Species, etc.)
- **Contextual Templates**: Dynamic section suggestions based on article category
- **Interactive Editing**: Click-to-edit detail chips for easy content customization
- **Lead Generation**: Multiple lead section variations (formal, engaging, detailed)
- **Wikidata Integration**: Fetches relevant data to enrich article content
- **Modern UI**: Built with Wikimedia's Codex design system

## Tech Stack

- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Codex**: Wikimedia's design system for consistent UI
- **Wikidata API**: For topic search and data enrichment

## Installation

```bash
# Clone the repository
git clone [repository-url]
cd article-creation

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Development

The project uses a modern TypeScript/HTML architecture:

- `src/html-main.ts` - Main application entry point
- `src/WikidataService.ts` - Wikidata API integration
- `src/CategoryMapper.ts` - Article categorization logic
- `src/IntelligentSectionEngine.ts` - Dynamic section generation
- `src/LeadTemplateEngine.ts` - Lead section templates

## Usage

1. Start typing in the search box to find a topic
2. Select a topic from the suggestions
3. Choose the appropriate category
4. Click "Create article" to generate the initial structure
5. Edit sections by clicking on detail chips
6. Add references and customize content as needed

## Project Structure

```
article-creation/
├── src/
│   ├── html-main.ts           # Main application
│   ├── WikidataService.ts     # API integration
│   ├── CategoryMapper.ts      # Category logic
│   ├── LeadTemplateEngine.ts  # Lead templates
│   └── ...
├── styles/
│   ├── codex.css             # Codex framework
│   └── components.css        # Custom styles
├── index.html                # Entry HTML
└── package.json             # Dependencies
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Add your license here]