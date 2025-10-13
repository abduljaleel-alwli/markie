import React from 'react';
import { useTranslations, Language } from '../hooks/useTranslations';

interface MarkdownInputProps {
    markdownText: string;
    onMarkdownChange: (text: string) => void;
    language: Language;
}

const MarkdownInput: React.FC<MarkdownInputProps> = ({ markdownText, onMarkdownChange, language }) => {
    const t = useTranslations(language);
    
    return (
        <div className="p-4">
            <textarea
                value={markdownText}
                onChange={(e) => onMarkdownChange(e.target.value)}
                placeholder={t('enterMarkdown')}
                className="w-full min-h-[660px] p-4 bg-slate-100/50 dark:bg-zinc-800/60 border-none focus:ring-0 rounded-lg text-slate-800 dark:text-zinc-200 font-mono text-sm leading-relaxed resize-none focus:outline-none"
                spellCheck="false"
            />
        </div>
    );
};

export default MarkdownInput;