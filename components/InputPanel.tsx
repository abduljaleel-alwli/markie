import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Metadata } from '../types';
import MetadataForm from './MetadataForm';
import MarkdownInput from './MarkdownInput';
import ActionButtons from './ActionButtons';
import { useTranslations, Language } from '../hooks/useTranslations';
import { DocumentTextIcon, CodeBracketIcon } from './icons';

interface InputPanelProps {
    metadata: Metadata;
    onMetadataChange: (metadata: Metadata) => void;
    markdownText: string;
    onMarkdownChange: (markdown: string) => void;
    onConvert: () => void;
    onGenerateSeo: () => void;
    onGenerateAll: () => void;
    isConverting: boolean;
    isGeneratingSeo: boolean;
    isApiKeySet: boolean;
    error: string | null;
    language: Language;
}

interface TabButtonProps {
    text: string;
    icon: React.ReactNode;
    onClick: () => void;
    isActive: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({ text, icon, onClick, isActive }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 focus:ring-cyan-500 ${
            isActive 
                ? 'bg-cyan-500 text-white' 
                : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-200/60 dark:hover:bg-zinc-800/60'
        }`}
    >
        {icon}
        {text}
    </button>
);


const InputPanel: React.FC<InputPanelProps> = (props) => {
    const t = useTranslations(props.language);
    
    const [activeTabKey, setActiveTabKey] = useState('markdown');
    
    const tabs = [
        { key: 'markdown', name: t('markdown'), icon: <CodeBracketIcon className="h-5 w-5" /> },
        { key: 'metadata', name: t('metadata'), icon: <DocumentTextIcon className="h-5 w-5" /> },
    ];

    return (
        <div className="space-y-8">
            <ActionButtons
                onConvert={props.onConvert}
                onGenerateSeo={props.onGenerateSeo}
                onGenerateAll={props.onGenerateAll}
                isConverting={props.isConverting}
                isGeneratingSeo={props.isGeneratingSeo}
                isApiKeySet={props.isApiKeySet}
                language={props.language}
            />

            <motion.div
                className="bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <div className="border-b border-slate-200 dark:border-zinc-800">
                    <nav className="flex space-x-2 p-2" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <TabButton
                                key={tab.key}
                                text={tab.name}
                                icon={tab.icon}
                                isActive={activeTabKey === tab.key}
                                onClick={() => setActiveTabKey(tab.key)}
                            />
                        ))}
                    </nav>
                </div>
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTabKey}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTabKey === 'markdown' ? (
                            <MarkdownInput 
                                markdownText={props.markdownText} 
                                onMarkdownChange={props.onMarkdownChange}
                                language={props.language}
                            />
                        ) : (
                            <MetadataForm 
                                metadata={props.metadata} 
                                onMetadataChange={props.onMetadataChange}
                                error={props.error}
                                language={props.language}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default InputPanel;