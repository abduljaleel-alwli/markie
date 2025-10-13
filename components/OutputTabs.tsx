import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Metadata } from '../types';
import { useTranslations, Language } from '../hooks/useTranslations';
import { ClipboardIcon, CheckIcon, DownloadIcon } from './icons';
import { locales } from '../i18n/locales';

interface OutputTabsProps {
    fullHtml: string;
    htmlBody: string;
    metadata: Metadata;
    language: Language;
}

const useCopyToClipboard = (text: string, t: (key: string) => string) => {
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const buttonText = copied ? t('copied') : 'Copy';
    return { copy, copied, buttonText };
};

const CodeBlock: React.FC<{
    code: string;
    language: string;
    buttonText: string;
    onCopy: () => void;
    copied: boolean;
    onDownload?: () => void;
    downloadButtonText?: string;
}> = ({ code, language, buttonText, onCopy, copied, onDownload, downloadButtonText }) => (
    <div className="relative group">
        <pre className="bg-slate-100 dark:bg-zinc-800/50 text-slate-800 dark:text-zinc-200 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-slate-200 dark:border-zinc-700">
            <code className={`language-${language}`}>{code}</code>
        </pre>
        <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
            {onDownload && downloadButtonText && (
                <button
                    onClick={onDownload}
                    className="flex items-center gap-2 bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors hover:bg-slate-300 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                    <DownloadIcon className="h-4 w-4" />
                    {downloadButtonText}
                </button>
            )}
            <button
                onClick={onCopy}
                className="flex items-center gap-2 bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors hover:bg-slate-300 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
                {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <ClipboardIcon className="h-4 w-4" />}
                {buttonText}
            </button>
        </div>
    </div>
);


const OutputTabs: React.FC<OutputTabsProps> = ({ fullHtml, htmlBody, metadata, language }) => {
    const t = useTranslations(language);
    
    // Use stable, non-translated keys to manage tab state
    const tabKeys = ['preview', 'fullHtml', 'article', 'meta', 'schema'];
    const [activeTabKey, setActiveTabKey] = useState(tabKeys[0]);

    // Create an array of tab objects with keys and translated labels
    const tabs = tabKeys.map(key => ({
        key,
        label: t(key as keyof typeof locales.en),
    }));

    const getMetaTags = (m: Metadata): string => {
        return `<!-- Primary Meta Tags -->
<title>${m.title}</title>
<meta name="title" content="${m.title}">
<meta name="description" content="${m.description}">
<meta name="author" content="${m.author}">
<meta name="keywords" content="${m.keywords}">
<link rel="canonical" href="${m.canonicalUrl}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="article">
<meta property="og:url" content="${m.canonicalUrl}">
<meta property="og:title" content="${m.title}">
<meta property="og:description" content="${m.description}">
<meta property="og:image" content="${m.imageUrl}">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${m.canonicalUrl}">
<meta property="twitter:title" content="${m.title}">
<meta property="twitter:description" content="${m.description}">
<meta property="twitter:image" content="${m.imageUrl}">`;
    };

    const getSchema = (m: Metadata): string => {
        const schemaObj = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": m.title,
            "author": { "@type": "Person", "name": m.author },
            "image": m.imageUrl,
            "datePublished": new Date().toISOString().split('T')[0],
            "description": m.description
        };
        return JSON.stringify(schemaObj, null, 2);
    };

    const handleDownloadHtml = () => {
        const slugify = (str: string) =>
            str
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');

        const filename = `${slugify(metadata.title) || 'article'}.html`;
        const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const fullHtmlCopy = useCopyToClipboard(fullHtml, (k) => t('copyFullHtml'));
    const bodyCopy = useCopyToClipboard(htmlBody, (k) => t('copyBody'));
    const metaCopy = useCopyToClipboard(getMetaTags(metadata), (k) => t('copyMeta'));
    const schemaCopy = useCopyToClipboard(getSchema(metadata), (k) => t('copySchema'));
    
    // Use stable keys for the content object
    const tabContent: { [key: string]: React.ReactNode } = {
        preview: (
            <iframe
                srcDoc={fullHtml}
                title="HTML Preview"
                className="w-full h-[75vh] bg-white rounded-lg border border-slate-200 dark:border-zinc-700"
                sandbox="allow-scripts"
            />
        ),
        fullHtml: <CodeBlock code={fullHtml} language="html" buttonText={fullHtmlCopy.buttonText} onCopy={fullHtmlCopy.copy} copied={fullHtmlCopy.copied} onDownload={handleDownloadHtml} downloadButtonText={t('download')} />,
        article: <CodeBlock code={htmlBody} language="html" buttonText={bodyCopy.buttonText} onCopy={bodyCopy.copy} copied={bodyCopy.copied} />,
        meta: <CodeBlock code={getMetaTags(metadata)} language="html" buttonText={metaCopy.buttonText} onCopy={metaCopy.copy} copied={metaCopy.copied} />,
        schema: <CodeBlock code={getSchema(metadata)} language="json" buttonText={schemaCopy.buttonText} onCopy={schemaCopy.copy} copied={schemaCopy.copied} />,
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 dark:border-zinc-800">
                <nav className="flex space-x-2 p-2" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTabKey(tab.key)}
                            className={`${
                                activeTabKey === tab.key
                                    ? 'bg-cyan-500 text-white'
                                    : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-200/60 dark:hover:bg-zinc-800/60'
                            } px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 focus:ring-cyan-500`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="p-5">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTabKey} // Use the stable key here for the animation
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {tabContent[activeTabKey] || <div>{t('pressConvertMessage')}</div>}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OutputTabs;