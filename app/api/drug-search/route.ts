import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

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
    return NextResponse.json({ drugs: mapFdaResults(response.data.results) });
  } catch (error: any) {
    // Silent fail for 404 (Not Found)
    if (error.response?.status === 404) {
      return NextResponse.json({ drugs: [] });
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

    return {
      id: id,
      name: tradeName,
      scientificName: shortGeneric, // Using cleaned name
      fullScientificName: fullGeneric, // Keep full name if needed for tooltip
      category: category,
      description: { 
        en: `Class: ${category} | Form: ${dosageForm}`,
        ar: `الصنف: ${category} | الشكل: ${dosageForm}`,
        ku: `پۆل: ${category} | شێوە: ${dosageForm}`
      },
      uses: { en: ["View Details >"], ar: ["عرض التفاصيل >"], ku: ["بینینی وردەکاری >"] },
      sideEffects: { en: [], ar: [], ku: [] },
      warnings: { en: [], ar: [], ku: [] },
      dosage: { en: dosageForm, ar: dosageForm, ku: dosageForm },
      qrCode: `FDA-${id}`
    };
  });
}