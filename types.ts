import { locales } from './i18n/locales';

export interface Metadata {
    lang: string;
    title: string;
    description: string;
    author: string;
    keywords: string;
    canonicalUrl: string;
    imageUrl: string;
}

export type Theme = 'light' | 'dark';
export type Page = 'converter' | 'generator';

export interface SelectOption {
    value: string;
    label_en: string;
    label_ar: string;
}

export interface ArticleOutline {
    introduction_summary: string;
    sections: {
        section_title: string;
        section_summary: string;
    }[];
    conclusion_summary: string;
    faq_section?: {
        faq_title: string;
        questions: {
            question: string;
            answer: string;
        }[];
    };
    data_table?: {
        table_title: string;
        headers: string[];
        rows: string[][];
    };
    quote?: {
        quote_text: string;
        quote_author: string;
    };
}

export type ResultTab = 'outline' | 'article' | 'image';

export interface ArticleGeneratorState {
    currentStep: number;
    highestStep: number;
    activeResultTab: ResultTab | null;
    title: string;
    keywords: string;
    articleLanguage: string;
    tone: string;
    contentType: string;
    targetAudience: string;
    writingStyle: string;
    wordCount: string;
    showAdvanced: boolean;
    numberOfSections: string;
    introductionStyle: string;
    conclusionStyle: string;
    includeFaq: boolean;
    includeTable: boolean;
    includeQuote: boolean;
    isGeneratingKeywords: boolean;
    isGeneratingArticle: boolean;
    generatedArticle: string;
    useGoogleSearch: boolean;
    sources: any[];
    generatedImage: string | null;
    isGeneratingImage: boolean;
    imageModel: string;
    imageStyle: string;
    imageAspectRatio: string;
    includeTitleInImage: boolean;
    imageTextLanguage: string;
    customImageText: string;
    embedLogo: boolean;
    logoImage: string | null;
    logoPlacement: string;
    outline: ArticleOutline | null;
    isGeneratingOutline: boolean;
    primaryFocus: string;
}