const API_KEY = process.env.GROQ_API_KEY

export async function POST(req: Request) {
  try {
    const { qrCode, drugName, language } = await req.json()
    const searchTerm = qrCode || drugName

    if (!searchTerm) {
      return Response.json({ found: false, drug: null })
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a professional pharmaceutical data server. 
            SPECIAL INSTRUCTION: You may receive raw QR scan data, such as a URL (e.g., www.onit.com), a manufacturer code, or a brand name. 
            Your goal is to extract or infer the actual medication name from this data.
            RULES: 
            - Output ONLY raw JSON. 
            - If the input is a URL, check if it belongs to a known supplement or drug brand (like 'Onit' for supplements) and return that item.
            - "name" MUST be an object with en, ar, and ku keys.
            - Multilingual arrays (uses, sideEffects, warnings) MUST have en, ar, and ku keys.
            - If no real medication/supplement can be identified, set "found": false.`
          },
          {
            role: "user",
            content: `Identify and lookup drug info for this scanned input: "${searchTerm}".
            
            REQUIRED JSON STRUCTURE:
            {
              "found": true,
              "drug": {
                "id": "...",
                "qrCode": "${qrCode || "DRG-AUTO"}",
                "name": { "en": "...", "ar": "...", "ku": "..." },
                "scientificName": "...",
                "category": "...",
                "description": { "en": "...", "ar": "...", "ku": "..." },
                "uses": { "en": [], "ar": [], "ku": [] },
                "sideEffects": { "en": [], "ar": [], "ku": [] },
                "dosage": { "en": "...", "ar": "...", "ku": "..." },
                "warnings": { "en": [], "ar": [], "ku": [] }
              }
            }`
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 2500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Groq Lookup Error:", errorText)
      throw new Error(`API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error("No content in response")

    const result = JSON.parse(content)

    if (result.found && result.drug) {
      result.drug = {
        ...result.drug,
        scientificName: result.drug.scientificName || result.drug.genericName || "N/A",
        name: typeof result.drug.name === 'string' 
          ? { en: result.drug.name, ar: result.drug.name, ku: result.drug.name }
          : result.drug.name || { en: "Unknown", ar: "غير معروف", ku: "نەناسراو" },
        uses: result.drug.uses || { en: [], ar: [], ku: [] },
        sideEffects: result.drug.sideEffects || { en: [], ar: [], ku: [] },
        dosage: result.drug.dosage || { en: "", ar: "", ku: "" },
        warnings: result.drug.warnings || { en: [], ar: [], ku: [] },
      }
    }

    return Response.json(result)
  } catch (error: any) {
    console.error("Drug lookup error:", error.message)
    return Response.json({ found: false, drug: null, error: error.message }, { status: 500 })
  }
}