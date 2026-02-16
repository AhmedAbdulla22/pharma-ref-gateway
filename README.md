# 💊 PharmRef Gateway (بوابة المرجع الصيدلاني)

**PharmRef Gateway** is a modern, AI-powered pharmaceutical reference platform designed to provide quick, reliable, and multilingual drug information. Built specifically for the healthcare context in Iraq, it supports **English, Arabic, and Kurdish (Sorani)**, featuring a built-in drug interaction checker.

🚀 **Live Demo:** [pharma-ref-gateway.vercel.app](https://pharma-ref-gateway.vercel.app)

---

## ✨ Key Features

* **🔍 AI-Powered Search:** Intelligent drug retrieval using **Groq (Llama 3.3-70B)** for high-speed, medically accurate data.
* **🌍 Triple-Language Support:** Full RTL (Right-to-Left) support for Arabic and Kurdish, alongside English.
* **🛡️ Interaction Checker:** Analyze potential risks between multiple medications with severity levels (Critical, Moderate, Safe).
* **🌓 Adaptive UI:** Clinical-grade "Medical Blue" theme with full Dark Mode support using OKLCH color space.
* **📱 Mobile First:** Optimized for use on-the-go by pharmacists and medical students.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
* **Styling:** [Tailwind CSS 4.1.9](https://tailwindcss.com/)
* **UI Components:** [Shadcn UI](https://ui.shadcn.com/) with Radix UI primitives
* **Typography:** [Vazirmatn](https://fonts.google.com/specimen/Vazirmatn) (Optimized for Kurdish/Arabic readability)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Theme Management:** [next-themes](https://github.com/pacocoursey/next-themes)

### Backend & AI
* **AI Engine:** [Groq Cloud](https://groq.com/) (Llama-3.3-70b-versatile)
* **AI SDK:** [Vercel AI SDK](https://sdk.vercel.ai/) v6.0.35
* **API Layer:** Next.js Route Handlers (Serverless)
* **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
* **Deployment:** [Vercel](https://vercel.com/) with Analytics

---

## 📐 Architecture & Logic

The project implements a **Defensive Data Layer** to handle the non-deterministic nature of AI outputs:

1.  **Sanitization:** Every AI response is passed through a server-side "Sanitizer" that enforces schema integrity (ensuring no missing keys or undefined objects).
2.  **Multilingual Mapping:** Dynamic translation fallbacks that ensure the UI remains populated even if specific language data is missing from the primary model output.
3.  **RTL Engine:** A robust layout system that adjusts text alignment, icon direction, and navigation flow based on the selected locale.



---

## 🚀 Getting Started

### Prerequisites
* Node.js 18.x or later
* A Groq API Key
* A Supabase project (for database features)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/pharma-ref-gateway.git](https://github.com/your-username/pharma-ref-gateway.git)
    cd pharma-ref-gateway
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root:
    ```env
    GROQ_API_KEY=your_groq_api_key_here
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

---

## 🎓 Graduation Project Context

This project was developed as a final year graduation project for a **B.Sc. in Computer Science**. It aims to solve the accessibility gap in pharmaceutical information for Kurdish and Arabic speakers by leveraging modern LLM capabilities.

**Vibe-Coders:**
- Ahmed Abdullah Ahmed
- Bawan Sameer Ibrahim
**Year:** 2026

---

## 📄 License

This project is for educational purposes as part of a Computer Science curriculum.