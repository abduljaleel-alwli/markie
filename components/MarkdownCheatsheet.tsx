import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, Language } from '../hooks/useTranslations';
import { InformationCircleIcon, ChevronDownIcon } from './icons';

interface MarkdownCheatsheetProps {
    language: Language;
}

const MarkdownCheatsheet: React.FC<MarkdownCheatsheetProps> = ({ language }) => {
    const t = useTranslations(language);
    const [isOpen, setIsOpen] = useState(false);

    const cheatsheetItems = [
        { syntax: t('heading1'), example: '# Heading 1' },
        { syntax: t('heading2'), example: '## Heading 2' },
        { syntax: t('boldText'), example: '**Bold Text**' },
        { syntax: t('italicText'), example: '*Italic Text*' },
        { syntax: t('blockquote'), example: '> Blockquote' },
        { syntax: t('unorderedList'), example: '- Item 1\n- Item 2' },
        { syntax: t('orderedList'), example: '1. First Item\n2. Second Item' },
        { syntax: t('inlineCode'), example: '`inline code`' },
        { syntax: t('codeBlock'), example: '```\ncode block\n```' },
        { syntax: t('link'), example: '[Title](https://www.example.com)' },
        { syntax: t('image'), example: '![Alt Text](image.jpg)' },
    ];

    return (
        <div className="absolute top-6 right-6 z-10">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400 bg-slate-200/50 dark:bg-zinc-900/50 px-2.5 py-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-700/80 transition-colors"
                aria-expanded={isOpen}
            >
                <InformationCircleIcon className="h-4 w-4" />
                <span>{t('markdownCheatsheet')}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDownIcon className="h-4 w-4" />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-slate-200 dark:border-zinc-700 p-4"
                    >
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-zinc-700">
                                    <th className="py-2 font-semibold text-slate-600 dark:text-zinc-300">{t('syntax')}</th>
                                    <th className="py-2 font-semibold text-slate-600 dark:text-zinc-300">{t('example')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cheatsheetItems.map(item => (
                                    <tr key={item.syntax} className="border-b border-slate-100 dark:border-zinc-700/50 last:border-b-0">
                                        <td className="py-2 text-slate-700 dark:text-zinc-200">{item.syntax}</td>
                                        <td className="py-2 font-mono text-cyan-600 dark:text-cyan-400 whitespace-pre-wrap">{item.example}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MarkdownCheatsheet;