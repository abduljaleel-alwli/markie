
import type { Metadata } from './types';

export const INITIAL_METADATA: Metadata = {
    lang: 'ar',
    title: 'Your Awesome Article Title',
    description: 'A brief and compelling description of your article for search engines.',
    author: 'John Doe',
    keywords: 'blog, article, tech, javascript',
    canonicalUrl: 'https://example.com/your-awesome-article',
    imageUrl: 'https://picsum.photos/seed/picsum/1200/630',
};

export const INITIAL_MARKDOWN: string = `
# My Awesome Article

This is a sample article written in Markdown. This tool will convert it into SEO-optimized HTML.

## Key Features

*   Semantic HTML5 structure
*   Automatic SEO meta tags
*   JSON-LD structured data for rich results

### Code Example

\`\`\`javascript
function greet() {
  console.log("Hello, World!");
}
\`\`\`

## Why This Matters

Properly structured and optimized HTML is crucial for search engine visibility and accessibility. This tool handles the technical details so you can focus on writing great content.

> "The best way to predict the future is to invent it." - Alan Kay

Learn more by visiting a [great website](https://www.google.com).
`;