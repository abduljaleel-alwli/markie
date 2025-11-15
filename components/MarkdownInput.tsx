import React, { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTranslations, Language } from '../hooks/useTranslations';
import MarkdownCheatsheet from './MarkdownCheatsheet';
import { QuestionMarkCircleIcon } from './icons';

interface MarkdownInputProps {
    markdownText: string;
    onMarkdownChange: (text: string) => void;
    language: Language;
}

const MarkdownInput: React.FC<MarkdownInputProps> = ({ markdownText, onMarkdownChange, language }) => {
    const t = useTranslations(language);
    const [showCheatsheet, setShowCheatsheet] = useState(false);

    const wordCount = useMemo(() => {
        if (!markdownText) return 0;
        // Trim whitespace, split by any whitespace characters, and filter out empty strings
        const words = markdownText.trim().split(/\s+/).filter(Boolean);
        return words.length;
    }, [markdownText]);
    
    return (
        <div className="p-4">
            <AnimatePresence>
                {showCheatsheet && <MarkdownCheatsheet language={language} />}
            </AnimatePresence>

            <div className="relative">
                <textarea
                    value={markdownText}
                    onChange={(e) => onMarkdownChange(e.target.value)}
                    placeholder={t('enterMarkdown')}
                    className="w-full min-h-[660px] p-4 bg-slate-100/50 dark:bg-zinc-800/60 border-none focus:ring-0 rounded-lg text-slate-800 dark:text-zinc-200 font-mono text-sm leading-relaxed resize-none focus:outline-none"
                    spellCheck="false"
                />
                <button 
                    onClick={() => setShowCheatsheet(!showCheatsheet)}
                    className="absolute top-3 right-3 p-1.5 rounded-full text-slate-500 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-zinc-700/60 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
                    aria-label="Toggle Markdown Cheatsheet"
                    title="Markdown Cheatsheet"
                >
                    <QuestionMarkCircleIcon className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 right-3 text-xs font-mono text-slate-500 dark:text-zinc-400 bg-slate-200/50 dark:bg-zinc-900/50 px-2 py-1 rounded select-none">
                    {t('wordCounter')}: {wordCount}
                </div>
            </div>
        </div>
    );
};

export default MarkdownInput;