import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// AI Interaction Analysis Prompt
const INTERACTION_PROMPT = `
You are a medical AI analyzing drug interaction data from FDA labels. 

Task: Analyze the provided raw FDA drug data for potential interactions between the specified drugs and provide a comprehensive assessment.

CRITICAL REQUIREMENTS:
1. Analyze the drug_interactions sections for both drugs
2. Look for cross-references between the drugs
3. Identify potential mechanisms of interaction
4. Assess severity levels (Critical/Moderate/Minor)
5. Provide actionable recommendations
6. Include a clear AI disclaimer

Input Data: Raw FDA label information for multiple drugs
Output: JSON with interaction analysis in English, Arabic, and Kurdish

Response Format:
{
  "interactions": [
    {
      "severity": "critical|moderate|minor",
      "title": {"en": "...", "ar": "...", "ku": "..."},
      "description": {"en": "...", "ar": "...", "ku": "..."},
      "recommendations": {"en": ["..."], "ar": ["..."], "ku": ["..."]}
    }
  ],
  "overallRisk": "critical|moderate|minor|safe",
  "summary": {"en": "...", "ar": "...", "ku": "..."},
  "disclaimer": {"en": "...", "ar": "...", "ku": "..."}
}

IMPORTANT: If no clear interactions are found, return "safe" overall risk with appropriate summary.`;

async function aiAnalyzeInteractions(drugData: any[], drugNames: string[]) {
  console.log('AI Analysis - Drug Names:', drugNames);
  console.log('AI Analysis - Drug Data Count:', drugData.length);
  console.log('AI Analysis - Sample Data:', JSON.stringify(drugData[0], null, 2).substring(0, 500) + '...');
  
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: INTERACTION_PROMPT
        },
        { 
          role: "user", 
          content: `Analyze interactions between these drugs: ${drugNames.join(', ')}\n\nFDA Data:\n${JSON.stringify(drugData, null, 2)}` 
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.3,
    });
    
    const result = JSON.parse(completion.choices[0].message.content || "{}");
    console.log('AI Analysis Result:', result);
    return result;
  } catch (err) {
    console.error("AI analysis failed:", err);
    return {
      interactions: [],
      overallRisk: "safe",
      summary: {
        en: "Unable to analyze interactions. Please consult a healthcare professional.",
        ar: "غير قادر على تحليل التفاعلات. يرجى استشارة أخصائي رعاية صحية.",
        ku: "ناتوانرا لە شیکاری کارلێکەکان. تکایە سەردانی لێپرسراوی تەندروستی بکە."
      },
      disclaimer: {
        en: "This AI analysis is for informational purposes only and should not replace professional medical advice.",
        ar: "هذا التحليل بواسطة الذكاء الاصطناعي لأغراض معلوماتية فقط ولا يجب أن يحل محل المشورة الطبية المهنية.",
        ku: "ئەم شیکاریی هوشی دەستکردە تەنها بۆ مەبەستی زانیارییە و نابێت جێگەی مشاورەی پزیشکی پیشەگەرە بگرێتەوە."
      }
    };
  }
}

