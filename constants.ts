
import type { Metadata, SelectOption } from './types';

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

export const LANGUAGE_OPTIONS: SelectOption[] = [
    { value: 'arabic', label_en: 'Arabic', label_ar: 'العربية' },
    { value: 'english', label_en: 'English', label_ar: 'الإنجليزية' },
    { value: 'french', label_en: 'French', label_ar: 'الفرنسية' },
    { value: 'spanish', label_en: 'Spanish', label_ar: 'الإسبانية' },
    { value: 'german', label_en: 'German', label_ar: 'الألمانية' },
];

export const TONE_OPTIONS: SelectOption[] = [
    { value: 'professional', label_en: 'Professional', label_ar: 'احترافي' },
    { value: 'playful', label_en: 'Playful', label_ar: 'مرح' },
    { value: 'egyptian-colloquial', label_en: 'Egyptian Colloquial', label_ar: 'عامية مصرية' },
    { value: 'gulf-colloquial', label_en: 'Gulf Colloquial', label_ar: 'خليجية' },
    { value: 'formal', label_en: 'Formal', label_ar: 'رسمي' },
    { value: 'friendly', label_en: 'Friendly', label_ar: 'ودي' },
    { value: 'motivational', label_en: 'Motivational', label_ar: 'تحفيزي' },
];

export const CONTENT_TYPE_OPTIONS: SelectOption[] = [
    { value: 'article', label_en: 'Article', label_ar: 'مقال' },
    { value: 'blog-post', label_en: 'Blog Post', label_ar: 'تدوينة' },
    { value: 'report', label_en: 'Report', label_ar: 'تقرير' },
    { value: 'review', label_en: 'Review', label_ar: 'مراجعة' },
    { value: 'guide', label_en: 'Guide', label_ar: 'دليل' },
    { value: 'listicle', label_en: 'Listicle', label_ar: 'قائمة' },
];

export const AUDIENCE_OPTIONS: SelectOption[] = [
    { value: 'general-public', label_en: 'General Public', label_ar: 'عام' },
    { value: 'specialists', label_en: 'Specialists', label_ar: 'متخصصين' },
    { value: 'students', label_en: 'Students', label_ar: 'طلاب' },
    { value: 'children', label_en: 'Children', label_ar: 'أطفال' },
    { value: 'seniors', label_en: 'Seniors', label_ar: 'كبار السن' },
];

export const WRITING_STYLE_OPTIONS: SelectOption[] = [
    { value: 'simple', label_en: 'Simple', label_ar: 'بسيط' },
    { value: 'intermediate', label_en: 'Intermediate', label_ar: 'متوسط' },
    { value: 'advanced', label_en: 'Advanced', label_ar: 'متقدم' },
    { value: 'academic', label_en: 'Academic', label_ar: 'أكاديمي' },
    { value: 'creative', label_en: 'Creative', label_ar: 'إبداعي' },
];

export const IMAGE_MODEL_OPTIONS: SelectOption[] = [
    { value: 'gemini-2.5-flash-image', label_en: 'Gemini Flash Image (Standard)', label_ar: 'Gemini Flash Image (قياسي)' },
    { value: 'imagen-4.0-generate-001', label_en: 'Imagen 4.0 (Advanced)', label_ar: 'Imagen 4.0 (متقدم)' },
];

export const IMAGE_STYLE_OPTIONS: SelectOption[] = [
    { value: 'photorealistic', label_en: 'Photorealistic', label_ar: 'صورة واقعية' },
    { value: 'illustrative', label_en: 'Illustrative', label_ar: 'توضيحي' },
    { value: 'abstract', label_en: 'Abstract', label_ar: 'تجريدي' },
    { value: 'minimalist', label_en: 'Minimalist', label_ar: 'بسيط' },
    { value: 'vintage', label_en: 'Vintage', label_ar: 'عتيق' },
    { value: '3d-render', label_en: '3D Render', label_ar: 'تصيير ثلاثي الأبعاد' },
];

export const IMAGE_ASPECT_RATIO_OPTIONS: SelectOption[] = [
    { value: '16:9', label_en: 'Landscape (16:9)', label_ar: 'أفقي (16:9)' },
    { value: '1:1', label_en: 'Square (1:1)', label_ar: 'مربع (1:1)' },
    { value: '9:16', label_en: 'Portrait (9:16)', label_ar: 'عمودي (9:16)' },
    { value: '4:3', label_en: 'Standard (4:3)', label_ar: 'قياسي (4:3)' },
    { value: '3:4', label_en: 'Standard Portrait (3:4)', label_ar: 'قياسي عمودي (3:4)' },
];

export const LOGO_PLACEMENT_OPTIONS: SelectOption[] = [
    { value: 'bottom-right', label_en: 'Bottom Right', label_ar: 'أسفل اليمين' },
    { value: 'bottom-left', label_en: 'Bottom Left', label_ar: 'أسفل اليسار' },
    { value: 'top-right', label_en: 'Top Right', label_ar: 'أعلى اليمين' },
    { value: 'top-left', label_en: 'Top Left', label_ar: 'أعلى اليسار' },
    { value: 'center', label_en: 'Center', label_ar: 'الوسط' },
];