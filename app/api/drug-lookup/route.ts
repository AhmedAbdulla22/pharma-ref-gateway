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

// Temporary cache for rate-limited scenarios (shorter TTL)
const tempCache = new Map<string, any>();
const TEMP_CACHE_TTL = 2 * 60 * 1000; // 2 minutes for rate limits

// Rate limit tracking
const recentFailures = new Map<string, number>(); // Track recent API failures
const FAILURE_THRESHOLD = 5; // Skip AI after 5 recent failures

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

// Smart Translation System with Fallbacks and Rate Limit Handling
// Priority: 1. SambaNova AI (best for medical translation), 2. Groq AI
async function smartTranslate(text: string, targetLang: string): Promise<string> {
  if (!text || text.length < 5 || targetLang === 'en' || !targetLang) return text;

  const cacheKey = `translate-${targetLang}-${text.substring(0, 50)}`; // Cache key for translation
  
  // Check temporary cache first (for rate limit scenarios)
  const tempCached = tempCache.get(cacheKey);
  if (tempCached && Date.now() - tempCached.timestamp < TEMP_CACHE_TTL) {
    console.log("Using temporary cache for translation:", cacheKey);
    return tempCached.translation;
  }

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
        model: "Meta-Llama-3.1-8B-Instruct",
        temperature: 0.3,
      });
      const translation = (completion as any).choices?.[0]?.message?.content || text;
      
      // Store in temporary cache (short TTL for rate limits)
      tempCache.set(cacheKey, {
        translation,
        timestamp: Date.now()
      });
      
      return translation;
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
      const translation = completion.choices[0].message.content || text;
      
      // Store in temporary cache (short TTL for rate limits)
      tempCache.set(cacheKey, {
        translation,
        timestamp: Date.now()
      });
      
      return translation;
    } catch (err: any) {
      console.error("All translation providers failed:", err.message);
      
      // Store fallback in temporary cache
      tempCache.set(cacheKey, {
        translation: text, // Return original text instead of unavailable message
        timestamp: Date.now()
      });
    }
  }

  // Final fallback - return original text
  return text;
}

// --- 2. AI SUMMARIZER (SambaNova + Groq fallback) ---

