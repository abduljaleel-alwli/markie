
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Metadata } from '../types';
import { useTranslations, Language } from '../hooks/useTranslations';


interface MetadataFormProps {
    metadata: Metadata;
    onMetadataChange: (metadata: Metadata) => void;
    language: Language;
}

const InputField: React.FC<{ label: string; name: keyof Metadata; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }> = ({ label, name, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">{label}</label>
        <input
            type="text"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-slate-100/50 dark:bg-zinc-900/70 border border-slate-300 dark:border-zinc-700 rounded-lg shadow-sm py-2 px-4 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
        />
    </div>
);

const MetadataForm: React.FC<MetadataFormProps> = ({ metadata, onMetadataChange, language }) => {
    const t = useTranslations(language);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onMetadataChange({
            ...metadata,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="p-8">
            <div className="space-y-5">
                <InputField label={t('title')} name="title" value={metadata.title} onChange={handleChange} placeholder="Article Title"/>
                <InputField label={t('description')} name="description" value={metadata.description} onChange={handleChange} placeholder="Meta description for SEO"/>
                <InputField label={t('author')} name="author" value={metadata.author} onChange={handleChange} placeholder="Author's name"/>
                <InputField label={t('keywords')} name="keywords" value={metadata.keywords} onChange={handleChange} placeholder="comma, separated, keywords"/>
                <InputField label={t('canonicalUrl')} name="canonicalUrl" value={metadata.canonicalUrl} onChange={handleChange} placeholder="https://example.com/page"/>
                <InputField label={t('imageUrl')} name="imageUrl" value={metadata.imageUrl} onChange={handleChange} placeholder="https://example.com/image.jpg"/>
                <InputField label={t('language')} name="lang" value={metadata.lang} onChange={handleChange} placeholder="e.g., en, ar"/>
            </div>
        </div>
    );
};

export default MetadataForm;