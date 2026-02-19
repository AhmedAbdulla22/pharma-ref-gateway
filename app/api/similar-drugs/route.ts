import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

const DRUG_ALTERNATIVES: Record<string, string[]> = {
  "acetaminophen": ["ibuprofen", "naproxen", "aspirin", "diclofenac"],
  "ibuprofen": ["acetaminophen", "naproxen", "aspirin", "diclofenac"],
  "naproxen": ["ibuprofen", "acetaminophen", "aspirin", "diclofenac"],
  "aspirin": ["acetaminophen", "ibuprofen", "naproxen", "clopidogrel"],
  "diclofenac": ["ibuprofen", "naproxen", "acetaminophen", "celecoxib"],
  
  "amoxicillin": ["penicillin", "erythromycin", "clarithromycin", "azithromycin"],
  "penicillin": ["amoxicillin", "erythromycin", "clarithromycin", "azithromycin"],
  "erythromycin": ["azithromycin", "clarithromycin", "amoxicillin", "penicillin"],
  "azithromycin": ["erythromycin", "clarithromycin", "amoxicillin", "doxycycline"],
  "clarithromycin": ["azithromycin", "erythromycin", "amoxicillin", "penicillin"],
  "doxycycline": ["azithromycin", "erythromycin", "minocycline", "tetracycline"],
  "ciprofloxacin": ["levofloxacin", "moxifloxacin", "ofloxacin", "norfloxacin"],
  "trimethoprim": ["sulfamethoxazole", "nitrofurantoin", "fosfomycin", "amoxicillin"],
  
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
  
  "metformin": ["glipizide", "glyburide", "pioglitazone", "sitagliptin"],
  "glipizide": ["glyburide", "glimepiride", "metformin", "sitagliptin"],
  "glyburide": ["glipizide", "glimepiride", "metformin", "sitagliptin"],
  "glimepiride": ["glipizide", "glyburide", "metformin", "sitagliptin"],
  
  "albuterol": ["levalbuterol", "pirbuterol", "terbutaline", "salmeterol"],
  "fluticasone": ["budesonide", "beclomethasone", "mometasone", "triamcinolone"],
  "beclomethasone": ["fluticasone", "budesonide", "mometasone", "triamcinolone"],
  "budesonide": ["fluticasone", "beclomethasone", "mometasone", "triamcinolone"],
  
  "omeprazole": ["esomeprazole", "lansoprazole", "pantoprazole", "rabeprazole"],
  "lansoprazole": ["omeprazole", "esomeprazole", "pantoprazole", "rabeprazole"],
  "esomeprazole": ["omeprazole", "lansoprazole", "pantoprazole", "rabeprazole"],
  
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

    const alternatives = DRUG_ALTERNATIVES[drugName.toLowerCase()] || [];
    let similar: any[] = [];
    
    if (category) {
      const categoryQuery = category.trim().replace(/\s+/g, '+');
      const categoryUrls = [
        `https://api.fda.gov/drug/label.json?search=openfda.pharm_class_epc:${categoryQuery}&limit=${limit}`,
        `https://api.fda.gov/drug/label.json?search=openfda.pharm_class_epc.exact:"${encodeURIComponent(category)}"&limit=${limit}`,
        `https://api.fda.gov/drug/label.json?search=pharm_class_epc:${categoryQuery}&limit=${limit}`
      ];
      
      for (const categoryUrl of categoryUrls) {
        try {
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
          }
        } catch (categoryError: any) {
          continue;
        }
      }
    }

    if (similar.length < 3) {
      const genericName = drugName.toLowerCase();
      
      const patterns = [
        genericName.split(' ')[0],
        genericName.replace(/\d+mg/g, '').trim(),
        genericName.replace(/\s+/g, '*'),
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
        }
      }
    }

    const alternativeResults: any[] = [];
    for (const alt of alternatives.slice(0, 4)) {
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