// Fallback analysis when AI is not available
function getFallbackAnalysis(drugNames: string[], validDrugData: any[]) {
  const drugCategories = validDrugData.map(drug => {
    const openfda = drug[0]?.openfda || {};
    return {
      name: drugNames[validDrugData.indexOf(drug)],
      category: openfda.pharm_class_epc?.[0] || openfda.product_type?.[0] || "Unknown"
    };
  });

  // Basic interaction logic based on drug categories
  const hasNSAIDs = drugCategories.some(d => 
    d.category.toLowerCase().includes('nonsteroidal anti-inflammatory') || 
    d.name.toLowerCase().includes('aspirin') || 
    d.name.toLowerCase().includes('ibuprofen') ||
    d.name.toLowerCase().includes('naproxen')
  );

  const hasBloodThinners = drugCategories.some(d => 
    d.name.toLowerCase().includes('warfarin') ||
    d.name.toLowerCase().includes('coumadin')
  );

  const interactions = [];

  if (hasNSAIDs && hasBloodThinners) {
    interactions.push({
      severity: "moderate" as const,
      title: {
        en: "NSAID + Blood Thinner Interaction",
        ar: "تفاعل مضاد الالتهاب غير الستيرويدي + مميع الدم",
        ku: "کاریلێکی دژە هەوکردنی ناستیرۆیدی + ڕەقکردنی خوێن"
      },
      description: {
        en: "Combining NSAIDs with blood thinners may increase bleeding risk.",
        ar: "قد يزيد الجمع بين مضادات الالتهاب غير الستيرويدية ومميعات الدم من خطر النزيف.",
        ku: "تێکەڵکردنی دژە هەوکردنە ناستیرۆیدییەکان لەگەڵ ڕەقکەرەکانی خوێن مەحاڵەکەی خوێنەربەوە زیاد دەکات."
      },
      recommendations: {
        en: ["Monitor for signs of bleeding", "Consult healthcare provider", "Consider alternative pain relief"],
        ar: ["راقب علامات النزيف", "استشر مقدم الرعاية الصحية", "فكر في بدائل مسكنات الألم"],
        ku: ["چاودێری نیشانەکانی خوێنەربەوە بکە", "سەردانی لێپرسراوی تەندروستی بکە", "بیری لە بەدیلەکانی ھێورکردنی ئازار بکەرەوە"]
      }
    });
  }

  if (drugCategories.length >= 2 && hasNSAIDs) {
    interactions.push({
      severity: "minor" as const,
      title: {
        en: "Multiple NSAIDs Warning",
        ar: "تحذير مضادات الالتهاب غير الستيرويدية المتعددة",
        ku: "ئاگاداری دژە هەوکردنە ناستیرۆیدییە چەندەھا"
      },
      description: {
        en: "Using multiple NSAIDs may increase risk of stomach irritation and side effects.",
        ar: "قد يزيد استخدام مضادات الالتهاب غير الستيرويدية المتعددة من خطر تهيج المعدة والآثار الجانبية.",
        ku: "بەکارهێنانی چەندین دژە هەوکردنی ناستیرۆیدی مەحاڵەکەی هەوکردنی گەدە و کاریگەری لاوەزی زیاد دەکات."
      },
      recommendations: {
        en: ["Use only one NSAID at a time", "Take with food", "Stay hydrated"],
        ar: ["استخدم مضاد التهاب واحد فقط في كل مرة", "تناوله مع الطعام", "حافظ على رطوبة الجسم"],
        ku: ["تەنها یەک دژە هەوکردنی ناستیرۆیدی بەکاربهێنە", "لەگەڵ خواردن بیخۆ", "شێوەت بپارێزە"]
      }
    });
  }

  const overallRisk = interactions.length > 0 
    ? (interactions.some(i => i.severity === 'moderate') ? 'moderate' : 'minor')
    : 'safe';

  return {
    interactions,
    overallRisk,
    summary: {
      en: interactions.length > 0 
        ? `Found ${interactions.length} potential interaction${interactions.length > 1 ? 's' : ''}.`
        : "No significant interactions detected between the selected medications.",
      ar: interactions.length > 0
        ? `تم العثور على ${interactions.length} تفاعل${interactions.length > 1 ? 'ات' : ''} محتمل.`
        : "لم يتم اكتشاف تفاعلات مهمة بين الأدوية المحددة.",
      ku: interactions.length > 0
        ? `${interactions.length} کارلێکی ${interactions.length > 1 ? 'دۆزرایەوە' : 'دۆزرایەوە'}.`
        : "هیچ کارلێکی گرنگێک لە نێوان دەرمانە دیاریکراوەکاندا نەدۆزرایەوە."
    },
    disclaimer: {
      en: "This analysis is based on FDA drug categories and should not replace professional medical advice. Always consult with healthcare providers.",
      ar: "هذا التحليل يعتمد على فئات أدوية FDA ولا يجب أن يحل محل المشورة الطبية المهنية. استشر دائما مقدمي الرعاية الصحية.",
      ku: "ئەم شیکارییە پشتی بە پۆلەکانی دەرمانی FDA دەبەستێت و نابێت جێگەی مشاورەی پزیشکی پیشەگەرە بگرێتەوە. هەمیشە سەردانی لێپرسراوی تەندروستی بکە."
    }
  };
}

