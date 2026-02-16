// Drug name translations from UK/Iraq to US equivalents
export const DRUG_NAME_TRANSLATIONS: Record<string, string> = {
  // Pain relievers
  "paracetamol": "acetaminophen",
  "co-codamol": "acetaminophen with codeine",
  "cocodamol": "acetaminophen with codeine",
  "ibuprofen": "ibuprofen", // Same in both
  "naproxen": "naproxen", // Same in both
  "diclofenac": "diclofenac", // Same in both
  
  // Antibiotics
  "amoxicillin": "amoxicillin", // Same
  "penicillin": "penicillin", // Same
  "erythromycin": "erythromycin", // Same
  "clarithromycin": "clarithromycin", // Same
  "doxycycline": "doxycycline", // Same
  "metronidazole": "metronidazole", // Same
  "ciprofloxacin": "ciprofloxacin", // Same
  "trimethoprim": "trimethoprim", // Same
  
  // Cardiovascular
  "atenolol": "atenolol", // Same
  "bisoprolol": "bisoprolol", // Same
  "ramipril": "ramipril", // Same
  "lisinopril": "lisinopril", // Same
  "amlodipine": "amlodipine", // Same
  "simvastatin": "simvastatin", // Same
  "atorvastatin": "atorvastatin", // Same
  
  // Diabetes
  "metformin": "metformin", // Same
  "gliclazide": "gliclazide", // Same
  "glimepiride": "glimepiride", // Same
  
  // Respiratory
  "salbutamol": "albuterol",
  "ventolin": "albuterol",
  "becotide": "beclomethasone",
  "beclozone": "beclomethasone",
  "flixotide": "fluticasone",
  "seretide": "fluticasone salmeterol",
  
  // Stomach/GI
  "omeprazole": "omeprazole", // Same
  "lansoprazole": "lansoprazole", // Same
  "gaviscon": "aluminum hydroxide magnesium hydroxide",
  "peptac": "aluminum hydroxide magnesium hydroxide",
  
  // Mental Health
  "diazepam": "diazepam", // Same
  "lorazepam": "lorazepam", // Same
  "temazepam": "temazepam", // Same
  "amitriptyline": "amitriptyline", // Same
  "sertraline": "sertraline", // Same
  "citalopram": "citalopram", // Same
  "fluoxetine": "fluoxetine", // Same
  
  // Common brand names (UK -> US)
  "panadol": "tylenol",
  "nurofen": "advil",
  "voltaire": "cataflam",
  "augmentin": "augmentin", // Same
  "zantac": "zantac", // Same
  "losec": "prilosec",
  "nexium": "nexium", // Same
  
  // Vitamin supplements
  "vitamin c": "ascorbic acid",
  "vitamin d": "cholecalciferol",
  "vitamin b12": "cyanocobalamin",
  "folic acid": "folic acid", // Same
  
  // Common variations and misspellings
  "paracitamol": "acetaminophen",
  "acetaminophen": "acetaminophen", // US term - keep as is
  "tylenol": "acetaminophen", // US brand - keep as is
}

export function findDrugTranslation(drugName: string): string | null {
  // Normalize the input: lowercase, trim, remove extra spaces
  const normalizedName = drugName.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // Direct lookup
  if (DRUG_NAME_TRANSLATIONS[normalizedName]) {
    return DRUG_NAME_TRANSLATIONS[normalizedName];
  }
  
  // Try to find partial matches (for compound drugs)
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
  
  // Add some common alternatives if no direct translation found
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
        break; // Only add suggestions for first matching symptom
      }
    }
  }
  
  return suggestions.slice(0, 3); // Limit to 3 suggestions
}