async function aiSummarize(text: string, type: keyof typeof PROMPTS) {
  const defaultMessages: Record<string, string[]> = {
    uses: ["No specific uses listed."],
    sideEffects: ["No common side effects listed."],
    warnings: ["No specific warnings listed."],
    dosage: ["No specific dosage instructions listed."],
    contraindications: ["No specific restrictions listed."],
    interactions: ["No specific drug interactions listed."],
    pregnancy: ["Safety data not available. Consult a doctor."]
  };

  if (!text || text.length < 5) {
    return { 
      en: defaultMessages[type] || ["Data not available."], 
      ar: ["غير متوفر"], 
      ku: ["بەردەست نییە"] 
    };
  }

  // Try SambaNova AI first (skip Google AI)
  if (sambaNova) {
    try {
      console.log(`Trying SambaNova for ${type}...`);
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
        model: "Meta-Llama-3.1-8B-Instruct",
        response_format: { type: "json_object" }
      });
      return JSON.parse((completion as any).choices?.[0]?.message?.content || "{}");
    } catch (sambaError: any) {
      console.log(`SambaNova failed for ${type}, trying Groq...`, sambaError.message);
      // Track SambaNova failures
      const failures = recentFailures.get('sambanova') || 0;
      recentFailures.set('sambanova', failures + 1);
    }
  }

  // Fall back to Groq
  try {
    console.log(`Trying Groq for ${type}...`);
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
    // Track Groq failures
    const failures = recentFailures.get('groq') || 0;
    recentFailures.set('groq', failures + 1);
    
    // Return meaningful fallback data instead of unavailable message
    return { 
      en: defaultMessages[type] || ["Data not available."], 
      ar: ["غير متوفر"], 
      ku: ["بەردەست نییە"] 
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
    const targetLang = language || 'en';

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
    
    // Extract additional FDA fields
    const strictIngredients = getSpecificField(item, ['active_ingredient', 'inactive_ingredient']);
    const strictPediatric = getSpecificField(item, ['pediatric_use']);
    const strictGeriatric = getSpecificField(item, ['geriatric_use']);
    const strictRoute = getSpecificField(item, ['route']);
    const strictSupply = getSpecificField(item, ['supply', 'product_type']);
    
    // Parse ingredients
    const activeIngredient = getSpecificField(item, ['active_ingredient']) || 'Not listed';
    const inactiveIngredient = getSpecificField(item, ['inactive_ingredient']) || 'Not listed';

    // 3. DEFINE CONTEXTS
    const contextInteractions = strictInteractions || strictWarnings; 
    const contextContra = strictContra || strictWarnings;
    const contextAdverse = strictAdverse || strictWarnings;

    // 4. REDUCED AI PROCESSING: Only process key sections for English
    // Check if we're rate limited and skip AI entirely
    const isRateLimited = () => {
      // Check if we've had recent failures
      const sambaFailures = recentFailures.get('sambanova') || 0;
      const groqFailures = recentFailures.get('groq') || 0;
      
      // If either provider has failed recently, skip AI
      return sambaFailures >= FAILURE_THRESHOLD || groqFailures >= FAILURE_THRESHOLD;
    };

    // Skip AI entirely if rate limited or non-English
    if (targetLang !== 'en' || isRateLimited()) {
      // Return fallback data for non-English requests
      const fallbackData = {
        en: ["See FDA data below for detailed information."],
        ar: ["انظر إلى بيانات FDA أدناه للحصول على معلومات مفصلة."],
        ku: ["زانیاریی تفصیلی بۆ خوارەوەی زانیاری FDA ببینە."]
      };
      
      return NextResponse.json({
        found: true,
        drug: {
          // Basic info
          id: openfda.product_ndc?.[0] || cleanName,
          name: openfda.brand_name?.[0] || drugName,
          genericName: openfda.generic_name?.[0] || drugName,
          generic: openfda.generic_name?.[0] || null,
          manufacturer: openfda.manufacturer_name?.[0] || null,
          category: 'Prescription Medication',
          
          // AI Summaries - fallback only
          aiSummary: {
            uses: fallbackData,
            sideEffects: fallbackData,
            warnings: fallbackData,
            dosage: fallbackData,
            contraindications: fallbackData,
            interactions: fallbackData,
            pregnancy: fallbackData
          },
          
          // Raw Details - use original FDA data
          rawDetails: {
            indications: strictUses || "See label.",
            dosage: strictDosage || "See label.",
            warnings: strictWarnings || "No specific warnings listed.",
            adverseReactions: strictAdverse || "None listed.",
            contraindications: strictContra || "None listed.",
            interactions: strictInteractions || "No specific interactions listed.",
            pregnancy: strictPregnancy || "Consult a doctor if pregnant or nursing.",
            
            ingredients: {
              active: activeIngredient,
              inactive: inactiveIngredient
            },
            pediatric: strictPediatric || "Consult pediatric guidelines.",
            geriatric: strictGeriatric || "Consult geriatric guidelines.",
            route: strictRoute || "Not specified",
            supply: strictSupply || "Not specified"
          }
        }
      });
    }

    // Only process AI for English requests
    const aiUsesResult = aiSummarize(strictUses || strictWarnings, "uses");
    const aiSideEffectsResult = aiSummarize(contextAdverse, "sideEffects");
    const aiWarningsResult = aiSummarize(strictWarnings, "warnings");
    const aiDosageResult = aiSummarize(strictDosage, "dosage");
    
    // Skip AI for less critical sections to save tokens
    const aiContraResult = Promise.resolve({ 
      en: ["No specific restrictions listed."], 
      ar: ["غير متوفر"], 
      ku: ["بەردەست نییە"] 
    });
    const aiInteractionsResult = Promise.resolve({ 
      en: ["No specific drug interactions listed."], 
      ar: ["غير متوفر"], 
      ku: ["بەردەست نییە"] 
    });
    const aiPregnancyResult = Promise.resolve({ 
      en: ["Safety data not available. Consult a doctor."], 
      ar: ["غير متوفر"], 
      ku: ["بەردەست نییە"] 
    });
        
    // REDUCED TRANSLATIONS: Only translate essential fields
    const transIndicationsResult = smartTranslate(strictUses || "See label.", targetLang);
    const transDosageResult = smartTranslate(strictDosage || "See label.", targetLang);
    const transWarningsResult = smartTranslate(strictWarnings || "No specific warnings listed.", targetLang);
    
    // Skip translations for less critical fields
    const transAdverseResult = Promise.resolve(strictAdverse || (strictWarnings ? "Refer to 'Warnings' above." : "None listed."));
    const transContraResult = Promise.resolve(strictContra || (strictWarnings ? "Refer to 'Warnings' section." : "None listed."));
    const transInteractionsResult = Promise.resolve(strictInteractions || "No specific interactions listed.");
    const transPregnancyResult = Promise.resolve(strictPregnancy || "Consult a doctor if pregnant or nursing.");
    
    // Skip additional field translations entirely
    const transActiveResult = Promise.resolve(activeIngredient);
    const transInactiveResult = Promise.resolve(inactiveIngredient);
    const transPediatricResult = Promise.resolve(strictPediatric || "Consult pediatric guidelines.");
    const transGeriatricResult = Promise.resolve(strictGeriatric || "Consult geriatric guidelines.");
    const transRouteResult = Promise.resolve(strictRoute || "Not specified");
    const transSupplyResult = Promise.resolve(strictSupply || "Not specified");
    
    const [
      // AI Summaries (These return EN/AR/KU automatically)
      aiUses, aiSideEffects, aiWarnings, aiDosage, aiContra, aiInteractions, aiPregnancy,
        
      // Raw Data Translations (Translates only to the requested language)
      transIndications, transDosage, transWarnings, transAdverse, transContra, transInteractions, transPregnancy,
      
      // Additional field translations
      transActive, transInactive, transPediatric, transGeriatric, transRoute, transSupply
    ] = await Promise.all([
      aiUsesResult,
      aiSideEffectsResult,
      aiWarningsResult,
      aiDosageResult,
      aiContraResult,
      aiInteractionsResult,
      aiPregnancyResult,
      transIndicationsResult,
      transDosageResult,
      transWarningsResult,
      transAdverseResult,
      transContraResult,
      transInteractionsResult,
      transPregnancyResult,
      transActiveResult,
      transInactiveResult,
      transPediatricResult,
      transGeriatricResult,
      transRouteResult,
      transSupplyResult
    ]);

    const drug = {
      // Basic info
      id: openfda.product_ndc?.[0] || cleanName,
      name: openfda.brand_name?.[0] || drugName,
      genericName: openfda.generic_name?.[0] || drugName, // Add genericName for frontend
      generic: openfda.generic_name?.[0] || null,
      manufacturer: openfda.manufacturer_name?.[0] || null,
      category: 'Prescription Medication', // Default category
      
      // AI Summaries (multilingual) - nested under aiSummary
      aiSummary: {
        uses: aiUses,
        sideEffects: aiSideEffects,
        warnings: aiWarnings, 
        dosage: aiDosage,
        contraindications: aiContra,
        interactions: aiInteractions,
        pregnancy: aiPregnancy
      },
      
      // Raw Details (translated) - nested under rawDetails
      rawDetails: {
        indications: transIndications,
        dosage: transDosage,
        warnings: transWarnings,
        adverseReactions: transAdverse,
        contraindications: transContra,
        interactions: transInteractions,
        pregnancy: transPregnancy,
        
        // Additional fields required by frontend
        ingredients: {
          active: transActive,
          inactive: transInactive
        },
        pediatric: transPediatric,
        geriatric: transGeriatric,
        route: transRoute,
        supply: transSupply
      }
    };

    // Store in cache
    drugCache.set(cacheKey, {
      data: drug,
      timestamp: Date.now()
    });

    return NextResponse.json({ found: true, drug });
  } catch (error) {
    console.error('Drug lookup error:', error);
    return NextResponse.json({ found: false, error: 'Failed to lookup drug' });
  }
}