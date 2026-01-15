export type Language = "en" | "ar" | "ku"

export const translations = {
  en: {
    // Header
    appName: "PharmRef Gateway",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",

    // Search
    searchPlaceholder: "Search for drugs, medications, or active ingredients...",
    recentSearches: "Recent Searches",
    clearAll: "Clear All",

    // Drug Card
    scientificName: "Scientific Name",
    commonUses: "Common Uses",
    sideEffects: "Side Effects",
    dosage: "Dosage",
    warnings: "Warnings",

    // Interaction Checker
    interactionChecker: "Drug Interaction Checker",
    selectFirstDrug: "Select First Drug",
    selectSecondDrug: "Select Second Drug",
    checkInteractions: "Check Interactions",
    dropHere: "Drop drug here or click to select",

    // Severity
    critical: "Critical",
    criticalDesc: "High danger - Avoid combination",
    moderate: "Moderate",
    moderateDesc: "Caution advised - Monitor closely",
    safe: "Safe",
    safeDesc: "No known interaction",

    // Results
    interactionResult: "Interaction Result",
    noInteractionFound: "No known interactions found between these drugs.",

    // Navigation
    home: "Home",
    drugSearch: "Drug Search",
    interactionCheckerNav: "Interaction Checker",
    qrScanner: "QR Scanner",
    backToHome: "Back to Home",

    // Home page
    welcomeTitle: "Welcome to PharmRef Gateway",
    welcomeDescription: "Your comprehensive pharmacy reference tool",
    searchDrugsTitle: "Search Drugs",
    searchDrugsDesc: "Find detailed information about medications",
    interactionCheckerTitle: "Check Interactions",
    interactionCheckerDesc: "Verify drug-to-drug interactions",
    qrScannerTitle: "Scan QR Code",
    qrScannerDesc: "Quickly find drug info by scanning",

    // QR Scanner
    scanQRCode: "Scan QR Code",
    qrInstructions: "Point your camera at a drug QR code or enter the code manually",
    enterManually: "Enter Code Manually",
    qrCodePlaceholder: "Enter drug code (e.g., ASP-001)",
    searchByCode: "Search by Code",
    cameraError: "Camera access denied. Please allow camera access to scan QR codes.",
    startCamera: "Start Camera",
    stopCamera: "Stop Camera",

    // Drug detail
    drugDetails: "Drug Details",
    viewDetails: "View Details",

    // API-powered features
    noResults: "No results found",
    loading: "Loading...",
    searching: "Searching...",
    aiPowered: "AI-Powered Search",
  },
  ar: {
    // Header
    appName: "بوابة المرجع الصيدلاني",
    language: "اللغة",
    theme: "المظهر",
    light: "فاتح",
    dark: "داكن",

    // Search
    searchPlaceholder: "ابحث عن الأدوية أو المكونات الفعالة...",
    recentSearches: "عمليات البحث الأخيرة",
    clearAll: "مسح الكل",

    // Drug Card
    scientificName: "الاسم العلمي",
    commonUses: "الاستخدامات الشائعة",
    sideEffects: "الآثار الجانبية",
    dosage: "الجرعة",
    warnings: "تحذيرات",

    // Interaction Checker
    interactionChecker: "فاحص التفاعلات الدوائية",
    selectFirstDrug: "اختر الدواء الأول",
    selectSecondDrug: "اختر الدواء الثاني",
    checkInteractions: "فحص التفاعلات",
    dropHere: "أسقط الدواء هنا أو انقر للاختيار",

    // Severity
    critical: "حرج",
    criticalDesc: "خطورة عالية - تجنب الجمع",
    moderate: "متوسط",
    moderateDesc: "ينصح بالحذر - راقب عن كثب",
    safe: "آمن",
    safeDesc: "لا توجد تفاعلات معروفة",

    // Results
    interactionResult: "نتيجة التفاعل",
    noInteractionFound: "لم يتم العثور على تفاعلات معروفة بين هذه الأدوية.",

    // Navigation
    home: "الرئيسية",
    drugSearch: "بحث الأدوية",
    interactionCheckerNav: "فاحص التفاعلات",
    qrScanner: "ماسح QR",
    backToHome: "العودة للرئيسية",

    // Home page
    welcomeTitle: "مرحباً ببوابة المرجع الصيدلاني",
    welcomeDescription: "أداتك الشاملة للمرجع الصيدلاني",
    searchDrugsTitle: "بحث الأدوية",
    searchDrugsDesc: "ابحث عن معلومات تفصيلية عن الأدوية",
    interactionCheckerTitle: "فحص التفاعلات",
    interactionCheckerDesc: "تحقق من التفاعلات بين الأدوية",
    qrScannerTitle: "مسح رمز QR",
    qrScannerDesc: "اعثر على معلومات الدواء بسرعة عبر المسح",

    // QR Scanner
    scanQRCode: "مسح رمز QR",
    qrInstructions: "وجه الكاميرا نحو رمز QR للدواء أو أدخل الرمز يدوياً",
    enterManually: "إدخال الرمز يدوياً",
    qrCodePlaceholder: "أدخل رمز الدواء (مثل: ASP-001)",
    searchByCode: "بحث بالرمز",
    cameraError: "تم رفض الوصول للكاميرا. يرجى السماح بالوصول للكاميرا لمسح رموز QR.",
    startCamera: "تشغيل الكاميرا",
    stopCamera: "إيقاف الكاميرا",

    // Drug detail
    drugDetails: "تفاصيل الدواء",
    viewDetails: "عرض التفاصيل",

    // API-powered features
    noResults: "لم يتم العثور على نتائج",
    loading: "جاري التحميل...",
    searching: "جاري البحث...",
    aiPowered: "بحث مدعوم بالذكاء الاصطناعي",
  },
  ku: {
    // Header
    appName: "دەروازەی سەرچاوەی دەرمانخانە",
    language: "زمان",
    theme: "ڕووکار",
    light: "ڕووناک",
    dark: "تاریک",

    // Search
    searchPlaceholder: "بگەڕێ بۆ دەرمان یان کارمادەی چالاک...",
    recentSearches: "گەڕانەکانی تازە",
    clearAll: "سڕینەوەی هەموو",

    // Drug Card
    scientificName: "ناوی زانستی",
    commonUses: "بەکارهێنانە باوەکان",
    sideEffects: "کاریگەرییە لاوەکییەکان",
    dosage: "دۆز",
    warnings: "ئاگاداریەکان",

    // Interaction Checker
    interactionChecker: "پشکنەری کارلێکی دەرمان",
    selectFirstDrug: "دەرمانی یەکەم هەڵبژێرە",
    selectSecondDrug: "دەرمانی دووەم هەڵبژێرە",
    checkInteractions: "پشکنینی کارلێکەکان",
    dropHere: "دەرمان لێرە دابنێ یان کرتە بکە بۆ هەڵبژاردن",

    // Severity
    critical: "کریتیک",
    criticalDesc: "مەترسی بەرز - دوور بکەوە لە تێکەڵکردن",
    moderate: "مامناوەند",
    moderateDesc: "وریابوون پێویستە - بە وریایی چاودێری بکە",
    safe: "سەلامەت",
    safeDesc: "هیچ کارلێکێکی زانراو نییە",

    // Results
    interactionResult: "ئەنجامی کارلێک",
    noInteractionFound: "هیچ کارلێکێکی زانراو نەدۆزرایەوە لەنێوان ئەم دەرمانانە.",

    // Navigation
    home: "سەرەکی",
    drugSearch: "گەڕانی دەرمان",
    interactionCheckerNav: "پشکنەری کارلێک",
    qrScanner: "سکانەری QR",
    backToHome: "گەڕانەوە بۆ سەرەکی",

    // Home page
    welcomeTitle: "بەخێربێیت بۆ دەروازەی سەرچاوەی دەرمانخانە",
    welcomeDescription: "ئامرازی تەواوی سەرچاوەی دەرمانسازی",
    searchDrugsTitle: "گەڕانی دەرمان",
    searchDrugsDesc: "زانیاری وردی دەرمان بدۆزەرەوە",
    interactionCheckerTitle: "پشکنینی کارلێک",
    interactionCheckerDesc: "کارلێکی نێوان دەرمانەکان بپشکنە",
    qrScannerTitle: "سکانی کۆدی QR",
    qrScannerDesc: "بە خێرایی زانیاری دەرمان بدۆزەرەوە بە سکان",

    // QR Scanner
    scanQRCode: "سکانی کۆدی QR",
    qrInstructions: "کامێراکەت ڕووی کۆدی QR ی دەرمان بکە یان کۆدەکە بە دەست بنووسە",
    enterManually: "کۆد بە دەست بنووسە",
    qrCodePlaceholder: "کۆدی دەرمان بنووسە (وەک: ASP-001)",
    searchByCode: "گەڕان بە کۆد",
    cameraError: "دەستگەیشتن بە کامێرا ڕەتکرایەوە. تکایە ڕێگە بدە بە کامێرا بۆ سکانی کۆدەکانی QR.",
    startCamera: "دەستپێکردنی کامێرا",
    stopCamera: "وەستاندنی کامێرا",

    // Drug detail
    drugDetails: "وردەکاری دەرمان",
    viewDetails: "بینینی وردەکاری",

    // API-powered features
    noResults: "هیچ ئەنجامێک نەدۆزرایەوە",
    loading: "بارکردن...",
    searching: "گەڕان...",
    aiPowered: "گەڕانی زیرەکی دەستکرد",
  },
} as const

export type TranslationKey = keyof typeof translations.en
