const API_KEY = process.env.GROQ_API_KEY

export async function POST(req: Request) {
  try {
    const { drugs, language } = await req.json()

    if (!drugs || drugs.length < 2) {
      return Response.json({
        interactions: [],
        overallRisk: "safe",
        summary: {
          en: "Please select at least two drugs to check interactions.",
          ar: "يرجى اختيار دوائين على الأقل للتحقق من التفاعلات.",
          ku: "تکایە لانیکەم دوو دەرمان هەڵبژێرە بۆ پشکنینی کارلێکردن.",
        },
      })
    }

    const drugNames = drugs.join(", ")

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
            content: `You are a pharmaceutical interaction expert. 
            RULES:
            - Output ONLY raw JSON.
            - Analyze interactions between the provided drugs.
            - Provide translations for English, Arabic, and Kurdish (Sorani).
            - Severity MUST be exactly "critical", "moderate", or "safe".`
          },
          {
            role: "user",
            content: `Analyze potential drug interactions between: ${drugNames}.
            
            REQUIRED JSON STRUCTURE:
            {
              "interactions": [
                {
                  "severity": "critical|moderate|safe",
                  "title": { "en": "...", "ar": "...", "ku": "..." },
                  "description": { "en": "...", "ar": "...", "ku": "..." },
                  "recommendations": { "en": [], "ar": [], "ku": [] }
                }
              ],
              "overallRisk": "critical|moderate|safe",
              "summary": { "en": "...", "ar": "...", "ku": "..." }
            }`
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1, // Low temperature for higher medical accuracy
        max_tokens: 3000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Groq Interaction Error:", errorText)
      throw new Error(`API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error("No content in response")

    const result = JSON.parse(content)

    // 🛡️ THE SANITIZER: Ensuring the UI doesn't crash on null fields
    const sanitizedResult = {
      overallRisk: result.overallRisk || "safe",
      summary: result.summary || { en: "", ar: "", ku: "" },
      interactions: (result.interactions || []).map((i: any) => ({
        severity: i.severity || "safe",
        title: i.title || { en: "No interaction found", ar: "لا يوجد تفاعل", ku: "هیچ کارلێکێک نییە" },
        description: i.description || { en: "", ar: "", ku: "" },
        recommendations: i.recommendations || { en: [], ar: [], ku: [] }
      }))
    }

    return Response.json(sanitizedResult)

  } catch (error: any) {
    console.error("Interaction check error:", error.message)
    return Response.json({
      interactions: [],
      overallRisk: "error",
      summary: {
        en: "Technical error checking interactions.",
        ar: "خطأ فني في التحقق من التفاعلات.",
        ku: "هەڵەی تەکنیکی لە پشکنینی کارلێکردن."
      },
      error: error.message
    }, { status: 500 })
  }
}