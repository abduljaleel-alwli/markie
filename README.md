# Markie - AI Markdown to HTML Converter

<div align="center">
  <img src="https://raw.githubusercontent.com/user-attachments/assets/de782c5f-a7b2-4dca-9781-8b3684a0d8e2/Markie-Logo-Light.svg#gh-light-mode-only" alt="Markie Logo" width="150">
  <img src="https://raw.githubusercontent.com/user-attachments/assets/65918304-486d-473d-986c-0e86236b3b5b/Markie-Logo-Dark.svg#gh-dark-mode-only" alt="Markie Logo" width="150">
</div>

<h3 align="center">
  AI-Powered Semantic Conversion Tool
</h3>

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![Language](https://img.shields.io/badge/language-TypeScript-blue.svg)
![Powered by](https://img.shields.io/badge/Powered%20By-Google%20Gemini-blueviolet)
![Tech](https://img.shields.io/badge/tech-React%20%26%20Tailwind-cyan)

</div>

<p align="center">
  Transform your Markdown articles into clean, semantic, and SEO-optimized HTML5 with the power of AI.
</p>

---

<p align="center">
  <img src="https://user-images.githubusercontent.com/12345/123456789-abcdef123456.png" alt="Markie Application Screenshot" style="border-radius: 12px; box-shadow: 0 10px 20px rgba(0,0,0,0.1);">
</p>

Markie is an intelligent web application designed to bridge the gap between writing in Markdown and publishing professional, search-engine-friendly web content. It automates the tedious process of manual HTML conversion and optimization by leveraging the Google Gemini API to generate perfectly structured semantic HTML, meta tags, and structured data.

## ✨ Key Features

- **🤖 AI-Powered Semantic HTML:** Goes beyond basic conversion by using AI to generate a fully semantic HTML structure (`<section>`, `<figure>`, etc.) that's optimized for accessibility and SEO.
- **🚀 Automatic SEO Metadata:** Generates SEO-friendly titles and meta descriptions based on your article's content with a single click.
- **📊 Structured Data (JSON-LD):** Automatically creates JSON-LD schema for articles, helping your content stand out in search results with rich snippets.
- **🔐 User-Provided API Keys:** Your Google Gemini API key is stored securely in your browser's local storage and is never sent to our servers, ensuring your privacy and data security.
- **🖥️ Live Preview & Code Output:** Instantly preview your rendered article and access the generated code across multiple tabs: Full HTML, Article Body, Meta Tags, and Schema.
- **🌍 Full Internationalization:**
  - **Bilingual Interface:** Supports both English and Arabic.
  - **RTL/LTR Layout:** The entire user interface automatically adjusts its directionality based on the selected language.
- **🌗 Light & Dark Mode:** A sleek, modern interface that respects your system preference or can be toggled manually. All user preferences are saved in local storage.
- **📥 Downloadable HTML:** Export the complete, ready-to-use `.html` file directly from the app.

## 🛠️ Tech Stack

- **Framework:** [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **AI Integration:** [Google Gemini API](https://ai.google.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Markdown Fallback:** [Remark](https://github.com/remarkjs/remark)

## ⚙️ Installation

Running Markie locally is simple with an npm-based workflow.

**Prerequisites:**
- [Node.js](https://nodejs.org/) (which includes npm)
- [Git](https://git-scm.com/)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/abduljaleel-alwli/markie.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd markie
    ```

3.  **Install dependencies:**
    This command installs the necessary development tools, like the Vite server.
    ```bash
    npm install
    ```

4.  **Run the development server:**
    This will start a local server and open the application in your browser.
    ```bash
    npm run dev
    ```
    *You can also use `npm start`.*

5.  **Preview a production build (Optional):**
    To test the production-ready version of the app, you can build it and then preview it.
    ```bash
    # 1. Build the application
    npm run build

    # 2. Preview the build
    npm run preview
    ```

## 🚀 How to Use

1.  **Add Your API Key:** On first launch, you'll be prompted to enter your Google Gemini API key. You can get one for free from [Google AI Studio](https://aistudio.google.com/app/apikey). Your key is saved in your browser for future use.
2.  **Paste Your Content:** Write or paste your Markdown content into the input editor.
3.  **Generate SEO (Optional):** Navigate to the "Metadata" tab and click the **"Generate SEO"** button. The AI will populate the title and description fields with optimized suggestions. You can manually edit any field.
4.  **Convert to HTML:** Click the **"Convert Markdown"** button to transform your Markdown into semantic HTML.
5.  **Do It All at Once:** Click the **"Generate & Convert"** button to perform both SEO generation and HTML conversion in one step.
6.  **Review the Output:**
    -   **Preview:** See a live, styled preview of the final article.
    -   **Full HTML:** Get the complete HTML document, including all metadata and styles.
    -   **Article:** Get just the semantic HTML body content.
    -   **Meta:** View and copy only the generated `<meta>` and `<link>` tags.
    -   **Schema:** View and copy the generated JSON-LD structured data.
7.  **Download:** In the "Full HTML" tab, click the **"Download"** button to save the complete file to your computer.

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or find a bug, please feel free to:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some amazing feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## ©️ Copyright

&copy; 2024 [Shamll Tech](https://shamlltech.com/). All rights reserved.