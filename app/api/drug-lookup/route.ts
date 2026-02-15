import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- 1. TARGETED AI PROMPTS ---
// These specific rules prevent the AI from summarizing "instructions" as "side effects".
const PROMPTS = {
  uses: "Summarize the 'Indications' or 'Purpose' into 3 short bullet points about what this drug treats.",
  
  sideEffects: `
    Extract only PHYSICAL SIDE EFFECTS or ADVERSE REACTIONS (e.g., rash, nausea, headache). 
    - IGNORE usage instructions like "Keep out of eyes" or "For external use only".
    - If no specific side effects are mentioned, return ["No common side effects listed"].
    - Do NOT list "Stop use" instructions as side effects.
  `,
  
  warnings: "Summarize the most critical safety warnings. Include 'Keep out of reach of children' if mentioned.",
  
  dosage: "Summarize the specific dosage instructions (amounts, frequency). If it says 'Ask a doctor', state that.",
  
  contraindications: `
    Extract conditions under which this drug should NEVER be used (e.g., "Do not use if you have...").
    - IGNORE general warnings like "Stop use if rash occurs".
    - Look for "Do not use" or "Contraindications".
    - If none found, return ["No specific contraindications listed"].
  `,
  
  interactions: `
    Extract specific DRUG-DRUG interactions (e.g., "Do not take with MAOIs").
    - IGNORE food or alcohol warnings unless specified.
    - IGNORE general usage warnings.
    - If no specific drugs are mentioned, return ["No specific drug interactions listed"].
  `
};

// Helper to find data in specific fields
function getSpecificField(item: any, keys: string[]): string {
  for (const key of keys) {
    if (item[key] && Array.isArray(item[key]) && item[key][0]) {
      return item[key][0];
    }
  }
  return "";
}

async function aiSummarize(text: string, type: keyof typeof PROMPTS) {
  // If text is totally missing/short, return specific empty messages based on type
  if (!text || text.length < 5) {
    const defaultMessages: Record<string, string> = {
      uses: "No specific uses listed.",
      sideEffects: "No common side effects listed.",
      warnings: "No specific warnings listed.",
      dosage: "No specific dosage instructions listed.",
      contraindications: "No specific restrictions listed.",
      interactions: "No specific drug interactions listed."
    };

    const emptyMsg = defaultMessages[type] || "Data not available.";
    
    return { en: [emptyMsg], ar: ["غير متوفر"], ku: ["بەردەست نییە"] };
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a medical data extractor. 
          Task: ${PROMPTS[type]}
          
          Input Text: "${text.substring(0, 2500)}"
          
          Output: Return a JSON object with keys "en", "ar", "ku". 
          Each value must be an array of 3 short strings. 
          Translate the extracted points accurately to Arabic and Kurdish.`
        },
        { role: "user", content: "Extract and format now." }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });
    return JSON.parse(completion.choices[0].message.content || "{}");
  } catch (err) {
    return { en: ["Summary unavailable."], ar: ["ملخص غير متوفر"], ku: ["کورتە بەردەست نییە"] };
  }
}

export async function POST(req: Request) {
  try {
    const { drugName } = await req.json();
    if (!drugName) return NextResponse.json({ found: false });

    const cleanName = encodeURIComponent(drugName.trim());
    
    // 1. FETCH
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

    // 3. DEFINE CONTEXTS (The Logic Fix)
    // We give the AI the "Warnings" text if specific fields are missing, 
    // BUT the new PROMPTS will ensure it filters out the garbage.
    const contextInteractions = strictInteractions || strictWarnings; 
    const contextContra = strictContra || strictWarnings;
    const contextAdverse = strictAdverse || strictWarnings;

    // 4. AI PROCESSING WITH SPECIFIC PROMPTS
    const [aiUses, aiSideEffects, aiWarnings, aiDosage, aiContra, aiInteractions] = await Promise.all([
      aiSummarize(strictUses || strictWarnings, "uses"),
      aiSummarize(contextAdverse, "sideEffects"), // Will now ignore "For external use only"
      aiSummarize(strictWarnings, "warnings"),
      aiSummarize(strictDosage, "dosage"),
      aiSummarize(contextContra, "contraindications"),
      aiSummarize(contextInteractions, "interactions") // Will now ignore "Keep out of eyes"
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
        interactions: aiInteractions
      },

      rawDetails: {
        // Clinical Data Section - Clean Display
        indications: strictUses || "See label.",
        dosage: strictDosage || "See label.",
        warnings: strictWarnings || "No specific warnings listed.",
        
        // FIX: Don't duplicate text in the raw view. 
        // If specific field is missing, just say "See Warnings" instead of pasting the whole Warning text again.
        adverseReactions: strictAdverse || (strictWarnings ? "Refer to 'Warnings & Precautions' above." : "None listed."),
        contraindications: strictContra || (strictWarnings ? "Refer to 'Warnings' section." : "None listed."),
        interactions: strictInteractions || "No specific interactions listed.",
        
        pediatric: getSpecificField(item, ['pediatric_use', 'children_only']) || "Consult a pediatrician.",
        geriatric: getSpecificField(item, ['geriatric_use']) || "Consult a doctor.",
        pregnancy: getSpecificField(item, ['pregnancy', 'pregnancy_or_breast_feeding']) || "Consult a doctor.",
        
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
    console.error("Lookup Error:", error);
    return NextResponse.json({ found: false });
  }
}