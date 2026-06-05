import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';
import { apiManager } from '../../../lib/api-provider-manager';

async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || targetLang === 'en') return text;
  
  try {
    const langName = targetLang === 'ar' ? 'Modern Standard Arabic (اللغة العربية الفصحى)' : 
                     'Sorani Kurdish (کوردی سۆرانی) - written in Arabic script ONLY';
    
    const completion = await apiManager.generateText([
      {
        role: "system",
        content: `You are a professional medical translator. Translate following text into ${langName}. Maintain medical accuracy and professional terminology.`
      },
      { role: "user", content: text.substring(0, 1500) }
    ], {
      temperature: 0.3,
      max_tokens: 1000
    });
    
    return completion.choices[0].message.content || text;
  } catch (err: any) {
    console.error("Translation failed:", err.message);
    return text;
  }
}

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


function minimizeFdaData(rawResults: any[]) {
  if (!rawResults || rawResults.length === 0) return {};
  const label = rawResults[0] || {};
  
  return {
    brand_name: label.openfda?.brand_name || [],
    generic_name: label.openfda?.generic_name || [],
    pharm_class_epc: label.openfda?.pharm_class_epc || [],
    drug_interactions: label.drug_interactions?.[0]?.substring(0, 3000) || "Not provided",
    warnings_and_cautions: label.warnings_and_precautions?.[0]?.substring(0, 3000) || 
                           label.warnings?.[0]?.substring(0, 3000) || "Not provided"
  };
}

