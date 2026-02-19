export const DRUG_NAME_TRANSLATIONS: Record<string, string> = {
  "paracetamol": "acetaminophen",
  "co-codamol": "acetaminophen with codeine",
  "cocodamol": "acetaminophen with codeine",
  "ibuprofen": "ibuprofen",
  "naproxen": "naproxen",
  "diclofenac": "diclofenac",
  
  "amoxicillin": "amoxicillin",
  "penicillin": "penicillin",
  "erythromycin": "erythromycin",
  "clarithromycin": "clarithromycin",
  "doxycycline": "doxycycline",
  "metronidazole": "metronidazole",
  "ciprofloxacin": "ciprofloxacin",
  "trimethoprim": "trimethoprim",
  
  "atenolol": "atenolol",
  "bisoprolol": "bisoprolol",
  "ramipril": "ramipril",
  "lisinopril": "lisinopril",
  "amlodipine": "amlodipine",
  "simvastatin": "simvastatin",
  "atorvastatin": "atorvastatin",
  
  "metformin": "metformin",
  "gliclazide": "gliclazide",
  "glimepiride": "glimepiride",
  
  "salbutamol": "albuterol",
  "ventolin": "albuterol",
  "becotide": "beclomethasone",
  "beclozone": "beclomethasone",
  "flixotide": "fluticasone",
  "seretide": "fluticasone salmeterol",
  
  "omeprazole": "omeprazole",
  "lansoprazole": "lansoprazole",
  "gaviscon": "aluminum hydroxide magnesium hydroxide",
  "peptac": "aluminum hydroxide magnesium hydroxide",
  
  "diazepam": "diazepam",
  "lorazepam": "lorazepam",
  "temazepam": "temazepam",
  "amitriptyline": "amitriptyline",
  "sertraline": "sertraline",
  "citalopram": "citalopram",
  "fluoxetine": "fluoxetine",
  
  "panadol": "tylenol",
  "nurofen": "advil",
  "voltaire": "cataflam",
  "augmentin": "augmentin",
  "zantac": "zantac",
  "losec": "prilosec",
  "nexium": "nexium",
  
  "vitamin c": "ascorbic acid",
  "vitamin d": "cholecalciferol",
  "vitamin b12": "cyanocobalamin",
  "folic acid": "folic acid",
  
  "paracitamol": "acetaminophen",
  "acetaminophen": "acetaminophen",
  "tylenol": "acetaminophen",
}

export function findDrugTranslation(drugName: string): string | null {
  const normalizedName = drugName.toLowerCase().trim().replace(/\s+/g, ' ');
  
  if (DRUG_NAME_TRANSLATIONS[normalizedName]) {
    return DRUG_NAME_TRANSLATIONS[normalizedName];
  }
  
  for (const [ukName, usName] of Object.entries(DRUG_NAME_TRANSLATIONS)) {
    if (normalizedName.includes(ukName) || ukName.includes(normalizedName)) {
      return usName;
    }
  }
  
  return null;
}

export function getSuggestedDrugs(originalQuery: string): Array<{original: string, suggestion: string, description: string}> {
  const suggestions: Array<{original: string, suggestion: string, description: string}> = [];
  const translation = findDrugTranslation(originalQuery);
  
  if (translation && translation !== originalQuery.toLowerCase()) {
    suggestions.push({
      original: originalQuery,
      suggestion: translation,
      description: `Commonly known as "${translation}" in the US`
    });
  }
  
  if (suggestions.length === 0) {
    const commonAlternatives: Record<string, string[]> = {
      "pain": ["acetaminophen", "ibuprofen", "naproxen"],
      "headache": ["acetaminophen", "ibuprofen", "aspirin"],
      "fever": ["acetaminophen", "ibuprofen"],
      "inflammation": ["ibuprofen", "naproxen", "diclofenac"],
      "infection": ["amoxicillin", "penicillin", "erythromycin"],
      "blood pressure": ["lisinopril", "atenolol", "amlodipine"],
      "diabetes": ["metformin", "gliclazide"],
      "asthma": ["albuterol", "fluticasone"],
      "stomach": ["omeprazole", "lansoprazole"],
      "depression": ["sertraline", "fluoxetine", "citalopram"],
      "anxiety": ["diazepam", "lorazepam"]
    };
    
    const lowerQuery = originalQuery.toLowerCase();
    for (const [symptom, drugs] of Object.entries(commonAlternatives)) {
      if (lowerQuery.includes(symptom)) {
        drugs.forEach(drug => {
          suggestions.push({
            original: originalQuery,
            suggestion: drug,
            description: `Common medication for ${symptom}`
          });
        });
        break;
      }
    }
  }
  
  return suggestions.slice(0, 3);
}
