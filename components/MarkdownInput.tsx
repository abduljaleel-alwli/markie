import React, { useMemo } from 'react';
import { useTranslations, Language } from '../hooks/useTranslations';
import MarkdownCheatsheet from './MarkdownCheatsheet';

interface MarkdownInputProps {
    markdownText: string;
    onMarkdownChange: (text: string) => void;
    language: Language;
}

const MarkdownInput: React.FC<MarkdownInputProps> = ({ markdownText, onMarkdownChange, language }) => {
    const t = useTranslations(language);

    const wordCount = useMemo(() => {
        if (!markdownText) return 0;
        // Trim whitespace, split by any whitespace characters, and filter out empty strings
        const words = markdownText.trim().split(/\s+/).filter(Boolean);
        return words.length;
    }, [markdownText]);
    
    return (
        <div className="p-4 relative">
            <MarkdownCheatsheet language={language} />
            <textarea
                value={markdownText}
                onChange={(e) => onMarkdownChange(e.target.value)}
                placeholder={t('enterMarkdown')}
                className="w-full min-h-[660px] p-4 bg-slate-100/50 dark:bg-zinc-800/60 border-none focus:ring-0 rounded-lg text-slate-800 dark:text-zinc-200 font-mono text-sm leading-relaxed resize-none focus:outline-none"
                spellCheck="false"
            />
            <div className="absolute bottom-6 right-6 text-xs font-mono text-slate-500 dark:text-zinc-400 bg-slate-200/50 dark:bg-zinc-900/50 px-2 py-1 rounded select-none">
                {t('wordCounter')}: {wordCount}
            </div>
        </div>
    );
};

export default MarkdownInput;