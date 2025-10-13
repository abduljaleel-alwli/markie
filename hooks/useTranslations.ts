import { useMemo } from 'react';
import { locales } from '../i18n/locales';

export type Language = 'en' | 'ar';

export const useTranslations = (lang: Language) => {
    const t = useMemo(() => {
        const translations = locales[lang] || locales.en;
        return (key: keyof typeof locales.en): string => {
            return translations[key] || key;
        };
    }, [lang]);

    return t;
};
