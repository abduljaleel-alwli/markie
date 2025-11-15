

import React, { useState, useEffect, useCallback, useMemo } from 'react';
// FIX: Import `Transition` type from framer-motion to resolve type error.
import { motion, AnimatePresence, Variants, Transition } from 'framer-motion';
import { INITIAL_MARKDOWN, INITIAL_METADATA } from './constants';
import { 
    generateSeoMetadata, 
    convertMarkdownToSemanticHtml, 
    generateText, 
    generateArticleStream, 
    generateArticleOutline, 
    generateImage 
} from './services/geminiService';
import { embedLogoOnImage } from './services/imageService';
import { generateFullHtml } from './services/htmlGenerator';
import type { Metadata, Theme, ArticleGeneratorState, ArticleOutline, ResultTab, Page } from './types';
import InputPanel from './components/InputPanel';
import OutputTabs from './components/OutputTabs';
import ApiKeyModal from './components/ApiKeyModal';
import SettingsModal from './components/SettingsModal';
import ArticleGenerator from './components/ArticleGenerator';
import { NewLogoIcon, MoonIcon, SunIcon, LogoOutlineIcon } from './components/icons';
import { useTranslations, Language } from './hooks/useTranslations';
import { useToast } from './hooks/useToast';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

const ARTICLE_GENERATOR_STORAGE_KEY = 'article-generator-settings';

const initialArticleGeneratorState: ArticleGeneratorState = {
    currentStep: 1,
    highestStep: 1,
    activeResultTab: null,
    title: '',
    keywords: '',
    articleLanguage: 'arabic',
    tone: '',
    contentType: '',
    targetAudience: '',
    writingStyle: '',
    wordCount: '600',
    numberOfSections: '3-5',
    introductionStyle: 'Engaging Hook',
    conclusionStyle: 'Concise Summary',
    includeFaq: false,
    includeTable: false,
    includeQuote: false,
    isGeneratingKeywords: false,
    isGeneratingArticle: false,
    generatedArticle: '',
    useGoogleSearch: false,
    sources: [],
    generatedImage: null,
    imageHistory: [],
    isGeneratingImage: false,
    imageModel: 'gemini-2.5-flash-image',
    imageStyle: 'photorealistic',
    imageAspectRatio: '16:9',
    includeTitleInImage: true,
    imageTextLanguage: 'arabic',
    customImageText: '',
    embedLogo: false,
    logoImage: null,
    logoPlacement: 'bottom-right',
    outline: null,
    isGeneratingOutline: false,
    primaryFocus: '',
};

// Moved outside the component to prevent re-creation on every render
const pageVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
};

// FIX: Explicitly type `pageTransition` with the imported `Transition` type to fix type error.
const pageTransition: Transition = { duration: 0.25, ease: 'easeInOut' };

// Moved outside the component to prevent re-creation on every render
interface NavButtonProps {
    page: Page;
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    children: React.ReactNode;
}

