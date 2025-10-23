import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, Language } from '../hooks/useTranslations';
import { ClipboardIcon, CheckIcon, DownloadIcon, MagicSparklesIcon, SpinnerIcon, PhotoIcon, ListBulletIcon, DocumentTextIcon, PencilSquareIcon } from './icons';
import {
    LANGUAGE_OPTIONS,
    TONE_OPTIONS,
    CONTENT_TYPE_OPTIONS,
    AUDIENCE_OPTIONS,
    WRITING_STYLE_OPTIONS,
    IMAGE_STYLE_OPTIONS,
    IMAGE_ASPECT_RATIO_OPTIONS,
    LOGO_PLACEMENT_OPTIONS,
} from '../constants';
import type { SelectOption, Theme, ArticleGeneratorState, ResultTab } from '../types';
import { locales } from '../i18n/locales';

interface ArticleGeneratorProps {
    apiKey: string | null;
    language: Language;
    theme: Theme;
    state: ArticleGeneratorState;
    setState: React.Dispatch<React.SetStateAction<ArticleGeneratorState>>;
    handlers: {
        handleGenerateKeywords: () => void;
        handleGenerateOutline: () => void;
        handleGenerateArticle: () => void;
        handleGenerateImage: () => void;
        handleDownload: () => void;
        handleDownloadImage: () => void;
        handleStepClick: (step: number) => void;
        handleTabClick: (tab: ResultTab) => void;
    }
}

