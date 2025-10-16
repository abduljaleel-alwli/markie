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

export interface SelectOption {
    value: string;
    label_en: string;
    label_ar: string;
}
