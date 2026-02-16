import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

// NEW: Live Translator for Raw Data
async function aiTranslate(text: string, targetLang: string) {
  // 1. If English, empty, or short, return original text immediately (Saves tokens/time)
  if (!text || text.length < 5 || targetLang === 'en' || !targetLang) return text;

  const langName = targetLang === 'ar' ? 'Modern Standard Arabic (اللغة العربية الفصحى)' : 
                   'Sorani Kurdish (کوردی سۆرانی) - written in Arabic script ONLY';

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a professional medical translator. 
          Task: Translate the following FDA drug label text into ${langName}.
          
          CRITICAL REQUIREMENTS:
          ${targetLang === 'ku' ? `
          - KURDISH: Use SORANI KURDISH ONLY (کوردی سۆرانی)
          - Write in Arabic script, NEVER Latin script
          - NEVER use Kurmanji terms or spellings
          - Use consistent Sorani medical terminology
          - Examples: "ئازار" (pain), "دەرمان" (medicine), "پزیشک" (doctor), "نیشانە" (symptom), "دۆز" (dose)
          ` : `
          - ARABIC: Use Modern Standard Arabic only
          - Use proper medical terminology
          `}
          
          Guidelines:
          1. Maintain strict medical accuracy
          2. Use professional medical terminology
          3. Keep original formatting (paragraphs, line breaks)
          4. Do NOT summarize; translate the full meaning
          5. Be consistent with terminology throughout`
        },
        { role: "user", content: text.substring(0, 1500) } // Limit chars to prevent timeouts
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
    });
    return completion.choices[0].message.content || text;
  } catch (err) {
    console.error("Translation failed, returning English:", err);
    return text; // Fallback to English on error
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

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a medical data extractor and translator. Task: ${PROMPTS[type]}
          
          CRITICAL LANGUAGE REQUIREMENTS:
          1. English: Standard medical English
          2. Arabic: Modern Standard Arabic (اللغة العربية الفصحى)
          3. Kurdish: SORANI KURDISH ONLY (کوردی سۆرانی) - written in Arabic script
             - NEVER use Kurmanji (Latin script)
             - NEVER mix dialects
             - Use consistent Sorani terminology
             - Examples: "ئازار" (pain), "دەرمان" (medicine), "پزیشک" (doctor), "نیشانە" (symptom)
          
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
  } catch (err) {
    return { 
      en: ["Summary unavailable."], 
      ar: ["ملخص غير متوفر"], 
      ku: ["کورتە بەردەست نییە"] 
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
      aiTranslate(strictUses || "See label.", targetLang),
      aiTranslate(strictDosage || "See label.", targetLang),
      aiTranslate(strictWarnings || "No specific warnings listed.", targetLang),
      aiTranslate(strictAdverse || (strictWarnings ? "Refer to 'Warnings' above." : "None listed."), targetLang),
      aiTranslate(strictContra || (strictWarnings ? "Refer to 'Warnings' section." : "None listed."), targetLang),
      aiTranslate(strictInteractions || "No specific interactions listed.", targetLang),
      aiTranslate(strictPregnancy || "Consult a doctor if pregnant or nursing.", targetLang)
    ]);

    const drug = {
      id: item.id,
      name: openfda.brand_name?.[0] || drugName,
      genericName: openfda.generic_name?.[0] || 'N/A',
      category: openfda.pharm_class_epc?.[0] || 'General',
      
      aiSummary: {
        uses: aiUses,
        sideEffects: aiSideEffects,
        warnings: aiWarnings,
        dosage: aiDosage,
        contraindications: aiContra,
        interactions: aiInteractions,
        pregnancy: aiPregnancy 
      },

      rawDetails: {
        // These fields now contain the TEXT IN THE USER'S LANGUAGE
        indications: transIndications,
        dosage: transDosage,
        warnings: transWarnings,
        adverseReactions: transAdverse,
        contraindications: transContra,
        interactions: transInteractions,
        pregnancy: transPregnancy,
        
        // Static fields (usually short enough not to need complex translation, or you can add it if needed)
        pediatric: getSpecificField(item, ['pediatric_use', 'children_only']) || "Consult a pediatrician.",
        geriatric: getSpecificField(item, ['geriatric_use']) || "Consult a doctor.",
        
        ingredients: {
            active: getSpecificField(item, ['active_ingredient']),
            inactive: getSpecificField(item, ['inactive_ingredient']) || "Check label for allergens"
        },
        supply: getSpecificField(item, ['how_supplied']) || "N/A",
        route: openfda.route?.[0] || "Oral"
      },
      qrCode: `FDA-${item.id}`
    };

    return NextResponse.json({ found: true, drug });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ found: false });
  }
}