import { NextResponse } from 'next/server';
import Groq from "groq-sdk";
import SambaNova from 'sambanova';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const sambaNova = process.env.SAMBA_NOVA_API_KEY ? new SambaNova({ apiKey: process.env.SAMBA_NOVA_API_KEY }) : null;

// Smart Translation System with Fallbacks
// Priority: 1. SambaNova AI (best for medical translation), 2. Groq AI
async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || targetLang === 'en') return text;
  
  // Try SambaNova AI first
  if (sambaNova) {
    try {
      const langName = targetLang === 'ar' ? 'Modern Standard Arabic (اللغة العربية الفصحى)' : 
                       'Sorani Kurdish (کوردی سۆرانی) - written in Arabic script ONLY';
      
      const completion = await sambaNova.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a professional medical translator. Translate following text into ${langName}. Maintain medical accuracy and professional terminology.`
          },
          { role: "user", content: text.substring(0, 1500) }
        ],
        model: "Meta-Llama-3.1-8B-Instruct",
        temperature: 0.3,
      });
      return (completion as any).choices?.[0]?.message?.content || text;
    } catch (err: any) {
      console.log("SambaNova translation failed, trying Groq...", err.message);
    }
  }

  // Fallback to Groq AI
  if (process.env.GROQ_API_KEY) {
    try {
      const langName = targetLang === 'ar' ? 'Modern Standard Arabic (اللغة العربية الفصحى)' : 
                       'Sorani Kurdish (کوردی سۆرانی) - written in Arabic script ONLY';
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a professional medical translator. Translate following text into ${langName}. Maintain medical accuracy and professional terminology.`
          },
          { role: "user", content: text.substring(0, 1500) }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
      });
      return completion.choices[0].message.content || text;
    } catch (err: any) {
      console.error("All translation providers failed:", err.message);
    }
  }

  // Fallback to original text
  return text;
}

export async function POST(req: Request) {
  try {
    const { message, drugName, context } = await req.json();

    if (!message || !drugName) {
      return NextResponse.json({ reply: "I need a valid question." }, { status: 400 });
    }

    // Detect language from message
    const detectLanguage = (text: string): string => {
      const arabicRegex = /[\u0600-\u06FF]/;
      const kurdishRegex = /[\u0750-\u077F\u0840-\u085F]/;
      
      if (arabicRegex.test(text)) return 'ar';
      if (kurdishRegex.test(text)) return 'ku';
      return 'en';
    };

    const userLanguage = detectLanguage(message);

    // System Prompt: Defines the AI's persona and strict safety rules
    const systemPrompt = `
      You are an expert clinical pharmacist assistant. 
      You are currently answering questions about the drug: "${drugName}".
      
      CONTEXT (FDA LABEL DATA):
      ${JSON.stringify(context).substring(0, 6000)} 
      
      RULES:
      1. Answer ONLY based on the provided FDA context. If the answer is not in the data, say "I cannot find that information in the official label."
      2. Be concise, professional, and empathetic.
      3. If asked about personal medical advice (e.g., "Should I take this?"), refuse and tell them to consult a doctor.
      4. Keep answers short (under 3 sentences) unless asked for details.
      5. Always respond in English first, then it will be translated.
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3, // Low temperature for factual accuracy
      max_tokens: 300
    });

    const englishReply = completion.choices[0].message.content || "";
    
    // Translate the response if needed
    const translatedReply = userLanguage === 'en' 
      ? englishReply 
      : await translateText(englishReply, userLanguage);

    return NextResponse.json({ 
      reply: translatedReply 
    });

  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ reply: "Sorry, I am having trouble connecting to the server." }, { status: 500 });
  }
}