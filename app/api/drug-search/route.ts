import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';
import { findDrugTranslation, getSuggestedDrugs } from '@/lib/drug-translations';

export async function POST(req: Request) {
  let query = "";
  
  try {
    const body = await req.json();
    query = body.query || "";
  } catch (e) {
    return NextResponse.json({ drugs: [] });
  }

  if (!query.trim()) {
    return NextResponse.json({ drugs: [] });
  }

  const cleanQuery = encodeURIComponent(query.trim());
  // Using wildcard (*) to find partial matches
  const fdaUrl = `https://api.fda.gov/drug/label.json?search=(openfda.brand_name:${cleanQuery}*+OR+openfda.generic_name:${cleanQuery}*)&limit=20`;

  const agent = new https.Agent({  
    rejectUnauthorized: false, 
    family: 4 
  });

  try {
    const response = await axios.get(fdaUrl, {
      timeout: 15000,
      httpsAgent: agent,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    const results = response.data.results;
    if (results && results.length > 0) {
      return NextResponse.json({ drugs: mapFdaResults(results) });
    }
    
    // If no results found, try to find a translation
    const translation = findDrugTranslation(query);
    if (translation && translation !== query.toLowerCase()) {
      // Search with the translated name
      const translatedQuery = encodeURIComponent(translation.trim());
      const translatedUrl = `https://api.fda.gov/drug/label.json?search=(openfda.brand_name:${translatedQuery}*+OR+openfda.generic_name:${translatedQuery}*)&limit=20`;
      
      try {
        const translatedResponse = await axios.get(translatedUrl, {
          timeout: 15000,
          httpsAgent: agent,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        const translatedResults = translatedResponse.data.results;
        if (translatedResults && translatedResults.length > 0) {
          // Add translation info to the results
          const drugs = mapFdaResults(translatedResults);
          return NextResponse.json({ 
            drugs,
            translationInfo: {
              original: query,
              translated: translation,
              message: `Showing results for "${translation}" (US name for "${query}")`
            }
          });
        }
      } catch (translationError) {
        // If translation search fails, continue to suggestions
        console.log('Translation search failed:', translationError);
      }
    }
    
    // If still no results, provide suggestions
    const suggestions = getSuggestedDrugs(query);
    return NextResponse.json({ 
      drugs: [],
      suggestions,
      message: suggestions.length > 0 ? "No exact match found. Try these suggestions:" : "No medications found. Please check the spelling or try a different search term."
    });
    
  } catch (error: any) {
    // Silent fail for 404 (Not Found)
    if (error.response?.status === 404) {
      // Try translation fallback for 404 as well
      const translation = findDrugTranslation(query);
      if (translation && translation !== query.toLowerCase()) {
        const translatedQuery = encodeURIComponent(translation.trim());
        const translatedUrl = `https://api.fda.gov/drug/label.json?search=(openfda.brand_name:${translatedQuery}*+OR+openfda.generic_name:${translatedQuery}*)&limit=20`;
        
        try {
          const translatedResponse = await axios.get(translatedUrl, {
            timeout: 15000,
            httpsAgent: agent,
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          
          const translatedResults = translatedResponse.data.results;
          if (translatedResults && translatedResults.length > 0) {
            const drugs = mapFdaResults(translatedResults);
            return NextResponse.json({ 
              drugs,
              translationInfo: {
                original: query,
                translated: translation,
                message: `Showing results for "${translation}" (US name for "${query}")`
              }
            });
          }
        } catch (translationError) {
          console.log('Translation search failed for 404:', translationError);
        }
      }
      
      const suggestions = getSuggestedDrugs(query);
      return NextResponse.json({ 
        drugs: [],
        suggestions,
        message: suggestions.length > 0 ? "No exact match found. Try these suggestions:" : "No medications found. Please check the spelling or try a different search term."
      });
    }
    console.error(`[API] Connection Error: ${error.message}`);
    return NextResponse.json({ drugs: [] });
  }
}

// --- HELPER: Get the best possible category ---
function getBestCategory(openfda: any) {
  // 1. Try Established Pharmacologic Class (Best)
  if (openfda.pharm_class_epc?.length) return openfda.pharm_class_epc[0];
  
  // 2. Try Physiologic Effect (e.g., "Increased Histamine Release")
  if (openfda.pharm_class_pe?.length) return openfda.pharm_class_pe[0];
  
  // 3. Try Mechanism of Action (e.g., "Histamine H1 Receptor Antagonist")
  if (openfda.pharm_class_moa?.length) return openfda.pharm_class_moa[0];
  
  // 4. Fallback to Product Type (e.g., "Human OTC Drug")
  if (openfda.product_type?.length) {
    // Clean up "HUMAN OTC DRUG" -> "OTC Medication"
    return openfda.product_type[0]
      .replace("HUMAN ", "")
      .replace(" DRUG", "")
      .toLowerCase()
      .replace(/\b\w/g, (l: string) => l.toUpperCase()); // Title Case
  }

  return "General Medication";
}

// --- HELPER: Clean up long text ---
function cleanString(str: string, maxLength: number = 50) {
  if (!str) return "N/A";
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + "...";
}

// 1. Add this translation map at the bottom of the file
const CATEGORY_TRANSLATIONS: any = {
  "General Medication": { ar: "دواء عام", ku: "دەرمانی گشتی" },
  "Otc Medication": { ar: "دواء بدون وصفة", ku: "دەرمانی بێ ڕەچەتە" },
  "Prescription": { ar: "دواء بوصفة طبية", ku: "دەرمانی بە ڕەچەتە" },
  "Human Otc Drug": { ar: "دواء بشري (بدون وصفة)", ku: "دەرمانی مرۆیی (بێ ڕەچەتە)" },
  "Human Prescription Drug": { ar: "دواء بشري (وصفة)", ku: "دەرمانی مرۆیی (بە ڕەچەتە)" },
  // Add common mechanisms if you want
  "Histamine H1 Receptor Antagonist": { ar: "مضاد الهيستامين", ku: "دژە هیستامین" },
  "Non-Steroidal Anti-Inflammatory Drug": { ar: "مضاد التهاب غير ستيرويدي", ku: "دژە هەوکردنی ناستیرۆیدی" }
};

function getLocalizedCategory(englishCat: string) {
  const trans = CATEGORY_TRANSLATIONS[englishCat];
  return {
    en: englishCat,
    ar: trans?.ar || englishCat, // Fallback to English if translation missing
    ku: trans?.ku || englishCat
  };
}

function mapFdaResults(results: any[]) {
  return results.map((item: any, index: number) => {
    const openfda = item.openfda || {};
    
    const id = item.id || openfda.application_number?.[0] || `fda-${index}`;
    
    // Brand Name
    const tradeName = openfda.brand_name?.[0] || openfda.generic_name?.[0] || 'Unknown';
    
    // Generic Name - Truncated to prevent UI overflow
    const fullGeneric = openfda.generic_name?.[0] || 'N/A';
    const shortGeneric = cleanString(fullGeneric, 40); 

    // Smart Category
    const category = getBestCategory(openfda);

    // Smart Dosage Form (Fallback to Route if Form is missing)
    // e.g. If "Tablet" is missing, use "Oral"
    const dosageForm = openfda.dosage_form?.[0] || openfda.route?.[0] || 'N/A';

    // Get the English Category first
    const englishCategory = getBestCategory(openfda);
    
    // Get the Localized Object
    const categoryObj = getLocalizedCategory(englishCategory);

    return {
      id: id,
      name: tradeName,
      scientificName: shortGeneric, // Using cleaned name
      fullScientificName: fullGeneric, // Keep full name if needed for tooltip
      category: englishCategory,
      description: { 
        en: `Class: ${categoryObj.en} | Form: ${dosageForm}`,
        ar: `الصنف: ${categoryObj.ar} | الشكل: ${dosageForm}`,
        ku: `پۆل: ${categoryObj.ku} | شێوە: ${dosageForm}`
      },
      uses: { en: ["View Details >"], ar: ["عرض التفاصيل >"], ku: ["بینینی وردەکاری >"] },
      sideEffects: { en: [], ar: [], ku: [] },
      warnings: { en: [], ar: [], ku: [] },
      dosage: { en: dosageForm, ar: dosageForm, ku: dosageForm }
    };
  });
}