export async function POST(req: Request) {
  try {
    const { drugs, language = 'en' } = await req.json();
    
    if (!drugs || drugs.length < 2) {
      return NextResponse.json({ 
        interactions: [],
        overallRisk: "safe",
        summary: { en: "Please enter at least 2 drugs to check interactions" },
        disclaimer: {
          en: "This analysis is for informational purposes only and should not replace professional medical advice."
        }
      });
    }

    const agent = new https.Agent({ rejectUnauthorized: false, family: 4 });
    const drugDataPromises = drugs.map(async (drugName: string) => {
      const cleanName = encodeURIComponent(drugName.trim());
      const fdaUrl = `https://api.fda.gov/drug/label.json?search=(openfda.brand_name:"${cleanName}"+OR+openfda.generic_name:"${cleanName}")&limit=3`;
      
      try {
        const response = await axios.get(fdaUrl, {
          timeout: 15000,
          httpsAgent: agent,
        });
        return {
          drugName,
          data: response.data.results || []
        };
      } catch (err) {
        console.error(`Failed to fetch data for ${drugName}:`, err);
        return {
          drugName,
          data: []
        };
      }
    });

    const drugDataResults = await Promise.all(drugDataPromises);
    const validDrugData = drugDataResults.filter(result => result.data.length > 0);
    
    if (validDrugData.length < 2) {
      return NextResponse.json({
        interactions: [],
        overallRisk: "unknown",
        summary: {
          en: "Insufficient data available for the specified drugs. Please check drug names and try again.",
          ar: "بيانات غير كافية متاحة للأدوية المحددة. يرجى التحقق من أسماء الأدوية والمحاولة مرة أخرى.",
          ku: "زانیاری پێویست بۆ دەرمانە دیاریکراوەکان بەردەست نییە. تکایە ناوی دەرمانەکان بپشکنە و دووبارە هەوڵ بدەرەوە."
        },
        disclaimer: {
          en: "This analysis is for informational purposes only and should not replace professional medical advice.",
          ar: "هذا التحليل بواسطة الذكاء الاصطناعي لأغراض معلوماتية فقط ولا يجب أن يحل محل المشورة الطبية المهنية.",
          ku: "ئەم شیکاریی هوشی دەستکردە تەنها بۆ مەبەستی زانیارییە و نابێت جێگەی مشاورەی پزیشکی پیشەگەرە بگرێتەوە."
        }
      });
    }

    // Try AI analysis first, fallback to basic analysis if AI fails
    try {
      const analysisResult = await aiAnalyzeInteractions(
        validDrugData.map(r => r.data), 
        drugs
      );
      
      // Check if AI returned meaningful results
      if (analysisResult.interactions && analysisResult.interactions.length > 0) {
        return NextResponse.json(analysisResult);
      }
    } catch (aiError) {
      console.log('AI analysis failed, using fallback:', aiError);
    }

    // Use fallback analysis
    const fallbackResult = getFallbackAnalysis(drugs, validDrugData);
    return NextResponse.json(fallbackResult);

  } catch (error: any) {
    console.error('Drug interactions API error:', error);
    return NextResponse.json({
      interactions: [],
      overallRisk: "error",
      summary: {
        en: "An error occurred while analyzing drug interactions. Please try again.",
        ar: "حدث خطأ أثناء تحليل التفاعلات الدوائية. يرجى المحاولة مرة أخرى.",
        ku: "هەڵەیەک ڕوویدا لە کاتی شیکاری کارلێکی دەرمانەکان. تکایە دووبارە هەوڵ بدەرەوە."
      },
      disclaimer: {
        en: "This analysis is for informational purposes only and should not replace professional medical advice.",
        ar: "هذا التحليل بواسطة الذكاء الاصطناعي لأغراض معلوماتية فقط ولا يجب أن يحل محل المشورة الطبية المهنية.",
        ku: "ئەم شیکاریی هوشی دەستکردە تەنها بۆ مەبەستی زانیارییە و نابێت جێگەی مشاورەی پزیشکی پیشەگەرە بگرێتەوە."
      }
    });
  }
}