// Helper components moved outside ArticleGenerator to prevent re-creation on re-renders
const SidebarCard: React.FC<{children: React.ReactNode, title?: string}> = ({ children, title }) => (
    <div className="bg-white dark:bg-zinc-900/70 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 space-y-5">
        {title && <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-200">{title}</h3>}
        {children}
    </div>
);

const ToggleSwitch: React.FC<{id: string, label: string, checked: boolean, onChange: (checked: boolean) => void}> = ({ id, label, checked, onChange }) => (
    <div className="flex items-center justify-between bg-slate-100 dark:bg-zinc-800/60 p-3 rounded-lg">
        <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-zinc-200 cursor-pointer">{label}</label>
        <button id={id} role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-zinc-900 ${checked ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-zinc-600'}`}>
            <motion.span animate={checked ? { translateX: '1.25rem' } : { translateX: '0.25rem' }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="inline-block h-4 w-4 transform rounded-full bg-white" />
        </button>
    </div>
);


const ArticleGenerator: React.FC<ArticleGeneratorProps> = ({ apiKey, language, theme, state, setState, handlers }) => {
    const t = useTranslations(language);
    const [copied, setCopied] = useState(false);
    const mainContentRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const scrollToMain = useCallback(() => {
        mainContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);
    
    useEffect(() => {
        if (state.outline && state.highestStep === 2 && state.currentStep === 2) {
            scrollToMain();
        }
    }, [state.outline, state.highestStep, state.currentStep, scrollToMain]);

    useEffect(() => {
        if (state.generatedImage && state.highestStep === 4 && state.currentStep === 4) {
            scrollToMain();
        }
    }, [state.generatedImage, state.highestStep, state.currentStep, scrollToMain]);


    const handleCopy = () => {
        if (!state.generatedArticle) { setState(p => ({ ...p, error: t('noArticleToCopy') })); return; }
        navigator.clipboard.writeText(state.generatedArticle).then(() => {
            setCopied(true); setState(p => ({ ...p, status: t('articleCopied') }));
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setState(p => ({ ...p, logoImage: e.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const useSelectOptions = (options: SelectOption[], placeholderKey?: keyof typeof locales.en) => {
        return useMemo(() => {
            const mappedOptions = options.map(opt => ({ value: opt.value, label: language === 'ar' ? opt.label_ar : opt.label_en }));
            if (placeholderKey) mappedOptions.unshift({ value: '', label: t(placeholderKey) });
            return mappedOptions;
        }, [language, options, placeholderKey, t]);
    };
    
    const languageOptions = useSelectOptions(LANGUAGE_OPTIONS);
    const toneOptions = useSelectOptions(TONE_OPTIONS, 'selectTone');
    const contentTypeOptions = useSelectOptions(CONTENT_TYPE_OPTIONS, 'selectContentType');
    const audienceOptions = useSelectOptions(AUDIENCE_OPTIONS, 'selectAudience');
    const writingStyleOptions = useSelectOptions(WRITING_STYLE_OPTIONS, 'selectWritingStyle');
    const imageStyleOptions = useSelectOptions(IMAGE_STYLE_OPTIONS);
    const imageAspectRatioOptions = useSelectOptions(IMAGE_ASPECT_RATIO_OPTIONS);
    const logoPlacementOptions = useSelectOptions(LOGO_PLACEMENT_OPTIONS);


    const renderSelect = (id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: {value: string, label: string}[]) => (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">{label}</label>
            <select id={id} value={value} onChange={onChange} className="w-full bg-slate-100/50 dark:bg-zinc-800/60 border border-slate-300 dark:border-zinc-700 rounded-lg shadow-sm py-2.5 px-4 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition">
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    );
    
    const steps = [
        { name: t('metadata'), icon: <PencilSquareIcon className="h-6 w-6"/>, step: 1 },
        { name: t('articleOutline'), icon: <ListBulletIcon className="h-6 w-6"/>, step: 2 },
        { name: t('article'), icon: <DocumentTextIcon className="h-6 w-6"/>, step: 3 },
        { name: t('featuredImage'), icon: <PhotoIcon className="h-6 w-6"/>, step: 4 },
    ];
    
    const inactiveColor = theme === 'dark' ? '#3f3f46' : '#e2e8f0'; // zinc-700 for dark, slate-200 for light

    const resultTabs = [
        { key: 'outline', name: t('articleOutline'), step: 2, icon: <ListBulletIcon className="h-5 w-5" /> },
        { key: 'article', name: t('article'), step: 3, icon: <DocumentTextIcon className="h-5 w-5" /> },
        { key: 'image', name: t('featuredImage'), step: 4, icon: <PhotoIcon className="h-5 w-5" /> },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start">
            {/* Sidebar */}
            <aside className="lg:col-span-1 xl:col-span-1 lg:sticky lg:top-28 space-y-6 w-full">
                <div className="flex justify-between items-center px-2">
                    {steps.map((s, index) => (
                        <React.Fragment key={s.step}>
                            <button 
                                onClick={() => handlers.handleStepClick(s.step)}
                                disabled={s.step > state.highestStep}
                                className="flex flex-col items-center gap-2 text-center disabled:cursor-not-allowed group transition-transform duration-200 ease-in-out"
                            >
                                <motion.div
                                    animate={s.step <= state.highestStep ? "active" : "inactive"}
                                    variants={{
                                        active: { scale: 1, backgroundColor: state.currentStep === s.step ? '#06b6d4' : '#10b981' },
                                        inactive: { scale: 0.9, backgroundColor: inactiveColor }
                                    }}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${s.step <= state.highestStep ? 'group-hover:scale-110' : ''} ${state.currentStep === s.step ? 'scale-110' : ''} ${s.step <= state.highestStep ? 'text-white' : 'text-slate-500 dark:text-zinc-400'}`}
                                >
                                    {state.highestStep > s.step ? <CheckIcon className="h-6 w-6"/> : s.icon}
                                </motion.div>
                                <span className={`text-xs ${s.step <= state.highestStep ? 'font-semibold text-slate-800 dark:text-zinc-200' : 'text-slate-500 dark:text-zinc-500'}`}>{s.name}</span>
                            </button>
                            {index < steps.length - 1 && <div className="flex-1 h-1 bg-slate-200 dark:bg-zinc-700 mt-[-2rem] mx-2"></div>}
                        </React.Fragment>
                    ))}
                </div>

                <SidebarCard title={t('newArticle')}>
                    <input type="text" value={state.title} onChange={(e) => setState(p => ({...p, title: e.target.value}))} placeholder={t('articleTitlePlaceholder')} className="w-full bg-slate-100/50 dark:bg-zinc-800/60 border border-slate-300 dark:border-zinc-700 rounded-lg shadow-sm py-2.5 px-4 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"/>
                    <div className="flex items-center gap-2">
                        <input type="text" value={state.keywords} onChange={(e) => setState(p => ({...p, keywords: e.target.value}))} placeholder={t('keywordsPlaceholder')} className="flex-grow bg-slate-100/50 dark:bg-zinc-800/60 border border-slate-300 dark:border-zinc-700 rounded-lg shadow-sm py-2.5 px-4 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"/>
                        <button onClick={handlers.handleGenerateKeywords} disabled={state.isGeneratingKeywords || !apiKey} className="flex-shrink-0 p-2.5 text-white rounded-lg shadow-md bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 dark:disabled:bg-zinc-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/50">
                            {state.isGeneratingKeywords ? <SpinnerIcon className="animate-spin h-5 w-5" /> : <MagicSparklesIcon className="h-5 w-5" />}
                        </button>
                    </div>
                    {renderSelect('language', t('selectLanguage'), state.articleLanguage, (e) => setState(p => ({...p, articleLanguage: e.target.value})), languageOptions)}
                     <div>
                        <label htmlFor="wordCount" className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">{t('wordCount')}</label>
                        <input id="wordCount" type="number" value={state.wordCount} onChange={(e) => setState(p => ({...p, wordCount: e.target.value}))} placeholder={t('wordCount')} className="w-full bg-slate-100/50 dark:bg-zinc-800/60 border border-slate-300 dark:border-zinc-700 rounded-lg shadow-sm py-2.5 px-4 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" />
                    </div>
                </SidebarCard>
                
                <SidebarCard>
                     <button onClick={() => setState(p => ({...p, showAdvanced: !p.showAdvanced}))} className="w-full text-left font-semibold text-cyan-600 dark:text-cyan-400 text-sm">
                        {t('advancedOptions')} {state.showAdvanced ? '(-)' : '(+)'}
                    </button>
                    <AnimatePresence>
                    {state.showAdvanced && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-4">
                             <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-200 dark:border-zinc-700">
                                {renderSelect('tone', t('selectTone'), state.tone, (e) => setState(p => ({...p, tone: e.target.value})), toneOptions)}
                                {renderSelect('contentType', t('selectContentType'), state.contentType, (e) => setState(p => ({...p, contentType: e.target.value})), contentTypeOptions)}
                                {renderSelect('targetAudience', t('selectAudience'), state.targetAudience, (e) => setState(p => ({...p, targetAudience: e.target.value})), audienceOptions)}
                                {renderSelect('writingStyle', t('selectWritingStyle'), state.writingStyle, (e) => setState(p => ({...p, writingStyle: e.target.value})), writingStyleOptions)}
                                {renderSelect('numberOfSections', t('numberOfSections'), state.numberOfSections, (e) => setState(p => ({...p, numberOfSections: e.target.value})), [{ value: '3-5', label: t('sections3to5') }, { value: '5-7', label: t('sections5to7') }, { value: '7-9', label: t('sections7to9') },])}
                                {renderSelect('introStyle', t('introStyle'), state.introductionStyle, (e) => setState(p => ({...p, introductionStyle: e.target.value})), [{ value: 'Engaging Hook', label: t('introStyleEngaging') }, { value: 'Direct Statement', label: t('introStyleDirect') }, { value: 'Question-based Hook', label: t('introStyleQuestion') },])}
                                {renderSelect('conclusionStyle', t('conclusionStyle'), state.conclusionStyle, (e) => setState(p => ({...p, conclusionStyle: e.target.value})), [{ value: 'Concise Summary', label: t('conclusionStyleSummary') }, { value: 'Call to Action', label: t('conclusionStyleCta') }, { value: 'Thought-Provoking Question', label: t('conclusionStyleQuestion') },])}
                                <ToggleSwitch id="faq-toggle" label={t('includeFaq')} checked={state.includeFaq} onChange={(c) => setState(p => ({...p, includeFaq: c}))} />
                                <ToggleSwitch id="table-toggle" label={t('includeTable')} checked={state.includeTable} onChange={(c) => setState(p => ({...p, includeTable: c}))} />
                                <ToggleSwitch id="quote-toggle" label={t('includeQuote')} checked={state.includeQuote} onChange={(c) => setState(p => ({...p, includeQuote: c}))} />
                            </div>
                        </motion.div>
                    )}
                    </AnimatePresence>
                    <ToggleSwitch id="google-search-toggle" label={t('useGoogleSearch')} checked={state.useGoogleSearch} onChange={(c) => setState(p => ({...p, useGoogleSearch: c}))} />
                </SidebarCard>
                
                <SidebarCard title={t('imageSettings')}>
                    {renderSelect('imageStyle', t('imageStyle'), state.imageStyle, (e) => setState(p => ({...p, imageStyle: e.target.value})), imageStyleOptions)}
                    {renderSelect('aspectRatio', t('aspectRatio'), state.imageAspectRatio, (e) => setState(p => ({...p, imageAspectRatio: e.target.value})), imageAspectRatioOptions)}
                     <div className="pt-5 border-t border-slate-200 dark:border-zinc-700/60 space-y-5">
                        <ToggleSwitch id="title-in-image-toggle" label={t('includeTitleInImage')} checked={state.includeTitleInImage} onChange={(c) => setState(p => ({...p, includeTitleInImage: c}))} />
                         <div>
                            <label htmlFor="customImageText" className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">{t('customImageText')}</label>
                            <input id="customImageText" type="text" value={state.customImageText} onChange={(e) => setState(p => ({...p, customImageText: e.target.value}))} placeholder={t('customImageTextPlaceholder')} className="w-full bg-slate-100/50 dark:bg-zinc-800/60 border border-slate-300 dark:border-zinc-700 rounded-lg shadow-sm py-2.5 px-4 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" />
                        </div>

                        <AnimatePresence>
                            {(state.includeTitleInImage || state.customImageText.trim() !== '') && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                    {renderSelect('imageTextLanguage', t('imageTextLanguage'), state.imageTextLanguage, (e) => setState(p => ({...p, imageTextLanguage: e.target.value})), languageOptions)}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="pt-5 border-t border-slate-200 dark:border-zinc-700/60 space-y-5">
                        <ToggleSwitch id="embed-logo-toggle" label={t('embedLogo')} checked={state.embedLogo} onChange={(c) => setState(p => ({...p, embedLogo: c}))} />
                         <AnimatePresence>
                            {state.embedLogo && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-4">
                                    <div className="space-y-2">
                                        <input type="file" accept="image/png, image/jpeg" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" />
                                        <button onClick={() => fileInputRef.current?.click()} className="w-full text-sm font-semibold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-700 dark:text-zinc-200 py-2 px-4 rounded-lg transition-colors">{t('uploadLogo')}</button>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400 text-center">{t('logoUploadInstructions')}</p>
                                    </div>
                                    {state.logoImage && (
                                        <div className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-zinc-800/60 rounded-lg">
                                            <img src={state.logoImage} alt="Logo Preview" className="h-12 w-12 object-contain rounded-md bg-white dark:bg-zinc-700 p-1" />
                                            <div className="flex-grow">
                                                {renderSelect('logoPlacement', t('logoPlacement'), state.logoPlacement, (e) => setState(p => ({...p, logoPlacement: e.target.value})), logoPlacementOptions)}
                                            </div>
                                            <button onClick={() => setState(p => ({...p, logoImage: null}))} className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-semibold">{t('removeLogo')}</button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </SidebarCard>

                <button onClick={handlers.handleGenerateOutline} disabled={state.isGeneratingOutline || state.isGeneratingArticle || !apiKey} className="w-full flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold text-white rounded-lg shadow-md bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 dark:disabled:bg-zinc-700 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/50">
                    {state.isGeneratingOutline ? <><SpinnerIcon className="animate-spin h-5 w-5" /><span>{t('generatingOutline')}</span></> : <><ListBulletIcon className="h-5 w-5" /><span>{t('generateOutline')}</span></>}
                </button>
            </aside>

            {/* Main Content */}
            <main ref={mainContentRef} className="lg:col-span-2 xl:col-span-3 w-full space-y-6">
                <AnimatePresence>
                {(state.status || state.error) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-live="polite" className={`p-4 rounded-xl text-sm font-semibold text-center ${state.error ? 'bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200' : 'bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-200'}`}>
                        {state.error || state.status}
                    </motion.div>
                )}
                </AnimatePresence>

                {state.highestStep === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-10 bg-slate-100/50 dark:bg-zinc-800/60 rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-700">
                        <h3 className="text-xl font-semibold text-slate-700 dark:text-zinc-300">{t('aiArticleGenerator')}</h3>
                        <p className="text-slate-500 dark:text-zinc-400 mt-2">{t('articleWillAppearHere')}</p>
                    </motion.div>
                )}
                
                {state.highestStep > 1 && (
                     <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <nav className="flex items-center gap-2 p-2 border-b border-slate-200 dark:border-zinc-800">
                            {resultTabs.map(tab => (
                                <button
                                    key={tab.key}
                                    disabled={state.highestStep < tab.step}
                                    onClick={() => handlers.handleTabClick(tab.key as ResultTab)}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 focus:ring-cyan-500 disabled:text-slate-400 dark:disabled:text-zinc-600 disabled:cursor-not-allowed ${
                                        state.activeResultTab === tab.key
                                            ? 'bg-cyan-500 text-white'
                                            : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-200/60 dark:hover:bg-zinc-800/60'
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                        
                        <div className="p-5">
                            {state.activeResultTab === 'outline' && state.outline && (
                                <div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <p className="text-slate-900 dark:text-zinc-100 font-semibold text-base">{state.title}</p>
                                            <button onClick={handlers.handleGenerateOutline} disabled={state.isGeneratingOutline} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-200 bg-white dark:bg-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-600 rounded-md border border-slate-300 dark:border-zinc-600 transition-colors"> <MagicSparklesIcon className="h-4 w-4" /> {t('regenerateOutline')} </button>
                                        </div>
                                        <div><strong className="text-slate-600 dark:text-zinc-400 font-semibold">{t('introduction')}:</strong><p className="text-slate-700 dark:text-zinc-300 pl-4">{state.outline.introduction_summary}</p></div>
                                        <div><strong className="text-slate-600 dark:text-zinc-400 font-semibold">{t('sections')}:</strong>
                                            <ul className="list-disc list-inside pl-4 space-y-1">
                                                {state.outline.sections.map((sec, i) => (<li key={i} className="text-slate-700 dark:text-zinc-300"><span className="font-semibold">{sec.section_title}:</span> {sec.section_summary}</li>))}
                                            </ul>
                                        </div>
                                        {state.outline.quote && (<div><strong className="text-slate-600 dark:text-zinc-400 font-semibold">{t('quote')}:</strong><blockquote className="text-slate-700 dark:text-zinc-300 pl-4 italic">"{state.outline.quote.quote_text}" - {state.outline.quote.quote_author}</blockquote></div>)}
                                        {state.outline.data_table && (<div><strong className="text-slate-600 dark:text-zinc-400 font-semibold">{t('dataTable')}: {state.outline.data_table.table_title}</strong><p className="text-slate-700 dark:text-zinc-300 pl-4"> (A table with headers: {state.outline.data_table.headers.join(', ')})</p></div>)}
                                        {state.outline.faq_section && (<div><strong className="text-slate-600 dark:text-zinc-400 font-semibold">{t('faqSection')}: {state.outline.faq_section.faq_title}</strong>
                                            <ul className="list-disc list-inside pl-4 space-y-1">{state.outline.faq_section.questions.map((q, i) => (<li key={i} className="text-slate-700 dark:text-zinc-300">{q.question}</li>))}</ul></div>)}
                                        <div><strong className="text-slate-600 dark:text-zinc-400 font-semibold">{t('conclusion')}:</strong><p className="text-slate-700 dark:text-zinc-300 pl-4">{state.outline.conclusion_summary}</p></div>
                                    </div>
                                    <button onClick={handlers.handleGenerateArticle} disabled={!state.outline || state.isGeneratingArticle || state.isGeneratingOutline || !apiKey} className="w-full mt-5 flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold text-white rounded-lg shadow-md bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-slate-400 disabled:to-slate-500 dark:disabled:from-zinc-700 dark:disabled:to-zinc-800 transition-all focus:outline-none focus:ring-4 focus:ring-cyan-500/50">
                                        {state.isGeneratingArticle ? <><SpinnerIcon className="animate-spin h-5 w-5" /><span>{t('streaming')}</span></> : <span>{t('generateFullArticle')}</span>}
                                    </button>
                                </div>
                            )}
                            {state.activeResultTab === 'article' && state.generatedArticle && (
                                 <div>
                                    <div className="flex justify-end items-center mb-4 gap-2">
                                         <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-600 rounded-md border border-slate-300 dark:border-zinc-600 transition-colors"> {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <ClipboardIcon className="h-4 w-4" />} {copied ? t('copied') : t('copyArticle')} </button>
                                         <button onClick={handlers.handleDownload} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-600 rounded-md border border-slate-300 dark:border-zinc-600 transition-colors"> <DownloadIcon className="h-4 w-4" /> {t('downloadArticle')} </button>
                                    </div>
                                    <textarea value={state.generatedArticle} readOnly className="w-full min-h-[400px] p-4 bg-slate-100/50 dark:bg-zinc-800/60 border-none rounded-lg text-slate-800 dark:text-zinc-200 leading-relaxed resize-y focus:outline-none" />
                                    {state.sources.length > 0 && (
                                        <div className="mt-4 p-4 bg-slate-100/50 dark:bg-zinc-800/60 rounded-lg border border-slate-200 dark:border-zinc-700">
                                            <h4 className="font-semibold text-slate-800 dark:text-zinc-200 mb-2">{t('sources')}</h4>
                                            <ul className="list-disc list-inside space-y-1 text-sm">{state.sources.map((source, index) => (<li key={index}><a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline">{source.web.title || source.web.uri}</a></li>))}</ul>
                                        </div>
                                    )}
                                    <button onClick={handlers.handleGenerateImage} disabled={state.isGeneratingImage || !apiKey || !state.title.trim()} className="w-full mt-5 flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold text-white rounded-lg shadow-md bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 disabled:from-slate-400 disabled:to-slate-500 dark:disabled:from-zinc-700 dark:disabled:to-zinc-800 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/50">
                                        {state.isGeneratingImage ? <><SpinnerIcon className="animate-spin h-5 w-5" /><span>{t('generatingImage')}</span></> : <><PhotoIcon className="h-5 w-5" /><span>{t('generateImage')}</span></>}
                                    </button>
                                </div>
                            )}
                            {state.activeResultTab === 'image' && (
                                <div>
                                    {state.imageError && <p className="p-3 rounded-md text-sm text-center bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200">{state.imageError}</p>}
                                    {state.generatedImage && (
                                        <div className="space-y-4">
                                            <img src={state.generatedImage} alt={state.title || 'Generated featured image'} className="w-full rounded-lg shadow-md border border-slate-200 dark:border-zinc-700" />
                                            <button onClick={handlers.handleDownloadImage} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 transition-colors"><DownloadIcon className="h-5 w-5" />{t('downloadImage')}</button>
                                        </div>
                                    )}
                                    {!state.generatedImage && !state.isGeneratingImage && (
                                        <div className="text-center p-6">
                                            <p className="text-slate-500 dark:text-zinc-400">{t('articleGenerated')}</p>
                                             <button onClick={handlers.handleGenerateImage} disabled={state.isGeneratingImage || !apiKey || !state.title.trim()} className="mt-4 flex items-center justify-center gap-2 mx-auto px-5 py-3 text-base font-semibold text-white rounded-lg shadow-md bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 disabled:from-slate-400 disabled:to-slate-500 dark:disabled:from-zinc-700 dark:disabled:to-zinc-800 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/50">
                                                {state.isGeneratingImage ? <><SpinnerIcon className="animate-spin h-5 w-5" /><span>{t('generatingImage')}</span></> : <><PhotoIcon className="h-5 w-5" /><span>{t('generateImage')}</span></>}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                     </div>
                )}
            </main>
        </div>
    );
};

export default ArticleGenerator;
