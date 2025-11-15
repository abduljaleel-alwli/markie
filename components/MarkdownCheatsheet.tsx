import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations, Language } from '../hooks/useTranslations';

interface CheatsheetProps {
    language: Language;
}

const syntaxItems = [
    { syntax: '# Heading 1', result: '<h1 class="text-xl font-bold">Heading 1</h1>' },
    { syntax: '## Heading 2', result: '<h2 class="text-lg font-semibold">Heading 2</h2>' },
    { syntax: '**Bold Text**', result: '<strong>Bold Text</strong>' },
    { syntax: '*Italic Text*', result: '<em>Italic Text</em>' },
    { syntax: '[Link Text](url)', result: '<a href="#" class="text-cyan-500 hover:underline">Link Text</a>' },
    { syntax: '* List Item', result: '<ul class="list-disc list-inside"><li>List Item</li></ul>' },
    { syntax: '1. List Item', result: '<ol class="list-decimal list-inside"><li>List Item</li></ol>' },
    { syntax: '> Blockquote', result: '<blockquote class="border-l-4 border-slate-300 dark:border-zinc-600 pl-2 italic">Blockquote</blockquote>' },
    { syntax: '`inline code`', result: '<code class="bg-slate-200 dark:bg-zinc-700 p-1 rounded text-sm">inline code</code>' },
    { syntax: '```\ncode block\n```', result: '<pre class="bg-slate-200 dark:bg-zinc-700 p-2 rounded text-sm"><code>code block</code></pre>' },
];

const MarkdownCheatsheet: React.FC<CheatsheetProps> = ({ language }) => {
    const t = useTranslations(language);

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden mb-4"
        >
            <div className="p-4 bg-slate-100/50 dark:bg-zinc-800/60 rounded-lg border border-slate-200 dark:border-zinc-700">
                <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-3">{t('markdownSyntaxGuide')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs font-mono">
                    {syntaxItems.map((item, index) => (
                        <div key={index} className="flex items-center">
                            <span className="text-slate-500 dark:text-zinc-400 w-28 flex-shrink-0">{item.syntax}</span>
                            <span className="text-slate-400 dark:text-zinc-500 mx-2">-&gt;</span>
                            <span className="text-slate-700 dark:text-zinc-300" dangerouslySetInnerHTML={{ __html: item.result }} />
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default MarkdownCheatsheet;
