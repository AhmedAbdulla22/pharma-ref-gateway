import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';
import Groq from "groq-sdk";
import SambaNova from 'sambanova';

// Initialize all AI providers
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GOOGLE_API_KEY = process.env.GOOGLE_AI_API_KEY;
const SAMBA_NOVA_API_KEY = process.env.SAMBA_NOVA_API_KEY;

// Initialize SambaNova client
const sambaNova = SAMBA_NOVA_API_KEY ? new SambaNova({ apiKey: SAMBA_NOVA_API_KEY }) : null;

// Simple in-memory cache for drug data
const drugCache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// --- 1. TARGETED AI PROMPTS ---
const PROMPTS = {
  uses: "Summarize the 'Indications' or 'Purpose' into 3 short bullet points about what this drug treats.",
  
  sideEffects: `
    Extract only PHYSICAL SIDE EFFECTS or ADVERSE REACTIONS. 
    - IGNORE usage instructions.
    - If none mentioned, return ["No common side effects listed"].
  `,
  
  warnings: "Summarize the most critical safety warnings.",
  
  dosage: "Summarize the specific dosage instructions (amounts, frequency).",
  
  contraindications: "Extract conditions under which this drug should NEVER be used.",
  
  interactions: "Extract specific DRUG-DRUG interactions.",

  pregnancy: `
    Summarize PREGNANCY, BREASTFEEDING, and FERTILITY safety.
    - Look for terms like "Contraindicated", "Use only if clearly needed", "Category C/D/X", or "Safe".
    - Mention if it passes into breast milk.
    - If no data, return ["Consult doctor before use"].
  `
};

// --- 2. HELPERS ---

function getSpecificField(item: any, keys: string[]): string {
  for (const key of keys) {
    if (item[key] && Array.isArray(item[key]) && item[key][0]) {
      return item[key][0];
    }
  }
  return "";
}