async function aiAnalyzeInteractions(drugData: any[], drugNames: string[]) {
  try {
    const completion = await apiManager.generateText([
      {
        role: "system",
        content: INTERACTION_PROMPT
      },
      { 
        role: "user", 
        content: `Analyze interactions between these drugs: ${drugNames.join(', ')}\n\nFDA Data:\n${JSON.stringify(drugData, null, 2)}` 
      }
    ], {
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    
    const result = JSON.parse(completion.choices[0].message.content || "{}");
    console.log('AI Analysis Result:', result);
    return result;
  } catch (err) {
    console.error("AI analysis failed:", err);
    return {
      interactions: [],
      overallRisk: "error",
      summary: {
        en: "Unable to analyze interactions due to an internal server error. Please consult a healthcare professional.",
        ar: "غير قادر على تحليل التفاعلات بسبب خطأ داخلي. يرجى استشارة أخصائي رعاية صحية.",
        ku: "ناتوانرا لە شیکاری کارلێکەکان بەهۆی هەڵەیەکی ناوخۆیی. تکایە سەردانی لێپرسراوی تەندروستی بکە."
      },
      disclaimer: {
        en: "This AI analysis is for informational purposes only and should not replace professional medical advice.",
        ar: "هذا التحليل بواسطة الذكاء الاصطناعي لأغراض معلوماتية فقط ولا يجب أن يحل محل المشورة الطبية المهنية.",
        ku: "ئەم شیکاریی هوشی دەستکردە تەنها بۆ مەبەستی زانیارییە و نابێت جێگەی مشاورەی پزیشکی پیشەگەرە بگرێتەوە."
      }
    };
  }
}

function getFallbackAnalysis(drugNames: string[], validDrugData: any[]) {
  const normalizedNames = drugNames.map(d => d.toLowerCase().trim());

  const drugCategories = validDrugData.map(drug => {
    const openfda = drug[0]?.openfda || {};
    return {
      name: drugNames[validDrugData.indexOf(drug)],
      category: openfda.pharm_class_epc?.[0] || openfda.product_type?.[0] || "Unknown"
    };
  });

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

  const isSildenafil = normalizedNames.some(n => n.includes('sildenafil') || n.includes('viagra'));
  const isNitroglycerin = normalizedNames.some(n => n.includes('nitroglycerin') || n.includes('nitro'));

  if (isSildenafil && isNitroglycerin) {
    interactions.push({
      severity: "critical" as const,
      title: {
        en: "CRITICAL: Fatal Blood Pressure Drop",
        ar: "خطر حرج: انخفاض حاد في ضغط الدم",
        ku: "مەترسیی کوشندە: دابەزینی توندی پەستانی خوێن"
      },
      description: {
        en: "Combining Sildenafil and Nitroglycerin causes a sudden, life-threatening drop in blood pressure. They must NEVER be taken together.",
        ar: "الجمع بين سيلدينافيل والنيتروجليسرين يسبب انخفاضاً مفاجئاً ومهدداً للحياة في ضغط الدم. لا يجوز تناولهما معاً أبداً.",
        ku: "تێکەڵکردنی سیڵدینافیل و نایترۆگلیسرین دەبێتە هۆی دابەزینی کتوپڕ و مەترسیداری پەستانی خوێن. نابێت هەرگیز پێکەوە بخورێن."
      },
      recommendations: {
        en: ["Do not take these medications together under any circumstance.", "Contact emergency services immediately if co-administered."],
        ar: ["لا تتناول هذه الأدوية معاً تحت أي ظرف من الظروف.", "اتصل بالطوارئ فوراً إذا تم تناولهما معاً."],
        ku: ["ژێر هیچ بارودۆخێکدا ئەم دەرمانانە پێکەوە مەخۆ.", "ئەگەر پێکەوە خوران, دەستبەجێ پەیوەندی بە فریاکەوتنەوە بکە."]
      }
    });
  }

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

  // TYPE FIX: Cast strings explicitly to strict union types so Vercel builds cleanly
  const overallRisk = interactions.length > 0 
    ? (interactions.some(i => i.severity === 'critical') ? 'critical' as const
      : interactions.some(i => i.severity === 'moderate') ? 'moderate' as const : 'minor' as const)
    : 'unknown' as const;

  return {
    interactions: interactions as Array<{
      severity: "critical" | "moderate" | "minor";
      title: Record<string, string>;
      description: Record<string, string>;
      recommendations: Record<string, string[]>;
    }>,
    overallRisk,
    summary: {
      en: interactions.length > 0 
        ? `Fallback System: Found ${interactions.length} localized interaction alerts.`
        : "Automated analysis offline. Unable to safely verify compatibility between these medications.",
      ar: interactions.length > 0
        ? `نظام الاحتياط: تم العثور على ${interactions.length} تنبيهات تفاعلية.`
        : "نظام التحليل التلقائي غير متصل بالشبكة. لا يمكن التحقق من سلامة الأدوية بشكل قاطع.",
      ku: interactions.length > 0
        ? `سیستەمی یەدەگ: ${interactions.length} ئاگادارکەرەوەی کارلێک دۆزرایەوە.`
        : "شیکاری ئۆتۆماتیکی دەرەlineە. ناتوانرێت بە سەلامەتی کارلێکی نێوان ئەم دەرمانانە پشتڕاست بکرێتەوە."
    },
    disclaimer: {
      en: "This local analysis is a fallback check and should never replace professional medical evaluation.",
      ar: "هذا التحليل المحلي هو فحص احتياطي ولا ينبغي أن يحل محل التقييم الطبي المهني.",
      ku: "ئەم شیکارییە ناوخۆییە پشکنینێکی یەدەگە و نابێت هەرگیز جێگەی هەڵسەنگاندنی پزیشکی پیشەگەر بگرێتەوە."
    }
  };
}

export async function POST(req: Request) {
  try {
    const { drugs, language = 'en' } = await req.json();
    
    if (!drugs || drugs.length < 2) {
      return NextResponse.json({ 
        interactions: [],
        overallRisk: "invalid",
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
          en: "Insufficient active database data available for the specified labels. Please verify drug naming spelling.",
          ar: "بيانات غير كافية متاحة للأدوية المحددة. يرجى التحقق من أسماء الأدوية والمحاولة مرة أخرى.",
          ku: "زانیاری پێویست بۆ دەرمانە دیاریکراوەکان بەردەست نییە. تکایە ناوی دەرمانەکان بپشکنە و دووبارە هەوڵ بدەرەوە."
        },
        disclaimer: {
          en: "This analysis is for informational purposes only and should not replace professional medical advice."
        }
      });
    }

    try {
      // PAYLOAD REDUCTION: Map massive data blocks into slim, optimized data objects
      const minimizedData = validDrugData.map(r => minimizeFdaData(r.data));

      const analysisResult = await aiAnalyzeInteractions(
        minimizedData, 
        drugs
      );
      
      if (analysisResult.overallRisk === "error") {
        return NextResponse.json(analysisResult, { status: 500 });
      }

      if (analysisResult.interactions && analysisResult.interactions.length > 0) {
        return NextResponse.json(analysisResult);
      }
    } catch (aiError) {
      console.log('AI analysis failed, executing defensive local fallback:', aiError);
    }

    const fallbackResult = getFallbackAnalysis(drugs, validDrugData);
    return NextResponse.json(fallbackResult);

  } catch (error: any) {
    console.error('Drug interactions API error:', error);
    return NextResponse.json({
      interactions: [],
      overallRisk: "error",
      summary: {
        en: "An unexpected network error occurred while analyzing drug interactions. Please retry.",
        ar: "حدث خطأ أثناء تحليل التفاعلات الدوائية. يرجى المحاولة مرة أخرى.",
        ku: "هەڵەیەک ڕوویدا لە کاتی شیکاری کارلێکی دەرمانەکان. تکایە دووبارە هەوڵ بدەرەوە."
      },
      disclaimer: {
        en: "This analysis is for informational purposes only and should not replace professional medical advice."
      }
    }, { status: 500 });
  }
}