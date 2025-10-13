import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, Language } from '../hooks/useTranslations';
import { KeyIcon, NewLogoIcon, SpinnerIcon, MoonIcon, SunIcon } from './icons';
import { validateApiKey } from '../services/geminiService';
import type { Theme } from '../types';

interface ApiKeyModalProps {
    onSave: (key: string) => void;
    language: Language;
    theme: Theme;
    toggleTheme: () => void;
    toggleLanguage: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, language, theme, toggleTheme, toggleLanguage }) => {
    const [key, setKey] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const t = useTranslations(language);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (key.trim() && !isVerifying) {
            setIsVerifying(true);
            setValidationError(null);
            const isValid = await validateApiKey(key.trim());
            if (isValid) {
                onSave(key.trim());
            } else {
                setValidationError(t('invalidApiKey'));
                setIsVerifying(false);
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                    onClick={toggleLanguage}
                    className="px-3 py-2 text-sm font-semibold border rounded-lg hover:bg-slate-100/20 dark:hover:bg-zinc-800/50 border-slate-300/30 dark:border-zinc-700/50 text-white transition-colors"
                >
                    {language === 'en' ? 'عربي' : 'English'}
                </button>
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg hover:bg-slate-100/20 dark:hover:bg-zinc-800/50 text-white transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
                </button>
            </div>
            
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden"
            >
                <div className="p-8 text-center">
                    <NewLogoIcon className="h-16 w-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 mb-2">{t('geminiApiKey')}</h2>
                    <p className="text-slate-600 dark:text-zinc-400 mb-6">{t('enterApiKey')}</p>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="relative">
                             <KeyIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-zinc-500" />
                             <input
                                type="password"
                                value={key}
                                onChange={(e) => {
                                    setKey(e.target.value);
                                    if (validationError) setValidationError(null);
                                }}
                                placeholder="Enter your Google Gemini API Key"
                                className="w-full bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg shadow-sm py-3 pr-4 pl-11 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                                required
                            />
                        </div>

                        <AnimatePresence>
                            {validationError && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mt-4 text-sm text-red-600 dark:text-red-400"
                                >
                                    {validationError}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={isVerifying || !key.trim()}
                            className="w-full mt-6 px-5 py-3 text-sm font-semibold text-white rounded-lg shadow-md bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-500 dark:disabled:bg-zinc-700 disabled:cursor-wait transition-colors focus:outline-none focus:ring-4 focus:ring-cyan-500/50 flex items-center justify-center"
                        >
                            {isVerifying ? (
                                <>
                                    <SpinnerIcon className="animate-spin h-5 w-5" />
                                    <span className="ml-2">{t('verifying')}</span>
                                </>
                            ) : (
                                t('save')
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-xs text-slate-500 dark:text-zinc-500">
                        <p>{t('getApiKeyInstructions')}</p>
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="font-semibold text-cyan-600 dark:text-cyan-400 hover:underline mt-1 inline-block">
                            {t('getApiKeyLinkText')}
                        </a>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ApiKeyModal;