// Smart Translation System with Fallbacks
// Priority: 1. SambaNova AI (best for medical translation), 2. Groq AI
async function smartTranslate(text: string, targetLang: string): Promise<string> {
  if (!text || text.length < 5 || targetLang === 'en' || !targetLang) return text;

  // Try SambaNova AI first
  if (sambaNova) {
    try {
      const langName = targetLang === 'ar' ? 'Modern Standard Arabic (اللغة العربية الفصحى)' : 
                       'Sorani Kurdish (کوردی سۆرانی) - written in Arabic script ONLY';
      
      const completion = await sambaNova.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a professional medical translator. Translate the following FDA drug label text into ${langName}. Maintain strict medical accuracy and professional terminology. Translate the full meaning without summarizing.`
          },
          { role: "user", content: text.substring(0, 1500) }
        ],
        model: "Meta-Llama-3.3-70B-Instruct",
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
            content: `You are a professional medical translator. Translate the following FDA drug label text into ${langName}. Maintain strict medical accuracy and professional terminology. Translate the full meaning without summarizing.`
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

  // Final fallback
  return `[Translation unavailable. Original text: ${text}]`;
}

// Google AI Summarizer
async function googleAiSummarize(text: string, type: keyof typeof PROMPTS) {
  if (!GOOGLE_API_KEY) {
    throw new Error("Google AI API key not configured");
  }

  const defaultMessages: Record<string, string> = {
    uses: "No specific uses listed.",
    sideEffects: "No common side effects listed.",
    warnings: "No specific warnings listed.",
    dosage: "No specific dosage instructions listed.",
    contraindications: "No specific restrictions listed.",
    interactions: "No specific drug interactions listed.",
    pregnancy: "Safety data not available. Consult a doctor."
  };

  if (!text || text.length < 5) {
    const emptyMsg = defaultMessages[type] || "Data not available.";
    return { 
      en: [emptyMsg], 
      ar: ["غير متوفر"], 
      ku: ["بەردەست نییە"] 
    };
  }

  const prompt = `You are a medical data extractor and translator. Task: ${PROMPTS[type]}

CRITICAL LANGUAGE REQUIREMENTS:
1. English: Standard medical English
2. Arabic: Modern Standard Arabic (اللغة العربية الفصحى)
3. Kurdish: SORANI KURDISH ONLY (كوردی سۆرانی) - written in Arabic script
   - NEVER use Kurmanji (Latin script)
   - NEVER mix dialects
   - Use consistent Sorani terminology
   - Examples: "ئازار" (pain), "دەرمان" (medicine), "پزیشك" (doctor), "نیشانە" (symptom)

Input Text: "${text.substring(0, 2500)}"
Output: Return a JSON object with keys "en", "ar", "ku". 
Each value must be an array of exactly 3 short, medically accurate strings.

Extract and translate to all three languages now.`;

    try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );

    const result = response.data.candidates[0].content.parts[0].text;
    return JSON.parse(result);
  } catch (err: any) {
    console.error("Google AI Summary failed:", err.message);
    throw err; // Re-throw to try Groq fallback
  }
}

async function aiSummarize(text: string, type: keyof typeof PROMPTS) {
  const defaultMessages: Record<string, string> = {
    uses: "No specific uses listed.",
    sideEffects: "No common side effects listed.",
    warnings: "No specific warnings listed.",
    dosage: "No specific dosage instructions listed.",
    contraindications: "No specific restrictions listed.",
    interactions: "No specific drug interactions listed.",
    pregnancy: "Safety data not available. Consult a doctor."
  };

  if (!text || text.length < 5) {
    const emptyMsg = defaultMessages[type] || "Data not available.";
    return { 
      en: [emptyMsg], 
      ar: ["غير متوفر"], 
      ku: ["بەردەست نییە"] 
    };
  }

  // Try Google AI first (if available)
  if (GOOGLE_API_KEY) {
    try {
      console.log(`Trying Google AI for ${type}...`);
      return await googleAiSummarize(text, type);
    } catch (googleError: any) {
      console.log(`Google AI failed for ${type}, trying SambaNova...`, googleError.message);
      
      // Try SambaNova AI second
      if (sambaNova) {
        try {
          const completion = await sambaNova.chat.completions.create({
            messages: [
              {
                role: "system",
                content: `You are a medical data extractor and translator. Task: ${PROMPTS[type]}
                
                CRITICAL LANGUAGE REQUIREMENTS:
                1. English: Standard medical English
                2. Arabic: Modern Standard Arabic (اللغة العربية الفصحى)
                3. Kurdish: SORANI KURDISH ONLY (كوردی سۆرانی) - written in Arabic script
                   - NEVER use Kurmanji (Latin script)
                   - NEVER mix dialects
                   - Use consistent Sorani terminology
                   - Examples: "ئازار" (pain), "دەرمان" (medicine), "پزیشك" (doctor), "نیشانە" (symptom)
                
                Input Text: "${text.substring(0, 2500)}"
                Output: Return a JSON object with keys "en", "ar", "ku". 
                Each value must be an array of exactly 3 short, medically accurate strings.`
              },
              { role: "user", content: "Extract and translate to all three languages now." }
            ],
            model: "Meta-Llama-3.3-70B-Instruct",
            response_format: { type: "json_object" }
          });
          return JSON.parse((completion as any).choices?.[0]?.message?.content || "{}");
        } catch (sambaError: any) {
          console.log(`SambaNova failed for ${type}, trying Groq...`, sambaError.message);
        }
      }
      
      // Fall back to Groq
      try {
        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `You are a medical data extractor and translator. Task: ${PROMPTS[type]}
              
              CRITICAL LANGUAGE REQUIREMENTS:
              1. English: Standard medical English
              2. Arabic: Modern Standard Arabic (اللغة العربية الفصحى)
              3. Kurdish: SORANI KURDISH ONLY (كوردی سۆرانی) - written in Arabic script
                 - NEVER use Kurmanji (Latin script)
                 - NEVER mix dialects
                 - Use consistent Sorani terminology
                 - Examples: "ئازار" (pain), "دەرمان" (medicine), "پزیشك" (doctor), "نیشانە" (symptom)
              
              Input Text: "${text.substring(0, 2500)}"
              Output: Return a JSON object with keys "en", "ar", "ku". 
              Each value must be an array of exactly 3 short, medically accurate strings.`
            },
            { role: "user", content: "Extract and translate to all three languages now." }
          ],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" }
        });
        return JSON.parse(completion.choices[0].message.content || "{}");
      } catch (err: any) {
        console.error(`All providers failed for ${type}`, err.message);
        return { 
          en: ["All AI services unavailable."], 
          ar: ["جميع خدمات الذكاء الاصطناعي غير متاحة."], 
          ku: ["هەموو خزمەتگوزاریەکانی هوشی دەستکرد ناچالاكن."] 
        };
      }
    }
  }

  // Try SambaNova AI first if Google AI not available
  if (sambaNova) {
    try {
      const completion = await sambaNova.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a medical data extractor and translator. Task: ${PROMPTS[type]}
            
            CRITICAL LANGUAGE REQUIREMENTS:
            1. English: Standard medical English
            2. Arabic: Modern Standard Arabic (اللغة العربية الفصحى)
            3. Kurdish: SORANI KURDISH ONLY (كوردی سۆرانی) - written in Arabic script
               - NEVER use Kurmanji (Latin script)
               - NEVER mix dialects
               - Use consistent Sorani terminology
               - Examples: "ئازار" (pain), "دەرمان" (medicine), "پزیشك" (doctor), "نیشانە" (symptom)
            
            Input Text: "${text.substring(0, 2500)}"
            Output: Return a JSON object with keys "en", "ar", "ku". 
            Each value must be an array of exactly 3 short, medically accurate strings.`
          },
          { role: "user", content: "Extract and translate to all three languages now." }
        ],
        model: "Meta-Llama-3.3-70B-Instruct",
        response_format: { type: "json_object" }
      });
      return JSON.parse((completion as any).choices?.[0]?.message?.content || "{}");
    } catch (sambaError: any) {
      console.log(`SambaNova failed for ${type}, trying Groq...`, sambaError.message);
    }
  }

  // Only Groq available - use original logic
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a medical data extractor and translator. Task: ${PROMPTS[type]}
          
          CRITICAL LANGUAGE REQUIREMENTS:
          1. English: Standard medical English
          2. Arabic: Modern Standard Arabic (اللغة العربية الفصحى)
          3. Kurdish: SORANI KURDISH ONLY (كوردی سۆرانی) - written in Arabic script
             - NEVER use Kurmanji (Latin script)
             - NEVER mix dialects
             - Use consistent Sorani terminology
             - Examples: "ئازار" (pain), "دەرمان" (medicine), "پزیشك" (doctor), "نیشانە" (symptom)
          
          Input Text: "${text.substring(0, 2500)}"
          Output: Return a JSON object with keys "en", "ar", "ku". 
          Each value must be an array of exactly 3 short, medically accurate strings.`
        },
        { role: "user", content: "Extract and translate to all three languages now." }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });
    return JSON.parse(completion.choices[0].message.content || "{}");
  } catch (err: any) {
    console.error(`All providers failed for ${type}`, err.message);
    return { 
      en: ["All AI services unavailable."], 
      ar: ["جميع خدمات الذكاء الاصطناعي غير متاحة."], 
      ku: ["هەموو خزمەتگوزاریەکانی هوشی دەستکرد ناچالاكن."] 
    };
  }
}

// --- 3. MAIN API HANDLER ---
export async function POST(req: Request) {
  try {
    // Now receiving 'language' from the client
    const { drugName, language } = await req.json(); 
    
    if (!drugName) return NextResponse.json({ found: false });
    const cleanName = encodeURIComponent(drugName.trim());

    // Check cache first
    const cacheKey = `${cleanName}-${language || 'en'}`;
    const cached = drugCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ found: true, drug: cached.data });
    }

    // 1. FETCH FROM FDA
    const fdaUrl = `https://api.fda.gov/drug/label.json?search=(openfda.brand_name.exact:"${cleanName}"+OR+openfda.generic_name.exact:"${cleanName}")&limit=1`;
    const agent = new https.Agent({ rejectUnauthorized: false, family: 4 });
    const response = await axios.get(fdaUrl, { timeout: 20000, httpsAgent: agent });
    
    if (!response.data.results?.[0]) return NextResponse.json({ found: false });

    const item = response.data.results[0];
    const openfda = item.openfda || {};

    // 2. EXTRACT RAW DATA
    const strictContra = getSpecificField(item, ['contraindications', 'do_not_use']);
    const strictInteractions = getSpecificField(item, ['drug_interactions', 'drug_interactions_table']);
    const strictAdverse = getSpecificField(item, ['adverse_reactions', 'adverse_reactions_table', 'side_effects']);
    const strictWarnings = getSpecificField(item, ['boxed_warning', 'warnings', 'warnings_and_precautions', 'precautions']);
    const strictDosage = getSpecificField(item, ['dosage_and_administration', 'dosage_and_administration_table', 'directions']);
    const strictUses = getSpecificField(item, ['indications_and_usage', 'purpose', 'usage']);
    const strictPregnancy = getSpecificField(item, ['pregnancy', 'pregnancy_or_breast_feeding', 'nursing_mothers', 'labor_and_delivery']);

    // 3. DEFINE CONTEXTS
    const contextInteractions = strictInteractions || strictWarnings; 
    const contextContra = strictContra || strictWarnings;
    const contextAdverse = strictAdverse || strictWarnings;

    // 4. PARALLEL PROCESSING: SUMMARIES + TRANSLATIONS
    const targetLang = language || 'en';

    const [
      // AI Summaries (These return EN/AR/KU automatically)
      aiUses, aiSideEffects, aiWarnings, aiDosage, aiContra, aiInteractions, aiPregnancy,
      
      // Raw Data Translations (Translates only to the requested language)
      transIndications, transDosage, transWarnings, transAdverse, transContra, transInteractions, transPregnancy
    ] = await Promise.all([
      // Summaries
      aiSummarize(strictUses || strictWarnings, "uses"),
      aiSummarize(contextAdverse, "sideEffects"),
      aiSummarize(strictWarnings, "warnings"),
      aiSummarize(strictDosage, "dosage"),
      aiSummarize(contextContra, "contraindications"),
      aiSummarize(contextInteractions, "interactions"),
      aiSummarize(strictPregnancy, "pregnancy"),
      
      // Live Translations
      smartTranslate(strictUses || "See label.", targetLang),
      smartTranslate(strictDosage || "See label.", targetLang),
      smartTranslate(strictWarnings || "No specific warnings listed.", targetLang),
      smartTranslate(strictAdverse || (strictWarnings ? "Refer to 'Warnings' above." : "None listed."), targetLang),
      smartTranslate(strictContra || (strictWarnings ? "Refer to 'Warnings' section." : "None listed."), targetLang),
      smartTranslate(strictInteractions || "No specific interactions listed.", targetLang),
      smartTranslate(strictPregnancy || "Consult a doctor if pregnant or nursing.", targetLang)
    ]);