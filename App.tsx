import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_MARKDOWN, INITIAL_METADATA } from './constants';
import { generateSeoMetadata, convertMarkdownToSemanticHtml } from './services/geminiService';
import { generateFullHtml } from './services/htmlGenerator';
import type { Metadata, Theme } from './types';
import InputPanel from './components/InputPanel';
import OutputTabs from './components/OutputTabs';
import ApiKeyModal from './components/ApiKeyModal';
import SettingsModal from './components/SettingsModal';
import { NewLogoIcon, MoonIcon, SunIcon, LogoOutlineIcon } from './components/icons';
import { useTranslations, Language } from './hooks/useTranslations';
import { remark } from 'remark';
import html from 'remark-html';

function App() {
    const [markdownText, setMarkdownText] = useState<string>(INITIAL_MARKDOWN);
    const [htmlBody, setHtmlBody] = useState<string>('');
    const [fullHtml, setFullHtml] = useState<string>('');
    const [isConverting, setIsConverting] = useState<boolean>(false);
    const [isGeneratingSeo, setIsGeneratingSeo] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('gemini-api-key'));
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme) return savedTheme;
        return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark';
    });
    
    const [language, setLanguage] = useState<Language>(() => {
        const savedLang = localStorage.getItem('language') as Language | null;
        if (savedLang) return savedLang;
        return navigator.language.split('-')[0] === 'ar' ? 'ar' : 'en';
    });

    const [metadata, setMetadata] = useState<Metadata>(INITIAL_METADATA);
    const t = useTranslations(language);
    const isApiKeySet = !!apiKey;

    const convertMarkdownBasic = useCallback(async (markdown: string) => {
        const result = await remark().use(html).process(markdown);
        setHtmlBody(result.toString());
    }, []);

    useEffect(() => {
        convertMarkdownBasic(markdownText);
    }, [markdownText, convertMarkdownBasic]);

    useEffect(() => {
        const newFullHtml = generateFullHtml(metadata, htmlBody, theme);
        setFullHtml(newFullHtml);
    }, [metadata, htmlBody, theme]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
        document.documentElement.dir = dir;
        localStorage.setItem('language', language);
        setMetadata(prev => ({ ...prev, lang: language }));
    }, [language]);
    
    const handleSaveApiKey = (key: string) => {
        if (key) {
            localStorage.setItem('gemini-api-key', key);
            setApiKey(key);
        }
    };

    const handleClearApiKey = () => {
        localStorage.removeItem('gemini-api-key');
        setApiKey(null);
    };

    const handleGenerateSeo = useCallback(async () => {
        if (!isApiKeySet || !apiKey) return;
        setError(null);
        setIsGeneratingSeo(true);
        try {
            const suggestions = await generateSeoMetadata(markdownText, apiKey);
            setMetadata(prev => ({ ...prev, ...suggestions }));
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setIsGeneratingSeo(false);
        }
    }, [markdownText, isApiKeySet, apiKey]);

    const handleConvertMarkdown = useCallback(async () => {
        if (!isApiKeySet || !apiKey) return;
        setError(null);
        setIsConverting(true);
        try {
            const semanticHtml = await convertMarkdownToSemanticHtml(markdownText, apiKey);
            setHtmlBody(semanticHtml);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
            convertMarkdownBasic(markdownText);
        } finally {
            setIsConverting(false);
        }
    }, [markdownText, isApiKeySet, apiKey, convertMarkdownBasic]);

    const handleGenerateAll = useCallback(async () => {
        if (!isApiKeySet || !apiKey) return;
        setError(null);
        setIsConverting(true);
        setIsGeneratingSeo(true);
        try {
            const [suggestions, semanticHtml] = await Promise.all([
                generateSeoMetadata(markdownText, apiKey),
                convertMarkdownToSemanticHtml(markdownText, apiKey)
            ]);
            setMetadata(prev => ({ ...prev, ...suggestions }));
            setHtmlBody(semanticHtml);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
            convertMarkdownBasic(markdownText);
        } finally {
            setIsConverting(false);
            setIsGeneratingSeo(false);
        }
    }, [markdownText, isApiKeySet, apiKey, convertMarkdownBasic]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'ar' : 'en');

    return (
        <div className="bg-slate-50 dark:bg-zinc-950 min-h-screen font-sans transition-colors duration-300 flex flex-col">
            {!isApiKeySet && <ApiKeyModal 
                onSave={handleSaveApiKey} 
                language={language}
                theme={theme}
                toggleTheme={toggleTheme}
                toggleLanguage={toggleLanguage}
            />}
            {isSettingsOpen && <SettingsModal apiKey={apiKey} onSave={handleSaveApiKey} onClear={handleClearApiKey} onClose={() => setIsSettingsOpen(false)} language={language} />}
            
            <header className="sticky top-0 z-20 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm border-b border-slate-200 dark:border-zinc-800">
                <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-3">
                            <NewLogoIcon className="h-9 w-9" />
                            <h1 className="text-xl font-bold text-slate-800 dark:text-zinc-200 hidden sm:block">
                                {t('appTitle')}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleLanguage}
                                className="px-3 py-2 text-sm font-semibold border rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors"
                            >
                                {language === 'en' ? 'عربي' : 'English'}
                            </button>
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors"
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
                            </button>
                             <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors"
                                aria-label={t('geminiApiKey')}
                            >
                                <LogoOutlineIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[100rem] mx-auto p-4 sm:p-6 lg:p-8 w-full flex-grow">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="lg:sticky lg:top-24 space-y-8">
                       <InputPanel
                            metadata={metadata}
                            onMetadataChange={setMetadata}
                            markdownText={markdownText}
                            onMarkdownChange={setMarkdownText}
                            onConvert={handleConvertMarkdown}
                            onGenerateSeo={handleGenerateSeo}
                            onGenerateAll={handleGenerateAll}
                            isConverting={isConverting}
                            isGeneratingSeo={isGeneratingSeo}
                            isApiKeySet={isApiKeySet}
                            error={error}
                            language={language}
                        />
                    </div>
                    
                    <OutputTabs 
                        fullHtml={fullHtml} 
                        htmlBody={htmlBody} 
                        metadata={metadata} 
                        language={language}
                    />
                </div>
            </main>
            
            <footer className="py-6 border-t border-slate-200 dark:border-zinc-800">
                <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500 dark:text-zinc-500">
                    <p>&copy; {new Date().getFullYear()} <a href="https://shamlltech.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">Shamll Tech</a>. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default App;