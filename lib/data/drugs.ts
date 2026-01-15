export interface Drug {
  id: string
  qrCode: string
  name: {
    en: string
    ar: string
    ku: string
  }
  scientificName: string
  genericName?: string
  category: string
  uses: {
    en: string[]
    ar: string[]
    ku: string[]
  }
  sideEffects: {
    en: string[]
    ar: string[]
    ku: string[]
  }
  dosage: {
    en: string
    ar: string
    ku: string
  }
  warnings: {
    en: string[]
    ar: string[]
    ku: string[]
  }
}

export interface DrugInteraction {
  drug1Id: string
  drug2Id: string
  severity: "critical" | "moderate" | "safe"
  description: {
    en: string
    ar: string
    ku: string
  }
}

export const drugs: Drug[] = [
  {
    id: "aspirin",
    qrCode: "ASP-001",
    name: { en: "Aspirin", ar: "أسبرين", ku: "ئەسپیرین" },
    scientificName: "Acetylsalicylic Acid",
    category: "NSAID",
    uses: {
      en: ["Pain relief", "Fever reduction", "Anti-inflammatory", "Blood thinner"],
      ar: ["تخفيف الألم", "خفض الحرارة", "مضاد للالتهاب", "مميع للدم"],
      ku: ["کەمکردنەوەی ئازار", "دابەزاندنی تای جەستە", "دژی ئالتهابی", "شلکەری خوێن"],
    },
    sideEffects: {
      en: ["Stomach upset", "Nausea", "Bleeding risk", "Allergic reactions"],
      ar: ["اضطراب المعدة", "غثيان", "خطر النزيف", "تفاعلات حساسية"],
      ku: ["ناڕەحەتی گەدە", "گێژبوون", "مەترسی خوێنڕێژی", "هەستیاری"],
    },
    dosage: {
      en: "325-650mg every 4-6 hours as needed",
      ar: "325-650 مجم كل 4-6 ساعات حسب الحاجة",
      ku: "325-650 میلی گرام هەر 4-6 کاتژمێر بەپێی پێویست",
    },
    warnings: {
      en: ["Do not use with blood thinners", "Avoid in pregnancy", "Not for children under 12"],
      ar: ["لا تستخدم مع مميعات الدم", "تجنب أثناء الحمل", "ليس للأطفال دون 12 سنة"],
      ku: ["بەکار مەهێنە لەگەڵ شلکەری خوێن", "دوور بکەوە لە دووگیانی", "بۆ منداڵانی ژێر 12 ساڵ نییە"],
    },
  },
  {
    id: "ibuprofen",
    qrCode: "IBU-002",
    name: { en: "Ibuprofen", ar: "إيبوبروفين", ku: "ئیبوپروفین" },
    scientificName: "Ibuprofen",
    category: "NSAID",
    uses: {
      en: ["Pain relief", "Fever reduction", "Anti-inflammatory"],
      ar: ["تخفيف الألم", "خفض الحرارة", "مضاد للالتهاب"],
      ku: ["کەمکردنەوەی ئازار", "دابەزاندنی تای جەستە", "دژی ئالتهابی"],
    },
    sideEffects: {
      en: ["Stomach pain", "Heartburn", "Dizziness", "Rash"],
      ar: ["ألم المعدة", "حرقة المعدة", "دوخة", "طفح جلدي"],
      ku: ["ئازاری گەدە", "سووتانی گەدە", "سەرگێژی", "هەڵکەوتنی پێست"],
    },
    dosage: {
      en: "200-400mg every 4-6 hours, max 1200mg/day",
      ar: "200-400 مجم كل 4-6 ساعات، بحد أقصى 1200 مجم/يوم",
      ku: "200-400 میلی گرام هەر 4-6 کاتژمێر، زۆرترین 1200 میلی گرام/ڕۆژ",
    },
    warnings: {
      en: ["Take with food", "Avoid with kidney disease", "May increase heart attack risk"],
      ar: ["تناول مع الطعام", "تجنب مع أمراض الكلى", "قد يزيد خطر النوبة القلبية"],
      ku: ["لەگەڵ خواردن بیخۆ", "دوور بکەوە لە نەخۆشی گورچیلە", "ڕەنگە مەترسی لێدانی دڵ زیاد بکات"],
    },
  },
  {
    id: "warfarin",
    qrCode: "WAR-003",
    name: { en: "Warfarin", ar: "وارفارين", ku: "وارفارین" },
    scientificName: "Warfarin Sodium",
    category: "Anticoagulant",
    uses: {
      en: ["Blood clot prevention", "Stroke prevention", "DVT treatment"],
      ar: ["منع تجلط الدم", "الوقاية من السكتة", "علاج الخثار الوريدي"],
      ku: ["پێشگیری لە قورسبوونی خوێن", "پێشگیری لە سترۆک", "چارەسەری DVT"],
    },
    sideEffects: {
      en: ["Bleeding", "Bruising", "Hair loss", "Skin necrosis"],
      ar: ["نزيف", "كدمات", "تساقط الشعر", "موت الأنسجة الجلدية"],
      ku: ["خوێنڕێژی", "شینبوون", "ڕیزانی پرچ", "مردنی شانەی پێست"],
    },
    dosage: {
      en: "Individualized based on INR monitoring",
      ar: "جرعة فردية بناءً على مراقبة INR",
      ku: "دۆزی تایبەت بەپێی چاودێری INR",
    },
    warnings: {
      en: ["Regular INR monitoring required", "Many drug interactions", "Avoid alcohol"],
      ar: ["مراقبة INR منتظمة مطلوبة", "تفاعلات دوائية كثيرة", "تجنب الكحول"],
      ku: ["چاودێری INR ی بەردەوام پێویستە", "کارلێکی دەرمانی زۆر", "دوور بکەوە لە ئەلکوول"],
    },
  },
  {
    id: "metformin",
    qrCode: "MET-004",
    name: { en: "Metformin", ar: "ميتفورمين", ku: "مێتفۆرمین" },
    scientificName: "Metformin Hydrochloride",
    category: "Antidiabetic",
    uses: {
      en: ["Type 2 diabetes management", "Blood sugar control", "PCOS treatment"],
      ar: ["إدارة السكري النوع 2", "التحكم في سكر الدم", "علاج تكيس المبايض"],
      ku: ["بەڕێوەبردنی شەکرە جۆری 2", "کۆنتڕۆڵی شەکری خوێن", "چارەسەری PCOS"],
    },
    sideEffects: {
      en: ["Nausea", "Diarrhea", "Stomach pain", "Metallic taste"],
      ar: ["غثيان", "إسهال", "ألم المعدة", "طعم معدني"],
      ku: ["گێژبوون", "زگماسی", "ئازاری گەدە", "تامی کانزایی"],
    },
    dosage: {
      en: "Start 500mg twice daily, max 2550mg/day",
      ar: "البدء بـ 500 مجم مرتين يومياً، بحد أقصى 2550 مجم/يوم",
      ku: "دەستپێکردن 500 میلی گرام دوو جار لە ڕۆژ، زۆرترین 2550 میلی گرام/ڕۆژ",
    },
    warnings: {
      en: ["Stop before contrast imaging", "Monitor kidney function", "Take with meals"],
      ar: ["توقف قبل التصوير بالصبغة", "راقب وظائف الكلى", "تناول مع الوجبات"],
      ku: ["بوەستە پێش وێنەگرتن بە کۆنتراست", "چاودێری کاری گورچیلە بکە", "لەگەڵ خواردن بیخۆ"],
    },
  },
  {
    id: "lisinopril",
    qrCode: "LIS-005",
    name: { en: "Lisinopril", ar: "ليسينوبريل", ku: "لیسینۆپریل" },
    scientificName: "Lisinopril",
    category: "ACE Inhibitor",
    uses: {
      en: ["High blood pressure", "Heart failure", "Post heart attack care"],
      ar: ["ارتفاع ضغط الدم", "فشل القلب", "الرعاية بعد النوبة القلبية"],
      ku: ["پەستانی خوێنی بەرز", "شکستی دڵ", "چاودێری دوای لێدانی دڵ"],
    },
    sideEffects: {
      en: ["Dry cough", "Dizziness", "Headache", "Fatigue"],
      ar: ["سعال جاف", "دوخة", "صداع", "تعب"],
      ku: ["کۆکەی وشک", "سەرگێژی", "ئێشی سەر", "ماندوێتی"],
    },
    dosage: {
      en: "10-40mg once daily",
      ar: "10-40 مجم مرة واحدة يومياً",
      ku: "10-40 میلی گرام یەک جار لە ڕۆژ",
    },
    warnings: {
      en: ["Do not use in pregnancy", "Monitor potassium levels", "May cause angioedema"],
      ar: ["لا تستخدم أثناء الحمل", "راقب مستويات البوتاسيوم", "قد يسبب وذمة وعائية"],
      ku: ["بەکار مەهێنە لە دووگیانی", "چاودێری ئاستی پۆتاسیۆم بکە", "ڕەنگە ئەنجیۆئێدێما ببێتە هۆی"],
    },
  },
  {
    id: "omeprazole",
    qrCode: "OME-006",
    name: { en: "Omeprazole", ar: "أوميبرازول", ku: "ئۆمیپرازۆل" },
    scientificName: "Omeprazole",
    category: "Proton Pump Inhibitor",
    uses: {
      en: ["GERD treatment", "Stomach ulcers", "Acid reflux"],
      ar: ["علاج ارتجاع المريء", "قرحة المعدة", "حموضة المعدة"],
      ku: ["چارەسەری GERD", "برینی گەدە", "گەڕانەوەی ئەسید"],
    },
    sideEffects: {
      en: ["Headache", "Nausea", "Diarrhea", "Vitamin B12 deficiency"],
      ar: ["صداع", "غثيان", "إسهال", "نقص فيتامين B12"],
      ku: ["ئێشی سەر", "گێژبوون", "زگماسی", "کەمی ڤیتامین B12"],
    },
    dosage: {
      en: "20-40mg once daily before breakfast",
      ar: "20-40 مجم مرة واحدة يومياً قبل الإفطار",
      ku: "20-40 میلی گرام یەک جار لە ڕۆژ پێش نانی بەیانی",
    },
    warnings: {
      en: ["Long-term use may affect bone density", "May mask symptoms of cancer", "Take on empty stomach"],
      ar: ["الاستخدام طويل الأمد قد يؤثر على كثافة العظام", "قد يخفي أعراض السرطان", "تناول على معدة فارغة"],
      ku: [
        "بەکارهێنانی درێژخایەن ڕەنگە کاریگەرییەکانی پاراستنی دڵی ئێسک بکات",
        "ڕەنگە نیشانەکانی شێرپەنجە بشارێتەوە",
        "لەسەر گەدەی بەتاڵ بیخۆ",
      ],
    },
  },
]