const NavButton: React.FC<NavButtonProps> = ({ page, currentPage, setCurrentPage, children }) => (
    <button
        onClick={() => setCurrentPage(page)}
        className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
            currentPage === page
                ? 'bg-cyan-500 text-white'
                : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
        }`}
    >
        {children}
    </button>
);

function App() {
    // Converter State
    const [markdownText, setMarkdownText] = useState<string>(INITIAL_MARKDOWN);
    const [htmlBody, setHtmlBody] = useState<string>('');
    const [fullHtml, setFullHtml] = useState<string>('');
    const [isConverting, setIsConverting] = useState<boolean>(false);
    const [isGeneratingSeo, setIsGeneratingSeo] = useState<boolean>(false);
    const [metadata, setMetadata] = useState<Metadata>(INITIAL_METADATA);

    // Article Generator State
    const [generatorState, setGeneratorState] = useState<ArticleGeneratorState>(() => {
        try {
            const savedSettings = localStorage.getItem(ARTICLE_GENERATOR_STORAGE_KEY);
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                // Merge saved settings with defaults, then reset transient properties
                return {
                    ...initialArticleGeneratorState,
                    ...parsedSettings,
                    // Reset transient state to avoid issues on page load
                    title: '', // Do not persist title
                    keywords: '', // Do not persist keywords
                    currentStep: 1,
                    highestStep: 1,
                    activeResultTab: null,
                    isGeneratingKeywords: false,
                    isGeneratingArticle: false,
                    generatedArticle: '',
                    sources: [],
                    generatedImage: null,
                    imageHistory: [],
                    isGeneratingImage: false,
                    outline: null,
                    isGeneratingOutline: false,
                };
            }
        } catch (error) {
            console.error("Failed to load or parse article generator settings from localStorage", error);
        }
        return initialArticleGeneratorState;
    });
    
    // Global State
    const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('gemini-api-key'));
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState<Page>('generator');
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

    const t = useTranslations(language);
    const { addToast } = useToast();
    const isApiKeySet = !!apiKey;

    // Converter Logic
    const convertMarkdownBasic = useCallback(async (markdown: string) => {
        const result = await remark().use(remarkGfm).use(html).process(markdown);
        setHtmlBody(result.toString());
    }, []);

    useEffect(() => {
        convertMarkdownBasic(markdownText);
    }, [markdownText, convertMarkdownBasic]);

    useEffect(() => {
        const newFullHtml = generateFullHtml(metadata, htmlBody, theme);
        setFullHtml(newFullHtml);
    }, [metadata, htmlBody, theme]);
    
    // Global Effects
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

    // Persist generator settings to localStorage
    useEffect(() => {
        try {
            const {
                // Exclude title and keywords from saving
                articleLanguage, tone, contentType,
                targetAudience, writingStyle, wordCount, numberOfSections,
                introductionStyle, conclusionStyle, includeFaq, includeTable,
                includeQuote, useGoogleSearch, imageModel, imageStyle,
                imageAspectRatio, includeTitleInImage, imageTextLanguage,
                customImageText, embedLogo, logoImage, logoPlacement, primaryFocus, // Include logoImage
            } = generatorState;

            const settingsToSave = {
                articleLanguage, tone, contentType,
                targetAudience, writingStyle, wordCount, numberOfSections,
                introductionStyle, conclusionStyle, includeFaq, includeTable,
                includeQuote, useGoogleSearch, imageModel, imageStyle,
                imageAspectRatio, includeTitleInImage, imageTextLanguage,
                customImageText, embedLogo, logoImage, logoPlacement, primaryFocus,
            };

            localStorage.setItem(ARTICLE_GENERATOR_STORAGE_KEY, JSON.stringify(settingsToSave));
        } catch (error) {
            console.error("Failed to save article generator settings to localStorage", error);
        }
    }, [generatorState]);
    
    // API Key Handlers
    const handleSaveApiKey = (key: string) => {
        if (key) {
            localStorage.setItem('gemini-api-key', key);
            setApiKey(key);
            addToast(t('apiKeySaved'), 'success');
        }
    };

    const handleClearApiKey = () => {
        localStorage.removeItem('gemini-api-key');
        setApiKey(null);
        addToast(t('apiKeyCleared'), 'info');
    };

    // Converter Handlers
    const handleGenerateSeo = useCallback(async () => {
        if (!isApiKeySet || !apiKey) return;
        setIsGeneratingSeo(true);
        addToast(t('generating'), 'info');
        try {
            const suggestions = await generateSeoMetadata(markdownText, apiKey);
            setMetadata(prev => ({ ...prev, ...suggestions }));
            addToast(t('generateSeoSuccess'), 'success');
        } catch (e) {
            addToast(e instanceof Error ? e.message : String(e), 'error');
        } finally {
            setIsGeneratingSeo(false);
        }
    }, [markdownText, isApiKeySet, apiKey, addToast, t]);

    const handleConvertMarkdown = useCallback(async () => {
        if (!isApiKeySet || !apiKey) return;
        setIsConverting(true);
        addToast(t('smartConversion'), 'info');
        try {
            const semanticHtml = await convertMarkdownToSemanticHtml(markdownText, apiKey);
            setHtmlBody(semanticHtml);
            addToast(t('convertMarkdownSuccess'), 'success');
        } catch (e) {
            addToast(e instanceof Error ? e.message : String(e), 'error');
            convertMarkdownBasic(markdownText);
        } finally {
            setIsConverting(false);
        }
    }, [markdownText, isApiKeySet, apiKey, convertMarkdownBasic, addToast, t]);

    const handleGenerateAll = useCallback(async () => {
        if (!isApiKeySet || !apiKey) return;
        setIsConverting(true);
        setIsGeneratingSeo(true);
        addToast(t('generating'), 'info');
        try {
            const [suggestions, semanticHtml] = await Promise.all([
                generateSeoMetadata(markdownText, apiKey),
                convertMarkdownToSemanticHtml(markdownText, apiKey)
            ]);
            setMetadata(prev => ({ ...prev, ...suggestions }));
            setHtmlBody(semanticHtml);
            addToast(t('generateAllSuccess'), 'success');
        } catch (e) {
            addToast(e instanceof Error ? e.message : String(e), 'error');
            convertMarkdownBasic(markdownText);
        } finally {
            setIsConverting(false);
            setIsGeneratingSeo(false);
        }
    }, [markdownText, isApiKeySet, apiKey, convertMarkdownBasic, addToast, t]);

    // Article Generator Handlers
    const buildOutlinePrompt = useCallback(() => {
        const { title, articleLanguage, tone, targetAudience, wordCount, keywords, numberOfSections, introductionStyle, conclusionStyle, includeFaq, includeTable, includeQuote, primaryFocus } = generatorState;
        const capitalizedLanguage = articleLanguage.charAt(0).toUpperCase() + articleLanguage.slice(1);
        return `You are an expert SEO content strategist. Your task is to create a structured JSON outline for a high-ranking blog article. The outline should be logical, comprehensive, and optimized for search engines and user engagement.

        **Article Title (This is fixed and MUST NOT be changed):** "${title}"
        **Core Parameters:**
        - Tone: ${tone || 'professional'}
        - Target Audience: ${targetAudience || 'general public'}
        - Desired Word Count: Approximately ${wordCount || 600} words
        - Language: ${capitalizedLanguage}
        - Primary Keywords to target: ${keywords || 'N/A'}
        ${primaryFocus ? `- **Primary Focus/Detailed Instructions:** ${primaryFocus}` : ''}

        **Structural & Stylistic Requirements:**
        - Create between ${numberOfSections.split('-')[0]} and ${numberOfSections.split('-')[1]} main section headings (H2s).
        - The introduction style should be: "${introductionStyle}".
        - The conclusion style should be: "${conclusionStyle}".

        **Optional Content (include in JSON only if enabled and relevant):**
        - Include FAQ Section: ${includeFaq ? `Yes, generate a relevant FAQ section with a title and 3-4 questions.` : 'No'}
        - Include Data Table: ${includeTable ? `Yes, if the topic is suitable, create a relevant data table.` : 'No'}
        - Include a Quote: ${includeQuote ? 'Yes, find one relevant and impactful quote.' : 'No'}

        Generate ONLY the JSON object based on the provided schema. Do not create a new title.`;
    }, [generatorState]);

    const buildFullArticlePromptFromOutline = useCallback((outlineToUse: ArticleOutline) => {
        const { wordCount, tone, targetAudience, writingStyle, articleLanguage, keywords, title, primaryFocus } = generatorState;
        const capitalizedLanguage = articleLanguage.charAt(0).toUpperCase() + articleLanguage.slice(1);
        
        const instructions = [
            `**Follow the Outline:** Adhere strictly to the provided JSON outline. The final word count should be approximately ${wordCount || 600} words.`,
            `**Tone and Style:** Adopt a ${tone || 'professional'} tone suitable for a ${targetAudience || 'general public'} audience. The writing style must be ${writingStyle || 'clear and engaging'}.`,
            `**Language:** The entire article MUST be written in ${capitalizedLanguage}.`,
            `**SEO:** Seamlessly and naturally integrate the primary keywords (${keywords || 'N/A'}) throughout the article.`,
        ];
    
        if (primaryFocus) {
            instructions.push(`**Primary Focus:** Make sure to address the following points or focus: ${primaryFocus}`);
        }
    
        instructions.push(`**Output Format (MANDATORY):** The entire output MUST be a single, valid Markdown document. The article MUST begin with the main title, "${title}", as a Level 1 Heading (H1).`);
        instructions.push(`**Final Output:** Do NOT include the JSON outline or any meta-commentary. Output only the final, complete Markdown article.`);
    
        const numberedInstructions = instructions.map((inst, index) => `${index + 1}.  ${inst}`).join('\n');

        return `You are an expert SEO content writer. Your mission is to write a comprehensive, engaging, and highly-optimized article in Markdown format, based on the provided JSON outline.

        **Instructions:**
        ${numberedInstructions}

        **JSON OUTLINE TO EXPAND:**
        ---
        ${JSON.stringify(outlineToUse, null, 2)}
        ---`;
    }, [generatorState]);

    const handleGenerateKeywords = useCallback(async () => {
        if (!apiKey) return;
        if (!generatorState.title.trim()) { 
            addToast(t('pleaseEnterTitleFirst'), 'error'); 
            return; 
        }
        setGeneratorState(p => ({ ...p, isGeneratingKeywords: true }));
        addToast(t('generatingKeywords'), 'info');
        try {
            const prompt = `Generate a list of 5 to 10 SEO keywords related to the title: "${generatorState.title}". The keywords should be in the same language as the title. Output as a comma-separated list.`;
            const result = await generateText(prompt, apiKey);
            setGeneratorState(p => ({ ...p, keywords: result.replace(/^\d+\.\s*/gm, '').replace(/\n/g, ', ') }));
            addToast(t('keywordsGenerated'), 'success');
        } catch (e) {
            addToast(e instanceof Error ? e.message : t('keywordsFailed'), 'error');
        } finally {
            setGeneratorState(p => ({ ...p, isGeneratingKeywords: false }));
        }
    }, [apiKey, generatorState.title, t, addToast]);

    const handleGenerateOutline = useCallback(async () => {
        if (!apiKey) return;
        if (!generatorState.title.trim()) { 
            addToast(t('pleaseEnterTitleFirst'), 'error'); 
            return; 
        }
        setGeneratorState(p => ({ ...p, isGeneratingOutline: true, outline: null }));
        addToast(t('generatingOutline'), 'info');
        try {
            const prompt = buildOutlinePrompt();
            const result = await generateArticleOutline(prompt, apiKey);
            setGeneratorState(p => ({
                ...p,
                outline: result,
                currentStep: 2,
                highestStep: Math.max(p.highestStep, 2),
                activeResultTab: 'outline'
            }));
            addToast(t('outlineGenerated'), 'success');
        } catch (e) {
            addToast(e instanceof Error ? e.message : 'Failed to generate outline', 'error');
        } finally {
            setGeneratorState(p => ({ ...p, isGeneratingOutline: false }));
        }
    }, [apiKey, generatorState.title, buildOutlinePrompt, t, addToast]);

    const handleGenerateArticle = useCallback(async () => {
        if (!apiKey || !generatorState.outline) return;
        setGeneratorState(p => ({ ...p, isGeneratingArticle: true, generatedArticle: '', sources: [] }));
        addToast(t('streaming'), 'info');

        let intervalId: number | undefined;
        try {
            const prompt = buildFullArticlePromptFromOutline(generatorState.outline);
            const stream = await generateArticleStream(prompt, apiKey, generatorState.useGoogleSearch);
            let finalResponse: any = null;
            let fullArticle = '';
            let buffer = '';

            intervalId = window.setInterval(() => {
                if (buffer) {
                    fullArticle += buffer;
                    setGeneratorState(p => ({ ...p, generatedArticle: fullArticle }));
                    buffer = '';
                }
            }, 100);

            for await (const chunk of stream) {
                if (chunk.text) buffer += chunk.text;
                finalResponse = chunk;
            }

            clearInterval(intervalId);
            if (buffer) {
                fullArticle += buffer;
                setGeneratorState(p => ({ ...p, generatedArticle: fullArticle }));
            }

            setGeneratorState(p => ({
                ...p,
                sources: finalResponse?.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
                currentStep: 3,
                highestStep: Math.max(p.highestStep, 3),
                activeResultTab: 'article'
            }));
            addToast(t('articleGenerated'), 'success');
        } catch (e) {
            if (intervalId) clearInterval(intervalId);
            addToast(e instanceof Error ? e.message : String(e), 'error');
            setGeneratorState(p => ({ ...p, isGeneratingArticle: false }));
        } finally {
            if (intervalId) clearInterval(intervalId);
            setGeneratorState(p => ({ ...p, isGeneratingArticle: false }));
        }
    }, [apiKey, generatorState.outline, generatorState.useGoogleSearch, buildFullArticlePromptFromOutline, t, addToast]);
    
    const handleGenerateImage = useCallback(async () => {
        if (!apiKey) return;
        if (!generatorState.title.trim()) {
            addToast(t('pleaseEnterTitleFirst'), 'error');
            return;
        }
        setGeneratorState(p => ({ ...p, isGeneratingImage: true, generatedImage: null }));
        addToast(t('generatingImage'), 'info');
        try {
            const base64Data = await generateImage(
                generatorState.title, 
                apiKey,
                generatorState.imageModel,
                generatorState.imageStyle,
                generatorState.imageAspectRatio,
                generatorState.includeTitleInImage,
                generatorState.imageTextLanguage,
                generatorState.customImageText
            );
            
            let finalImage = `data:image/jpeg;base64,${base64Data}`;
            
            if (generatorState.embedLogo && generatorState.logoImage) {
                addToast(t('embeddingLogo'), 'info');
                finalImage = await embedLogoOnImage(finalImage, generatorState.logoImage, generatorState.logoPlacement);
            }

            setGeneratorState(p => ({
                ...p,
                generatedImage: finalImage,
                imageHistory: [finalImage, ...p.imageHistory].slice(0, 10),
                currentStep: 4,
                highestStep: Math.max(p.highestStep, 4),
                activeResultTab: 'image'
            }));
            addToast(t('imageGeneratedSuccessfully'), 'success');
        } catch (e) {
            addToast(e instanceof Error ? e.message : t('imageGenerationFailed'), 'error');
        } finally {
            setGeneratorState(p => ({ ...p, isGeneratingImage: false }));
        }
    }, [apiKey, generatorState, t, addToast]);
    
    const handleDownload = useCallback(() => {
        if (!generatorState.generatedArticle) { 
            addToast(t('noArticleToDownload'), 'error'); 
            return; 
        }
        const blob = new Blob([generatorState.generatedArticle], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const filename = `${generatorState.title.trim().replace(/\s+/g, '_') || 'article'}.md`;
        link.href = url; link.download = filename;
        document.body.appendChild(link); link.click();
        document.body.removeChild(link); URL.revokeObjectURL(url);
        addToast(t('articleDownloaded'), 'success');
    }, [generatorState.generatedArticle, generatorState.title, t, addToast]);
    
    const handleDownloadImage = useCallback(() => {
        if (!generatorState.generatedImage) return;
        const link = document.createElement('a');
        const filename = `${generatorState.title.trim().replace(/\s+/g, '_') || 'featured_image'}.jpeg`;
        link.href = generatorState.generatedImage; link.download = filename;
        document.body.appendChild(link); link.click();
        document.body.removeChild(link);
        addToast(t('downloadImage') + ' started.', 'success');
    }, [generatorState.generatedImage, generatorState.title, addToast, t]);

    const handleStepClick = useCallback((stepToGo: number) => {
        setGeneratorState(p => {
            if (stepToGo <= p.highestStep) {
                const stepToTabMap: { [key: number]: ResultTab } = { 2: 'outline', 3: 'article', 4: 'image' };
                return { ...p, currentStep: stepToGo, activeResultTab: stepToGo >= 2 ? stepToTabMap[stepToGo] : p.activeResultTab };
            }
            return p;
        });
    }, []);

    const handleTabClick = useCallback((tab: ResultTab) => {
        setGeneratorState(p => {
            const tabToStepMap: { [key in ResultTab]: number } = { 'outline': 2, 'article': 3, 'image': 4 };
            return { ...p, activeResultTab: tab, currentStep: tabToStepMap[tab] };
        });
    }, []);
    
    const generatorHandlers = useMemo(() => ({
        handleGenerateKeywords,
        handleGenerateOutline,
        handleGenerateArticle,
        handleGenerateImage,
        handleDownload,
        handleDownloadImage,
        handleStepClick,
        handleTabClick,
    }), [handleGenerateKeywords, handleGenerateOutline, handleGenerateArticle, handleGenerateImage, handleDownload, handleDownloadImage, handleStepClick, handleTabClick]);
    
    // Global UI Handlers
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
                        
                        <div className="flex-grow flex items-center justify-center">
                            <div className="bg-slate-200/60 dark:bg-zinc-800/60 p-1 rounded-xl flex items-center gap-1">
                                <NavButton page="converter" currentPage={currentPage} setCurrentPage={setCurrentPage}>{t('converter')}</NavButton>
                                <NavButton page="generator" currentPage={currentPage} setCurrentPage={setCurrentPage}>{t('articleGenerator')}</NavButton>
                            </div>
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
                 <AnimatePresence mode="wait">
                    {currentPage === 'converter' ? (
                        <motion.div
                            key="converter"
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={pageVariants}
                            transition={pageTransition}
                        >
                            <div
                               className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
                            >
                               <div className="lg:sticky lg:top-28 space-y-8">
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
                                        language={language}
                                    />
                                </div>
                                
                                <div>
                                    <OutputTabs 
                                        fullHtml={fullHtml} 
                                        htmlBody={htmlBody} 
                                        metadata={metadata} 
                                        language={language}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="generator"
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={pageVariants}
                            transition={pageTransition}
                        >
                           <div>
                               <ArticleGenerator 
                                    apiKey={apiKey} 
                                    language={language} 
                                    theme={theme}
                                    state={generatorState}
                                    setState={setGeneratorState}
                                    handlers={generatorHandlers}
                                />
                           </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
            
            <footer className="py-6 border-t border-slate-200 dark:border-zinc-800">
                <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:p-8 text-center text-sm text-slate-500 dark:text-zinc-500">
                    <p>&copy; {new Date().getFullYear()} <a href="https://shamlltech.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">Shamll Tech</a>. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default App;