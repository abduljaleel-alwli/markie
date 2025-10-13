import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, Language } from '../hooks/useTranslations';
import { SpinnerIcon, MagicSparklesIcon, CodeBracketIcon, BoltIcon } from './icons';

interface ActionButtonsProps {
    onConvert: () => void;
    onGenerateSeo: () => void;
    onGenerateAll: () => void;
    isConverting: boolean;
    isGeneratingSeo: boolean;
    isApiKeySet: boolean;
    language: Language;
}

const ActionButton: React.FC<{
    onClick: () => void;
    disabled: boolean;
    isLoading: boolean;
    text: string;
    icon: React.ReactNode;
    className: string;
}> = ({ onClick, disabled, isLoading, text, icon, className }) => (
    <motion.button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white rounded-lg shadow-md hover:shadow-lg disabled:bg-slate-500 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 ${className}`}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
        {isLoading ? <SpinnerIcon className="animate-spin h-5 w-5" /> : icon}
        <span>{text}</span>
    </motion.button>
);


const ActionButtons: React.FC<ActionButtonsProps> = ({
    onConvert,
    onGenerateSeo,
    onGenerateAll,
    isConverting,
    isGeneratingSeo,
    isApiKeySet,
    language,
}) => {
    const t = useTranslations(language);

    const isAnyLoading = isConverting || isGeneratingSeo;
    const isButtonDisabled = isAnyLoading || !isApiKeySet;

    return (
        <div className="bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{t('actions')}</h2>
                <AnimatePresence>
                {!isApiKeySet && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <span className="text-sm text-yellow-600 dark:text-yellow-400 font-semibold">
                            {t('apiKeyRequired')}
                        </span>
                    </motion.div>
                 )}
                </AnimatePresence>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <ActionButton
                    onClick={onGenerateSeo}
                    disabled={isButtonDisabled}
                    isLoading={isGeneratingSeo && !isConverting}
                    text={t('generateSeo')}
                    icon={<MagicSparklesIcon className="h-5 w-5" />}
                    className="bg-blue-600 hover:bg-blue-500 focus:ring-blue-500/50"
                />

                <ActionButton
                    onClick={onConvert}
                    disabled={isButtonDisabled}
                    isLoading={isConverting && !isGeneratingSeo}
                    text={t('convertMarkdown')}
                    icon={<CodeBracketIcon className="h-5 w-5" />}
                    className="bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-500/50"
                />

                <ActionButton
                    onClick={onGenerateAll}
                    disabled={isButtonDisabled}
                    isLoading={isAnyLoading}
                    text={t('generateAll')}
                    icon={<BoltIcon className="h-5 w-5" />}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 focus:ring-cyan-500/50"
                />
            </div>
        </div>
    );
};

export default ActionButtons;
