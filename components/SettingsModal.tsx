import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, Language } from '../hooks/useTranslations';
import { KeyIcon, CheckIcon, EyeIcon, EyeSlashIcon, SpinnerIcon } from './icons';
import { validateApiKey } from '../services/geminiService';

interface SettingsModalProps {
    apiKey: string | null;
    onSave: (key: string) => void;
    onClear: () => void;
    onClose: () => void;
    language: Language;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ apiKey, onSave, onClear, onClose, language }) => {
    const [newKey, setNewKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const t = useTranslations(language);

    useEffect(() => {
        if (apiKey) {
            setNewKey(apiKey);
        }
    }, [apiKey]);
    
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedKey = newKey.trim();
        if (!trimmedKey || isVerifying || saved) return;

        if (trimmedKey === apiKey) {
            onClose();
            return;
        }

        setIsVerifying(true);
        setValidationError(null);
        
        const isValid = await validateApiKey(trimmedKey);

        setIsVerifying(false);

        if (isValid) {
            onSave(trimmedKey);
            setSaved(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } else {
            setValidationError(t('invalidApiKey'));
        }
    };

    const handleClear = () => {
        onClear();
        onClose();
    };

    const maskKey = (key: string | null) => {
        if (!key) return '******************';
        return key.slice(0, 4) + '******************' + key.slice(-4);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800"
            >
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 mb-6">{t('geminiApiKey')}</h2>
                    
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">
                                {t('geminiApiKey')}
                            </label>
                            <div className="relative">
                                <KeyIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-zinc-500" />
                                <input
                                    type={showKey ? 'text' : 'password'}
                                    id="apiKey"
                                    value={showKey ? newKey : maskKey(newKey)}
                                    onChange={(e) => {
                                        setNewKey(e.target.value);
                                        if (validationError) setValidationError(null);
                                        if (saved) setSaved(false);
                                    }}
                                    className="w-full bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg py-3 pr-12 pl-11 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    required
                                />
                                <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200">
                                    {showKey ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {validationError && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="!mt-2 text-sm text-red-600 dark:text-red-400"
                                >
                                    {validationError}
                                </motion.p>
                            )}
                        </AnimatePresence>
                        
                        <div className="flex flex-col sm:flex-row-reverse gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={isVerifying || saved || !newKey.trim() || newKey.trim() === apiKey}
                                className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white rounded-lg shadow-md bg-cyan-600 hover:bg-cyan-500 disabled:bg-green-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-4 focus:ring-cyan-500/50 flex items-center justify-center"
                            >
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={saved ? 'saved' : isVerifying ? 'verifying' : 'update'}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center gap-2"
                                    >
                                       {saved ? <><CheckIcon className="h-5 w-5" /> {t('apiKeySaved')}</> : 
                                        isVerifying ? <><SpinnerIcon className="animate-spin h-5 w-5" /> {t('verifying')}</> :
                                        t('updateKey')}
                                    </motion.span>
                                </AnimatePresence>
                            </button>
                            <button
                                type="button"
                                onClick={handleClear}
                                className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/60 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                            >
                                {t('clearKey')}
                            </button>
                             <button
                                type="button"
                                onClick={onClose}
                                className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 sm:mr-auto"
                            >
                                {t('close')}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SettingsModal;