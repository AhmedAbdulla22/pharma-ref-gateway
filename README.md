# 💊 PharmRef Gateway (بوابة المرجع الصيدلاني)

**PharmRef Gateway** is a modern, AI-powered pharmaceutical reference platform designed to provide quick, reliable, and multilingual drug information. Built specifically for the healthcare context in Iraq, it supports **English, Arabic, and Kurdish (Sorani)**, featuring a built-in drug interaction checker.

🚀 **Live Demo:** [pharma-ref-gateway.vercel.app](https://pharma-ref-gateway.vercel.app)

---

## ✨ Key Features

* **🔍 Multi-AI Search:** Intelligent drug retrieval using **Groq (Llama 3.3-70B)**, **Google Gemini**, and **SambaNova** for high-speed, medically accurate data with fallback support.
* **🌍 Triple-Language Support:** Full RTL (Right-to-Left) support for Arabic and Kurdish, alongside English.
* **🛡️ Interaction Checker:** Analyze potential risks between multiple medications with severity levels (Critical, Moderate, Safe).
* **🌓 Adaptive UI:** Clinical-grade "Medical Blue" theme with full Dark Mode support using OKLCH color space.
* **📱 Mobile First:** Optimized for use on-the-go by pharmacists and medical students.
* **🔄 Smart Caching:** In-memory caching with rate limit protection and multi-tier fallback system.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** [Next.js 16.0.10](https://nextjs.org/) (App Router)
* **Styling:** [Tailwind CSS 4.1.9](https://tailwindcss.com/) with OKLCH color space
* **UI Components:** [Shadcn UI](https://ui.shadcn.com/) with Radix UI primitives
* **Typography:** [Vazirmatn](https://fonts.google.com/specimen/Vazirmatn) (Optimized for Kurdish/Arabic readability)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Theme Management:** [next-themes](https://github.com/pacocoursey/next-themes)
* **Forms:** [React Hook Form](https://react-hook-form.com/) with Zod validation
* **Charts:** [Recharts](https://recharts.org/) for data visualization

### Backend & AI
* **AI Engines:** 
  - [Groq Cloud](https://groq.com/) (Llama-3.3-70b-versatile)
  - [Google AI](https://ai.google.dev/) (Gemini models)
  - [SambaNova](https://cloud.sambanova.ai/) (Advanced reasoning)
* **AI SDK:** [Vercel AI SDK](https://sdk.vercel.ai/) v6.0.35
* **API Layer:** Next.js Route Handlers (Serverless)
* **Deployment:** [Vercel](https://vercel.com/) with Analytics
* **HTTP Client:** [Axios](https://axios-http.com/) for API requests

---

## 📐 Architecture & Logic

The project implements a **Defensive Data Layer** to handle the non-deterministic nature of AI outputs:

1. **Multi-AI Provider System:** Automatic fallback between Groq, Google Gemini, and SambaNova with rate limit protection.
2. **Smart Caching:** Two-tier caching system (5-minute primary, 2-minute fallback) with failure tracking.
3. **Sanitization:** Every AI response is passed through a server-side "Sanitizer" that enforces schema integrity.
4. **Multilingual Mapping:** Dynamic translation fallbacks that ensure the UI remains populated even if specific language data is missing.
5. **RTL Engine:** A robust layout system that adjusts text alignment, icon direction, and navigation flow based on the selected locale.

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18.x or later
* API keys for AI providers (Groq, Google AI, SambaNova)

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/pharma-ref-gateway.git
    cd pharma-ref-gateway
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Set up Environment Variables:**
    Create a `.env.local` file in the root:
    ```env
    # Google AI API Key (for Gemini AI summarization)
    # Get this from: https://makersuite.google.com/app/apikey
    GOOGLE_AI_API_KEY=your_google_ai_api_key_here

    # Groq API Key (for AI analysis and summarization)
    # Get this from: https://console.groq.com/keys
    GROQ_API_KEY=your_groq_api_key_here

    # SambaNova API Key (for AI analysis and translation)
    # Get this from: https://cloud.sambanova.ai/
    SAMBA_NOVA_API_KEY=your_sambanova_api_key_here

    ```

4. **Run the development server:**
    ```bash
    npm run dev
    ```

---

## 🎓 Graduation Project Context

This project was developed as a final year graduation project for a **B.Sc. in Computer Science**. It aims to solve the accessibility gap in pharmaceutical information for Kurdish and Arabic speakers by leveraging modern LLM capabilities with robust fallback systems.

**Year:** 2026

---

## 📄 License

This project is for educational purposes as part of a Computer Science curriculum.