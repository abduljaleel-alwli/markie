import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, Language } from '../hooks/useTranslations';
import { generateText, generateArticleStream, generateImage, generateArticleOutline, ArticleOutline } from '../services/geminiService';
import { ClipboardIcon, CheckIcon, DownloadIcon, MagicSparklesIcon, SpinnerIcon, SearchIcon, PhotoIcon, ListBulletIcon } from './icons';

interface ArticleGeneratorProps {
    apiKey: string | null;
    language: Language;
}

const categories = [
    { key: 'sports', ar: 'رياضة' },
    { key: 'food', ar: 'أكلات' },
    { key: 'tourism', ar: 'سياحة' },
    { key: 'medical', ar: 'مقال طبي' },
    { key: 'phone_review', ar: 'مراجعة هاتف' },
    { key: 'games', ar: 'ألعاب' },
    { key: 'tech', ar: 'تقنية' },
    { key: 'news', ar: 'أخبار' },
    { key: 'stories', ar: 'روايات وقصص' },
    { key: 'custom', ar: 'مخصص' },
];

const ArticleGenerator: React.FC<ArticleGeneratorProps> = ({ apiKey, language }) => {
    const t = useTranslations(language);
    // Basic options
    const [category, setCategory] = useState('');
    const [title, setTitle] = useState('');
    const [keywords, setKeywords] = useState('');
    const [articleLanguage, setArticleLanguage] = useState('العربية');
    const [tone, setTone] = useState('');
    const [contentType, setContentType] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [writingStyle, setWritingStyle] = useState('');
    const [wordCount, setWordCount] = useState('600');
    
    // Advanced options
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [numberOfSections, setNumberOfSections] = useState('3-5');
    const [introductionStyle, setIntroductionStyle] = useState('Engaging Hook');
    const [conclusionStyle, setConclusionStyle] = useState('Concise Summary');
    const [includeFaq, setIncludeFaq] = useState(false);
    const [includeTable, setIncludeTable] = useState(false);
    const [includeQuote, setIncludeQuote] = useState(false);
    
    // State and results
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
    const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
    const [generatedArticle, setGeneratedArticle] = useState('');
    const [copied, setCopied] = useState(false);
    const [useGoogleSearch, setUseGoogleSearch] = useState(false);
    const [sources, setSources] = useState<any[]>([]);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);

    const [outline, setOutline] = useState<ArticleOutline | null>(null);
    const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);


    const buildOutlinePrompt = useCallback(() => {
        let prompt = `Based on the following parameters, create a structured JSON outline for a blog article. 
        Your task is to generate an outline of subheadings (H2s) and their content summaries that logically follow the main title.

        **Article Title (This is fixed and MUST NOT be changed):** "${title}"
        
        **Core Parameters:**
        - Category: ${category}
        - Tone: ${tone || 'professional'}
        - Target Audience: ${targetAudience || 'general public'}
        - Desired Word Count: Approximately ${wordCount || 600} words
        - Language: ${articleLanguage}
        - Keywords to include: ${keywords || 'N/A'}

        **Structural & Stylistic Requirements:**
        - The article should have between ${numberOfSections.split('-')[0]} and ${numberOfSections.split('-')[1]} main section headings (H2s).
        - The introduction style should be: "${introductionStyle}".
        - The conclusion style should be: "${conclusionStyle}".

        **Optional Content (include in JSON only if enabled and relevant):**
        - Include FAQ Section: ${includeFaq ? 'Yes, generate a relevant FAQ section with a title and 3-4 questions and answers.' : 'No'}
        - Include Data Table: ${includeTable ? 'Yes, if the topic is suitable, create a relevant data table with a title, headers, and several rows of data.' : 'No'}
        - Include a Quote: ${includeQuote ? 'Yes, find one relevant and impactful quote from a notable source to include.' : 'No'}

        Generate the JSON object based on the schema provided. Do not create a new title; build the structure under the one provided.
        `;
        return prompt;
    }, [title, category, tone, targetAudience, wordCount, articleLanguage, keywords, numberOfSections, introductionStyle, conclusionStyle, includeFaq, includeTable, includeQuote]);
    
    const buildFullArticlePromptFromOutline = useCallback((outlineToUse: ArticleOutline) => {
        let prompt = `You are an expert writer specializing in creating engaging, well-structured, and high-quality articles. Your task is to expand the following JSON outline into a complete and detailed article of approximately ${wordCount || 600} words. The main title of the article is "${title}".

        **Instructions:**
        1.  **Follow the Outline:** Adhere strictly to the provided JSON outline. Use 'section_title' for headings (e.g., H2), and expand 'section_summary' into detailed paragraphs. Write the introduction and conclusion based on their respective summaries.
        2.  **Tone and Style:** Write in a ${tone || 'professional'} tone, for a ${targetAudience || 'general public'} audience. The writing style should be ${writingStyle || 'clear and engaging'}.
        3.  **Language:** The entire article MUST be written in ${articleLanguage}.
        4.  **Keywords:** Naturally integrate these keywords where appropriate: ${keywords || 'N/A'}.
        5.  **Special Sections:**
            - If a 'data_table' is present in the outline, format it clearly and logically within the article body where it makes the most sense.
            - If a 'faq_section' is present, create a dedicated section for it at the end of the article before the conclusion. Use the 'faq_title' as a heading (e.g., H2) and format the questions (e.g., H3) and answers clearly.
            - If a 'quote' is present, integrate it naturally into the article where it adds the most impact, for example, in a blockquote.
        6.  **Output Format:** Provide only the final article text, ready for publication. Start directly with the introduction content. Do NOT include the JSON outline, the main title, meta-commentary, or markdown formatting like \`###\`. The output should be clean, readable text.

        **JSON OUTLINE TO EXPAND:**
        ---
        ${JSON.stringify(outlineToUse, null, 2)}
        ---
        `;
        return prompt;
    }, [wordCount, tone, targetAudience, writingStyle, articleLanguage, keywords, title]);
    
    const handleGenerateOutline = async () => {
        if (!apiKey) return;
        if (!title.trim()) {
            setError(t('pleaseEnterTitleFirst'));
            return;
        }
        setIsGeneratingOutline(true);
        setStatus(t('generatingOutline'));
        setError(null);
        setOutline(null);
        try {
            const prompt = buildOutlinePrompt();
            const result = await generateArticleOutline(prompt, apiKey);
            setOutline(result);
            setStatus(t('outlineGenerated'));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to generate outline');
            setStatus(null);
        } finally {
            setIsGeneratingOutline(false);
        }
    };


    const handleGenerateKeywords = async () => {
        if (!apiKey) return;
        if (!title.trim()) {
            setError(t('pleaseEnterTitleFirst'));
            return;
        }
        setIsGeneratingKeywords(true);
        setStatus(t('generatingKeywords'));
        setError(null);
        try {
            const prompt = ` قم بإنشاء قائمة من 5 إلى 10 كلمات مفتاحية متعلقة بالعنوان التالي بلغة العنوان نفسه: "${title}". يجب أن تكون الكلمات المفتاحية مناسبة لمحركات البحث SEO. أدرجها كقائمة مفصولة بفواصل بدون أرقام أو نقاط.`;
            const result = await generateText(prompt, apiKey);
            setKeywords(result.replace(/^\d+\.\s*/gm, '').replace(/\n/g, ', '));
            setStatus(t('keywordsGenerated'));
        } catch (e) {
            setError(e instanceof Error ? e.message : t('keywordsFailed'));
            setStatus(null);
        } finally {
            setIsGeneratingKeywords(false);
        }
    };

    const handleGenerateArticle = async () => {
        if (!apiKey || !outline) return;

        setIsGeneratingArticle(true);
        setStatus(t('streaming'));
        setError(null);
        setGeneratedArticle('');
        setSources([]);
        
        try {
            const prompt = buildFullArticlePromptFromOutline(outline);
            const stream = await generateArticleStream(prompt, apiKey, useGoogleSearch);
            
            let finalResponse: any = null;
            let fullArticle = `<h1>${title}</h1>\n\n`; // Start with the user's title as H1
            for await (const chunk of stream) {
                const chunkText = chunk.text;
                fullArticle += chunkText;
                setGeneratedArticle(fullArticle);
                finalResponse = chunk;
            }

            const groundingChunks = finalResponse?.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (groundingChunks && groundingChunks.length > 0) {
                setSources(groundingChunks);
            }
            
            setStatus(t('articleGenerated'));
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
            setStatus(null);
        } finally {
            setIsGeneratingArticle(false);
        }
    };
    
    const handleCopy = () => {
        if (!generatedArticle) {
            setError(t('noArticleToCopy'));
            return;
        }
        navigator.clipboard.writeText(generatedArticle).then(() => {
            setCopied(true);
            setStatus(t('articleCopied'));
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleDownload = () => {
        if (!generatedArticle) {
             setError(t('noArticleToDownload'));
            return;
        }
        const blob = new Blob([generatedArticle], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const filename = `${title.trim().replace(/\s+/g, '_') || 'article'}.txt`;
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setStatus(t('articleDownloaded'));
    };

    const handleGenerateImage = async () => {
        if (!apiKey || !title.trim()) return;
        setIsGeneratingImage(true);
        setImageError(null);
        setGeneratedImage(null);
        try {
            const base64Data = await generateImage(title, apiKey);
            setGeneratedImage(`data:image/jpeg;base64,${base64Data}`);
        } catch (e) {
            setImageError(e instanceof Error ? e.message : t('imageGenerationFailed'));
        } finally {
            setIsGeneratingImage(false);
        }
    };
    
    const handleDownloadImage = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        const filename = `${title.trim().replace(/\s+/g, '_') || 'featured_image'}.jpeg`;
        link.href = generatedImage;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const renderSelect = (id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: {value: string, label: string}[]) => (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">{label}</label>
            <select
                id={id}
                value={value}
                onChange={onChange}
                className="w-full bg-slate-100/50 dark:bg-zinc-800/60 border border-slate-300 dark:border-zinc-700 rounded-lg shadow-sm py-2.5 px-4 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            >
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    );
    
    const ToggleSwitch: React.FC<{id: string, label: string, checked: boolean, onChange: (checked: boolean) => void}> = ({ id, label, checked, onChange }) => (
        <div className="flex items-center justify-between bg-slate-100 dark:bg-zinc-800/60 p-3 rounded-lg">
            <label htmlFor={id} className="font-medium text-slate-700 dark:text-zinc-200 cursor-pointer">{label}</label>
            <button
                id={id}
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-zinc-900 ${
                    checked ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-zinc-600'
                }`}
            >
                <motion.span
                    animate={checked ? { translateX: '1.25rem' } : { translateX: '0.25rem' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="inline-block h-4 w-4 transform rounded-full bg-white"
                />
            </button>
        </div>
    );


    return (
        <motion.div 
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="text-center mb-4 p-4 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                <h2 className="text-xl font-bold text-white">{t('aiArticleGenerator')}</h2>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-200 text-center mb-6">{t('newArticle')}</h3>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">{t('selectCategory')}</label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat.key}
                                onClick={() => setCategory(cat.key)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 focus:ring-cyan-500 ${
                                    category === cat.key
                                        ? 'bg-cyan-500 text-white'
                                        : 'text-slate-600 dark:text-zinc-300 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700'
                                }`}
                            >
                                {language === 'ar' ? cat.ar : cat.key.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('articleTitlePlaceholder')}
                    className="w-full bg-slate-100/50 dark:bg-zinc-800/60 border border-slate-300 dark:border-zinc-700 rounded-lg shadow-sm py-2.5 px-4 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                />

                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder={t('keywordsPlaceholder')}
                        className="flex-grow bg-slate-100/50 dark:bg-zinc-800/60 border border-slate-300 dark:border-zinc-700 rounded-lg shadow-sm py-2.5 px-4 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                    />
                    <button onClick={handleGenerateKeywords} disabled={isGeneratingKeywords || !apiKey} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg shadow-md bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 dark:disabled:bg-zinc-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/50">
                        {isGeneratingKeywords ? <SpinnerIcon className="animate-spin h-5 w-5" /> : <MagicSparklesIcon className="h-5 w-5" />}
                        <span>{t('extractKeywords')}</span>
                    </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                     {renderSelect('language', t('selectLanguage'), articleLanguage, (e) => setArticleLanguage(e.target.value), [
                        { value: 'العربية', label: 'العربية' }, { value: 'الإنجليزية', label: 'الإنجليزية' }, { value: 'الفرنسية', label: 'الفرنسية' }, { value: 'الإسبانية', label: 'الإسبانية' }, { value: 'الألمانية', label: 'الألمانية' },
                    ])}
                    {renderSelect('tone', t('selectTone'), tone, (e) => setTone(e.target.value), [
                        { value: '', label: t('selectTone')}, { value: 'مرح', label: 'مرح' }, { value: 'احترافي', label: 'احترافي' }, { value: 'عامية مصرية', label: 'عامية مصرية' }, { value: 'خليجية', label: 'خليجية' }, { value: 'رسمي', label: 'رسمي' }, { value: 'ودي', label: 'ودي' }, { value: 'تحفيزي', label: 'تحفيزي' },
                    ])}
                    {renderSelect('contentType', t('selectContentType'), contentType, (e) => setContentType(e.target.value), [
                        { value: '', label: t('selectContentType')}, { value: 'مقال', label: 'مقال' }, { value: 'تدوينة', label: 'تدوينة' }, { value: 'تقرير', label: 'تقرير' }, { value: 'مراجعة', label: 'مراجعة' }, { value: 'دليل', label: 'دليل' }, { value: 'قائمة', label: 'قائمة' },
                    ])}
                    {renderSelect('targetAudience', t('selectAudience'), targetAudience, (e) => setTargetAudience(e.target.value), [
                       { value: '', label: t('selectAudience')}, { value: 'عام', label: 'عام' }, { value: 'متخصصين', label: 'متخصصين' }, { value: 'طلاب', label: 'طلاب' }, { value: 'أطفال', label: 'أطفال' }, { value: 'كبار السن', label: 'كبار السن' },
                    ])}
                    {renderSelect('writingStyle', t('selectWritingStyle'), writingStyle, (e) => setWritingStyle(e.target.value), [
                        { value: '', label: t('selectWritingStyle')}, { value: 'بسيط', label: 'بسيط' }, { value: 'متوسط', label: 'متوسط' }, { value: 'متقدم', label: 'متقدم' }, { value: 'أكاديمي', label: 'أكاديمي' }, { value: 'إبداعي', label: 'إبداعي' },
                    ])}
                    <div>
                        <label htmlFor="wordCount" className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">{t('wordCount')}</label>
                        <input id="wordCount" type="number" value={wordCount} onChange={(e) => setWordCount(e.target.value)} placeholder={t('wordCount')} className="w-full bg-slate-100/50 dark:bg-zinc-800/60 border border-slate-300 dark:border-zinc-700 rounded-lg shadow-sm py-2.5 px-4 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" />
                    </div>
                </div>

                {/* Advanced Options */}
                <div className="space-y-4">
                    <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full text-left font-semibold text-cyan-600 dark:text-cyan-400">
                        {t('advancedOptions')} {showAdvanced ? '(-)' : '(+)'}
                    </button>
                    <AnimatePresence>
                    {showAdvanced && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden space-y-4"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {renderSelect('numberOfSections', t('numberOfSections'), numberOfSections, (e) => setNumberOfSections(e.target.value), [
                                    { value: '3-5', label: t('sections3to5') }, { value: '5-7', label: t('sections5to7') }, { value: '7-9', label: t('sections7to9') },
                                ])}
                                {renderSelect('introStyle', t('introStyle'), introductionStyle, (e) => setIntroductionStyle(e.target.value), [
                                    { value: 'Engaging Hook', label: t('introStyleEngaging') }, { value: 'Direct Statement', label: t('introStyleDirect') }, { value: 'Question-based Hook', label: t('introStyleQuestion') },
                                ])}
                                {renderSelect('conclusionStyle', t('conclusionStyle'), conclusionStyle, (e) => setConclusionStyle(e.target.value), [
                                    { value: 'Concise Summary', label: t('conclusionStyleSummary') }, { value: 'Call to Action', label: t('conclusionStyleCta') }, { value: 'Thought-Provoking Question', label: t('conclusionStyleQuestion') },
                                ])}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <ToggleSwitch id="faq-toggle" label={t('includeFaq')} checked={includeFaq} onChange={setIncludeFaq} />
                                <ToggleSwitch id="table-toggle" label={t('includeTable')} checked={includeTable} onChange={setIncludeTable} />
                                <ToggleSwitch id="quote-toggle" label={t('includeQuote')} checked={includeQuote} onChange={setIncludeQuote} />
                            </div>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
                
                
                <ToggleSwitch id="google-search-toggle" label={t('useGoogleSearch')} checked={useGoogleSearch} onChange={setUseGoogleSearch} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={handleGenerateOutline} disabled={isGeneratingOutline || isGeneratingArticle || !apiKey} className="w-full flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold text-white rounded-lg shadow-md bg-blue-600 hover:bg-blue-500 disabled:from-slate-400 disabled:to-slate-500 dark:disabled:bg-zinc-700 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/50">
                        {isGeneratingOutline ? <><SpinnerIcon className="animate-spin h-5 w-5" /><span>{t('generatingOutline')}</span></> : <><ListBulletIcon className="h-5 w-5" /><span>{t('generateOutline')}</span></>}
                    </button>
                    <button onClick={handleGenerateArticle} disabled={!outline || isGeneratingArticle || isGeneratingOutline || !apiKey} className="w-full flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold text-white rounded-lg shadow-md bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-slate-400 disabled:to-slate-500 dark:disabled:from-zinc-700 dark:disabled:to-zinc-800 transition-all focus:outline-none focus:ring-4 focus:ring-cyan-500/50">
                        {isGeneratingArticle ? <><SpinnerIcon className="animate-spin h-5 w-5" /><span>{t('streaming')}</span></> : <span>{t('generateFullArticle')}</span>}
                    </button>
                </div>

                {(status || error) && (
                    <div 
                        aria-live="polite"
                        className={`p-3 rounded-md text-sm text-center ${
                        error 
                        ? 'bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200' 
                        : 'bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-200'
                    }`}>
                        {error || status}
                    </div>
                )}
                
                <AnimatePresence>
                {outline && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-6 p-5 bg-slate-100/50 dark:bg-zinc-800/60 rounded-lg border border-slate-200 dark:border-zinc-700 space-y-4"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-lg text-slate-800 dark:text-zinc-200">{t('articleOutline')}</h4>
                            <button onClick={handleGenerateOutline} disabled={isGeneratingOutline} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-200 bg-white dark:bg-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-600 rounded-md border border-slate-300 dark:border-zinc-600 transition-colors">
                                <MagicSparklesIcon className="h-4 w-4" />
                                {t('regenerateOutline')}
                            </button>
                        </div>
                        <div className="space-y-3 text-sm">
                             <p className="text-slate-900 dark:text-zinc-100 font-semibold text-base">{title}</p>
                            <div>
                                <strong className="text-slate-600 dark:text-zinc-400 font-semibold">{t('introduction')}:</strong>
                                <p className="text-slate-700 dark:text-zinc-300 pl-4">{outline.introduction_summary}</p>
                            </div>
                            <div>
                                <strong className="text-slate-600 dark:text-zinc-400 font-semibold">{t('sections')}:</strong>
                                <ul className="list-disc list-inside pl-4 space-y-1">
                                    {outline.sections.map((sec, i) => (
                                        <li key={i} className="text-slate-700 dark:text-zinc-300">
                                            <span className="font-semibold">{sec.section_title}:</span> {sec.section_summary}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                             {outline.quote && (
                                <div>
                                    <strong className="text-slate-600 dark:text-zinc-400 font-semibold">{t('quote')}:</strong>
                                    <blockquote className="text-slate-700 dark:text-zinc-300 pl-4 italic">
                                        "{outline.quote.quote_text}" - {outline.quote.quote_author}
                                    </blockquote>
                                </div>
                            )}
                            {outline.data_table && (
                                <div>
                                    <strong className="text-slate-600 dark:text-zinc-400 font-semibold">{t('dataTable')}: {outline.data_table.table_title}</strong>
                                    <p className="text-slate-700 dark:text-zinc-300 pl-4"> (A table with headers: {outline.data_table.headers.join(', ')})</p>
                                </div>
                            )}
                            {outline.faq_section && (
                                <div>
                                    <strong className="text-slate-600 dark:text-zinc-400 font-semibold">{t('faqSection')}: {outline.faq_section.faq_title}</strong>
                                    <ul className="list-disc list-inside pl-4 space-y-1">
                                        {outline.faq_section.questions.map((q, i) => (
                                            <li key={i} className="text-slate-700 dark:text-zinc-300">{q.question}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                             <div>
                                <strong className="text-slate-600 dark:text-zinc-400 font-semibold">{t('conclusion')}:</strong>
                                <p className="text-slate-700 dark:text-zinc-300 pl-4">{outline.conclusion_summary}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>

                <textarea
                    value={generatedArticle}
                    readOnly
                    placeholder={t('articleWillAppearHere')}
                    className="w-full min-h-[300px] p-4 bg-slate-100/50 dark:bg-zinc-800/60 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-800 dark:text-zinc-200 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                />

                {sources.length > 0 && (
                    <div className="mt-4 p-4 bg-slate-100/50 dark:bg-zinc-800/60 rounded-lg border border-slate-200 dark:border-zinc-700">
                        <h4 className="font-semibold text-slate-800 dark:text-zinc-200 mb-2">{t('sources')}</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            {sources.map((source, index) => (
                                <li key={index}>
                                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline">
                                        {source.web.title || source.web.uri}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button onClick={handleCopy} className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md bg-blue-600 hover:bg-blue-500 transition-colors">
                        {copied ? <CheckIcon className="h-5 w-5" /> : <ClipboardIcon className="h-5 w-5" />}
                        {t('copyArticle')}
                    </button>
                    <button onClick={handleDownload} className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 transition-colors">
                        <DownloadIcon className="h-5 w-5" />
                        {t('downloadArticle')}
                    </button>
                    <button onClick={handleGenerateArticle} disabled={isGeneratingArticle || !outline} className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md bg-amber-500 hover:bg-amber-400 transition-colors">
                        {t('regenerate')}
                    </button>
                </div>
            </div>

             <div className="pt-6 mt-6 border-t border-slate-200 dark:border-zinc-700 space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-200 text-center">{t('featuredImage')}</h3>
                
                <button onClick={handleGenerateImage} disabled={isGeneratingImage || !apiKey || !title.trim()} className="w-full flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold text-white rounded-lg shadow-md bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 disabled:from-slate-400 disabled:to-slate-500 dark:disabled:from-zinc-700 dark:disabled:to-zinc-800 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/50">
                    {isGeneratingImage ? <><SpinnerIcon className="animate-spin h-5 w-5" /><span>{t('generatingImage')}</span></> : <><PhotoIcon className="h-5 w-5" /><span>{t('generateImage')}</span></>}
                </button>

                {imageError && (
                    <div className="p-3 rounded-md text-sm text-center bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200">
                        {imageError}
                    </div>
                )}

                {generatedImage && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <img src={generatedImage} alt={title || 'Generated featured image'} className="w-full rounded-lg shadow-md border border-slate-200 dark:border-zinc-700" />
                        <button onClick={handleDownloadImage} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-500 transition-colors">
                            <DownloadIcon className="h-5 w-5" />
                            {t('downloadImage')}
                        </button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default ArticleGenerator;