export const drugInteractions: DrugInteraction[] = [
  {
    drug1Id: "aspirin",
    drug2Id: "warfarin",
    severity: "critical",
    description: {
      en: "Aspirin significantly increases the risk of bleeding when taken with Warfarin. This combination should be avoided unless specifically prescribed by a physician.",
      ar: "يزيد الأسبرين بشكل كبير من خطر النزيف عند تناوله مع الوارفارين. يجب تجنب هذا المزيج إلا إذا وصفه طبيب بشكل محدد.",
      ku: "ئەسپیرین بەشێوەیەکی بەرچاو مەترسی خوێنڕێژی زیاد دەکات کاتێک لەگەڵ وارفارین دەخورێت. دەبێت لەم تێکەڵەیە دوور بکەوێت ئەگەر پزیشک بە تایبەتی نەینووسێت.",
    },
  },
  {
    drug1Id: "aspirin",
    drug2Id: "ibuprofen",
    severity: "moderate",
    description: {
      en: "Taking Aspirin with Ibuprofen may reduce the cardioprotective effects of Aspirin and increase the risk of gastrointestinal bleeding.",
      ar: "تناول الأسبرين مع الإيبوبروفين قد يقلل من التأثيرات الوقائية للقلب للأسبرين ويزيد من خطر نزيف الجهاز الهضمي.",
      ku: "خواردنی ئەسپیرین لەگەڵ ئیبوپروفین ڕەنگە کاریگەرییەکانی پاراستنی دڵی ئەسپیرین کەم بکات و مەترسی خوێنڕێژی گەدە و ڕیخۆڵە زیاد بکات.",
    },
  },
  {
    drug1Id: "ibuprofen",
    drug2Id: "warfarin",
    severity: "critical",
    description: {
      en: "Ibuprofen can increase the effect of Warfarin and significantly increase bleeding risk. Close monitoring is required if combination cannot be avoided.",
      ar: "يمكن للإيبوبروفين زيادة تأثير الوارفارين وزيادة خطر النزيف بشكل كبير. المراقبة الدقيقة مطلوبة إذا لم يمكن تجنب الجمع.",
      ku: "ئیبوپروفین دەتوانێت کاریگەری وارفارین زیاد بکات و مەترسی خوێنڕێژی بەشێوەیەکی بەرچاو زیاد بکات. چاودێری نزیک پێویستە ئەگەر نەتوانرێت لە تێکەڵکردن دوور بکەویت.",
    },
  },
  {
    drug1Id: "metformin",
    drug2Id: "lisinopril",
    severity: "safe",
    description: {
      en: "Metformin and Lisinopril are commonly used together safely in diabetic patients with hypertension. No significant interaction.",
      ar: "يستخدم الميتفورمين والليسينوبريل بشكل شائع معاً بأمان في مرضى السكري المصابين بارتفاع ضغط الدم. لا يوجد تفاعل مهم.",
      ku: "مێتفۆرمین و لیسینۆپریل بە شێوەیەکی باو پێکەوە بە سەلامەتی بەکاردێن لە نەخۆشانی شەکرەی بەرزی پەستانی خوێن. هیچ کارلێکێکی گرنگ نییە.",
    },
  },
  {
    drug1Id: "omeprazole",
    drug2Id: "metformin",
    severity: "safe",
    description: {
      en: "Omeprazole and Metformin can be taken together safely. Omeprazole may slightly increase Metformin absorption but this is rarely clinically significant.",
      ar: "يمكن تناول أوميبرازول وميتفورمين معاً بأمان. قد يزيد أوميبرازول قليلاً من امتصاص الميتفورمين لكن هذا نادراً ما يكون مهماً سريرياً.",
      ku: "ئۆمیپرازۆل و مێتفۆرمین دەتوانرێت پێکەوە بە سەلامەتی بخورێن. ئۆمیپرازۆل ڕەنگە کەمێک هەڵگرتنی مێتفۆرمین زیاد بکات بەڵام ئەمە بە دەگمەن کلینیکیانە گرنگە.",
    },
  },
  {
    drug1Id: "lisinopril",
    drug2Id: "aspirin",
    severity: "moderate",
    description: {
      en: "High-dose Aspirin may reduce the blood pressure lowering effect of Lisinopril. Low-dose Aspirin is generally acceptable.",
      ar: "جرعة عالية من الأسبرين قد تقلل من تأثير خفض ضغط الدم لليسينوبريل. جرعة منخفضة من الأسبرين مقبولة عموماً.",
      ku: "دۆزی بەرزی ئەسپیرین ڕەنگە کاریگەری دابەزاندنی پەستانی خوێنی لیسینۆپریل کەم بکات. دۆزی نزمی ئەسپیرین بەگشتی قبوڵە.",
    },
  },
]

export function searchDrugs(query: string, language: "en" | "ar" | "ku"): Drug[] {
  const normalizedQuery = query.toLowerCase()
  return drugs.filter(
    (drug) =>
      drug.name[language].toLowerCase().includes(normalizedQuery) ||
      drug.name.en.toLowerCase().includes(normalizedQuery) ||
      drug.scientificName.toLowerCase().includes(normalizedQuery) ||
      drug.category.toLowerCase().includes(normalizedQuery),
  )
}

export function getInteraction(drug1Id: string, drug2Id: string): DrugInteraction | null {
  return (
    drugInteractions.find(
      (i) => (i.drug1Id === drug1Id && i.drug2Id === drug2Id) || (i.drug1Id === drug2Id && i.drug2Id === drug1Id),
    ) || null
  )
}

export function getDrugByQRCode(qrCode: string): Drug | null {
  return drugs.find((drug) => drug.qrCode.toLowerCase() === qrCode.toLowerCase()) || null
}

export function getDrugById(id: string): Drug | null {
  return drugs.find((drug) => drug.id === id) || null
}
