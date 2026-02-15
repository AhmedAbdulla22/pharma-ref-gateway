import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { message, drugName, context } = await req.json();

    if (!message || !drugName) {
      return NextResponse.json({ reply: "I need a valid question." }, { status: 400 });
    }

    // System Prompt: Defines the AI's persona and strict safety rules
    const systemPrompt = `
      You are an expert clinical pharmacist assistant. 
      You are currently answering questions about the drug: "${drugName}".
      
      CONTEXT (FDA LABEL DATA):
      ${JSON.stringify(context).substring(0, 6000)} 
      
      RULES:
      1. Answer ONLY based on the provided FDA context. If the answer is not in the data, say "I cannot find that information in the official label."
      2. Be concise, professional, and empathetic.
      3. If asked about personal medical advice (e.g., "Should I take this?"), refuse and tell them to consult a doctor.
      4. Keep answers short (under 3 sentences) unless asked for details.
      5. Output in the same language as the user's question (English, Arabic, or Kurdish).
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3, // Low temperature for factual accuracy
      max_tokens: 300
    });

    return NextResponse.json({ 
      reply: completion.choices[0].message.content 
    });

  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ reply: "Sorry, I am having trouble connecting to the server." }, { status: 500 });
  }
}