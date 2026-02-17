import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

// Similar drug categories and classes for finding alternatives
const DRUG_ALTERNATIVES: Record<string, string[]> = {
  // Pain relievers
  "acetaminophen": ["ibuprofen", "naproxen", "aspirin", "diclofenac"],
  "ibuprofen": ["acetaminophen", "naproxen", "aspirin", "diclofenac"],
  "naproxen": ["ibuprofen", "acetaminophen", "aspirin", "diclofenac"],
  "aspirin": ["acetaminophen", "ibuprofen", "naproxen", "clopidogrel"],
  "diclofenac": ["ibuprofen", "naproxen", "acetaminophen", "celecoxib"],
  
  // Antibiotics
  "amoxicillin": ["penicillin", "erythromycin", "clarithromycin", "azithromycin"],
  "penicillin": ["amoxicillin", "erythromycin", "clarithromycin", "azithromycin"],
  "erythromycin": ["azithromycin", "clarithromycin", "amoxicillin", "penicillin"],
  "azithromycin": ["erythromycin", "clarithromycin", "amoxicillin", "doxycycline"],
  "clarithromycin": ["azithromycin", "erythromycin", "amoxicillin", "penicillin"],
  "doxycycline": ["azithromycin", "erythromycin", "minocycline", "tetracycline"],
  "ciprofloxacin": ["levofloxacin", "moxifloxacin", "ofloxacin", "norfloxacin"],
  "trimethoprim": ["sulfamethoxazole", "nitrofurantoin", "fosfomycin", "amoxicillin"],
  
  // Cardiovascular
  "lisinopril": ["ramipril", "enalapril", "benazepril", "losartan"],
  "ramipril": ["lisinopril", "enalapril", "benazepril", "losartan"],
  "enalapril": ["lisinopril", "ramipril", "benazepril", "losartan"],
  "losartan": ["valsartan", "irbesartan", "candesartan", "lisinopril"],
  "valsartan": ["losartan", "irbesartan", "candesartan", "olmesartan"],
  "atenolol": ["metoprolol", "propranolol", "bisoprolol", "carvedilol"],
  "metoprolol": ["atenolol", "propranolol", "bisoprolol", "carvedilol"],
  "amlodipine": ["nifedipine", "diltiazem", "verapamil", "felodipine"],
  "simvastatin": ["atorvastatin", "rosuvastatin", "pravastatin", "lovastatin"],
  "atorvastatin": ["simvastatin", "rosuvastatin", "pravastatin", "lovastatin"],
  
  // Diabetes
  "metformin": ["glipizide", "glyburide", "pioglitazone", "sitagliptin"],
  "glipizide": ["glyburide", "glimepiride", "metformin", "sitagliptin"],
  "glyburide": ["glipizide", "glimepiride", "metformin", "sitagliptin"],
  "glimepiride": ["glipizide", "glyburide", "metformin", "sitagliptin"],
  
  // Respiratory
  "albuterol": ["levalbuterol", "pirbuterol", "terbutaline", "salmeterol"],
  "fluticasone": ["budesonide", "beclomethasone", "mometasone", "triamcinolone"],
  "beclomethasone": ["fluticasone", "budesonide", "mometasone", "triamcinolone"],
  "budesonide": ["fluticasone", "beclomethasone", "mometasone", "triamcinolone"],
  
  // Stomach/GI
  "omeprazole": ["esomeprazole", "lansoprazole", "pantoprazole", "rabeprazole"],
  "lansoprazole": ["omeprazole", "esomeprazole", "pantoprazole", "rabeprazole"],
  "esomeprazole": ["omeprazole", "lansoprazole", "pantoprazole", "rabeprazole"],
  
  // Mental Health
  "sertraline": ["fluoxetine", "paroxetine", "escitalopram", "citalopram"],
  "fluoxetine": ["sertraline", "paroxetine", "escitalopram", "citalopram"],
  "paroxetine": ["sertraline", "fluoxetine", "escitalopram", "citalopram"],
  "escitalopram": ["sertraline", "fluoxetine", "paroxetine", "citalopram"],
  "citalopram": ["sertraline", "fluoxetine", "paroxetine", "escitalopram"],
  "diazepam": ["lorazepam", "alprazolam", "clonazepam", "temazepam"],
  "lorazepam": ["diazepam", "alprazolam", "clonazepam", "temazepam"],
  "alprazolam": ["diazepam", "lorazepam", "clonazepam", "temazepam"],
  "amitriptyline": ["nortriptyline", "imipramine", "desipramine", "venlafaxine"],
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { drugName, category, limit = 8 } = body;

    if (!drugName) {
      return NextResponse.json({ similar: [], alternatives: [] });
    }

    const agent = new https.Agent({  
      rejectUnauthorized: false, 
      family: 4 
    });

    // Get alternatives from our mapping
    const alternatives = DRUG_ALTERNATIVES[drugName.toLowerCase()] || [];
    
    // Search for similar drugs by category/class
    let similar: any[] = [];
    
    if (category) {
      // Search for drugs in the same category - try multiple query formats
      const categoryQuery = category.trim().replace(/\s+/g, '+');
      const categoryUrls = [
        `https://api.fda.gov/drug/label.json?search=openfda.pharm_class_epc:${categoryQuery}&limit=${limit}`,
        `https://api.fda.gov/drug/label.json?search=openfda.pharm_class_epc.exact:"${encodeURIComponent(category)}"&limit=${limit}`,
        `https://api.fda.gov/drug/label.json?search=pharm_class_epc:${categoryQuery}&limit=${limit}`
      ];
      
      console.log('Category search URLs:', categoryUrls);
      
      for (const categoryUrl of categoryUrls) {
        try {
          console.log('Trying URL:', categoryUrl);
          const categoryResponse = await axios.get(categoryUrl, {
            timeout: 15000,
            httpsAgent: agent,
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          
          if (categoryResponse.data.results) {
            similar = categoryResponse.data.results
              .filter((result: any) => 
                result.openfda?.brand_name?.[0] !== drugName && 
                result.openfda?.generic_name?.[0] !== drugName
              )
              .slice(0, limit)
              .map(mapFdaResult);
            console.log('Category search successful, found', similar.length, 'results');
          }
        } catch (categoryError: any) {
          console.log('Category search failed for URL:', categoryUrl, 'Error:', categoryError.message);
          continue; // Try next URL
        }
      }
    }

    // If we don't have enough similar drugs, search by generic name patterns
    if (similar.length < 3) {
      const genericName = drugName.toLowerCase();
      
      // Try to find drugs with similar generic names
      const patterns = [
        genericName.split(' ')[0], // First word
        genericName.replace(/\d+mg/g, '').trim(), // Remove dosage
        genericName.replace(/\s+/g, '*'), // Wildcard search
      ];

      for (const pattern of patterns) {
        if (similar.length >= limit) break;
        
        const patternQuery = pattern.trim().replace(/\s+/g, '%20');
        const patternUrl = `https://api.fda.gov/drug/label.json?search=(openfda.generic_name:${patternQuery}*)&limit=${limit - similar.length}`;
        
        try {
          const patternResponse = await axios.get(patternUrl, {
            timeout: 15000,
            httpsAgent: agent,
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          
          if (patternResponse.data.results) {
            const patternResults = patternResponse.data.results
              .filter((result: any) => 
                result.openfda?.brand_name?.[0] !== drugName && 
                result.openfda?.generic_name?.[0] !== drugName
              )
              .map(mapFdaResult)
              .filter((drug: any) => !similar.some(s => s.id === drug.id));
            
            similar = [...similar, ...patternResults];
          }
        } catch (patternError) {
          console.log('Pattern search failed:', patternError);
        }
      }
    }

    // Search for alternatives in FDA database
    const alternativeResults: any[] = [];
    for (const alt of alternatives.slice(0, 4)) { // Limit to 4 alternatives
      const altQuery = alt.trim().replace(/\s+/g, '%20');
      const altUrl = `https://api.fda.gov/drug/label.json?search=(openfda.brand_name:${altQuery}+OR+openfda.generic_name:${altQuery})&limit=1`;
      
      try {
        const altResponse = await axios.get(altUrl, {
          timeout: 10000,
          httpsAgent: agent,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        if (altResponse.data.results?.[0]) {
          alternativeResults.push(mapFdaResult(altResponse.data.results[0]));
        }
      } catch (altError) {
        console.log(`Alternative search failed for ${alt}:`, altError);
      }
    }

    return NextResponse.json({
      similar: similar.slice(0, limit),
      alternatives: alternativeResults.slice(0, 4)
    });

  } catch (error: any) {
    console.error('Similar drugs API error:', error);
    return NextResponse.json({ similar: [], alternatives: [] });
  }
}

function mapFdaResult(item: any) {
  const openfda = item.openfda || {};
  
  return {
    id: item.id,
    name: openfda.brand_name?.[0] || openfda.generic_name?.[0] || 'Unknown',
    scientificName: openfda.generic_name?.[0] || 'N/A',
    category: openfda.pharm_class_epc?.[0] || 'General',
    dosage: openfda.route?.[0] || 'Oral'
  };
}
