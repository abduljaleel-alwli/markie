import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, Language } from '../hooks/useTranslations';
import { BookOpenIcon } from './icons';

interface MarkdownInputProps {
    markdownText: string;
    onMarkdownChange: (text: string) => void;
    language: Language;
}

const SyntaxRow: React.FC<{ name: string; syntax: string }> = ({ name, syntax }) => (
    <tr>
        <td className="px-3 py-1.5 text-slate-600 dark:text-zinc-300 w-1/3">{name}</td>
        <td className="px-3 py-1.5 font-mono text-sm text-cyan-700 dark:text-cyan-400">
            <code>{syntax}</code>
        </td>
    </tr>
);

const MarkdownCheatsheet: React.FC<{ t: (key: string) => string }> = ({ t }) => {
    return (
        <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: '1rem' }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
        >
            <div className="p-4 bg-slate-100 dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-1">
                         <h5 className="font-semibold text-slate-700 dark:text-zinc-300 text-sm mb-2">{t('cheatsheetHeadings')}</h5>
                         <table className="w-full text-left text-sm">
                            <tbody>
                                <SyntaxRow name="H1" syntax="# Heading 1" />
                                <SyntaxRow name="H2" syntax="## Heading 2" />
                            </tbody>
                         </table>
                    </div>
                    <div className="space-y-1">
                         <h5 className="font-semibold text-slate-700 dark:text-zinc-300 text-sm mb-2">{t('cheatsheetTextStyles')}</h5>
                         <table className="w-full text-left text-sm">
                             <tbody>
                                <SyntaxRow name={t('cheatsheetBold')} syntax="**Bold**" />
                                <SyntaxRow name={t('cheatsheetItalic')} syntax="*Italic*" />
                             </tbody>
                         </table>
                    </div>
                     <div className="space-y-1">
                         <h5 className="font-semibold text-slate-700 dark:text-zinc-300 text-sm mb-2">{t('cheatsheetLists')}</h5>
                         <table className="w-full text-left text-sm">
                             <tbody>
                                <SyntaxRow name={t('cheatsheetOrderedList')} syntax="1. Item" />
                                <SyntaxRow name={t('cheatsheetUnorderedList')} syntax="* Item" />
                             </tbody>
                         </table>
                    </div>
                     <div className="space-y-1">
                         <h5 className="font-semibold text-slate-700 dark:text-zinc-300 text-sm mb-2">{t('cheatsheetMisc')}</h5>
                         <table className="w-full text-left text-sm">
                             <tbody>
                                <SyntaxRow name={t('cheatsheetLink')} syntax="[Title](url)" />
                                <SyntaxRow name={t('cheatsheetImage')} syntax="![Alt](url)" />
                             </tbody>
                         </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};


const MarkdownInput: React.FC<MarkdownInputProps> = ({ markdownText, onMarkdownChange, language }) => {
    const t = useTranslations(language);
    const [isCheatsheetVisible, setIsCheatsheetVisible] = useState(false);

    const wordCount = useMemo(() => {
        if (!markdownText) return 0;
        // Trim whitespace, split by any whitespace characters, and filter out empty strings
        const words = markdownText.trim().split(/\s+/).filter(Boolean);
        return words.length;
    }, [markdownText]);
    
    return (
        <div className="p-4 relative">
            <button
                onClick={() => setIsCheatsheetVisible(!isCheatsheetVisible)}
                aria-expanded={isCheatsheetVisible}
                className="absolute top-6 right-6 z-10 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                aria-label={t('cheatsheet')}
            >
                <BookOpenIcon className="h-4 w-4" />
                <span>{t('cheatsheet')}</span>
            </button>
            
            <AnimatePresence>
                {isCheatsheetVisible && <MarkdownCheatsheet t={t} />}
            </AnimatePresence>

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