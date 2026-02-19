export type Language = "en" | "ar" | "ku"

export const translations = {
  en: {
    appName: "PharmRef Gateway",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",

    searchPlaceholder: "Search for drugs, medications, or active ingredients...",
    recentSearches: "Recent Searches",
    clearAll: "Clear All",

    scientificName: "Scientific Name",
    commonUses: "Common Uses",
    sideEffects: "Side Effects",
    dosage: "Dosage",
    warnings: "Warnings",

    interactionChecker: "Drug Interaction Checker",
    selectFirstDrug: "Select First Drug",
    selectSecondDrug: "Select Second Drug",
    checkInteractions: "Check Interactions",
    dropHere: "Drop drug here or click to select",

    critical: "Critical",
    criticalDesc: "High danger - Avoid combination",
    moderate: "Moderate",
    moderateDesc: "Caution advised - Monitor closely",
    safe: "Safe",
    safeDesc: "No known interaction",

    interactionResult: "Interaction Result",
    noInteractionFound: "No known interactions found between these drugs.",

    home: "Home",
    drugSearch: "Drug Search",
    interactionCheckerNav: "Interaction Checker",
    backToHome: "Back to Home",

    welcomeTitle: "Welcome to PharmRef Gateway",
    welcomeDescription: "Your comprehensive pharmacy reference tool",
    searchDrugsTitle: "Search Drugs",
    searchDrugsDesc: "Find detailed information about medications",
    interactionCheckerTitle: "Check Interactions",
    interactionCheckerDesc: "Verify drug-to-drug interactions",


    drugDetails: "Drug Details",
    viewDetails: "View Details",
    medicalDisclaimer: "Medical Disclaimer",
    disclaimerText: "The information provided, including AI summaries and raw FDA data, is for educational purposes only. It is not a substitute for professional medical advice. Always consult a physician before making medical decisions.",

    noResults: "No results found",
    loading: "Loading...",
    searching: "Searching...",
    aiPowered: "AI-Powered Search",
  },
  ar: {
    appName: "بوابة المرجع الصيدلاني",
    language: "اللغة",
    theme: "المظهر",
    light: "فاتح",
    dark: "داكن",

    searchPlaceholder: "ابحث عن الأدوية أو المكونات الفعالة...",
    recentSearches: "عمليات البحث الأخيرة",
    clearAll: "مسح الكل",

    scientificName: "الاسم العلمي",
    commonUses: "الاستخدامات الشائعة",
    sideEffects: "الآثار الجانبية",
    dosage: "الجرعة",
    warnings: "تحذيرات",

    interactionChecker: "فاحص التفاعلات الدوائية",
    selectFirstDrug: "اختر الدواء الأول",
    selectSecondDrug: "اختر الدواء الثاني",
    checkInteractions: "فحص التفاعلات",
    dropHere: "أسقط الدواء هنا أو انقر للاختيار",

    critical: "حرج",
    criticalDesc: "خطورة عالية - تجنب الجمع",
    moderate: "متوسط",
    moderateDesc: "ينصح بالحذر - راقب عن كثب",
    safe: "آمن",
    safeDesc: "لا توجد تفاعلات معروفة",

    interactionResult: "نتيجة التفاعل",
    noInteractionFound: "لم يتم العثور على تفاعلات معروفة بين هذه الأدوية.",

    home: "الرئيسية",
    drugSearch: "بحث الأدوية",
    interactionCheckerNav: "فاحص التفاعلات",
    backToHome: "العودة للرئيسية",

    welcomeTitle: "مرحباً بك في بوابة المرجع الصيدلاني",
    welcomeDescription: "أداة المرجع الصيدلاني الشاملة الخاصة بك",
    searchDrugsTitle: "بحث الأدوية",
    searchDrugsDesc: "ابحث عن معلومات تفصيلية عن الأدوية",
    interactionCheckerTitle: "فحص التفاعلات",
    interactionCheckerDesc: "تحقق من التفاعلات بين الأدوية",


    drugDetails: "تفاصيل الدواء",
    viewDetails: "عرض التفاصيل",
    medicalDisclaimer: "إخلاء مسؤولية طبي",
    disclaimerText: "المعلومات المقدمة، بما في ذلك ملخصات الذكاء الاصطناعي وبيانات FDA، هي لأغراض تعليمية فقط. وليست بديلاً عن الاستشارة الطبية المهنية. استشر الطبيب دائماً قبل اتخاذ أي قرارات طبية.",

    noResults: "لم يتم العثور على نتائج",
    loading: "جاري التحميل...",
    searching: "جاري البحث...",
    aiPowered: "بحث مدعوم بالذكاء الاصطناعي",
  },
  ku: {
    appName: "دەروازەی سەرچاوەی دەرمانخانە",
    language: "زمان",
    theme: "ڕووکار",
    light: "ڕووناک",
    dark: "تاریک",

    searchPlaceholder: "بگەڕێ بۆ دەرمان یان کارمادەی چالاک...",
    recentSearches: "گەڕانەکانی تازە",
    clearAll: "سڕینەوەی هەموو",

    scientificName: "ناوی زانستی",
    commonUses: "بەکارهێنانە باوەکان",
    sideEffects: "کاریگەرییە لاوەکییەکان",
    dosage: "دۆز",
    warnings: "ئاگاداریەکان",

    interactionChecker: "پشکنەری کارلێکی دەرمان",
    selectFirstDrug: "دەرمانی یەکەم هەڵبژێرە",
    selectSecondDrug: "دەرمانی دووەم هەڵبژێرە",
    checkInteractions: "پشکنینی کارلێکەکان",
    dropHere: "دەرمان لێرە دابنێ یان کرتە بکە بۆ هەڵبژاردن",

    critical: "کریتیک",
    criticalDesc: "مەترسی بەرز - دوور بکەوە لە تێکەڵکردن",
    moderate: "مامناوەند",
    moderateDesc: "وریابوون پێویستە - بە وریایی چاودێری بکە",
    safe: "سەلامەت",
    safeDesc: "هیچ کارلێکێکی زانراو نییە",

    interactionResult: "ئەنجامی کارلێک",
    noInteractionFound: "هیچ کارلێکێکی زانراو نەدۆزرایەوە لەنێوان ئەم دەرمانانە.",

    home: "سەرەکی",
    drugSearch: "گەڕانی دەرمان",
    interactionCheckerNav: "پشکنەری کارلێک",
    backToHome: "گەڕانەوە بۆ سەرەکی",

    welcomeTitle: "بەخێربێیت بۆ دەروازەی سەرچاوەی دەرمانخانە",
    welcomeDescription: "ئامرازی تەواوی سەرچاوەی دەرمانسازی",
    searchDrugsTitle: "گەڕانی دەرمان",
    searchDrugsDesc: "زانیاری وردی دەرمان بدۆزەرەوە",
    interactionCheckerTitle: "پشکنینی کارلێک",
    interactionCheckerDesc: "کارلێکی نێوان دەرمانەکان بپشکنە",


    drugDetails: "وردەکاری دەرمان",
    viewDetails: "بینینی وردەکاری",
    medicalDisclaimer: "بەرپرسیارێتی پزیشکی",
    disclaimerText: "ئەو زانیارییانەی دابینکراون، لەوانە کورتەی زیرەکی دەستکرد و داتاکانی FDA، تەنها بۆ مەبەستی پەروەردەیین. جێگرەوەی ئامۆژگاری پزیشکی نین. هەمیشە پێش بڕیاردانی پزیشکی ڕاوێژ بە پزیشک بکە.",

    noResults: "هیچ ئەنجامێک نەدۆزرایەوە",
    loading: "بارکردن...",
    searching: "گەڕان...",
    aiPowered: "گەڕانی زیرەکی دەستکرد",
  },
} as const

export type TranslationKey = keyof typeof translations.en
