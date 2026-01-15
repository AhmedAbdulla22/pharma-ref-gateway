const API_KEY = process.env.GROQ_API_KEY

export async function POST(req: Request) {
  try {
    const { query, language } = await req.json()

    if (!query?.trim()) {
      return Response.json({ drugs: [] })
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        // 1. Use the most stable model
        model: "llama-3.3-70b-versatile", 
        messages: [
          {
            role: "system",
            content: `You are a professional pharmaceutical data server. 
            CRITICAL RULES:
            1. Output ONLY raw JSON. 
            2. Every single drug object MUST contain all keys: id, name, genericName, category, description, uses, sideEffects, dosage, warnings, qrCode.
            3. Multilingual fields (en, ar, ku) must NEVER be null. If data is missing for a language, translate the English version into that language.
            4. For Kurdish, use Sorani script.
            5. The "uses", "sideEffects", and "warnings" fields must be objects containing arrays of strings for each language.`
          },
          {
            role: "user",
            content: `Search query: "${query}". 
            Target Language: ${language}.

            REQUIRED JSON STRUCTURE:
            {
              "drugs": [
                {
                  "id": "unique-string-id",
                  "name": "Brand Name",
                  "genericName": "Scientific Name",
                  "category": "Category",
                  "description": { "en": "...", "ar": "...", "ku": "..." },
                  "uses": { "en": ["use1"], "ar": ["use1"], "ku": ["use1"] },
                  "sideEffects": { "en": ["eff1"], "ar": ["eff1"], "ku": ["eff1"] },
                  "dosage": { "en": "...", "ar": "...", "ku": "..." },
                  "warnings": { "en": ["warn1"], "ar": ["warn1"], "ku": ["warn1"] },
                  "qrCode": "DRG-000"
                }
              ]
            }`
          },
        ],
        // 3. This is what was likely causing the 400 error
        response_format: { type: "json_object" }, 
        temperature: 0.1, // Lower temperature is better for JSON
        max_tokens: 3000,
      }),
    })

    if (!response.ok) {
      // Log the actual error text from Groq to find out WHY it's a 400
      const errorText = await response.text();
      console.error("Groq Raw Error:", errorText);
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) throw new Error("Empty response from AI")

    // 1. Parse the raw string into a JavaScript object
    const result = JSON.parse(content)

    // 2. THE SANITIZER: This protects your frontend from missing data
    if (result.drugs && Array.isArray(result.drugs)) {
      result.drugs = result.drugs.map((drug: any) => ({
        ...drug,
        // If the key is missing, provide a valid multilingual structure
        // Force the AI's genericName into the scientificName field
        scientificName: drug.scientificName || drug.genericName || "N/A",
        description: drug.description || { en: "", ar: "", ku: "" },
        uses: drug.uses || { en: [], ar: [], ku: [] },
        sideEffects: drug.sideEffects || { en: [], ar: [], ku: [] },
        dosage: drug.dosage || { en: "", ar: "", ku: "" },
        warnings: drug.warnings || { en: [], ar: [], ku: [] },
      }))
    }

    // 3. Return the clean, safe object
    return Response.json(result)

  } catch (error: any) {
    console.error("Search error:", error.message)
    return Response.json({ drugs: [], error: error.message }, { status: 500 })
  }
}
