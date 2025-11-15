import type { Metadata } from '../types';

const generateJsonLd = (metadata: Metadata): object => {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": metadata.title,
        "author": {
            "@type": "Person",
            "name": metadata.author
        },
        "image": metadata.imageUrl,
        "publisher": {
            "@type": "Organization",
            "name": "Your Website",
            "logo": {
                "@type": "ImageObject",
                "url": "https://example.com/logo.png" 
            }
        },
        "datePublished": new Date().toISOString(),
        "description": metadata.description
    };
};

export const generateFullHtml = (metadata: Metadata, htmlBody: string, theme: 'light' | 'dark'): string => {
    const jsonLd = generateJsonLd(metadata);
    const lang = metadata.lang || 'en';
    const dir = ['ar', 'he', 'fa', 'ur'].includes(lang.toLowerCase()) ? 'rtl' : 'ltr';

    const baseCss = `
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
        body { font-family: 'Tajawal', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.7; max-width: 800px; margin: 2rem auto; padding: 0 1rem; transition: color 0.3s, background-color 0.3s; }
        h1, h2, h3 { line-height: 1.3; font-weight: 700; }
        h1 { font-size: 2.25em; }
        h2 { font-size: 1.75em; margin-top: 2em; border-bottom: 1px solid; padding-bottom: 0.3em; }
        p + p { margin-top: 25px; }
        code { padding: 0.2em 0.4em; margin: 0; font-size: 85%; border-radius: 6px; font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace; }
        pre { padding: 1rem; border-radius: 8px; overflow-x: auto; }
        pre code { padding: 0; background: none; }
        blockquote { padding-left: 1em; }
        img { max-width: 100%; height: auto; border-radius: 8px; }
        .table-blog { border-collapse: separate; border-spacing: 0; width: 100%; margin: 1.5em 0; overflow: hidden; border-radius: 8px; }
        .table-blog th, .table-blog td { padding: 12px 15px; text-align: left; }
        .table-blog th { font-weight: 700; font-size: 0.9em; letter-spacing: 0.05em; text-transform: uppercase; }
        .table-blog tbody tr { border-top: 1px solid; }
        a { font-weight: 500; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .section-part { margin-bottom: 2.5em; }
        .header-part { margin-bottom: 1em; }
    `;

    const lightThemeCss = `
        body { color: #1e293b; background-color: #f8fafc; }
        h2 { border-color: #e2e8f0; }
        code { background-color: #e2e8f0; }
        pre { background-color: #e2e8f0; color: #1e293b; }
        blockquote { border-left: 4px solid #cbd5e1; color: #475569; }
        .table-blog { box-shadow: 0 0 0 1px #e2e8f0; }
        .table-blog th { background-color: #f8fafc; color: #475569; }
        .table-blog td { color: #334155; }
        .table-blog tbody tr { border-color: #e2e8f0; }
        .table-blog tbody tr:nth-child(even) { background-color: #f8fafc; }
        a { color: #0891b2; }
    `;

    const darkThemeCss = `
        body { color: #d4d4d8; background-color: #09090b; }
        h2 { border-color: #3f3f46; }
        code { background-color: #3f3f46; }
        pre { background-color: #18181b; color: #e4e47; }
        blockquote { border-left: 4px solid #52525b; color: #a1a1aa; }
        .table-blog { box-shadow: 0 0 0 1px #3f3f46; }
        .table-blog th { background-color: #27272a; color: #a1a1aa; }
        .table-blog td { color: #d4d4d8; }
        .table-blog tbody tr { border-color: #3f3f46; }
        .table-blog tbody tr:nth-child(even) { background-color: #18181b; }
        a { color: #67e8f9; }
    `;
    
    return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}" class="${theme}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Primary Meta Tags -->
    <title>${metadata.title}</title>
    <meta name="title" content="${metadata.title}">
    <meta name="description" content="${metadata.description}">
    <meta name="author" content="${metadata.author}">
    <meta name="keywords" content="${metadata.keywords}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${metadata.canonicalUrl}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${metadata.canonicalUrl}">
    <meta property="og:title" content="${metadata.title}">
    <meta property="og:description" content="${metadata.description}">
    <meta property="og:image" content="${metadata.imageUrl}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${metadata.canonicalUrl}">
    <meta property="twitter:title" content="${metadata.title}">
    <meta property="twitter:description" content="${metadata.description}">
    <meta property="twitter:image" content="${metadata.imageUrl}">

    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(jsonLd, null, 4)}
    </script>
    
    <!-- Styling for Preview -->
    <style>
        ${baseCss}
        :root {
            ${lightThemeCss}
        }
        html.dark {
            ${darkThemeCss}
        }
    </style>
</head>
<body>
    <article>
        ${htmlBody}
    </article>
</body>
</html>`;
};
