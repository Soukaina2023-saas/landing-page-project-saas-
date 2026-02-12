/**
 * PageGen Pro - Main Application Logic
 * Production-ready SPA for AI Landing Page Generation
 * Enhanced with Advanced Customization System, Preset Themes & Save/Load
 */

// ============================================
// APP STATE
// ============================================
const AppState = {
    currentLang: 'ar',
    currentTheme: 'gold',
    themeApplied: false, // Track if user has manually applied a color palette
    currentTone: 'professional',
    currentView: 'desktop',
    uploadedImage: null,
    generatedHTML: '',
    generatedImages: {},
    pagesCount: 0,
    imagesCount: 0,
    isGenerating: false,
    isPremium: false, // Premium = extra power features (inline edit, layout, templates, widgets, logo). Basic tools never locked.
    hasGeneratedOnce: false,
    // Customization State
    customization: {
        font: 'cairo',
        gap: 24,
        padding: 48,
        borderRadius: 24,
        backgroundType: 'gradient',
        backgroundValue: 'hero-gradient',
        animations: {
            enabled: true,
            float: true,
            glow: true,
            speed: 1
        }
    },
    // Track loaded fonts - Cairo is pre-loaded for UI
    loadedFonts: new Set(['cairo']),
    // Premium power features (only when isPremium; basic tools never locked)
    premium: {
        inlineEdit: false,
        sectionOrder: ['hero', 'problem', 'solution', 'howItWorks', 'beforeAfter', 'testimonials', 'expert', 'faq', 'cta', 'footer'],
        columnLayout: '6-6',
        templateId: null,
        widgets: { countdown: false, whatsapp: false, videoPopup: false, testimonialsBlock: true },
        logoUrl: null,
        logoPosition: 'header',
        editedContent: {}
    },
    textEditHistory: { undo: [], redo: [], maxUndo: 10 }
};

// ============================================
// THEME SWITCHING (CSS variables + localStorage)
// ============================================
const THEME_STORAGE_KEY = 'pagegen-active-theme';

var THEME_VARS = {
    'theme-1': {
        '--bg-primary': '#0b0f2a',
        '--bg-secondary': '#11163a',
        '--bg-card': 'rgba(26, 31, 74, 0.5)',
        '--bg-elevated': '#1a1f4a',
        '--border-color': 'rgba(255, 255, 255, 0.08)',
        '--bg-gradient-body': 'linear-gradient(135deg, #0b0f2a 0%, #11163a 50%, #0d1030 100%)',
        '--accent-primary': '#8b5cf6',
        '--accent-secondary': '#ec4899',
        '--accent-gradient': 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #ec4899 100%)',
        '--text-primary': 'rgba(255, 255, 255, 0.95)',
        '--text-secondary': 'rgba(255, 255, 255, 0.65)',
        '--text-muted': 'rgba(255, 255, 255, 0.45)',
        '--glass-bg': 'rgba(26, 31, 74, 0.45)',
        '--glass-border': 'rgba(255, 255, 255, 0.08)',
        '--glass-highlight': 'rgba(255, 255, 255, 0.03)',
        '--shadow-soft': '0 8px 32px rgba(0, 0, 0, 0.4)',
        '--shadow-glow': '0 0 60px rgba(139, 92, 246, 0.15)',
        '--shadow-depth': '0 50px 100px rgba(0, 0, 0, 0.5)'
    },
    'theme-2': {
        '--bg-primary': '#1a0b2e',
        '--bg-secondary': '#2d1b4e',
        '--bg-card': 'rgba(45, 27, 78, 0.8)',
        '--bg-elevated': '#3d2366',
        '--border-color': 'rgba(139, 92, 246, 0.15)',
        '--accent-primary': '#8b5cf6',
        '--accent-secondary': '#ec4899',
        '--accent-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #8b5cf6 100%)',
        '--text-primary': '#ffffff',
        '--text-secondary': '#a78bfa',
        '--glass-bg': 'rgba(45, 27, 78, 0.7)',
        '--glass-border': 'rgba(139, 92, 246, 0.2)',
        '--glass-highlight': 'rgba(255, 255, 255, 0.03)',
        '--shadow-soft': '0 8px 32px rgba(0, 0, 0, 0.4)',
        '--shadow-glow': '0 0 60px rgba(139, 92, 246, 0.15)',
        '--shadow-depth': '0 50px 100px rgba(0, 0, 0, 0.5)'
    },
    'theme-3': {
        '--bg-primary': '#0f172a',
        '--bg-secondary': '#1e293b',
        '--bg-card': 'rgba(30, 41, 59, 0.7)',
        '--bg-elevated': '#1e293b',
        '--border-color': 'rgba(148, 163, 184, 0.1)',
        '--accent-primary': '#8b5cf6',
        '--accent-secondary': '#6366f1',
        '--accent-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        '--text-primary': '#f8fafc',
        '--text-secondary': '#94a3b8',
        '--glass-bg': 'rgba(30, 41, 59, 0.6)',
        '--glass-border': 'rgba(255, 255, 255, 0.08)',
        '--glass-highlight': 'rgba(255, 255, 255, 0.03)',
        '--shadow-soft': '0 8px 32px rgba(0, 0, 0, 0.4)',
        '--shadow-glow': '0 0 60px rgba(99, 102, 241, 0.15)',
        '--shadow-depth': '0 50px 100px rgba(0, 0, 0, 0.5)'
    },
    'theme-4': {
        '--bg-primary': '#0f172a',
        '--bg-secondary': '#1e293b',
        '--bg-card': 'rgba(30, 41, 59, 0.7)',
        '--bg-elevated': '#1e293b',
        '--border-color': 'rgba(148, 163, 184, 0.1)',
        '--accent-primary': '#f67f44',
        '--accent-secondary': '#f67f44',
        '--accent-gradient': 'linear-gradient(135deg, #f67f44 0%, #f67f44 100%)',
        '--text-primary': '#f8fafc',
        '--text-secondary': '#78787d',
        '--glass-bg': 'rgba(30, 41, 59, 0.6)',
        '--glass-border': 'rgba(255, 255, 255, 0.08)',
        '--glass-highlight': 'rgba(255, 255, 255, 0.03)',
        '--shadow-soft': '0 8px 32px rgba(0, 0, 0, 0.4)',
        '--shadow-glow': '0 0 60px rgba(246, 127, 68, 0.15)',
        '--shadow-depth': '0 50px 100px rgba(0, 0, 0, 0.5)'
    },
    'theme-dark': {
        '--bg-primary': '#050505',
        '--bg-secondary': '#0a060e',
        '--bg-card': 'rgba(10, 6, 16, 0.8)',
        '--bg-elevated': '#0f0a14',
        '--border-color': 'rgba(255, 255, 255, 0.06)',
        '--bg-gradient-body': 'linear-gradient(135deg, #050505 0%, #0a060e 50%, #050505 100%)',
        '--accent-primary': '#814ac8',
        '--accent-secondary': '#9e74d4',
        '--accent-gradient': 'linear-gradient(135deg, #814ac8 0%, #9e74d4 100%)',
        '--text-primary': '#ffffff',
        '--text-secondary': '#a1a1aa',
        '--text-muted': 'rgba(255, 255, 255, 0.5)',
        '--glass-bg': 'rgba(10, 6, 16, 0.7)',
        '--glass-border': 'rgba(255, 255, 255, 0.06)',
        '--glass-highlight': 'rgba(255, 255, 255, 0.02)',
        '--shadow-soft': '0 8px 32px rgba(0, 0, 0, 0.5)',
        '--shadow-glow': '0 0 60px rgba(129, 74, 200, 0.2)',
        '--shadow-depth': '0 50px 100px rgba(0, 0, 0, 0.5)'
    },
    'theme-light': {
        '--bg-primary': '#f5f7fa',
        '--bg-secondary': '#ffffff',
        '--bg-card': 'rgba(255, 255, 255, 0.72)',
        '--bg-elevated': '#e8ecf1',
        '--border-color': 'rgba(255, 255, 255, 0.5)',
        '--bg-gradient-body': 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 50%, #dce3eb 100%)',
        '--accent-primary': '#667eea',
        '--accent-secondary': '#764ba2',
        '--accent-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
        '--text-primary': '#0f0f23',
        '--text-secondary': '#4a4a6a',
        '--text-muted': 'rgba(15, 15, 35, 0.5)',
        '--glass-bg': 'rgba(255, 255, 255, 0.72)',
        '--glass-border': 'rgba(255, 255, 255, 0.5)',
        '--glass-highlight': 'rgba(255, 255, 255, 0.4)',
        '--shadow-soft': '0 8px 32px rgba(31, 38, 135, 0.12)',
        '--shadow-glow': '0 0 40px rgba(102, 126, 234, 0.15)',
        '--shadow-depth': '0 50px 100px rgba(0, 0, 0, 0.08)'
    },
    'theme-neon': {
        '--bg-primary': '#0a0a0f',
        '--bg-secondary': '#0f0f15',
        '--bg-card': 'rgba(15, 15, 25, 0.8)',
        '--bg-elevated': '#151520',
        '--border-color': 'rgba(255, 255, 255, 0.08)',
        '--bg-gradient-body': 'linear-gradient(135deg, #0a0a0f 0%, #0f0f15 50%, #0a0a0f 100%)',
        '--accent-primary': '#00f3ff',
        '--accent-secondary': '#bc13fe',
        '--accent-gradient': 'linear-gradient(135deg, #00f3ff 0%, #bc13fe 50%, #ff006e 100%)',
        '--text-primary': 'rgba(255, 255, 255, 0.95)',
        '--text-secondary': 'rgba(255, 255, 255, 0.65)',
        '--text-muted': 'rgba(255, 255, 255, 0.45)',
        '--glass-bg': 'rgba(15, 15, 25, 0.8)',
        '--glass-border': 'rgba(255, 255, 255, 0.08)',
        '--glass-highlight': 'rgba(0, 243, 255, 0.1)',
        '--shadow-soft': '0 8px 32px rgba(0, 0, 0, 0.6)',
        '--shadow-glow': '0 0 60px rgba(0, 243, 255, 0.2)',
        '--shadow-depth': '0 50px 100px rgba(0, 0, 0, 0.7)'
    }
};

function applyTheme(themeName) {
    var root = document.documentElement;
    var vars = THEME_VARS[themeName];
    if (!vars) return;
    Object.keys(vars).forEach(function (key) {
        root.style.setProperty(key, vars[key]);
    });
    if (themeName === 'theme-light') {
        root.classList.add('theme-light');
    } else {
        root.classList.remove('theme-light');
    }
    
    // Add/remove Neon theme animations
    if (themeName === 'theme-neon') {
        root.setAttribute('data-theme', 'theme-neon');
        // Remove existing neon elements first
        document.querySelectorAll('.neon-orb, .neon-scanner').forEach(function(el) {
            el.remove();
        });
        // Add floating orbs
        setTimeout(function() {
            var orb1 = document.createElement('div');
            orb1.className = 'neon-orb neon-orb-1';
            document.body.appendChild(orb1);
            var orb2 = document.createElement('div');
            orb2.className = 'neon-orb neon-orb-2';
            document.body.appendChild(orb2);
            var orb3 = document.createElement('div');
            orb3.className = 'neon-orb neon-orb-3';
            document.body.appendChild(orb3);
            // Add scanner line
            var scanner = document.createElement('div');
            scanner.className = 'neon-scanner';
            document.body.appendChild(scanner);
        }, 100);
    } else {
        root.removeAttribute('data-theme');
        // Remove neon elements
        document.querySelectorAll('.neon-orb, .neon-scanner').forEach(function(el) {
            el.remove();
        });
    }
    
    try {
        localStorage.setItem(THEME_STORAGE_KEY, themeName);
    } catch (e) {}
    document.querySelectorAll('.theme-dropdown-btn').forEach(function (btn) {
        btn.classList.toggle('theme-btn-active', btn.getAttribute('data-theme') === themeName);
    });
}

// ============================================
// I18N - AR / EN / FR (no hardcoded UI strings)
// ============================================
const I18n = {
    ar: {
        appTitle: 'PageGen',
        appSubtitle: 'منشئ الصفحات الذكي',
        customize: 'تخصيص',
        customization: 'التخصيص المتقدم',
        customizationDesc: 'تخصيص مظهر صفحة الهبوط',
        saveLoad: 'حفظ وتحميل',
        designName: 'اسم التصميم',
        save: 'حفظ',
        noSavedStyles: 'لا توجد تصاميم محفوظة',
        load: 'تحميل',
        delete: 'حذف',
        presetThemes: 'الثيمات الجاهزة',
        fonts: 'الخطوط',
        chooseOneFont: 'اختر خطاً واحداً للعناوين والنصوص',
        premiumFonts: 'خطوط إضافية',
        extraFonts: 'خطوط إضافية',
        powerFeatures: 'أدوات Premium',
        inlineEdit: 'تعديل النص مباشرة',
        inlineEditDesc: 'اضغط على أي نص في المعاينة لتعديله',
        layoutControl: 'ترتيب وتخطيط الصفحة',
        layoutControlDesc: 'ترتيب الأقسام واختيار تخطيط الأعمدة',
        premiumTemplates: 'قوالب احترافية',
        premiumTemplatesDesc: 'قوالب جاهزة بتصاميم متقدمة',
        premiumWidgets: 'ودجات جاهزة',
        premiumWidgetsDesc: 'فيديو، عد تنازلي، واتساب، شهادات',
        brandLogo: 'الشعار والهوية',
        brandLogoDesc: 'رفع الشعار وموضعه في الصفحة',
        sectionOrder: 'ترتيب الأقسام',
        sectionOrderDesc: 'حرّك الأقسام بأعلى أو أسفل لترتيب صفحة الهبوط كما تريد.',
        sectionOrder_hero: 'هيرو',
        sectionOrder_problem: 'المشاكل',
        sectionOrder_solution: 'الحلول',
        sectionOrder_howItWorks: 'كيف يعمل',
        sectionOrder_beforeAfter: 'قبل وبعد',
        sectionOrder_testimonials: 'آراء العملاء',
        sectionOrder_expert: 'توصية الخبير',
        sectionOrder_faq: 'الأسئلة الشائعة',
        sectionOrder_cta: 'الدعوة للإجراء',
        sectionOrder_footer: 'التذييل',
        sectionOrderUp: 'أعلى',
        sectionOrderDown: 'أسفل',
        columnLayout: 'تخطيط الأعمدة',
        addWidget: 'إضافة ودجت',
        widgetCountdown: 'عد تنازلي',
        widgetWhatsApp: 'زر واتساب',
        widgetVideo: 'فيديو بوب أب',
        widgetTestimonials: 'كتلة شهادات',
        uploadLogo: 'رفع الشعار',
        logoPosition: 'موضع الشعار',
        logoHeader: 'الهيدر',
        logoHero: 'منطقة الهيرو',
        layout: 'الأبعاد والتخطيط',
        gap: 'المسافات بين العناصر',
        padding: 'الهوامش الداخلية',
        radius: 'تدوير الحواف',
        backgrounds: 'الخلفيات',
        solid: 'لون ثابت',
        gradient: 'تدرج',
        animations: 'الحركات والأنيميشن',
        enableAnimations: 'تفعيل الحركات',
        animDesc: 'حركات عند التمرير والظهور',
        floatProduct: 'حركة المنتج',
        floatDesc: 'تأثير عائم للمنتج في Hero',
        buttonGlow: 'توهج الأزرار',
        glowDesc: 'تأثير Glow على أزرار CTA',
        animSpeed: 'سرعة الحركات',
        slow: 'بطيء',
        fast: 'سريع',
        veryFast: 'سريع جداً',
        medium: 'متوسط',
        resetDefault: 'إعادة الضبط الافتراضي',
        productImage: 'صورة المنتج',
        uploadProduct: 'ارفع صورة المنتج',
        uploadHint: 'سنستخدمها لتوليد صور تسويقية احترافية',
        uploadFormats: 'PNG, JPG حتى 5MB',
        uploadSuccess: '✓ تم رفع الصورة بنجاح',
        removeImage: 'إزالة الصورة',
        tip: 'نصيحة: استخدم صورة واضحة للمنتج على خلفية بيضاء للحصول على أفضل نتيجة.',
        projectDetails: 'تفاصيل المشروع',
        categoryBeauty: 'منتجات تجميل وعناية',
        categoryHealth: 'مكملات غذائية وصحة',
        categoryKitchen: 'أجهزة منزلية ومطبخ',
        categoryFitness: 'رياضة ولياقة',
        categoryTech: 'تقنية وأجهزة',
        goalSell: 'بيع مباشر',
        goalLeads: 'جمع عملاء محتملين',
        goalWhatsapp: 'تواصل واتساب',
        currencyRiyal: 'ريال',
        currencyDirham: 'درهم',
        currencyDinar: 'دينار',
        currencyDollar: 'دولار',
        currencyEuro: 'يورو',
        productName: 'اسم المنتج',
        productNamePlaceholder: 'مثال: زيت الأرغان الطبيعي',
        category: 'فئة المنتج',
        problem: 'المشكلة التي يحلها',
        problemPlaceholder: 'مثال: تساقط الشعر، بشرة جافة...',
        benefit: 'الفائدة الرئيسية',
        benefitPlaceholder: 'مثال: شعر كثيف ولامع في 30 يوم...',
        price: 'السعر',
        goal: 'الهدف الرئيسي',
        tone: 'نبرة الصوت',
        toneProfessional: 'احترافي',
        toneFriendly: 'ودود',
        toneUrgent: 'عاجل',
        colorPalette: 'لوحة الألوان',
        generate: 'إنشاء صفحة الهبوط',
        generating: 'جاري الإنشاء...',
        livePreview: 'معاينة حية',
        desktop: 'Desktop',
        mobile: 'Mobile',
        openInNewTab: 'فتح في نافذة جديدة',
        landingHere: 'صفحة الهبوط ستظهر هنا',
        uploadAndCreate: 'ارفع صورة المنتج واضغط "إنشاء"',
        building: 'جاري تجميع الصفحة...',
        status: 'حالة النظام',
        waitingImage: 'في انتظار الصورة',
        ready: 'جاهز للإنشاء',
        created: 'تم الإنشاء بنجاح',
        exportSection: 'تصدير',
        downloadHtml: 'تحميل HTML',
        copyCode: 'نسخ الكود',
        regenerate: 'إعادة إنشاء',
        exportFormat: 'اختر صيغة التصدير',
        exportHtmlOnly: 'HTML فقط',
        exportZip: 'ZIP (HTML + CSS + Assets)',
        exportJpg: 'JPG / JPEG (لقطة شاشة)',
        exportPdf: 'PDF',
        cancel: 'إلغاء',
        export: 'تصدير',
        pagesCreated: 'صفحة منشأة',
        imagesGenerated: 'صور مولدة',
        generatedImagesTitle: 'الصور المولدة',
        noImagesYet: 'ستظهر هنا الصور التسويقية',
        premium: 'Premium',
        upgradeToUnlock: 'ترقية لفتح هذه الميزة',
        locked: 'مقفل',
        toastSaved: 'تم حفظ التصميم بنجاح',
        toastLoad: 'تم تحميل',
        toastDeleted: 'تم حذف التصميم',
        toastReset: 'تم إعادة الضبط الافتراضي',
        toastStyleApplied: 'تم تطبيق ثيم',
        toastThemeApplied: 'تم تطبيق لوحة الألوان',
        colorPaletteDesc: 'اختر لوحة ألوان لتطبيقها على صفحة الهبوط',
        applyTheme: 'تطبيق لوحة الألوان',
        priceCardTexts: 'نصوص بطاقة السعر',
        priceCardTextsDesc: 'غيّر نصوص الضمان والدفع والشحن الظاهرة تحت السعر حسب رغبتك. اترك الحقل فارغاً لاستخدام النص الافتراضي.',
        priceLabelSecure: 'دفع آمن',
        priceLabelShipping: 'شحن مجاني',
        priceLabelWarranty: 'ضمان (مثال: ضمان 30 يوم)',
        toastErrorName: 'يرجى إدخال اسم للتصميم',
        toastErrorSave: 'فشل حفظ التصميم',
        toastErrorLoad: 'التصميم غير موجود',
        toastErrorNoExport: 'لا يوجد محتوى للتصدير',
        toastDownloadSuccess: 'تم تحميل الملف بنجاح!',
        toastCopySuccess: 'تم نسخ الكود!',
        toastNoCopy: 'لا يوجد محتوى للنسخ',
        toastUploadImage: 'يرجى رفع صورة المنتج أولاً',
        toastProductName: 'يرجى إدخال اسم المنتج',
        toastGenerationError: 'حدث خطأ أثناء الإنشاء',
        toastNoRegenerate: 'لا يوجد صفحة لإعادة إنشائها',
        navFeatures: 'المميزات',
        navUse: 'الاستخدام',
        navReviews: 'الآراء',
        navPricing: 'السعر',
        navFaq: 'الأسئلة',
        navOrder: 'اطلب الآن',
        heroBadge: 'الأكثر مبيعاً | شحن مجاني + ضمان استرداد 30 يوم',
        urgencyLabel: 'العرض ينتهي خلال',
        sectionProblems: 'المشاكل',
        sectionProblemsTitle: 'هل تعاني من هذه المشاكل؟',
        sectionProblemsSub: 'أنت لست وحدك...',
        sectionSolution: 'الحل الأمثل',
        sectionSolutionTitle: 'لماذا',
        sectionSolutionTitleSpan: 'الحل المثالي؟',
        sectionSolutionSub: 'تركيبة فريدة تجمع بين العلم والطبيعة',
        sectionHow: 'طريقة الاستخدام',
        sectionHowTitle: 'كيف يعمل؟',
        sectionBeforeAfter: 'التحول المذهل',
        sectionBeforeAfterTitle: 'النتائج تتحدث عن نفسها',
        sectionBeforeAfterSub: 'تحول مذهل في 30 يوم فقط مع',
        sectionTestimonials: 'آراء العملاء',
        sectionTestimonialsTitle: 'ماذا يقول عملاؤنا؟',
        sectionTestimonialsSub: 'انضم لـ 50,000+ عميل سعيد',
        sectionFaq: 'الأسئلة الشائعة',
        sectionFaqTitle: 'الأسئلة الأكثر شيوعاً',
        sectionExpertLabel: 'توصية الخبراء',
        sectionExpertQuote: 'أنصح بـ',
        sectionExpertDesc: 'بعد سنوات من الخبرة',
        ctaTitle: 'لا تفوت الفرصة!',
        ctaSubtitle: 'انضم لـ 50,000+ عميل سعيد وغيّر حياتك اليوم',
        ctaButton: 'اطلب الآن بـ',
        ctaGuarantee: 'ضمان استرداد كامل لمدة 30 يوم',
        footerSecure: 'دفع آمن',
        footerShipping: 'شحن مجاني',
        footerWarranty: 'ضمان 30 يوم',
        footerSupport: 'دعم 24/7',
        footerCopyright: 'جميع الحقوق محفوظة',
        beforeLabel: 'قبل ❌',
        afterLabel: 'بعد ✓',
        beforeText: 'قبل الاستخدام',
        afterText: 'بعد الاستخدام',
        priceSecure: 'دفع آمن',
        priceShipping: 'شحن مجاني',
        priceWarranty: 'ضمان 30 يوم',
        trustSecure: 'دفع آمن 100%',
        trustShipping: 'شحن مجاني',
        trustRefund: 'ضمان استرداد',
        problemCardSuffix: 'نحن نفهم ما تمر به، ولذلك طورنا'
    },
    en: {
        appTitle: 'PageGen',
        appSubtitle: 'Smart Page Builder',
        customize: 'Customize',
        customization: 'Advanced Customization',
        customizationDesc: 'Customize landing page appearance',
        saveLoad: 'Save & Load',
        designName: 'Design name',
        save: 'Save',
        noSavedStyles: 'No saved designs',
        load: 'Load',
        delete: 'Delete',
        presetThemes: 'Preset Themes',
        fonts: 'Fonts',
        chooseOneFont: 'Choose one font for headings and text',
        premiumFonts: 'Extra fonts',
        extraFonts: 'Extra fonts',
        powerFeatures: 'Premium power features',
        inlineEdit: 'Inline text editing',
        inlineEditDesc: 'Click any text in preview to edit',
        layoutControl: 'Layout & section order',
        layoutControlDesc: 'Reorder sections and column layout',
        premiumTemplates: 'Pro templates',
        premiumTemplatesDesc: 'Ready-made professional designs',
        premiumWidgets: 'Widgets',
        premiumWidgetsDesc: 'Video, countdown, WhatsApp, testimonials',
        brandLogo: 'Logo & brand',
        brandLogoDesc: 'Upload logo and place it',
        sectionOrder: 'Section order',
        sectionOrderDesc: 'Move sections up or down to order your landing page.',
        sectionOrder_hero: 'Hero',
        sectionOrder_problem: 'Problems',
        sectionOrder_solution: 'Solutions',
        sectionOrder_howItWorks: 'How it works',
        sectionOrder_beforeAfter: 'Before & After',
        sectionOrder_testimonials: 'Testimonials',
        sectionOrder_expert: 'Expert',
        sectionOrder_faq: 'FAQ',
        sectionOrder_cta: 'Call to Action',
        sectionOrder_footer: 'Footer',
        sectionOrderUp: 'Up',
        sectionOrderDown: 'Down',
        columnLayout: 'Column layout',
        addWidget: 'Add widget',
        widgetCountdown: 'Countdown',
        widgetWhatsApp: 'WhatsApp button',
        widgetVideo: 'Video popup',
        widgetTestimonials: 'Testimonials block',
        uploadLogo: 'Upload logo',
        logoPosition: 'Logo position',
        logoHeader: 'Header',
        logoHero: 'Hero area',
        layout: 'Layout & Spacing',
        gap: 'Gap between elements',
        padding: 'Inner padding',
        radius: 'Border radius',
        backgrounds: 'Backgrounds',
        solid: 'Solid color',
        gradient: 'Gradient',
        animations: 'Animations',
        enableAnimations: 'Enable animations',
        animDesc: 'Scroll and reveal effects',
        floatProduct: 'Product float',
        floatDesc: 'Floating effect for hero product',
        buttonGlow: 'Button glow',
        glowDesc: 'Glow effect on CTA buttons',
        animSpeed: 'Animation speed',
        slow: 'Slow',
        fast: 'Fast',
        veryFast: 'Very fast',
        medium: 'Medium',
        resetDefault: 'Reset to default',
        productImage: 'Product Image',
        uploadProduct: 'Upload product image',
        uploadHint: 'We\'ll use it for professional marketing images',
        uploadFormats: 'PNG, JPG up to 5MB',
        uploadSuccess: '✓ Image uploaded successfully',
        removeImage: 'Remove image',
        tip: 'Tip: Use a clear product image on white background for best results.',
        projectDetails: 'Project Details',
        categoryBeauty: 'Beauty and care products',
        categoryHealth: 'Nutrition and health',
        categoryKitchen: 'Home and kitchen appliances',
        categoryFitness: 'Sports and fitness',
        categoryTech: 'Tech and devices',
        goalSell: 'Direct sales',
        goalLeads: 'Lead generation',
        goalWhatsapp: 'WhatsApp contact',
        currencyRiyal: 'SAR',
        currencyDirham: 'MAD',
        currencyDinar: 'IQD',
        currencyDollar: 'USD',
        currencyEuro: 'EUR',
        productName: 'Product name',
        productNamePlaceholder: 'e.g. Natural Argan Oil',
        category: 'Category',
        problem: 'Problem it solves',
        problemPlaceholder: 'e.g. Hair loss, dry skin...',
        benefit: 'Main benefit',
        benefitPlaceholder: 'e.g. Thick shiny hair in 30 days...',
        price: 'Price',
        goal: 'Main goal',
        tone: 'Tone',
        toneProfessional: 'Professional',
        toneFriendly: 'Friendly',
        toneUrgent: 'Urgent',
        colorPalette: 'Color palette',
        priceCardTexts: 'Price card texts',
        priceCardTextsDesc: 'Change the warranty, payment and shipping labels under the price. Leave empty for default.',
        priceLabelSecure: 'Secure payment',
        priceLabelShipping: 'Free shipping',
        priceLabelWarranty: 'Warranty (e.g. 30-day guarantee)',
        generate: 'Create Landing Page',
        generating: 'Creating...',
        livePreview: 'Live preview',
        desktop: 'Desktop',
        mobile: 'Mobile',
        openInNewTab: 'Open in new tab',
        landingHere: 'Landing page will appear here',
        uploadAndCreate: 'Upload product image and click "Create"',
        building: 'Building page...',
        status: 'System status',
        waitingImage: 'Waiting for image',
        ready: 'Ready to create',
        created: 'Created successfully',
        exportSection: 'Export',
        downloadHtml: 'Download HTML',
        copyCode: 'Copy code',
        regenerate: 'Regenerate',
        exportFormat: 'Choose export format',
        exportHtmlOnly: 'HTML only',
        exportZip: 'ZIP (HTML + CSS + Assets)',
        exportJpg: 'JPG / JPEG (screenshot)',
        exportPdf: 'PDF',
        cancel: 'Cancel',
        export: 'Export',
        pagesCreated: 'Pages created',
        imagesGenerated: 'Images generated',
        generatedImagesTitle: 'Generated images',
        noImagesYet: 'Marketing images will appear here',
        premium: 'Premium',
        upgradeToUnlock: 'Upgrade to unlock this feature',
        locked: 'Locked',
        toastSaved: 'Design saved successfully',
        toastLoad: 'Loaded',
        toastDeleted: 'Design deleted',
        toastReset: 'Reset to default',
        toastStyleApplied: 'Theme applied',
        toastThemeApplied: 'Color palette applied',
        colorPaletteDesc: 'Choose a color palette to apply to the landing page',
        applyTheme: 'Apply Color Palette',
        toastErrorName: 'Please enter a design name',
        toastErrorSave: 'Failed to save design',
        toastErrorLoad: 'Design not found',
        toastErrorNoExport: 'No content to export',
        toastDownloadSuccess: 'File downloaded successfully!',
        toastCopySuccess: 'Code copied!',
        toastNoCopy: 'No content to copy',
        toastUploadImage: 'Please upload product image first',
        toastProductName: 'Please enter product name',
        toastGenerationError: 'An error occurred while creating',
        toastNoRegenerate: 'No page to regenerate',
        navFeatures: 'Features', navUse: 'How to use', navReviews: 'Reviews', navPricing: 'Pricing', navFaq: 'FAQ', navOrder: 'Order now',
        heroBadge: 'Best seller | Free shipping + 30-day guarantee', urgencyLabel: 'Offer ends in',
        sectionProblems: 'Problems', sectionProblemsTitle: 'Suffering from these issues?', sectionProblemsSub: 'You are not alone...',
        sectionSolution: 'The solution', sectionSolutionTitle: 'Why', sectionSolutionTitleSpan: 'is the perfect choice?', sectionSolutionSub: 'Unique formula combining science and nature',
        sectionHow: 'How to use', sectionHowTitle: 'How it works',
        sectionBeforeAfter: 'Transformation', sectionBeforeAfterTitle: 'Results speak', sectionBeforeAfterSub: 'Amazing change in 30 days with',
        sectionTestimonials: 'Reviews', sectionTestimonialsTitle: 'What our customers say', sectionTestimonialsSub: 'Join 50,000+ happy customers',
        sectionFaq: 'FAQ', sectionFaqTitle: 'Most common questions',
        sectionExpertLabel: 'Expert recommendation', sectionExpertQuote: 'I recommend', sectionExpertDesc: 'After years of experience',
        ctaTitle: 'Do not miss out!', ctaSubtitle: 'Join 50,000+ happy customers', ctaButton: 'Order now for', ctaGuarantee: 'Full 30-day money-back guarantee',
        footerSecure: 'Secure payment', footerShipping: 'Free shipping', footerWarranty: '30-day guarantee', footerSupport: '24/7 support', footerCopyright: 'All rights reserved',
        beforeLabel: 'Before ❌', afterLabel: 'After ✓', beforeText: 'Before', afterText: 'After',
        priceSecure: 'Secure payment', priceShipping: 'Free shipping', priceWarranty: '30-day guarantee',
        trustSecure: '100% secure', trustShipping: 'Free shipping', trustRefund: 'Money-back guarantee', problemCardSuffix: 'We understand what you go through, so we developed'
    },
    fr: {
        appTitle: 'PageGen',
        appSubtitle: 'Créateur de pages intelligent',
        customize: 'Personnaliser',
        customization: 'Personnalisation avancée',
        customizationDesc: 'Personnaliser l\'apparence de la page',
        saveLoad: 'Enregistrer et charger',
        designName: 'Nom du design',
        save: 'Enregistrer',
        noSavedStyles: 'Aucun design enregistré',
        load: 'Charger',
        delete: 'Supprimer',
        presetThemes: 'Thèmes prédéfinis',
        fonts: 'Polices',
        chooseOneFont: 'Choisissez une police pour titres et texte',
        premiumFonts: 'Polices supplémentaires',
        extraFonts: 'Polices supplémentaires',
        powerFeatures: 'Outils Premium',
        inlineEdit: 'Édition de texte inline',
        inlineEditDesc: 'Cliquez sur un texte dans l’aperçu pour modifier',
        layoutControl: 'Ordre et mise en page',
        layoutControlDesc: 'Réorganiser les sections et colonnes',
        premiumTemplates: 'Modèles pro',
        premiumTemplatesDesc: 'Designs professionnels prêts à l’emploi',
        premiumWidgets: 'Widgets',
        premiumWidgetsDesc: 'Vidéo, compte à rebours, WhatsApp, témoignages',
        brandLogo: 'Logo et identité',
        brandLogoDesc: 'Télécharger le logo et le placer',
        sectionOrder: 'Ordre des sections',
        sectionOrderDesc: 'Déplacez les sections pour réorganiser la page.',
        sectionOrder_hero: 'Hero',
        sectionOrder_problem: 'Problèmes',
        sectionOrder_solution: 'Solutions',
        sectionOrder_howItWorks: 'Comment ça marche',
        sectionOrder_beforeAfter: 'Avant / Après',
        sectionOrder_testimonials: 'Témoignages',
        sectionOrder_expert: 'Expert',
        sectionOrder_faq: 'FAQ',
        sectionOrder_cta: 'Appel à l\'action',
        sectionOrder_footer: 'Pied de page',
        sectionOrderUp: 'Haut',
        sectionOrderDown: 'Bas',
        columnLayout: 'Disposition des colonnes',
        addWidget: 'Ajouter un widget',
        widgetCountdown: 'Compte à rebours',
        widgetWhatsApp: 'Bouton WhatsApp',
        widgetVideo: 'Vidéo popup',
        widgetTestimonials: 'Bloc témoignages',
        uploadLogo: 'Télécharger le logo',
        logoPosition: 'Position du logo',
        logoHeader: 'En-tête',
        logoHero: 'Zone hero',
        layout: 'Mise en page',
        gap: 'Espacement entre éléments',
        padding: 'Marge intérieure',
        radius: 'Coins arrondis',
        backgrounds: 'Arrière-plans',
        solid: 'Couleur unie',
        gradient: 'Dégradé',
        animations: 'Animations',
        enableAnimations: 'Activer les animations',
        animDesc: 'Effets au défilement',
        floatProduct: 'Flottement produit',
        floatDesc: 'Effet flottant pour le hero',
        buttonGlow: 'Lueur des boutons',
        glowDesc: 'Effet glow sur les CTA',
        animSpeed: 'Vitesse des animations',
        slow: 'Lent',
        fast: 'Rapide',
        veryFast: 'Très rapide',
        medium: 'Moyen',
        resetDefault: 'Réinitialiser',
        productImage: 'Image du produit',
        uploadProduct: 'Télécharger l\'image',
        uploadHint: 'Pour des visuels marketing professionnels',
        uploadFormats: 'PNG, JPG jusqu\'à 5 Mo',
        uploadSuccess: '✓ Image téléchargée avec succès',
        removeImage: 'Supprimer l\'image',
        tip: 'Conseil : utilisez une image nette sur fond blanc.',
        projectDetails: 'Détails du projet',
        categoryBeauty: 'Beauté et soins',
        categoryHealth: 'Nutrition et santé',
        categoryKitchen: 'Maison et cuisine',
        categoryFitness: 'Sport et fitness',
        categoryTech: 'Tech et appareils',
        goalSell: 'Vente directe',
        goalLeads: 'Génération de leads',
        goalWhatsapp: 'Contact WhatsApp',
        currencyRiyal: 'SAR',
        currencyDirham: 'MAD',
        currencyDinar: 'IQD',
        currencyDollar: 'USD',
        currencyEuro: 'EUR',
        productName: 'Nom du produit',
        productNamePlaceholder: 'ex. Huile d\'argan naturelle',
        category: 'Catégorie',
        problem: 'Problème résolu',
        problemPlaceholder: 'ex. Chute de cheveux, peau sèche...',
        benefit: 'Bénéfice principal',
        benefitPlaceholder: 'ex. Cheveux épais en 30 jours...',
        price: 'Prix',
        goal: 'Objectif principal',
        tone: 'Ton',
        toneProfessional: 'Professionnel',
        toneFriendly: 'Amical',
        toneUrgent: 'Urgent',
        colorPalette: 'Palette de couleurs',
        generate: 'Créer la page',
        generating: 'Création...',
        livePreview: 'Aperçu en direct',
        desktop: 'Bureau',
        mobile: 'Mobile',
        openInNewTab: 'Ouvrir dans un nouvel onglet',
        landingHere: 'La page s\'affichera ici',
        uploadAndCreate: 'Téléchargez l\'image et cliquez sur "Créer"',
        building: 'Assemblage de la page...',
        status: 'État du système',
        waitingImage: 'En attente de l\'image',
        ready: 'Prêt à créer',
        created: 'Créé avec succès',
        exportSection: 'Export',
        downloadHtml: 'Télécharger HTML',
        copyCode: 'Copier le code',
        regenerate: 'Régénérer',
        exportFormat: 'Choisir le format d\'export',
        exportHtmlOnly: 'HTML uniquement',
        exportZip: 'ZIP (HTML + CSS + Assets)',
        exportJpg: 'JPG / JPEG (capture)',
        exportPdf: 'PDF',
        cancel: 'Annuler',
        export: 'Exporter',
        pagesCreated: 'Pages créées',
        imagesGenerated: 'Images générées',
        generatedImagesTitle: 'Images générées',
        noImagesYet: 'Les images apparaîtront ici',
        premium: 'Premium',
        upgradeToUnlock: 'Passez à Premium pour débloquer',
        locked: 'Verrouillé',
        toastSaved: 'Design enregistré',
        toastLoad: 'Chargé',
        toastDeleted: 'Design supprimé',
        toastReset: 'Réinitialisé',
        toastStyleApplied: 'Thème appliqué',
        toastThemeApplied: 'Palette de couleurs appliquée',
        colorPaletteDesc: 'Choisissez une palette de couleurs à appliquer à la page',
        applyTheme: 'Appliquer la palette',
        priceCardTexts: 'Textes de la carte prix',
        priceCardTextsDesc: 'Modifiez les textes garantie, paiement et livraison sous le prix. Laissez vide pour le défaut.',
        priceLabelSecure: 'Paiement sécurisé',
        priceLabelShipping: 'Livraison gratuite',
        priceLabelWarranty: 'Garantie (ex. garantie 30 jours)',
        toastErrorName: 'Entrez un nom pour le design',
        toastErrorSave: 'Échec de l\'enregistrement',
        toastErrorLoad: 'Design introuvable',
        toastErrorNoExport: 'Rien à exporter',
        toastDownloadSuccess: 'Fichier téléchargé !',
        toastCopySuccess: 'Code copié !',
        toastNoCopy: 'Rien à copier',
        toastUploadImage: 'Téléchargez d\'abord une image',
        toastProductName: 'Entrez le nom du produit',
        toastGenerationError: 'Erreur lors de la création',
        toastNoRegenerate: 'Rien à régénérer',
        navFeatures: 'Avantages', navUse: 'Utilisation', navReviews: 'Avis', navPricing: 'Prix', navFaq: 'FAQ', navOrder: 'Commander',
        heroBadge: 'Best-seller | Livraison gratuite + garantie 30 jours', urgencyLabel: 'Offre se termine dans',
        sectionProblems: 'Problèmes', sectionProblemsTitle: 'Vous souffrez de ces problèmes ?', sectionProblemsSub: 'Vous n\'êtes pas seul...',
        sectionSolution: 'La solution', sectionSolutionTitle: 'Pourquoi', sectionSolutionTitleSpan: 'est le choix idéal ?', sectionSolutionSub: 'Formule unique alliant science et nature',
        sectionHow: 'Utilisation', sectionHowTitle: 'Comment ça marche',
        sectionBeforeAfter: 'Transformation', sectionBeforeAfterTitle: 'Les résultats parlent', sectionBeforeAfterSub: 'Changement en 30 jours avec',
        sectionTestimonials: 'Avis', sectionTestimonialsTitle: 'Ce que disent nos clients', sectionTestimonialsSub: 'Rejoignez 50 000+ clients satisfaits',
        sectionFaq: 'FAQ', sectionFaqTitle: 'Questions fréquentes',
        sectionExpertLabel: 'Recommandation expert', sectionExpertQuote: 'Je recommande', sectionExpertDesc: 'Après des années d\'expérience',
        ctaTitle: 'Ne manquez pas !', ctaSubtitle: 'Rejoignez 50 000+ clients satisfaits', ctaButton: 'Commander pour', ctaGuarantee: 'Garantie 30 jours',
        footerSecure: 'Paiement sécurisé', footerShipping: 'Livraison gratuite', footerWarranty: 'Garantie 30 jours', footerSupport: 'Support 24/7', footerCopyright: 'Tous droits réservés',
        beforeLabel: 'Avant ❌', afterLabel: 'Après ✓', beforeText: 'Avant', afterText: 'Après',
        priceSecure: 'Paiement sécurisé', priceShipping: 'Livraison gratuite', priceWarranty: 'Garantie 30 jours',
        trustSecure: '100% sécurisé', trustShipping: 'Livraison gratuite', trustRefund: 'Garantie remboursement', problemCardSuffix: 'Nous comprenons ce que vous vivez, nous avons développé'
    }
};

function t(key) {
    const lang = AppState.currentLang;
    const dict = I18n[lang] || I18n.ar;
    return dict[key] !== undefined ? dict[key] : (I18n.ar[key] || key);
}

function applyI18n() {
    const lang = AppState.currentLang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = t(key);
        if (text) el.textContent = text;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t(key)) el.placeholder = t(key);
    });
    
    // Update preset themes names
    initPresetThemes();
    
    // Update color palette dropdown options (theme names in selected language)
    refreshThemeSelectorOptions();
    
    // Update color palette preview if theme selector exists
    const themeSelector = document.getElementById('themeSelector');
    if (themeSelector && themeSelector.value) {
        updateThemePreview(themeSelector.value);
    }
    
    // Update category and goal dropdown option labels
    refreshCategoryAndGoalOptions();
    
    // Update currency dropdown option labels
    refreshCurrencyOptions();
    
    // Update tone buttons text
    refreshToneButtons();
    
    if (AppState.lastStatus != null && AppState.lastStatusKey) {
        updateStatus(AppState.lastStatus, AppState.lastStatusKey);
    }
}

function refreshThemeSelectorOptions() {
    const sel = document.getElementById('themeSelector');
    if (!sel) return;
    const keys = Object.keys(ThemeColors);
    keys.forEach(key => {
        const opt = sel.querySelector('option[value="' + key + '"]');
        if (opt) opt.textContent = getColorThemeDisplayName(ThemeColors[key]);
    });
}

var CategoryGoalKeys = {
    category: { beauty: 'categoryBeauty', health: 'categoryHealth', kitchen: 'categoryKitchen', fitness: 'categoryFitness', tech: 'categoryTech' },
    goal: { sell: 'goalSell', leads: 'goalLeads', whatsapp: 'goalWhatsapp' },
    currency: { 'ريال': 'currencyRiyal', 'درهم': 'currencyDirham', 'دينار': 'currencyDinar', 'دولار': 'currencyDollar', 'يورو': 'currencyEuro' }
};

function refreshCategoryAndGoalOptions() {
    const categorySelect = document.getElementById('inputCategory');
    if (categorySelect) {
        [].slice.call(categorySelect.options).forEach(opt => {
            const key = CategoryGoalKeys.category[opt.value];
            if (key) opt.textContent = t(key);
        });
    }
    const goalSelect = document.getElementById('inputGoal');
    if (goalSelect) {
        [].slice.call(goalSelect.options).forEach(opt => {
            const key = CategoryGoalKeys.goal[opt.value];
            if (key) opt.textContent = t(key);
        });
    }
}

function refreshToneButtons() {
    ['toneProfessional', 'toneFriendly', 'toneUrgent'].forEach((key, i) => {
        const btn = document.getElementById(key);
        if (btn) btn.textContent = t(key);
    });
}

function refreshCurrencyOptions() {
    const currencySelect = document.getElementById('inputCurrency');
    if (currencySelect) {
        [].slice.call(currencySelect.options).forEach(opt => {
            const key = CategoryGoalKeys.currency[opt.value];
            if (key) opt.textContent = t(key);
        });
    }
}

// ============================================
// PRESET THEMES (all available to free users; no locking)
// ============================================
const PresetThemes = {
    light: {
        id: 'light',
        name: { ar: 'فاتح أنيق', en: 'Elegant Light', fr: 'Clair élégant' },
        font: 'cairo',
        colors: { primary: '#2563eb', dark: '#1d4ed8', accent: '#dbeafe', text: '#1e293b' },
        background: { type: 'solid', value: 'white' },
        animations: { enabled: true, float: true, glow: true, speed: 1 }
    },
    darkGradient: {
        id: 'darkGradient',
        name: { ar: 'داكن متدرج', en: 'Dark Gradient', fr: 'Dégradé sombre' },
        font: 'tajawal',
        colors: { primary: '#8b5cf6', dark: '#7c3aed', accent: '#ede9fe', text: '#f8fafc' },
        background: { type: 'gradient', value: 'midnight' },
        animations: { enabled: true, float: true, glow: true, speed: 0.8 }
    },
    luxury: {
        id: 'luxury',
        name: { ar: 'ذهبي فاخر', en: 'Luxury Gold', fr: 'Or luxe' },
        font: 'amiri',
        colors: { primary: '#d4af37', dark: '#b8941f', accent: '#f4e4c1', text: '#1a1a1a' },
        background: { type: 'gradient', value: 'rose-gold' },
        animations: { enabled: true, float: true, glow: true, speed: 1.2 }
    },
    tech: {
        id: 'tech',
        name: { ar: 'تقني عصري', en: 'Modern Tech', fr: 'Tech moderne' },
        font: 'ibmplex',
        colors: { primary: '#06b6d4', dark: '#0891b2', accent: '#cffafe', text: '#0f172a' },
        background: { type: 'gradient', value: 'aurora' },
        animations: { enabled: true, float: true, glow: true, speed: 1.5 }
    },
    health: {
        id: 'health',
        name: { ar: 'صحة وطبيعة', en: 'Health & Nature', fr: 'Santé et nature' },
        font: 'elmessiri',
        colors: { primary: '#10b981', dark: '#059669', accent: '#d1fae5', text: '#064e3b' },
        background: { type: 'gradient', value: 'forest' },
        animations: { enabled: true, float: false, glow: false, speed: 1 }
    }
};

// ============================================
// ARABIC FONTS LIBRARY
// ============================================
const ArabicFonts = {
    // Free Fonts
    cairo: {
        id: 'cairo',
        name: 'Cairo',
        family: "'Cairo', sans-serif",
        preview: 'خط كايرو',
        weights: [400, 500, 600, 700, 800],
        googleUrl: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap',
        premium: false
    },
    changa: {
        id: 'changa',
        name: 'Changa',
        family: "'Changa', sans-serif",
        preview: 'خط شنجة',
        weights: [400, 500, 600, 700],
        googleUrl: 'https://fonts.googleapis.com/css2?family=Changa:wght@400;500;600;700&display=swap',
        premium: false
    },
    tajawal: {
        id: 'tajawal',
        name: 'Tajawal',
        family: "'Tajawal', sans-serif",
        preview: 'خط طجوال',
        weights: [400, 500, 700, 800],
        googleUrl: 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap',
        premium: false
    },
    almarai: {
        id: 'almarai',
        name: 'Almarai',
        family: "'Almarai', sans-serif",
        preview: 'خط المراعي',
        weights: [400, 700, 800],
        googleUrl: 'https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&display=swap',
        premium: false
    },
    elmessiri: {
        id: 'elmessiri',
        name: 'El Messiri',
        family: "'El Messiri', sans-serif",
        preview: 'خط المسيري',
        weights: [400, 500, 600, 700],
        googleUrl: 'https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&display=swap',
        premium: false
    },
    // Premium Fonts
    notoarabic: {
        id: 'notoarabic',
        name: 'Noto Arabic',
        family: "'Noto Sans Arabic', sans-serif",
        preview: 'خط نوتو',
        weights: [400, 500, 600, 700],
        googleUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap',
        premium: true
    },
    ibmplex: {
        id: 'ibmplex',
        name: 'IBM Plex Arabic',
        family: "'IBM Plex Sans Arabic', sans-serif",
        preview: 'خط IBM',
        weights: [400, 500, 600, 700],
        googleUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap',
        premium: true
    },
    markazi: {
        id: 'markazi',
        name: 'Markazi Text',
        family: "'Markazi Text', serif",
        preview: 'خط مركزي',
        weights: [400, 500, 600, 700],
        googleUrl: 'https://fonts.googleapis.com/css2?family=Markazi+Text:wght@400;500;600;700&display=swap',
        premium: true
    },
    amiri: {
        id: 'amiri',
        name: 'Amiri',
        family: "'Amiri', serif",
        preview: 'خط أميري',
        weights: [400, 700],
        googleUrl: 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap',
        premium: true
    },
    scheherazade: {
        id: 'scheherazade',
        name: 'Scheherazade',
        family: "'Scheherazade New', serif",
        preview: 'خط شهرزاد',
        weights: [400, 500, 600, 700],
        googleUrl: 'https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;500;600;700&display=swap',
        premium: true
    }
};

// ============================================
// BACKGROUND LIBRARY - FIXED COLORS
// ============================================
const BackgroundLibrary = {
    solid: {
        white: { name: { ar: 'أبيض', en: 'White', fr: 'Blanc' }, value: '#ffffff', textColor: '#1a1a1a' },
        offwhite: { name: { ar: 'أبيض مائل', en: 'Off White', fr: 'Blanc cassé' }, value: '#fafafa', textColor: '#1a1a1a' },
        lightgray: { name: { ar: 'رمادي فاتح', en: 'Light Gray', fr: 'Gris clair' }, value: '#f5f5f5', textColor: '#1a1a1a' },
        cream: { name: { ar: 'كريمي', en: 'Cream', fr: 'Crème' }, value: '#fef9f3', textColor: '#1a1a1a' },
        ivory: { name: { ar: 'عاجي', en: 'Ivory', fr: 'Ivoire' }, value: '#fffef0', textColor: '#1a1a1a' },
        mint: { name: { ar: 'نعناعي', en: 'Mint', fr: 'Menthe' }, value: '#f0fdf4', textColor: '#064e3b' },
        lavender: { name: { ar: 'لافندر', en: 'Lavender', fr: 'Lavande' }, value: '#faf5ff', textColor: '#581c87' },
        blush: { name: { ar: 'وردي خفيف', en: 'Blush', fr: 'Rose pâle' }, value: '#fff1f2', textColor: '#881337' },
        sky: { name: { ar: 'سماوي', en: 'Sky', fr: 'Ciel' }, value: '#f0f9ff', textColor: '#0c4a6e' },
        sand: { name: { ar: 'رملي', en: 'Sand', fr: 'Sable' }, value: '#fdf8f6', textColor: '#431407' }
    },
    gradients: {
        'hero-gradient': {
            name: { ar: 'تدرج البطل', en: 'Hero Gradient', fr: 'Dégradé héroïque' },
            value: 'linear-gradient(135deg, var(--theme-accent) 0%, #ffffff 50%, var(--theme-accent) 100%)',
            textColor: '#1a1a1a'
        },
        'sunrise': {
            name: { ar: 'شروق الشمس', en: 'Sunrise', fr: 'Lever du soleil' },
            value: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 25%, #fcd34d 50%, #fbbf24 75%, #f59e0b 100%)',
            textColor: '#78350f'
        },
        'ocean': {
            name: { ar: 'محيط', en: 'Ocean', fr: 'Océan' },
            value: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 25%, #7dd3fc 50%, #38bdf8 75%, #0ea5e9 100%)',
            textColor: '#0c4a6e'
        },
        'sunset': {
            name: { ar: 'غروب الشمس', en: 'Sunset', fr: 'Coucher de soleil' },
            value: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 25%, #fca5a5 50%, #f87171 75%, #ef4444 100%)',
            textColor: '#7f1d1d'
        },
        'forest': {
            name: { ar: 'غابة', en: 'Forest', fr: 'Forêt' },
            value: 'linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 25%, #6ee7b7 50%, #34d399 75%, #10b981 100%)',
            textColor: '#064e3b'
        },
        'royal': {
            name: { ar: 'ملكي', en: 'Royal', fr: 'Royal' },
            value: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 25%, #c4b5fd 50%, #a78bfa 75%, #8b5cf6 100%)',
            textColor: '#4c1d95'
        },
        'candy': {
            name: { ar: 'حلوى', en: 'Candy', fr: 'Bonbon' },
            value: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 25%, #f9a8d4 50%, #f472b6 75%, #ec4899 100%)',
            textColor: '#831843'
        },
        'midnight': {
            name: { ar: 'منتصف الليل', en: 'Midnight', fr: 'Minuit' },
            value: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4338ca 50%, #6366f1 75%, #818cf8 100%)',
            textColor: '#ffffff'
        },
        'peach': {
            name: { ar: 'خوخي', en: 'Peach', fr: 'Pêche' },
            value: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 25%, #fed7aa 50%, #fdba74 75%, #fb923c 100%)',
            textColor: '#7c2d12'
        },
        'aurora': {
            name: { ar: 'شفق قطبي', en: 'Aurora', fr: 'Aurore' },
            value: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 25%, #a5f3fc 50%, #67e8f9 75%, #22d3ee 100%)',
            textColor: '#164e63'
        },
        'rose-gold': {
            name: { ar: 'ذهبي وردي', en: 'Rose Gold', fr: 'Rose doré' },
            value: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 25%, #fecdd3 50%, #fda4af 75%, #fb7185 100%)',
            textColor: '#881337'
        },
        'emerald': {
            name: { ar: 'زمردي', en: 'Emerald', fr: 'Émeraude' },
            value: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 25%, #a7f3d0 50%, #6ee7b7 75%, #34d399 100%)',
            textColor: '#064e3b'
        }
    }
};

// ============================================
// DEFAULT TEMPLATE COLORS (used when no theme is applied)
// ============================================
const DefaultTemplateColors = {
    primary: '#6366f1',      // Indigo (default from CSS)
    dark: '#4f46e5',         // Indigo dark
    accent: '#e0e7ff',       // Indigo light
    text: '#1f2937',         // Dark gray
    name: 'افتراضي'
};

// ============================================
// THEME COLORS (10 Themes)
// ============================================
const ThemeColors = {
    gold: { primary: '#d4af37', dark: '#b8941f', accent: '#f4e4c1', text: '#1a1a1a', name: { ar: 'ذهبي فاخر', en: 'Luxury Gold', fr: 'Or luxe' } },
    blue: { primary: '#2563eb', dark: '#1d4ed8', accent: '#dbeafe', text: '#1e293b', name: { ar: 'أزرق احترافي', en: 'Professional Blue', fr: 'Bleu professionnel' } },
    green: { primary: '#059669', dark: '#047857', accent: '#d1fae5', text: '#1f2937', name: { ar: 'أخضر طبيعي', en: 'Natural Green', fr: 'Vert naturel' } },
    rose: { primary: '#e11d48', dark: '#be123c', accent: '#ffe4e6', text: '#1f2937', name: { ar: 'وردي عصري', en: 'Modern Rose', fr: 'Rose moderne' } },
    purple: { primary: '#8b5cf6', dark: '#7c3aed', accent: '#ede9fe', text: '#1f2937', name: { ar: 'بنفسجي مميز', en: 'Distinctive Purple', fr: 'Violet distinctif' } },
    orange: { primary: '#f97316', dark: '#ea580c', accent: '#ffedd5', text: '#1f2937', name: { ar: 'برتقالي حيوي', en: 'Vibrant Orange', fr: 'Orange vibrant' } },
    teal: { primary: '#14b8a6', dark: '#0d9488', accent: '#ccfbf1', text: '#1f2937', name: { ar: 'تركواز منعش', en: 'Fresh Teal', fr: 'Sarcelle frais' } },
    slate: { primary: '#475569', dark: '#334155', accent: '#f1f5f9', text: '#1f2937', name: { ar: 'رمادي أنيق', en: 'Elegant Slate', fr: 'Ardoise élégante' } },
    indigo: { primary: '#6366f1', dark: '#4f46e5', accent: '#e0e7ff', text: '#1f2937', name: { ar: 'نيلي عميق', en: 'Deep Indigo', fr: 'Indigo profond' } },
    emerald: { primary: '#10b981', dark: '#059669', accent: '#d1fae5', text: '#1f2937', name: { ar: 'زمردي غني', en: 'Rich Emerald', fr: 'Émeraude riche' } }
};

// ============================================
// LOCAL STORAGE FUNCTIONS
// ============================================
const StyleStorage = {
    STORAGE_KEY: 'pagegen_saved_styles',
    
    getAll() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error loading saved styles:', e);
            return [];
        }
    },
    
    save(name, style) {
        try {
            const styles = this.getAll();
            const existingIndex = styles.findIndex(s => s.name === name);
            const styleData = {
                name,
                style,
                createdAt: new Date().toISOString()
            };
            
            if (existingIndex >= 0) {
                styles[existingIndex] = styleData;
            } else {
                styles.push(styleData);
            }
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(styles));
            return true;
        } catch (e) {
            console.error('Error saving style:', e);
            return false;
        }
    },
    
    load(name) {
        const styles = this.getAll();
        const style = styles.find(s => s.name === name);
        return style ? style.style : null;
    },
    
    delete(name) {
        try {
            let styles = this.getAll();
            styles = styles.filter(s => s.name !== name);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(styles));
            return true;
        } catch (e) {
            console.error('Error deleting style:', e);
            return false;
        }
    }
};

// ============================================
// API CLIENT
// ============================================
const ApiClient = {
    baseUrl: '',
    
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}/api${endpoint}`;
        const headers = {
            'Content-Type': 'application/json'
        };
        
        try {
            const response = await fetch(url, {
                ...options,
                headers: { ...headers, ...options.headers }
            });
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error || `HTTP ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('[API Error]', error);
            throw error;
        }
    },
    
    async healthCheck() {
        return this.request('/health');
    }
};

// ============================================
// PROMPT ENGINE
// ============================================
const PromptEngine = {
    getHeadline(productName, benefit, tone) {
        const headlines = {
            professional: `اكتشف سر ${productName} لـ ${benefit}`,
            friendly: `مع ${productName}، ${benefit} أصبح سهلاً!`,
            urgent: `⚡ فرصة أخيرة! احصل على ${productName} و${benefit} الآن`
        };
        return headlines[tone] || headlines.professional;
    },
    
    getHeroDescription(problem, benefit, productName) {
        return `توقف عن معاناة ${problem} اليوم! مع ${productName}، ستشعر بـ ${benefit} من أول استخدام. تركيبة فريدة مثبتة علمياً لنتائج مضمونة 100%.`;
    },
    
    getBenefits(benefit, count = 6) {
        const allBenefits = [
            `${benefit} من أول استخدام`,
            'نتائج مضمونة 100%',
            'تركيبة طبيعية آمنة',
            'شحن مجاني سريع',
            'ضمان استرداد 30 يوم',
            'دعم فني على مدار الساعة'
        ];
        return allBenefits.slice(0, count);
    },
    
    getTrustBadges(category) {
        const badges = {
            beauty: [
                { icon: '🌿', text: '100% طبيعي' },
                { icon: '🛡️', text: 'معتمد من FDA' },
                { icon: '⚡', text: 'نتائج فورية' }
            ],
            health: [
                { icon: '🔬', text: 'مختبر سريرياً' },
                { icon: '🌍', text: 'مكونات عالمية' },
                { icon: '✓', text: 'GMP معتمد' }
            ],
            kitchen: [
                { icon: '⚡', text: 'توفير 80% وقت' },
                { icon: '🏆', text: 'جودة ألمانية' },
                { icon: '🛡️', text: 'ضمان 5 سنوات' }
            ],
            fitness: [
                { icon: '📊', text: 'تتبع ذكي' },
                { icon: '🔋', text: 'بطارية 7 أيام' },
                { icon: '💧', text: 'مقاوم للماء' }
            ],
            tech: [
                { icon: '🚀', text: 'أداء فائق' },
                { icon: '🔒', text: 'حماية قصوى' },
                { icon: '🔄', text: 'تحديثات مجانية' }
            ]
        };
        return badges[category] || badges.beauty;
    },

    getProblemPoints(problem, category) {
        const problemMap = {
            beauty: [
                { icon: '😔', text: `معاناة يومية من ${problem}` },
                { icon: '💸', text: 'إنفاق آلاف على منتجات لا تعمل' },
                { icon: '⏰', text: 'إضاعة وقت ثمين بدون نتائج' }
            ],
            health: [
                { icon: '😫', text: `تأثير سلبي على صحتك بسبب ${problem}` },
                { icon: '💊', text: 'حلول مؤقتة لا تعالج السبب' },
                { icon: '😰', text: 'قلق مستمر بشأن مستقبلك الصحي' }
            ],
            kitchen: [
                { icon: '😤', text: `إرهاق يومي بسبب ${problem}` },
                { icon: '⏳', text: 'إضاعة ساعات في المطبخ' },
                { icon: '🍳', text: 'نتائج غير مرضية رغم الجهد' }
            ],
            fitness: [
                { icon: '😓', text: `صعوبة في تحقيق أهداف ${problem}` },
                { icon: '📉', text: 'فقدان الدافع بعد محاولات فاشلة' },
                { icon: '🏋️', text: 'تمرين شاق بدون نتائج واضحة' }
            ],
            tech: [
                { icon: '😠', text: `إحباط مستمر من ${problem}` },
                { icon: '🐌', text: 'أداء بطيء يضيع وقتك' },
                { icon: '🔧', text: 'مشاكل تقنية متكررة' }
            ]
        };
        return problemMap[category] || problemMap.beauty;
    },

    getHowItWorks(category) {
        const steps = {
            beauty: [
                { step: 1, title: 'التطبيق', desc: 'ضع المنتج على البشرة النظيفة' },
                { step: 2, title: 'الامتصاص', desc: 'دع التركيبة الفريدة تعمل' },
                { step: 3, title: 'النتائج', desc: 'استمتع بالبشرة المثالية' }
            ],
            health: [
                { step: 1, title: 'تناول', desc: 'خذ الجرعة الموصى بها يومياً' },
                { step: 2, title: 'استمر', desc: 'اتبع البرنامج بانتظام' },
                { step: 3, title: 'تحسن', desc: 'شعر بالفرق في صحتك' }
            ],
            kitchen: [
                { step: 1, title: 'الإعداد', desc: 'جهز المكونات بسهولة' },
                { step: 2, title: 'الاستخدام', desc: 'شغل الجهاز واسترخِ' },
                { step: 3, title: 'الاستمتاع', desc: 'احصل على نتائج مثالية' }
            ],
            fitness: [
                { step: 1, title: 'ارتداء', desc: 'ضع الجهاز واضبط الإعدادات' },
                { step: 2, title: 'تتبع', desc: 'راقب تقدمك يومياً' },
                { step: 3, title: 'تحقيق', desc: 'حقق أهدافك الرياضية' }
            ],
            tech: [
                { step: 1, title: 'الإعداد', desc: 'شغل الجهاز في دقائق' },
                { step: 2, title: 'الاستخدام', desc: 'استمتع بالأداء الفائق' },
                { step: 3, title: 'الإنتاجية', desc: 'أنجز مهامك بسرعة' }
            ]
        };
        return steps[category] || steps.beauty;
    },

    getTestimonials(category) {
        const testimonials = {
            beauty: [
                { name: 'سارة أحمد', location: 'الرياض', rating: 5, text: 'غيرت حياتي تماماً! بشرتي أصبحت مشرقة كأنني في العشرينات' },
                { name: 'نورة الخالد', location: 'جدة', rating: 5, text: 'أفضل منتج جربته في حياتي. النتائج فورية ومذهلة!' },
                { name: 'فاطمة علي', location: 'الدمام', rating: 5, text: 'أنصح به بشدة لكل من تعاني من مشاكل البشرة' }
            ],
            health: [
                { name: 'محمد عبدالله', location: 'الرياض', rating: 5, text: 'طاقتي عادت كما كنت في شبابي. شعور رائع!' },
                { name: 'أحمد سالم', location: 'مكة', rating: 5, text: 'نتائج مذهلة بعد شهر واحد فقط. صحتي تحسنت كثيراً' },
                { name: 'خالد عمر', location: 'المدينة', rating: 5, text: 'المنتج الوحيد الذي حقق معي نتائج حقيقية' }
            ],
            kitchen: [
                { name: 'منى حسن', location: 'الرياض', rating: 5, text: 'وفرت لي ساعات يومياً! مطبخي أصبح ممتعاً' },
                { name: 'ليلى محمد', location: 'جدة', rating: 5, text: 'جودة لا مثيل لها. يستحق كل ريال!' },
                { name: 'هدى إبراهيم', location: 'الخبر', rating: 5, text: 'أفضل استثمار في مطبخي على الإطلاق' }
            ],
            fitness: [
                { name: 'عمر خالد', location: 'الرياض', rating: 5, text: 'ساعدني على خسارة 10 كجم في شهرين!' },
                { name: 'يوسف أحمد', location: 'جدة', rating: 5, text: 'أدق جهاز تتبع جربته. يحفزني يومياً' },
                { name: 'سعد علي', location: 'الدمام', rating: 5, text: 'تحولت حياتي الرياضية 180 درجة' }
            ],
            tech: [
                { name: 'فهد محمد', location: 'الرياض', rating: 5, text: 'سرعة خرافية! أنجز عملي في نصف الوقت' },
                { name: 'عبدالرحمن سعد', location: 'جدة', rating: 5, text: 'تصميم أنيق وأداء استثنائي. يستحق التجربة' },
                { name: 'طلال أحمد', location: 'الخبر', rating: 5, text: 'أفضل جهاز في فئته. لا أستغني عنه' }
            ]
        };
        return testimonials[category] || testimonials.beauty;
    },

    getFAQ(category) {
        const faqs = {
            beauty: [
                { q: 'هل المنتج مناسب لجميع أنواع البشرة؟', a: 'نعم، تركيبتنا الطبيعية آمنة لجميع أنواع البشرة بما فيها الحساسة.' },
                { q: 'متى أرى النتائج؟', a: 'معظم عملائنا يلاحظون فرقاً من أول استخدام، والنتائج الكاملة تظهر خلال 2-4 أسابيع.' },
                { q: 'هل هناك آثار جانبية؟', a: 'لا، جميع مكوناتنا طبيعية 100% وخالية من المواد الكيميائية الضارة.' }
            ],
            health: [
                { q: 'هل المنتج معتمد طبياً؟', a: 'نعم، منتجنا معتمد من هيئة الغذاء والدواء وتم اختباره سريرياً.' },
                { q: 'كم الوقت حتى أشعر بالفرق؟', a: 'يختلف من شخص لآخر، لكن معظم المستخدمين يشعرون بالتحسن خلال أسبوعين.' },
                { q: 'هل يمكنني تناوله مع أدوية أخرى؟', a: 'ننصح باستشارة طبيبك قبل الاستخدام إذا كنت تتناول أدوية.' }
            ],
            kitchen: [
                { q: 'ما مدة الضمان؟', a: 'ضمان شامل لمدة 5 سنوات يشمل جميع الأعطال المصنعية.' },
                { q: 'هل التركيب صعب؟', a: 'لا على الإطلاق! يأتي جاهزاً للاستخدام مع دليل بسيط.' },
                { q: 'هل يمكن الإرجاع؟', a: 'نعم، ضمان استرداد كامل لمدة 30 يوم إذا لم تكن راضياً.' }
            ],
            fitness: [
                { q: 'هل الجهاز مقاوم للماء؟', a: 'نعم، مقاوم للماء حتى عمق 50 متر.' },
                { q: 'كم تدوم البطارية؟', a: 'تدوم البطارية حتى 7 أيام من الاستخدام المتواصل.' },
                { q: 'هل يتوافق مع الهاتف؟', a: 'نعم، يتوافق مع iOS وAndroid عبر تطبيق مجاني.' }
            ],
            tech: [
                { q: 'ما مدة الضمان؟', a: 'ضمان سنتين شامل مع دعم فني مجاني.' },
                { q: 'هل هناك تحديثات مجانية؟', a: 'نعم، تحديثات البرنامج مجانية مدى الحياة.' },
                { q: 'هل يمكن الإرجاع؟', a: 'نعم، ضمان استرداد 30 يوم إذا لم يعجبك المنتج.' }
            ]
        };
        return faqs[category] || faqs.beauty;
    }
};

// ============================================
// CUSTOMIZATION PANEL FUNCTIONS
// ============================================
function openCustomizationPanel() {
    const panel = document.getElementById('customizationPanel');
    const overlay = document.getElementById('customizationOverlay');
    panel.classList.add('open');
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    if (!panel.dataset.initialized) {
        initCustomizationPanel();
        panel.dataset.initialized = 'true';
    }
    var pw = document.getElementById('inputPriceWarranty');
    var ps = document.getElementById('inputPriceSecure');
    var psh = document.getElementById('inputPriceShipping');
    if (pw) pw.value = (AppState.customization.priceWarranty !== undefined && AppState.customization.priceWarranty !== null) ? AppState.customization.priceWarranty : '';
    if (ps) ps.value = (AppState.customization.priceSecure !== undefined && AppState.customization.priceSecure !== null) ? AppState.customization.priceSecure : '';
    if (psh) psh.value = (AppState.customization.priceShipping !== undefined && AppState.customization.priceShipping !== null) ? AppState.customization.priceShipping : '';
    renderSectionOrderList();
    // Load saved styles
    updateSavedStylesList();
}

function closeCustomizationPanel() {
    const panel = document.getElementById('customizationPanel');
    const overlay = document.getElementById('customizationOverlay');
    panel.classList.remove('open');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
}

function toggleSection(header) {
    const body = header.nextElementSibling;
    header.classList.toggle('active');
    body.classList.toggle('open');
}

function switchBgType(type) {
    const tabs = document.querySelectorAll('.bg-type-tab');
    const solidWrap = document.getElementById('solidColorsWrap');
    const gradientWrap = document.getElementById('gradientColorsWrap');
    
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.type === type);
    });
    
    if (type === 'solid') {
        if (solidWrap) solidWrap.classList.remove('hidden');
        if (gradientWrap) gradientWrap.classList.add('hidden');
    } else {
        if (solidWrap) solidWrap.classList.add('hidden');
        if (gradientWrap) gradientWrap.classList.remove('hidden');
    }
    
    AppState.customization.backgroundType = type;
}

function initCustomizationPanel() {
    initPresetThemes();
    initFonts();
    const fontSelector = document.getElementById('fontSelector');
    if (fontSelector) {
        fontSelector.addEventListener('change', function () {
            selectFont(this.value);
        });
    }
    const presetThemeSelector = document.getElementById('presetThemeSelector');
    if (presetThemeSelector) {
        presetThemeSelector.addEventListener('change', function () {
            applyPresetTheme(this.value);
        });
    }
    initBackgrounds();
    const solidBgSel = document.getElementById('solidBackgroundSelector');
    const gradientBgSel = document.getElementById('gradientBackgroundSelector');
    if (solidBgSel) {
        solidBgSel.addEventListener('change', function () {
            selectBackground('solid', this.value);
        });
    }
    if (gradientBgSel) {
        gradientBgSel.addEventListener('change', function () {
            selectBackground('gradient', this.value);
        });
    }
    switchBgType(AppState.customization.backgroundType);
    initSliders();
    initAnimationToggles();
    initPriceCardTextInputs();
    initSectionOrder();
    initPremiumSection();
}

function initPremiumSection() {
    const cta = document.getElementById('premiumUpgradeCta');
    const tools = document.getElementById('premiumToolsContent');
    if (cta && tools) {
        if (AppState.isPremium) {
            cta.classList.add('hidden');
            tools.classList.remove('hidden');
        } else {
            cta.classList.remove('hidden');
            tools.classList.add('hidden');
        }
    }
    if (!AppState.isPremium) return;
    var inlineCheck = document.getElementById('enableInlineEdit');
    if (inlineCheck) {
        inlineCheck.checked = AppState.premium.inlineEdit;
        inlineCheck.addEventListener('change', function() {
            AppState.premium.inlineEdit = this.checked;
            applyInlineEditingToPreview();
        });
    }
    document.querySelectorAll('.template-opt').forEach(btn => {
        var isSelected = (btn.dataset.template || '') === (AppState.premium.templateId || '');
        btn.classList.toggle('border-purple-500/50', isSelected);
        btn.classList.toggle('bg-purple-500/20', isSelected);
        btn.addEventListener('click', function() {
            AppState.premium.templateId = this.dataset.template || null;
            document.querySelectorAll('.template-opt').forEach(b => b.classList.remove('border-purple-500/50', 'bg-purple-500/20'));
            this.classList.add('border-purple-500/50', 'bg-purple-500/20');
        });
    });
    document.querySelectorAll('.layout-opt').forEach(btn => {
        btn.classList.toggle('border-purple-500/50', btn.dataset.layout === AppState.premium.columnLayout);
        btn.classList.toggle('bg-purple-500/20', btn.dataset.layout === AppState.premium.columnLayout);
        btn.addEventListener('click', function() {
            AppState.premium.columnLayout = this.dataset.layout;
            document.querySelectorAll('.layout-opt').forEach(b => b.classList.remove('border-purple-500/50', 'bg-purple-500/20'));
            this.classList.add('border-purple-500/50', 'bg-purple-500/20');
        });
    });
    var wCountdown = document.getElementById('widgetCountdown');
    var wWhatsApp = document.getElementById('widgetWhatsApp');
    var wVideo = document.getElementById('widgetVideo');
    var wTestimonials = document.getElementById('widgetTestimonials');
    if (wCountdown) { wCountdown.checked = AppState.premium.widgets.countdown; wCountdown.addEventListener('change', function() { AppState.premium.widgets.countdown = this.checked; }); }
    if (wWhatsApp) { wWhatsApp.checked = AppState.premium.widgets.whatsapp; wWhatsApp.addEventListener('change', function() { AppState.premium.widgets.whatsapp = this.checked; }); }
    if (wVideo) { wVideo.checked = AppState.premium.widgets.videoPopup; wVideo.addEventListener('change', function() { AppState.premium.widgets.videoPopup = this.checked; }); }
    if (wTestimonials) { wTestimonials.checked = AppState.premium.widgets.testimonialsBlock; wTestimonials.addEventListener('change', function() { AppState.premium.widgets.testimonialsBlock = this.checked; }); }
    var logoZone = document.getElementById('logoUploadZone');
    var logoInput = document.getElementById('logoUpload');
    if (logoZone && logoInput) {
        logoZone.addEventListener('click', () => logoInput.click());
        logoInput.addEventListener('change', function(e) {
            var f = e.target.files[0];
            if (!f || !f.type.startsWith('image/')) return;
            var r = new FileReader();
            r.onload = function() {
                AppState.premium.logoUrl = r.result;
                showToast(t('toastSaved'), 'success');
            };
            r.readAsDataURL(f);
        });
    }
    document.querySelectorAll('.logo-pos').forEach(btn => {
        btn.classList.toggle('border-purple-500/50', btn.dataset.pos === AppState.premium.logoPosition);
        btn.classList.toggle('bg-purple-500/20', btn.dataset.pos === AppState.premium.logoPosition);
        btn.addEventListener('click', function() {
            AppState.premium.logoPosition = this.dataset.pos;
            document.querySelectorAll('.logo-pos').forEach(b => b.classList.remove('border-purple-500/50', 'bg-purple-500/20'));
            this.classList.add('border-purple-500/50', 'bg-purple-500/20');
        });
    });
}

var _inlineEditSyncDebounce = null;

function applyInlineEditingToPreview() {
    var desktop = document.getElementById('desktopContent');
    var mobile = document.getElementById('mobileContent');
    var enable = !!AppState.generatedHTML;
    [desktop, mobile].filter(Boolean).forEach(function (container) {
        if (!container) return;
        var root = getPreviewRoot(container);
        var scope = root && root !== container
            ? (root.querySelector('.preview-content-wrapper') || root)
            : (container.querySelector('.lp-preview-scope') || container.querySelector('body') || container);
        if (!scope) return;

        var editableSelector = 'h1, h2, h3, h4, p, a, .logo, .hero-badge, .section-label, .hero-trust-item, .hero-badge-item, .float-item span, .float-item div, .price-guarantee span, .price-guarantee-item, .footer-trust-item, .footer-trust-item span, .hero-benefits li span, .price-original, .price-discount, .urgency-text, .cta-guarantee';
        var editable = scope.querySelectorAll(editableSelector);
        var priceGuaranteeSpans = scope.querySelectorAll('.price-box .price-guarantee span, .price-guarantee span');
        var allEditable = [];
        editable.forEach(function (el) { allEditable.push(el); });
        priceGuaranteeSpans.forEach(function (el) {
            if (allEditable.indexOf(el) === -1) allEditable.push(el);
        });
        allEditable.forEach(function (el) {
            el.setAttribute('contenteditable', enable ? 'true' : 'false');
            if (enable) {
                el.addEventListener('blur', onEditableBlur);
                el.addEventListener('input', onEditableInput);
            } else {
                el.removeEventListener('blur', onEditableBlur);
                el.removeEventListener('input', onEditableInput);
            }
        });
        var priceGuaranteeP = scope.querySelector('.price-guarantee');
        if (priceGuaranteeP) {
            priceGuaranteeP.setAttribute('contenteditable', 'false');
        }

        if (enable) {
            injectInlineEditStyles(root);
            preventLinkNavigation(scope);
            if (!scope.hasAttribute('data-ft-focus-bound')) {
                scope.setAttribute('data-ft-focus-bound', 'true');
                scope.addEventListener('focusin', onPreviewEditableFocusIn);
                scope.addEventListener('focusout', onPreviewEditableFocusOut);
            }
        }
    });
}

function onEditableBlur() {
    pushUndoState();
    syncPreviewToGeneratedHtml();
}

function onEditableInput() {
    if (_inlineEditSyncDebounce) clearTimeout(_inlineEditSyncDebounce);
    _inlineEditSyncDebounce = setTimeout(syncPreviewToGeneratedHtml, 400);
}

function injectInlineEditStyles(root) {
    if (!root || root.querySelector('style[data-inline-edit-styles]')) return;
    var style = document.createElement('style');
    style.setAttribute('data-inline-edit-styles', 'true');
    style.textContent = [
        ':host [contenteditable="true"]:hover {',
        '  outline: 1px dotted rgba(139, 92, 246, 0.45);',
        '  background: rgba(255, 255, 255, 0.04);',
        '  border-radius: 2px;',
        '}',
        ':host [contenteditable="true"]:focus { outline: 1px dotted rgba(139, 92, 246, 0.6); }'
    ].join('\n');
    root.appendChild(style);
}

function preventLinkNavigation(scope) {
    if (!scope || scope.hasAttribute('data-preview-links-disabled')) return;
    scope.setAttribute('data-preview-links-disabled', 'true');
    scope.addEventListener('click', function (e) {
        var a = e.target && (e.target.closest ? e.target.closest('a') : e.target.tagName === 'A' ? e.target : null);
        if (a && a.getAttribute('href')) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);
}

function getActiveEditableInPreview() {
    var el = document.activeElement;
    while (el) {
        if (el.id === 'desktopContent' || el.id === 'mobileContent') {
            var root = el.shadowRoot;
            if (root && root.activeElement && root.activeElement.getAttribute('contenteditable') === 'true')
                return root.activeElement;
            return null;
        }
        el = (el.getRootNode && el.getRootNode().host) || el.parentNode;
    }
    return null;
}

function getPreviewContainerForActive() {
    var el = document.activeElement;
    while (el) {
        if (el.id === 'desktopContent' || el.id === 'mobileContent') return el;
        el = (el.getRootNode && el.getRootNode().host) || el.parentNode;
    }
    return null;
}

var _floatingToolbarHideTimeout = null;

function showFloatingToolbar(targetEl) {
    var toolbar = document.getElementById('floatingTextToolbar');
    if (!toolbar || !targetEl) return;
    toolbar.classList.remove('hidden');
    toolbar.setAttribute('aria-hidden', 'false');
    toolbar.classList.add('visible');
    positionFloatingToolbar(targetEl);
    updateUndoRedoButtons();
}

function hideFloatingToolbar() {
    var toolbar = document.getElementById('floatingTextToolbar');
    if (!toolbar) return;
    if (_floatingToolbarHideTimeout) clearTimeout(_floatingToolbarHideTimeout);
    _floatingToolbarHideTimeout = setTimeout(function () {
        toolbar.classList.add('hidden');
        toolbar.classList.remove('visible');
        toolbar.setAttribute('aria-hidden', 'true');
        var palette = document.getElementById('ftColorPalette');
        if (palette) palette.classList.add('hidden');
    }, 150);
}

function positionFloatingToolbar(targetEl) {
    var toolbar = document.getElementById('floatingTextToolbar');
    if (!toolbar || !targetEl) return;
    var rect = targetEl.getBoundingClientRect();
    var toolbarRect = toolbar.getBoundingClientRect();
    var gap = 10;
    var top = rect.top - (toolbarRect.height || 44) - gap;
    var left = rect.left + (rect.width / 2) - ((toolbarRect.width || 280) / 2);
    var minLeft = 8;
    var maxLeft = window.innerWidth - (toolbarRect.width || 280) - 8;
    if (left < minLeft) left = minLeft;
    if (left > maxLeft) left = maxLeft;
    if (top < 8) top = 8;
    toolbar.style.top = top + 'px';
    toolbar.style.left = left + 'px';
}

function pushUndoState() {
    if (!AppState.generatedHTML) return;
    var h = AppState.textEditHistory;
    h.undo.push(AppState.generatedHTML);
    if (h.undo.length > h.maxUndo) h.undo.shift();
    h.redo = [];
}

function clearRedoState() {
    AppState.textEditHistory.redo = [];
}

function undoEdit() {
    var h = AppState.textEditHistory;
    if (h.undo.length === 0) return;
    var prev = h.undo.pop();
    h.redo.push(AppState.generatedHTML);
    window._skipPushUndo = true;
    AppState.generatedHTML = prev;
    refreshBothPreviewsFromGeneratedHtml();
    window._skipPushUndo = false;
    updateUndoRedoButtons();
}

function redoEdit() {
    var h = AppState.textEditHistory;
    if (h.redo.length === 0) return;
    var next = h.redo.pop();
    h.undo.push(AppState.generatedHTML);
    window._skipPushUndo = true;
    AppState.generatedHTML = next;
    refreshBothPreviewsFromGeneratedHtml();
    window._skipPushUndo = false;
    updateUndoRedoButtons();
}

function refreshBothPreviewsFromGeneratedHtml() {
    if (!AppState.generatedHTML) return;
    var desktopEl = document.getElementById('desktopContent');
    var mobileEl = document.getElementById('mobileContent');
    var desktopRoot = desktopEl && getPreviewRoot(desktopEl);
    var mobileRoot = mobileEl && getPreviewRoot(mobileEl);
    var desktopHtml = scopePreviewHtmlForShadow(AppState.generatedHTML, false);
    var mobileHtml = scopePreviewHtmlForShadow(AppState.generatedHTML, true);
    if (desktopRoot) desktopRoot.innerHTML = desktopHtml;
    if (mobileRoot) mobileRoot.innerHTML = mobileHtml;
    loadFontIntoPreview(AppState.customization.font);
    applyInlineEditingToPreview();
}

function updateUndoRedoButtons() {
    var h = AppState.textEditHistory;
    var undoBtn = document.getElementById('ftUndoBtn');
    var redoBtn = document.getElementById('ftRedoBtn');
    if (undoBtn) undoBtn.disabled = h.undo.length === 0;
    if (redoBtn) redoBtn.disabled = h.redo.length === 0;
}

function onPreviewEditableFocusIn(e) {
    var target = e.target;
    if (!target || target.getAttribute('contenteditable') !== 'true') return;
    if (_floatingToolbarHideTimeout) {
        clearTimeout(_floatingToolbarHideTimeout);
        _floatingToolbarHideTimeout = null;
    }
    showFloatingToolbar(target);
}

function onPreviewEditableFocusOut(e) {
    var related = e.relatedTarget;
    var toolbar = document.getElementById('floatingTextToolbar');
    if (toolbar && related && toolbar.contains(related)) return;
    hideFloatingToolbar();
}

function applyFormatAndSync(cmd, value) {
    pushUndoState();
    document.execCommand(cmd, false, value || null);
    syncPreviewToGeneratedHtml();
    refreshOtherPreviewFromGeneratedHtml(getPreviewContainerForActive());
    updateUndoRedoButtons();
}

function initFloatingTextToolbar() {
    var toolbar = document.getElementById('floatingTextToolbar');
    if (!toolbar) return;
    var colorBtn = toolbar.querySelector('.ft-color');
    var palette = document.getElementById('ftColorPalette');
    var boldBtn = toolbar.querySelector('.ft-bold');
    var alignBtns = toolbar.querySelectorAll('.ft-align');
    var undoBtn = document.getElementById('ftUndoBtn');
    var redoBtn = document.getElementById('ftRedoBtn');

    if (colorBtn && palette) {
        colorBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            palette.classList.toggle('hidden');
            palette.classList.toggle('visible');
        });
        palette.querySelectorAll('.ft-palette-color').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                var color = btn.getAttribute('data-color');
                if (color) applyFormatAndSync('foreColor', color);
                palette.classList.add('hidden');
                palette.classList.remove('visible');
            });
        });
    }
    document.addEventListener('click', function (e) {
        if (palette && !palette.classList.contains('hidden') && !palette.contains(e.target) && !colorBtn.contains(e.target)) {
            palette.classList.add('hidden');
        }
    });

    if (boldBtn) {
        boldBtn.addEventListener('click', function () {
            applyFormatAndSync('bold');
        });
    }
    if (alignBtns.length) {
        alignBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var align = btn.getAttribute('data-align');
                var cmd = align === 'left' ? 'justifyLeft' : align === 'center' ? 'justifyCenter' : 'justifyRight';
                applyFormatAndSync(cmd);
            });
        });
    }
    if (undoBtn) undoBtn.addEventListener('click', undoEdit);
    if (redoBtn) redoBtn.addEventListener('click', redoEdit);

    var dragHandle = toolbar.querySelector('.ft-drag-handle');
    if (dragHandle) {
        var dragStartX, dragStartY, toolbarStartLeft, toolbarStartTop;
        function onDragMove(e) {
            var dx = e.clientX - dragStartX;
            var dy = e.clientY - dragStartY;
            toolbar.style.left = (toolbarStartLeft + dx) + 'px';
            toolbar.style.top = (toolbarStartTop + dy) + 'px';
        }
        function onDragEnd() {
            document.removeEventListener('mousemove', onDragMove);
            document.removeEventListener('mouseup', onDragEnd);
        }
        dragHandle.addEventListener('mousedown', function (e) {
            e.preventDefault();
            var rect = toolbar.getBoundingClientRect();
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            toolbarStartLeft = rect.left;
            toolbarStartTop = rect.top;
            document.addEventListener('mousemove', onDragMove);
            document.addEventListener('mouseup', onDragEnd);
        });
    }
}

/**
 * Build preview HTML for Shadow DOM so template CSS is fully isolated from the app UI.
 * Uses :host in shadow root so variables apply only inside the preview.
 */
function scopePreviewHtmlForShadow(fullHtml, isMobile) {
    if (!fullHtml || typeof fullHtml !== 'string') return '';
    var styleMatch = fullHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    var scopedCss = (styleMatch ? styleMatch[1] : '')
        .replace(/:root\s*\{/g, ':host {');
    
    // Different scaling for Desktop vs Mobile
    var scaleFactor, scaleWidth, scaleMargin;
    if (isMobile) {
        // Mobile: Scale to fit mobile screen properly
        scaleFactor = 0.65; // Scale to 65% for mobile (better fit)
        scaleWidth = (1 / scaleFactor) * 100; // Calculate width needed (~154%)
        scaleMargin = ((scaleWidth - 100) / 2) * -1; // Center the scaled content (~-27%)
        
        scopedCss += '\n:host { display: flex; width: 100%; height: 100%; overflow: visible; position: relative; justify-content: center; align-items: flex-start; }\n';
        scopedCss += ':host > .preview-content-wrapper { transform: scale(' + scaleFactor + '); transform-origin: top center; width: ' + scaleWidth + '%; margin-left: ' + scaleMargin + '%; margin-right: ' + scaleMargin + '%; height: auto; min-height: 100%; position: relative; display: block; }\n';
        // Mobile-specific CSS for better organization and layout
        scopedCss += ':host section { width: 100% !important; max-width: 100% !important; padding: 1.5rem 0.75rem !important; box-sizing: border-box !important; }\n';
        scopedCss += ':host .hero { padding: 1.5rem 0.75rem !important; min-height: auto !important; width: 100% !important; }\n';
        scopedCss += ':host .hero-content { grid-template-columns: 1fr !important; gap: 1.5rem !important; padding: 0.5rem !important; width: 100% !important; }\n';
        scopedCss += ':host .hero-text { width: 100% !important; text-align: center !important; }\n';
        scopedCss += ':host .hero-image { width: 100% !important; }\n';
        scopedCss += ':host .testimonials-grid { grid-template-columns: 1fr !important; gap: 1rem !important; width: 100% !important; }\n';
        scopedCss += ':host .testimonial-card { width: 100% !important; margin: 0 !important; }\n';
        scopedCss += ':host .problem-grid { grid-template-columns: 1fr !important; gap: 1rem !important; width: 100% !important; }\n';
        scopedCss += ':host .problem-card { width: 100% !important; margin: 0 !important; }\n';
        scopedCss += ':host .features-grid { grid-template-columns: 1fr !important; gap: 1rem !important; width: 100% !important; }\n';
        scopedCss += ':host .feature-card { width: 100% !important; margin: 0 !important; }\n';
        scopedCss += ':host .steps-grid { grid-template-columns: 1fr !important; gap: 1rem !important; width: 100% !important; }\n';
        scopedCss += ':host .step-card { width: 100% !important; margin: 0 !important; }\n';
        scopedCss += ':host .before-after-grid { grid-template-columns: 1fr !important; gap: 1rem !important; width: 100% !important; }\n';
        scopedCss += ':host .before-after-card { width: 100% !important; margin: 0 !important; }\n';
        scopedCss += ':host .expert-content { grid-template-columns: 1fr !important; gap: 1.5rem !important; text-align: center !important; width: 100% !important; }\n';
        scopedCss += ':host .expert-stats { flex-direction: column !important; gap: 0.75rem !important; width: 100% !important; align-items: center !important; }\n';
        scopedCss += ':host .expert-stat { width: 100% !important; max-width: 100% !important; margin: 0 !important; }\n';
        scopedCss += ':host .faq-list { gap: 0.5rem !important; width: 100% !important; }\n';
        scopedCss += ':host .faq-item { width: 100% !important; margin: 0 !important; }\n';
        scopedCss += ':host .container { max-width: 100% !important; padding: 0 0.75rem !important; width: 100% !important; }\n';
        scopedCss += ':host .nav { width: 100% !important; padding: 0.75rem 0.5rem !important; }\n';
        scopedCss += ':host .nav-content { flex-direction: column !important; gap: 1rem !important; }\n';
        scopedCss += ':host .nav-links { display: none !important; }\n';
        scopedCss += ':host .price-box { width: 100% !important; padding: 1.5rem 1rem !important; }\n';
        scopedCss += ':host .cta-section { padding: 2rem 1rem !important; }\n';
        scopedCss += ':host .footer { padding: 2rem 1rem !important; }\n';
    } else {
        // Desktop: Keep current scaling
        scaleFactor = 0.5; // Scale to 50% of original size
        scaleWidth = (1 / scaleFactor) * 100; // Calculate width needed (200%)
        scaleMargin = ((scaleWidth - 100) / 2) * -1; // Center the scaled content (-50%)
        
        scopedCss += '\n:host { display: flex; width: 100%; height: 100%; overflow: visible; position: relative; justify-content: center; align-items: flex-start; }\n';
        scopedCss += ':host > .preview-content-wrapper { transform: scale(' + scaleFactor + '); transform-origin: top center; width: ' + scaleWidth + '%; margin-left: ' + scaleMargin + '%; margin-right: ' + scaleMargin + '%; height: auto; min-height: 100%; position: relative; display: block; }\n';
    }
    scopedCss += ':host .nav { position: relative !important; transform: none !important; top: auto !important; z-index: auto !important; width: 100% !important; margin-left: 0 !important; margin-right: 0 !important; }\n';
    scopedCss += ':host .hero-badge { position: relative !important; z-index: auto !important; transform: none !important; width: 100% !important; margin-left: 0 !important; margin-right: 0 !important; }\n';
    scopedCss += ':host body, :host > * { position: relative; width: 100%; min-height: auto; }\n';
    scopedCss += ':host section { position: relative !important; width: 100% !important; }\n';
    scopedCss += ':host .hero { position: relative !important; min-height: auto !important; width: 100% !important; }\n';
    // Make all scroll-reveal elements visible immediately in preview
    scopedCss += ':host .scroll-reveal { opacity: 1 !important; transform: translateY(0) !important; visibility: visible !important; }\n';
    scopedCss += ':host .reveal { opacity: 1 !important; transform: translateY(0) !important; visibility: visible !important; }\n';
    scopedCss += ':host .reveal.active { opacity: 1 !important; transform: translateY(0) !important; }\n';
    // Ensure all sections and content are visible
    scopedCss += ':host section { display: block !important; visibility: visible !important; opacity: 1 !important; }\n';
    scopedCss += ':host .hero { display: flex !important; visibility: visible !important; opacity: 1 !important; }\n';
    scopedCss += ':host .hero-content { display: grid !important; visibility: visible !important; opacity: 1 !important; }\n';
    scopedCss += ':host .hero-text { visibility: visible !important; opacity: 1 !important; }\n';
    scopedCss += ':host .hero-image { visibility: visible !important; opacity: 1 !important; }\n';
    scopedCss += ':host * { visibility: visible !important; }\n';
    // Fix overflow issues to ensure full text visibility
    scopedCss += ':host section { overflow: visible !important; }\n';
    scopedCss += ':host .expert-stat { overflow: visible !important; min-height: auto !important; height: auto !important; }\n';
    scopedCss += ':host .expert-stat-value { overflow: visible !important; }\n';
    scopedCss += ':host .expert-stat-label { overflow: visible !important; white-space: normal !important; }\n';
    scopedCss += ':host .problem-card { overflow: visible !important; }\n';
    scopedCss += ':host .feature-card { overflow: visible !important; }\n';
    scopedCss += ':host .testimonial-card { overflow: visible !important; }\n';
    scopedCss += ':host .expert-description { overflow: visible !important; white-space: normal !important; }\n';
    scopedCss += ':host .expert-quote { overflow: visible !important; white-space: normal !important; }\n';
    // Ensure hover animations work in shadow DOM - animations work on scaled content
    scopedCss += ':host .expert-stat { transition: all 0.4s ease !important; }\n';
    scopedCss += ':host .expert-stat:hover { transform: translateY(-10px) scale(1.05) !important; box-shadow: 0 20px 50px rgba(0,0,0,0.15) !important; }\n';
    scopedCss += ':host .problem-card { transition: all 0.4s ease !important; }\n';
    scopedCss += ':host .problem-card:hover { transform: translateY(-10px) scale(1.02) !important; box-shadow: 0 25px 60px rgba(0,0,0,0.15) !important; }\n';
    scopedCss += ':host .feature-card { transition: all 0.4s ease !important; }\n';
    scopedCss += ':host .feature-card:hover { transform: translateX(-10px) translateY(-5px) !important; box-shadow: 0 25px 60px rgba(99, 102, 241, 0.2) !important; }\n';
    scopedCss += ':host .testimonial-card { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important; }\n';
    scopedCss += ':host .testimonial-card:hover { transform: translateY(-15px) scale(1.03) !important; box-shadow: 0 35px 70px rgba(0,0,0,0.18) !important; }\n';
    scopedCss += ':host .before-after-card { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important; }\n';
    scopedCss += ':host .before-after-card:hover { transform: translateY(-15px) scale(1.02) !important; box-shadow: 0 40px 80px rgba(0,0,0,0.2) !important; }\n';
    scopedCss += ':host .step-card { transition: all 0.4s ease !important; }\n';
    scopedCss += ':host .step-card:hover { transform: translateY(-15px) scale(1.03) !important; box-shadow: 0 30px 70px rgba(0,0,0,0.2) !important; }\n';
    scopedCss += ':host .faq-item { transition: all 0.4s ease !important; }\n';
    scopedCss += ':host .faq-item:hover { box-shadow: 0 15px 40px rgba(0,0,0,0.12) !important; transform: translateX(-5px) !important; }\n';
    scopedCss += ':host .nav-cta { transition: all 0.3s ease !important; }\n';
    scopedCss += ':host .nav-cta:hover { transform: translateY(-2px) !important; box-shadow: 0 15px 40px rgba(99, 102, 241, 0.4) !important; }\n';
    scopedCss += ':host .cta-button { transition: all 0.3s ease !important; }\n';
    scopedCss += ':host .cta-button:hover { transform: translateY(-3px) scale(1.02) !important; box-shadow: 0 25px 60px rgba(99, 102, 241, 0.5) !important; }\n';
    scopedCss += ':host .cta-button-white { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important; }\n';
    scopedCss += ':host .cta-button-white:hover { transform: translateY(-5px) scale(1.05) !important; box-shadow: 0 30px 60px rgba(0,0,0,0.4) !important; }\n';
    scopedCss += ':host .float-item { transition: all 0.3s ease !important; }\n';
    scopedCss += ':host .float-item:hover { transform: scale(1.05) translateY(-5px) !important; box-shadow: 0 15px 50px rgba(0,0,0,0.2) !important; }\n';
    scopedCss += ':host .expert-image-wrapper { transition: all 0.4s ease !important; }\n';
    scopedCss += ':host .expert-image-wrapper:hover .expert-image { transform: scale(1.05) !important; }\n';
    scopedCss += ':host .expert-label { transition: all 0.3s ease !important; }\n';
    scopedCss += ':host .expert-label:hover { transform: translateY(-3px) !important; box-shadow: 0 15px 40px rgba(99, 102, 241, 0.4) !important; }\n';
    scopedCss += ':host .problem-icon { transition: all 0.3s ease !important; }\n';
    scopedCss += ':host .problem-card:hover .problem-icon { transform: scale(1.1) !important; }\n';
    scopedCss += ':host .feature-number { transition: all 0.3s ease !important; }\n';
    scopedCss += ':host .feature-card:hover .feature-number { transform: scale(1.1) rotate(5deg) !important; }\n';
    scopedCss += ':host .testimonial-avatar { transition: all 0.3s ease !important; }\n';
    scopedCss += ':host .testimonial-card:hover .testimonial-avatar { transform: scale(1.1) !important; box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4) !important; }\n';
    scopedCss += ':host .step-number { transition: all 0.4s ease !important; }\n';
    scopedCss += ':host .step-card:hover .step-number { transform: scale(1.15) !important; border-color: var(--primary) !important; box-shadow: 0 0 40px rgba(99, 102, 241, 0.5) !important; }\n';
    
    var bodyOpen = fullHtml.indexOf('<body');
    if (bodyOpen === -1) {
        // If no body tag, try to extract content directly
        var htmlMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (htmlMatch) {
            return '<style>' + scopedCss + '</style>' + htmlMatch[1];
        }
        return '';
    }
    var start = fullHtml.indexOf('>', bodyOpen) + 1;
    var end = fullHtml.lastIndexOf('</body>');
    var bodyContent = (end !== -1) ? fullHtml.slice(start, end) : '';
    
    // Ensure bodyContent is not empty
    if (!bodyContent || bodyContent.trim().length === 0) {
        console.warn('Empty body content extracted from HTML');
        return '<style>' + scopedCss + '</style><div class="preview-content-wrapper"><div style="padding: 20px; color: red;">Error: No content found</div></div>';
    }
    
    // Wrap content in a wrapper div for scaling
    return '<style>' + scopedCss + '</style><div class="preview-content-wrapper">' + bodyContent + '</div>';
}

function getPreviewRoot(container) {
    if (!container) return null;
    if (container.shadowRoot) return container.shadowRoot;
    try {
        var shadow = container.attachShadow({ mode: 'open' });
        // Add base styles to ensure proper display
        var baseStyle = document.createElement('style');
        baseStyle.textContent = `
            :host {
                display: flex;
                width: 100%;
                height: 100%;
                overflow: visible;
                justify-content: center;
                align-items: flex-start;
                position: relative;
            }
            * {
                box-sizing: border-box;
            }
            /* Ensure pointer events work for hover */
            :host * {
                pointer-events: auto;
            }
            /* Ensure hover works on all interactive elements */
            :host a, :host button, :host .expert-stat, :host .problem-card, 
            :host .feature-card, :host .testimonial-card, :host .before-after-card,
            :host .step-card, :host .faq-item, :host .nav-cta, :host .cta-button,
            :host .cta-button-white, :host .float-item {
                cursor: pointer;
            }
            :host .section-reorder-highlight {
                outline: 2px solid var(--theme-accent, rgba(16, 185, 129, 0.8));
                outline-offset: 2px;
                animation: sectionHighlightPulse 0.6s ease-out;
            }
            @keyframes sectionHighlightPulse {
                0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
                50% { box-shadow: 0 0 20px 4px rgba(16, 185, 129, 0.35); }
                100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
            }
        `;
        shadow.appendChild(baseStyle);
        return shadow;
    } catch (e) {
        return container;
    }
}

function syncPreviewToGeneratedHtml() {
    var desktopEl = document.getElementById('desktopContent');
    var mobileEl = document.getElementById('mobileContent');
    var container = AppState.currentView === 'mobile' ? mobileEl : desktopEl;
    if (!container || !AppState.generatedHTML) return;
    var root = getPreviewRoot(container);
    var inner;
    if (root && root !== container) {
        var wrapper = root.querySelector('.preview-content-wrapper');
        if (wrapper) {
            inner = wrapper.innerHTML;
        } else {
            var parts = [];
            for (var i = 0; i < root.children.length; i++)
                if (root.children[i].tagName !== 'STYLE')
                    parts.push(root.children[i].outerHTML);
            inner = parts.join('');
        }
    } else {
        var scope = container.querySelector('.lp-preview-scope');
        if (scope) {
            var parts = [];
            for (var i = 0; i < scope.children.length; i++)
                if (scope.children[i].tagName !== 'STYLE')
                    parts.push(scope.children[i].outerHTML);
            inner = parts.join('');
        } else {
            var body = container.querySelector('body');
            inner = body ? body.innerHTML : container.innerHTML;
        }
    }
    var full = AppState.generatedHTML;
    var bodyOpen = full.indexOf('<body');
    if (bodyOpen === -1) return;
    var start = full.indexOf('>', bodyOpen) + 1;
    var end = full.lastIndexOf('</body>');
    if (end === -1) return;
    AppState.generatedHTML = full.slice(0, start) + inner + full.slice(end);
    refreshOtherPreviewFromGeneratedHtml(container);
}

function refreshOtherPreviewFromGeneratedHtml(sourceContainer) {
    if (!AppState.generatedHTML) return;
    var desktopEl = document.getElementById('desktopContent');
    var mobileEl = document.getElementById('mobileContent');
    var other = sourceContainer === desktopEl ? mobileEl : desktopEl;
    if (!other) return;
    var root = getPreviewRoot(other);
    if (!root) return;
    var isMobile = other === mobileEl;
    root.innerHTML = scopePreviewHtmlForShadow(AppState.generatedHTML, isMobile);
    loadFontIntoPreview(AppState.customization.font);
    applyInlineEditingToPreview();
}

function escapeHtmlForPreview(s) {
    if (s == null || s === '') return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
}

function updatePriceGuaranteeInPreview() {
    if (!AppState.generatedHTML) return;
    var secure = (AppState.customization.priceSecure !== undefined && AppState.customization.priceSecure !== null && String(AppState.customization.priceSecure).trim() !== '') ? String(AppState.customization.priceSecure).trim() : (I18n.ar['priceSecure'] || 'دفع آمن');
    var shipping = (AppState.customization.priceShipping !== undefined && AppState.customization.priceShipping !== null && String(AppState.customization.priceShipping).trim() !== '') ? String(AppState.customization.priceShipping).trim() : (I18n.ar['priceShipping'] || 'شحن مجاني');
    var warranty = (AppState.customization.priceWarranty !== undefined && AppState.customization.priceWarranty !== null && String(AppState.customization.priceWarranty).trim() !== '') ? String(AppState.customization.priceWarranty).trim() : (I18n.ar['priceWarranty'] || 'ضمان 30 يوم');
    var desktopEl = document.getElementById('desktopContent');
    var mobileEl = document.getElementById('mobileContent');
    [desktopEl, mobileEl].filter(Boolean).forEach(function (container) {
        var root = getPreviewRoot(container);
        if (!root) return;
        var wrapper = root.querySelector('.preview-content-wrapper');
        var scope = wrapper || root;
        var items = scope.querySelectorAll('.price-guarantee .price-guarantee-item');
        if (items.length >= 3) {
            items[0].innerHTML = '<i class="fas fa-lock"></i> ' + escapeHtmlForPreview(secure);
            items[1].innerHTML = '<i class="fas fa-truck"></i> ' + escapeHtmlForPreview(shipping);
            items[2].innerHTML = '<i class="fas fa-shield-alt"></i> ' + escapeHtmlForPreview(warranty);
        }
    });
    syncPreviewToGeneratedHtml();
}

function initPresetThemes() {
    const sel = document.getElementById('presetThemeSelector');
    if (!sel) return;
    const themes = Object.values(PresetThemes);
    sel.innerHTML = themes.map(theme => {
        const nameStr = getThemeDisplayName(theme);
        return `<option value="${theme.id}" class="bg-slate-800">${nameStr}</option>`;
    }).join('');
    sel.value = themes[0]?.id || 'light';
}

/**
 * Update font load icons for a specific font card
 */
function updateFontLoadIcon(fontId) {
    const fontCard = document.querySelector(`[data-font="${fontId}"]`);
    if (!fontCard) return;
    
    const isLoaded = AppState.loadedFonts.has(fontId);
    const existingIcon = fontCard.querySelector('.font-load-icon');
    
    if (isLoaded && existingIcon) {
        // Remove icon if font is loaded
        existingIcon.classList.remove('loading');
        setTimeout(() => {
            if (existingIcon.parentNode) {
                existingIcon.remove();
            }
        }, 300);
    } else if (!isLoaded && !existingIcon) {
        // Add icon if font is not loaded
        const icon = document.createElement('div');
        icon.className = 'font-load-icon';
        icon.setAttribute('data-font-id', fontId);
        icon.onclick = (e) => {
            e.stopPropagation();
            loadFontIcon(fontId);
        };
        const loadTitle = AppState.currentLang === 'ar' ? 'انقر لتحميل الخط' : (AppState.currentLang === 'en' ? 'Click to load font' : 'Cliquez pour charger la police');
        icon.title = loadTitle;
        icon.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
        `;
        fontCard.appendChild(icon);
    }
}

function initFonts() {
    const fontSelector = document.getElementById('fontSelector');
    if (!fontSelector) return;
    
    const lang = AppState.currentLang;
    const allFontIds = ['cairo', 'changa', 'tajawal', 'almarai', 'elmessiri', 'notoarabic', 'ibmplex', 'scheherazade', 'amiri', 'markazi'];
    
    // تحميل جميع الخطوط في الواجهة الرئيسية لعرض الأسماء بخطها الخاص في القائمة
    allFontIds.forEach(id => {
        if (!AppState.loadedFonts.has(id)) {
            ensureFontLoadedForUI(id);
        }
    });
    
    // حفظ القيمة الحالية قبل إعادة بناء القائمة
    const currentValue = fontSelector.value || AppState.customization.font || 'cairo';
    
    fontSelector.innerHTML = allFontIds.map(id => {
        const font = ArabicFonts[id];
        if (!font) return '';
        const displayName = lang === 'ar' ? font.preview : font.name;
        // إضافة style لعرض الاسم بخطه الخاص
        return `<option value="${id}" class="bg-slate-800" style="font-family: ${font.family};">${displayName}</option>`;
    }).join('');
    
    // استعادة القيمة بعد إعادة البناء
    fontSelector.value = currentValue;
    
    // تحميل الخط المختار حالياً في المعاينة فقط (إذا كانت المعاينة موجودة)
    if (AppState.generatedHTML && currentValue) {
        loadFontIntoPreview(currentValue);
    }
}

/**
 * Load font in main document head for UI display only (for dropdown font names)
 * This is separate from preview font loading
 */
function ensureFontLoadedForUI(fontId) {
    if (AppState.loadedFonts.has(fontId)) return;
    const font = ArabicFonts[fontId] || ArabicFonts.cairo;
    const fontLink = font.googleUrl || ('https://fonts.googleapis.com/css2?family=' + (font.name || 'Cairo').replace(/ /g, '+') + ':wght@' + (font.weights ? font.weights.join(';') : '400;600;700;800') + '&display=swap');
    
    // Check if link already exists
    const existingLink = document.querySelector(`link[data-font-ui="${fontId}"]`);
    if (existingLink) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontLink;
    link.setAttribute('data-font-ui', fontId);
    link.onload = () => {
        AppState.loadedFonts.add(fontId);
    };
    document.head.appendChild(link);
}

function initBackgrounds() {
    const solidSel = document.getElementById('solidBackgroundSelector');
    const gradientSel = document.getElementById('gradientBackgroundSelector');
    if (solidSel) {
        // حفظ القيمة الحالية قبل إعادة بناء القائمة
        const currentValue = solidSel.value || (AppState.customization.backgroundType === 'solid' ? AppState.customization.backgroundValue : 'white');
        solidSel.innerHTML = Object.entries(BackgroundLibrary.solid).map(([key, bg]) => {
            const displayName = getBackgroundDisplayName(bg);
            return `<option value="${key}" class="bg-slate-800">${displayName}</option>`;
        }).join('');
        // استعادة القيمة بعد إعادة البناء
        if (currentValue && BackgroundLibrary.solid[currentValue]) {
            solidSel.value = currentValue;
        }
    }
    if (gradientSel) {
        // حفظ القيمة الحالية قبل إعادة بناء القائمة
        const currentValue = gradientSel.value || (AppState.customization.backgroundType === 'gradient' ? AppState.customization.backgroundValue : 'hero-gradient');
        gradientSel.innerHTML = Object.entries(BackgroundLibrary.gradients).map(([key, bg]) => {
            const displayName = getBackgroundDisplayName(bg);
            return `<option value="${key}" class="bg-slate-800">${displayName}</option>`;
        }).join('');
        // استعادة القيمة بعد إعادة البناء
        if (currentValue && BackgroundLibrary.gradients[currentValue]) {
            gradientSel.value = currentValue;
        }
    }
}

function initSliders() {
    const gapSlider = document.getElementById('gapSlider');
    const gapValue = document.getElementById('gapValue');
    gapSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        gapValue.textContent = `${value}px`;
        AppState.customization.gap = parseInt(value);
        refreshPreviewWithCurrentCustomization();
    });
    
    const paddingSlider = document.getElementById('paddingSlider');
    const paddingValue = document.getElementById('paddingValue');
    paddingSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        paddingValue.textContent = `${value}px`;
        AppState.customization.padding = parseInt(value);
        refreshPreviewWithCurrentCustomization();
    });
    
    const radiusSlider = document.getElementById('radiusSlider');
    const radiusValue = document.getElementById('radiusValue');
    radiusSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        radiusValue.textContent = `${value}px`;
        AppState.customization.borderRadius = parseInt(value);
        refreshPreviewWithCurrentCustomization();
    });
    
    const animSpeedSlider = document.getElementById('animSpeedSlider');
    const animSpeedValue = document.getElementById('animSpeedValue');
    animSpeedSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        const labels = { 0.5: 'بطيء', 1: 'متوسط', 1.5: 'سريع', 2: 'سريع جداً' };
        animSpeedValue.textContent = labels[value] || 'متوسط';
        AppState.customization.animations.speed = value;
    });
}

function initAnimationToggles() {
    document.getElementById('enableAnimations').addEventListener('change', (e) => {
        AppState.customization.animations.enabled = e.target.checked;
    });
    
    document.getElementById('enableFloat').addEventListener('change', (e) => {
        AppState.customization.animations.float = e.target.checked;
    });
    
    document.getElementById('enableGlow').addEventListener('change', (e) => {
        AppState.customization.animations.glow = e.target.checked;
    });
}

function initPriceCardTextInputs() {
    function apply() {
        var w = document.getElementById('inputPriceWarranty');
        var s = document.getElementById('inputPriceSecure');
        var sh = document.getElementById('inputPriceShipping');
        var vW = (w && w.value !== undefined) ? String(w.value).trim() : '';
        var vS = (s && s.value !== undefined) ? String(s.value).trim() : '';
        var vSh = (sh && sh.value !== undefined) ? String(sh.value).trim() : '';
        if (vW === '') delete AppState.customization.priceWarranty; else AppState.customization.priceWarranty = vW;
        if (vS === '') delete AppState.customization.priceSecure; else AppState.customization.priceSecure = vS;
        if (vSh === '') delete AppState.customization.priceShipping; else AppState.customization.priceShipping = vSh;
        updatePriceGuaranteeInPreview();
    }
    var w = document.getElementById('inputPriceWarranty');
    var s = document.getElementById('inputPriceSecure');
    var sh = document.getElementById('inputPriceShipping');
    if (w) { w.addEventListener('input', apply); w.addEventListener('change', apply); }
    if (s) { s.addEventListener('input', apply); s.addEventListener('change', apply); }
    if (sh) { sh.addEventListener('input', apply); sh.addEventListener('change', apply); }
}

/**
 * Load font dynamically into shadow DOM preview ONLY (not in main document head)
 * This function loads fonts on-demand when user selects a font in the preview
 */
function loadFontIntoPreview(fontId) {
    const font = ArabicFonts[fontId] || ArabicFonts.cairo;
    const fontLink = font.googleUrl || ('https://fonts.googleapis.com/css2?family=' + (font.name || 'Cairo').replace(/ /g, '+') + ':wght@' + (font.weights ? font.weights.join(';') : '400;600;700;800') + '&display=swap');
    
    // Get preview containers (iframes with shadow DOM)
    const desktopEl = document.getElementById('desktopContent');
    const mobileEl = document.getElementById('mobileContent');
    
    [desktopEl, mobileEl].filter(Boolean).forEach(container => {
        const shadowRoot = getPreviewRoot(container);
        if (!shadowRoot) return;
        
        // Remove existing font link if any
        const existingLink = shadowRoot.querySelector('link[data-dynamic-font]');
        if (existingLink) {
            existingLink.remove();
        }
        
        // Create and inject new font link ONLY in shadow DOM (not in main document.head)
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontLink;
        link.setAttribute('data-dynamic-font', fontId);
        // Insert link before style elements to ensure font loads before CSS applies
        const firstStyle = shadowRoot.querySelector('style');
        if (firstStyle) {
            shadowRoot.insertBefore(link, firstStyle);
        } else {
            shadowRoot.appendChild(link);
        }
        
        // Update font-family in all style elements within shadow root
        setTimeout(() => {
            const styleElements = shadowRoot.querySelectorAll('style');
            styleElements.forEach(styleEl => {
                if (styleEl.textContent) {
                    let cssContent = styleEl.textContent;
                    
                    // Replace body font-family (including :host body)
                    cssContent = cssContent.replace(
                        /(body|:host\s+body)\s*\{[^}]*font-family\s*:\s*[^;]+;/g,
                        (match) => match.replace(/font-family\s*:\s*[^;]+;/, `font-family: ${font.family} !important;`)
                    );
                    
                    // Add body font-family rule if not present
                    if (!cssContent.match(/(body|:host\s+body)\s*\{[^}]*font-family/)) {
                        cssContent += `\nbody { font-family: ${font.family} !important; }`;
                    }
                    
                    // Add a general font-family rule for all elements (but preserve existing specific rules)
                    if (!cssContent.includes('font-family: ' + font.family)) {
                        cssContent += `\n* { font-family: ${font.family} !important; }`;
                    }
                    
                    styleEl.textContent = cssContent;
                }
            });
            
            // Update font-family via inline style on wrapper if it exists
            const wrapper = shadowRoot.querySelector('.preview-content-wrapper');
            if (wrapper) {
                wrapper.style.fontFamily = font.family;
            }
        }, 100);
    });
}

/**
 * Load font icon handler - DEPRECATED: Fonts are now loaded on-demand in preview only
 * This function is kept for backward compatibility but no longer loads fonts in main document
 */
function loadFontIcon(fontId) {
    // Fonts are now loaded dynamically in preview iframe shadow DOM only
    // No need to load fonts in main document head
    if (AppState.generatedHTML) {
        loadFontIntoPreview(fontId);
    }
}

function selectFont(fontId) {
    AppState.customization.font = fontId;
    
    const fontSelector = document.getElementById('fontSelector');
    if (fontSelector) {
        fontSelector.value = fontId;
    }
    
    // Load font ONLY in preview iframe shadow DOM (on-demand, not in main document)
    if (AppState.generatedHTML) {
        loadFontIntoPreview(fontId);
    }
}

/**
 * DEPRECATED: ensureFontLoaded() - Use ensureFontLoadedForUI() for UI or loadFontIntoPreview() for preview
 */
function ensureFontLoaded(fontId) {
    // For backward compatibility, load in UI
    ensureFontLoadedForUI(fontId);
}

function selectBackground(type, key) {
    const solidSel = document.getElementById('solidBackgroundSelector');
    const gradientSel = document.getElementById('gradientBackgroundSelector');
    if (type === 'solid' && solidSel) solidSel.value = key;
    if (type === 'gradient' && gradientSel) gradientSel.value = key;
    AppState.customization.backgroundType = type;
    AppState.customization.backgroundValue = key;
    refreshPreviewWithCurrentCustomization();
}

function getThemeDisplayName(theme) {
    if (!theme || !theme.name) return '';
    return typeof theme.name === 'string' ? theme.name : (theme.name[AppState.currentLang] || theme.name.ar || theme.name.en);
}

function getBackgroundDisplayName(bg) {
    if (!bg || !bg.name) return '';
    return typeof bg.name === 'string' ? bg.name : (bg.name[AppState.currentLang] || bg.name.ar || bg.name.en);
}

function getColorThemeDisplayName(colorTheme) {
    if (!colorTheme || !colorTheme.name) return '';
    return typeof colorTheme.name === 'string' ? colorTheme.name : (colorTheme.name[AppState.currentLang] || colorTheme.name.ar || colorTheme.name.en);
}

function applyPresetTheme(themeId) {
    const theme = PresetThemes[themeId];
    if (!theme) return;
    const presetSel = document.getElementById('presetThemeSelector');
    if (presetSel) presetSel.value = themeId;
    
    // Apply to state
    AppState.customization.font = theme.font;
    AppState.customization.backgroundType = theme.background.type;
    AppState.customization.backgroundValue = theme.background.value;
    AppState.customization.animations = { ...theme.animations };
    
    // Update main theme selector
    const themeSelector = document.getElementById('themeSelector');
    const themeKeys = Object.keys(ThemeColors);
    const matchingTheme = themeKeys.find(key => ThemeColors[key].primary === theme.colors.primary);
    if (matchingTheme) {
        themeSelector.value = matchingTheme;
        AppState.currentTheme = matchingTheme;
        AppState.themeApplied = true; // Preset theme applies colors
        updateThemePreview(matchingTheme);
    }
    
    // Update UI controls
    document.getElementById('gapSlider').value = 24;
    document.getElementById('gapValue').textContent = '24px';
    document.getElementById('paddingSlider').value = 48;
    document.getElementById('paddingValue').textContent = '48px';
    document.getElementById('radiusSlider').value = 24;
    document.getElementById('radiusValue').textContent = '24px';
    document.getElementById('enableAnimations').checked = theme.animations.enabled;
    document.getElementById('enableFloat').checked = theme.animations.float;
    document.getElementById('enableGlow').checked = theme.animations.glow;
    
    // Update font selection
    const fontSel = document.getElementById('fontSelector');
    if (fontSel) fontSel.value = theme.font;
    selectFont(theme.font);
    
    // Load font into preview if preview exists
    if (AppState.generatedHTML) {
        loadFontIntoPreview(theme.font);
    }
    
    // Update background
    switchBgType(theme.background.type);
    const solidSel = document.getElementById('solidBackgroundSelector');
    const gradientSel = document.getElementById('gradientBackgroundSelector');
    if (theme.background.type === 'solid' && solidSel) solidSel.value = theme.background.value;
    if (theme.background.type === 'gradient' && gradientSel) gradientSel.value = theme.background.value;
    
    showToast(`${t('toastStyleApplied')}: ${getThemeDisplayName(theme)}`, 'success');
    refreshPreviewWithCurrentCustomization();
}

// ============================================
// SAVE/LOAD STYLES
// ============================================
function saveCurrentStyle() {
    const nameInput = document.getElementById('styleName');
    const name = nameInput.value.trim();
    
    if (!name) {
        showToast(t('toastErrorName'), 'error');
        return;
    }
    
    const style = {
        font: AppState.customization.font,
        gap: AppState.customization.gap,
        padding: AppState.customization.padding,
        borderRadius: AppState.customization.borderRadius,
        backgroundType: AppState.customization.backgroundType,
        backgroundValue: AppState.customization.backgroundValue,
        animations: { ...AppState.customization.animations },
        theme: AppState.currentTheme,
        themeApplied: AppState.themeApplied,
        priceSecure: AppState.customization.priceSecure,
        priceShipping: AppState.customization.priceShipping,
        priceWarranty: AppState.customization.priceWarranty
    };
    
    if (StyleStorage.save(name, style)) {
        showToast(t('toastSaved'), 'success');
        nameInput.value = '';
        updateSavedStylesList();
    } else {
        showToast(t('toastErrorSave'), 'error');
    }
}

function loadSavedStyle(name) {
    const style = StyleStorage.load(name);
    if (!style) {
        showToast(t('toastErrorLoad'), 'error');
        return;
    }
    
    // Apply style
    AppState.customization = { ...AppState.customization, ...style };
    if (style.theme) AppState.currentTheme = style.theme;
    // Restore themeApplied flag (default to false if not saved)
    AppState.themeApplied = style.themeApplied || false;
    
    // Update UI
    document.getElementById('gapSlider').value = style.gap;
    document.getElementById('gapValue').textContent = `${style.gap}px`;
    document.getElementById('paddingSlider').value = style.padding;
    document.getElementById('paddingValue').textContent = `${style.padding}px`;
    document.getElementById('radiusSlider').value = style.borderRadius;
    document.getElementById('radiusValue').textContent = `${style.borderRadius}px`;
    
    if (style.animations) {
        document.getElementById('enableAnimations').checked = style.animations.enabled;
        document.getElementById('enableFloat').checked = style.animations.float;
        document.getElementById('enableGlow').checked = style.animations.glow;
    }
    
    // Update theme selector
    if (style.theme) {
        document.getElementById('themeSelector').value = style.theme;
        updateThemePreview(style.theme);
    }
    
    // Update font
    const fontSel = document.getElementById('fontSelector');
    if (fontSel) fontSel.value = style.font;
    selectFont(style.font);
    var pw = document.getElementById('inputPriceWarranty');
    var ps = document.getElementById('inputPriceSecure');
    var psh = document.getElementById('inputPriceShipping');
    if (pw) pw.value = (style.priceWarranty !== undefined && style.priceWarranty !== null) ? style.priceWarranty : '';
    if (ps) ps.value = (style.priceSecure !== undefined && style.priceSecure !== null) ? style.priceSecure : '';
    if (psh) psh.value = (style.priceShipping !== undefined && style.priceShipping !== null) ? style.priceShipping : '';
    if (AppState.generatedHTML) updatePriceGuaranteeInPreview();
    // Load font into preview if preview exists
    if (AppState.generatedHTML) {
        loadFontIntoPreview(style.font);
    }
    
    // Update background
    switchBgType(style.backgroundType);
    const solidSel = document.getElementById('solidBackgroundSelector');
    const gradientSel = document.getElementById('gradientBackgroundSelector');
    if (style.backgroundType === 'solid' && solidSel) solidSel.value = style.backgroundValue;
    if (style.backgroundType === 'gradient' && gradientSel) gradientSel.value = style.backgroundValue;
    
    showToast(`${t('toastLoad')}: ${name}`, 'success');
}

function deleteSavedStyle(name) {
    if (StyleStorage.delete(name)) {
        showToast(t('toastDeleted'), 'success');
        updateSavedStylesList();
    } else {
        showToast(t('toastErrorSave'), 'error');
    }
}

function updateSavedStylesList() {
    const container = document.getElementById('savedStylesList');
    const styles = StyleStorage.getAll();
    
    if (styles.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-500 text-center py-2">${t('noSavedStyles')}</p>`;
        return;
    }
    
    container.innerHTML = styles.map(s => `
        <div class="saved-style-item">
            <span class="saved-style-name">${s.name}</span>
            <div class="saved-style-actions">
                <button class="saved-style-btn saved-style-load" onclick="loadSavedStyle('${s.name}')">${t('load')}</button>
                <button class="saved-style-btn saved-style-delete" onclick="deleteSavedStyle('${s.name}')">${t('delete')}</button>
            </div>
        </div>
    `).join('');
}

function resetCustomization() {
    AppState.customization = {
        font: 'cairo',
        gap: 24,
        padding: 48,
        borderRadius: 24,
        backgroundType: 'gradient',
        backgroundValue: 'hero-gradient',
        animations: { enabled: true, float: true, glow: true, speed: 1 }
    };
    
    // Reset theme application flag to use default template colors
    AppState.themeApplied = false;
    
    document.getElementById('gapSlider').value = 24;
    document.getElementById('gapValue').textContent = '24px';
    document.getElementById('paddingSlider').value = 48;
    document.getElementById('paddingValue').textContent = '48px';
    document.getElementById('radiusSlider').value = 24;
    document.getElementById('radiusValue').textContent = '24px';
    document.getElementById('animSpeedSlider').value = 1;
    document.getElementById('animSpeedValue').textContent = 'متوسط';
    document.getElementById('enableAnimations').checked = true;
    document.getElementById('enableFloat').checked = true;
    document.getElementById('enableGlow').checked = true;
    
    const fontSel = document.getElementById('fontSelector');
    if (fontSel) fontSel.value = 'cairo';
    selectFont('cairo');
    
    // Load font into preview if preview exists
    if (AppState.generatedHTML) {
        loadFontIntoPreview('cairo');
    }
    
    switchBgType('gradient');
    const solidSel = document.getElementById('solidBackgroundSelector');
    const gradientSel = document.getElementById('gradientBackgroundSelector');
    if (solidSel) solidSel.value = 'white';
    if (gradientSel) gradientSel.value = 'hero-gradient';
    
    const presetSel = document.getElementById('presetThemeSelector');
    if (presetSel && presetSel.options.length) presetSel.selectedIndex = 0;
    
    // Reset theme selector to default but don't apply it
    const themeSelector = document.getElementById('themeSelector');
    if (themeSelector) {
        themeSelector.value = 'gold';
        updateThemePreview('gold');
    }
    
    showToast(t('toastReset'), 'success');
}

// ============================================
// TEMPLATE REGISTRY (internal; no UI)
// ============================================
if (typeof window !== 'undefined' && !window.DEFAULT_TEMPLATE_CSS) window.DEFAULT_TEMPLATE_CSS = '';

var TemplateRegistry = {
    list: [
        { id: 'default', tier: 'basic', isDefault: true, render: typeof window !== 'undefined' && window.renderDefaultTemplate }
    ],
    getDefault: function() {
        var t = this.list.find(function(x) { return x.isDefault; });
        if (t && typeof t.render !== 'function' && typeof window !== 'undefined') t.render = window.renderDefaultTemplate;
        return t;
    }
};

// ============================================
// ENHANCED LANDING PAGE GENERATOR - DEFAULT TEMPLATE
// ============================================
function buildDefaultTemplateData(inputs, images, ctx) {
    // Use theme colors only if user has manually applied a theme, otherwise use default template colors
    var themeColors = (AppState.themeApplied && ctx.themeColors) ? ctx.themeColors : DefaultTemplateColors;
    var custom = ctx.custom;
    var font = ctx.font;
    // Landing page is always in Arabic, regardless of UI language
    var lang = 'ar';
    var themeVarsCss = ':root {\n' +
        '--primary: ' + themeColors.primary + ';\n' +
        '--primary-dark: ' + themeColors.dark + ';\n' +
        '--primary-light: ' + themeColors.accent + ';\n' +
        '--secondary: #f59e0b;\n--accent: ' + themeColors.accent + ';\n--dark: ' + themeColors.text + ';\n--gray: ' + themeColors.text + ';\n--light: #f8fafc;\n--success: #10b981;\n--rose: #e11d48;\n' +
        '--gradient-primary: linear-gradient(135deg, ' + themeColors.primary + ' 0%, ' + themeColors.dark + ' 100%);\n' +
        '--shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05);\n--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);\n--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);\n--shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1);\n--shadow-2xl: 0 25px 50px -12px rgba(0,0,0,0.25);\n' +
        '--glow-backdrop: color-mix(in srgb, var(--primary) 15%, transparent);\n' +
        '--glow-button: 0 0 20px color-mix(in srgb, var(--primary) 40%, transparent);\n' +
        '--glow-button-strong: 0 0 40px color-mix(in srgb, var(--primary) 60%, transparent);\n' +
        '--section-padding: ' + (custom.padding || 48) + 'px;\n--section-gap: ' + (custom.gap || 24) + 'px;\n--section-border-radius: ' + (custom.borderRadius || 24) + 'px;\n--container-max: 1200px;\n}\n' +
        '.problem-grid,.features-grid,.steps-grid,.testimonials-grid,.before-after-grid,.hero-badges,.hero-trust-bar,.price-guarantee,.expert-stats,.footer-trust{gap:var(--section-gap)!important;}\n' +
        '.problem-card,.feature-card,.step-card,.testimonial-card,.before-after-card,.price-box,.faq-item,.expert-stat,.hero-badge-item,.before-after-label{border-radius:var(--section-border-radius)!important;}\n';
    var inlineScript = 'var observerOptions = { root: null, rootMargin: \'0px\', threshold: 0.1 };\nvar observer = new IntersectionObserver(function(entries) {\n  entries.forEach(function(entry) {\n    if (entry.isIntersecting) { entry.target.classList.add(\'visible\', \'active\'); observer.unobserve(entry.target); }\n  });\n}, observerOptions);\ndocument.querySelectorAll(\'.scroll-reveal, .reveal\').forEach(function(el) { observer.observe(el); });\n' +
        'var navbar = document.getElementById(\'navbar\');\nif (navbar) window.addEventListener(\'scroll\', function() { if (window.pageYOffset > 100) navbar.classList.add(\'visible\'); else navbar.classList.remove(\'visible\'); });\n' +
        'function toggleFaq(el) { var item = el.parentElement; document.querySelectorAll(\'.faq-item\').forEach(function(f) { if (f !== item) f.classList.remove(\'active\'); }); item.classList.toggle(\'active\'); }\n' +
        'function updateCountdown() { var now = new Date(); var end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59); var d = end - now; if (d <= 0) return; var h = Math.floor(d/3600000), m = Math.floor((d%3600000)/60000), s = Math.floor((d%60000)/1000); var el = document.getElementById(\'urgency-countdown\'); if (el) el.textContent = (h<10?\'0\':\'\')+h+\':\'+(m<10?\'0\':\'\')+m+\':\'+(s<10?\'0\':\'\')+s; }\nsetInterval(updateCountdown, 1000); updateCountdown();\n' +
        'document.querySelectorAll(\'a[href^="#"]\').forEach(function(a) { a.addEventListener(\'click\', function(e) { e.preventDefault(); var t = document.querySelector(this.getAttribute(\'href\')); if (t) t.scrollIntoView({ behavior: \'smooth\', block: \'start\' }); }); });';
    return {
        themeVarsCss: themeVarsCss,
        fontLink: font.googleUrl || ('https://fonts.googleapis.com/css2?family=' + (font.name || 'Cairo').replace(/ /g, '+') + ':wght@' + (font.weights ? font.weights.join(';') : '400;600;700;800') + '&display=swap'),
        fontFamily: (font.family || "'Cairo', sans-serif"),
        heroBackground: ctx.heroBackground,
        name: inputs.name,
        headline: ctx.headline,
        description: ctx.description,
        benefits: ctx.benefits,
        trustBadges: ctx.trustBadges,
        problemPoints: ctx.problemPoints,
        howItWorks: ctx.howItWorks,
        testimonials: ctx.testimonials,
        faqs: ctx.faqs,
        categoryName: ctx.categoryName,
        price: String(inputs.price),
        oldPrice: String(ctx.oldPrice),
        currency: inputs.currency || 'ريال',
        ctaText: ctx.ctaText || ('اطلب الآن واحصل على خصم 33%'),
        // Always use Arabic translations for landing page content (not affected by UI language)
        urgencyLabel: I18n.ar['urgencyLabel'] || 'العرض ينتهي خلال',
        heroImage: ctx.heroImage || '',
        beforeImage: ctx.beforeImage || '',
        afterImage: ctx.afterImage || '',
        expertImage: ctx.expertImage || '',
        i18n: {
            navFeatures: I18n.ar['navFeatures'] || 'المميزات',
            navUse: I18n.ar['navUse'] || 'الاستخدام',
            navReviews: I18n.ar['navReviews'] || 'الآراء',
            navPricing: I18n.ar['navPricing'] || 'السعر',
            navFaq: I18n.ar['navFaq'] || 'الأسئلة',
            navOrder: I18n.ar['navOrder'] || 'اطلب الآن',
            heroBadge: I18n.ar['heroBadge'] || 'الأكثر مبيعاً | شحن مجاني + ضمان استرداد 30 يوم',
            sectionProblems: I18n.ar['sectionProblems'] || 'المشاكل',
            sectionProblemsTitle: I18n.ar['sectionProblemsTitle'] || 'هل تعاني من هذه المشاكل؟',
            sectionProblemsSub: I18n.ar['sectionProblemsSub'] || 'أنت لست وحدك...',
            sectionSolution: I18n.ar['sectionSolution'] || 'الحل الأمثل',
            sectionSolutionTitle: I18n.ar['sectionSolutionTitle'] || 'لماذا',
            sectionSolutionTitleSpan: I18n.ar['sectionSolutionTitleSpan'] || 'الحل المثالي؟',
            sectionSolutionSub: I18n.ar['sectionSolutionSub'] || 'تركيبة فريدة تجمع بين العلم والطبيعة',
            sectionHow: I18n.ar['sectionHow'] || 'طريقة الاستخدام',
            sectionHowTitle: I18n.ar['sectionHowTitle'] || 'كيف يعمل؟',
            sectionBeforeAfter: I18n.ar['sectionBeforeAfter'] || 'التحول المذهل',
            sectionBeforeAfterTitle: I18n.ar['sectionBeforeAfterTitle'] || 'النتائج تتحدث عن نفسها',
            sectionBeforeAfterSub: I18n.ar['sectionBeforeAfterSub'] || 'تحول مذهل في 30 يوم فقط مع',
            sectionTestimonials: I18n.ar['sectionTestimonials'] || 'آراء العملاء',
            sectionTestimonialsTitle: I18n.ar['sectionTestimonialsTitle'] || 'ماذا يقول عملاؤنا؟',
            sectionTestimonialsSub: I18n.ar['sectionTestimonialsSub'] || 'انضم لـ 50,000+ عميل سعيد',
            sectionFaq: I18n.ar['sectionFaq'] || 'الأسئلة الشائعة',
            sectionFaqTitle: I18n.ar['sectionFaqTitle'] || 'الأسئلة الأكثر شيوعاً',
            sectionExpertLabel: I18n.ar['sectionExpertLabel'] || 'توصية الخبراء',
            sectionExpertQuote: I18n.ar['sectionExpertQuote'] || 'أنصح بـ',
            sectionExpertDesc: I18n.ar['sectionExpertDesc'] || 'بعد سنوات من الخبرة',
            ctaTitle: I18n.ar['ctaTitle'] || 'لا تفوت الفرصة!',
            ctaSubtitle: I18n.ar['ctaSubtitle'] || 'انضم لـ 50,000+ عميل سعيد وغيّر حياتك اليوم',
            ctaButton: I18n.ar['ctaButton'] || 'اطلب الآن بـ',
            ctaGuarantee: I18n.ar['ctaGuarantee'] || 'ضمان استرداد كامل لمدة 30 يوم',
            footerSecure: I18n.ar['footerSecure'] || 'دفع آمن',
            footerShipping: I18n.ar['footerShipping'] || 'شحن مجاني',
            footerWarranty: I18n.ar['footerWarranty'] || 'ضمان 30 يوم',
            footerSupport: I18n.ar['footerSupport'] || 'دعم 24/7',
            footerCopyright: I18n.ar['footerCopyright'] || 'جميع الحقوق محفوظة',
            beforeLabel: I18n.ar['beforeLabel'] || 'قبل ❌',
            afterLabel: I18n.ar['afterLabel'] || 'بعد ✓',
            beforeText: I18n.ar['beforeText'] || 'قبل الاستخدام',
            afterText: I18n.ar['afterText'] || 'بعد الاستخدام',
            priceSecure: (custom && custom.priceSecure !== undefined && String(custom.priceSecure).trim() !== '') ? String(custom.priceSecure).trim() : (I18n.ar['priceSecure'] || 'دفع آمن'),
            priceShipping: (custom && custom.priceShipping !== undefined && String(custom.priceShipping).trim() !== '') ? String(custom.priceShipping).trim() : (I18n.ar['priceShipping'] || 'شحن مجاني'),
            priceWarranty: (custom && custom.priceWarranty !== undefined && String(custom.priceWarranty).trim() !== '') ? String(custom.priceWarranty).trim() : (I18n.ar['priceWarranty'] || 'ضمان 30 يوم'),
            trustSecure: I18n.ar['trustSecure'] || 'دفع آمن 100%',
            trustShipping: I18n.ar['trustShipping'] || 'شحن مجاني',
            trustRefund: I18n.ar['trustRefund'] || 'ضمان استرداد',
            problemCardSuffix: I18n.ar['problemCardSuffix'] || 'نحن نفهم ما تمر به، ولذلك طورنا'
        },
        lang: lang,
        extraCss: (window.DEFAULT_TEMPLATE_CSS || '').replace(/^\uFEFF/, ''),
        inlineScript: inlineScript,
        sectionOrder: (ctx.sectionOrder && Array.isArray(ctx.sectionOrder)) ? ctx.sectionOrder : ['hero', 'problem', 'solution', 'howItWorks', 'beforeAfter', 'testimonials', 'expert', 'faq', 'cta', 'footer']
    };
}

const LandingPageGenerator = {
    generate(inputs, images) {
        // Use theme colors only if user has manually applied a theme, otherwise use default template colors
        const themeColors = AppState.themeApplied ? ThemeColors[AppState.currentTheme] : DefaultTemplateColors;
        const { name, category, problem, benefit, price, currency, tone } = inputs;
        const custom = AppState.customization;
        const font = ArabicFonts[custom.font] || ArabicFonts.cairo;
        const premium = AppState.isPremium ? AppState.premium : null;
        const logoUrl = premium && premium.logoUrl;
        const logoPos = (premium && premium.logoPosition) || 'header';
        const layoutCols = premium && premium.columnLayout ? premium.columnLayout : '6-6';
        const gridTemplate = { '12': '1fr', '6-6': '1fr 1fr', '4-4-4': 'repeat(3, 1fr)', '3-3-3-3': 'repeat(4, 1fr)' }[layoutCols] || '1fr 1fr';
        const showTestimonials = !AppState.isPremium || (premium && premium.widgets.testimonialsBlock);
        const widgets = premium ? premium.widgets : {};
        
        // Get background with proper text contrast
        let heroBackground, heroTextColor, needsOverlay = false;
        
        if (custom.backgroundType === 'solid') {
            const solidBg = BackgroundLibrary.solid[custom.backgroundValue];
            heroBackground = solidBg ? solidBg.value : '#ffffff';
            heroTextColor = solidBg ? solidBg.textColor : '#1a1a1a';
        } else {
            const gradientBg = BackgroundLibrary.gradients[custom.backgroundValue];
            if (gradientBg) {
                heroBackground = gradientBg.value.replace(/var\(--theme-accent\)/g, themeColors.accent);
                heroTextColor = gradientBg.textColor;
                needsOverlay = custom.backgroundValue === 'midnight';
            } else {
                heroBackground = `linear-gradient(135deg, ${themeColors.accent} 0%, #ffffff 50%, ${themeColors.accent} 100%)`;
                heroTextColor = themeColors.text;
            }
        }
        
        // Animation CSS
        const animSpeed = custom.animations.speed;
        const floatAnim = custom.animations.float ? `
            @keyframes heroFloat {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                25% { transform: translateY(-10px) rotate(1deg); }
                50% { transform: translateY(-18px) rotate(0deg); }
                75% { transform: translateY(-10px) rotate(-1deg); }
            }
            .hero-image img { animation: heroFloat ${4 / animSpeed}s ease-in-out infinite; }
        ` : '';
        
        const glowAnim = custom.animations.glow ? `
            @keyframes glowPulse {
                0%, 100% { box-shadow: 0 0 20px ${themeColors.primary}40; }
                50% { box-shadow: 0 0 40px ${themeColors.primary}60, 0 0 60px ${themeColors.primary}40; }
            }
            .cta-button { animation: glowPulse ${2 / animSpeed}s ease-in-out infinite; }
        ` : '';
        
        const scrollReveal = custom.animations.enabled ? `
            .scroll-reveal { opacity: 0; transform: translateY(30px); transition: opacity ${0.6 / animSpeed}s ease, transform ${0.6 / animSpeed}s ease; }
            .scroll-reveal.visible { opacity: 1; transform: translateY(0); }
            .scroll-reveal-delay-1 { transition-delay: 0.1s; }
            .scroll-reveal-delay-2 { transition-delay: 0.2s; }
            .scroll-reveal-delay-3 { transition-delay: 0.3s; }
        ` : '';
        
        const headline = PromptEngine.getHeadline(name, benefit, tone);
        const description = PromptEngine.getHeroDescription(problem, benefit, name);
        const benefits = PromptEngine.getBenefits(benefit, 6);
        const trustBadges = PromptEngine.getTrustBadges(category);
        const problemPoints = PromptEngine.getProblemPoints(problem, category);
        const howItWorks = PromptEngine.getHowItWorks(category);
        const testimonials = PromptEngine.getTestimonials(category);
        const faqs = PromptEngine.getFAQ(category);
        const oldPrice = Math.round(price * 1.5);
        
        const heroImage = images.hero?.url || '';
        const beforeImage = images.before?.url || '';
        const afterImage = images.after?.url || '';
        const expertImage = images.expert?.url || '';
        
        const categoryName = {
            beauty: 'العناية بالبشرة',
            health: 'التغذية والصحة',
            kitchen: 'الأجهزة المنزلية',
            fitness: 'اللياقة البدنية',
            tech: 'التقنية'
        }[category] || 'المنتج';

        var template = TemplateRegistry.getDefault();
        if (!template || typeof template.render !== 'function') {
            return '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>Template</title></head><body><p>Template not loaded. Refresh the page.</p></body></html>';
        }
        var data = buildDefaultTemplateData(inputs, images, {
            themeColors: themeColors, custom: custom, font: font, headline: headline, description: description,
            benefits: benefits, trustBadges: trustBadges, problemPoints: problemPoints, howItWorks: howItWorks,
            testimonials: testimonials, faqs: faqs, oldPrice: oldPrice, heroImage: heroImage, beforeImage: beforeImage,
            afterImage: afterImage, expertImage: expertImage, categoryName: categoryName, heroBackground: heroBackground,
            ctaText: 'اطلب الآن واحصل على خصم 33%',
            sectionOrder: (AppState.premium && AppState.premium.sectionOrder) ? AppState.premium.sectionOrder.slice() : ['hero', 'problem', 'solution', 'howItWorks', 'beforeAfter', 'testimonials', 'expert', 'faq', 'cta', 'footer']
        });
        return template.render(data);
    }
};

// ============================================
// UI UTILITIES
// ============================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateStatus(status, messageOrKey) {
    AppState.lastStatus = status;
    AppState.lastStatusKey = messageOrKey;
    // Check if messageOrKey is a translation key (exists in any language)
    const isTranslationKey = typeof messageOrKey === 'string' && 
        (I18n.ar[messageOrKey] !== undefined || I18n.en[messageOrKey] !== undefined || I18n.fr[messageOrKey] !== undefined);
    const message = isTranslationKey ? t(messageOrKey) : (typeof messageOrKey === 'string' ? messageOrKey : '');
    const indicator = document.getElementById('statusIndicator');
    if (!indicator) return;
    let color = 'bg-slate-500';
    let pulse = 'status-pulse';
    if (status === 'ready') color = 'bg-green-500';
    else if (status === 'generating') color = 'bg-amber-500';
    else if (status === 'error') { color = 'bg-red-500'; pulse = ''; }
    indicator.innerHTML = `<div class="w-3 h-3 rounded-full ${color} ${pulse}"></div><span class="text-sm font-medium text-slate-300">${message}</span>`;
}

function updateProgress(percent) {
    document.getElementById('progressFill').style.width = `${percent}%`;
}

function updateGeneratedImagesPanel(images) {
    const container = document.getElementById('generatedImages');
    if (Object.keys(images).length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-500 text-center py-4">${t('noImagesYet')}</p>`;
        return;
    }
    
    container.innerHTML = '<div class="image-grid">' + 
        Object.entries(images).map(([role, img]) => `
            <div class="image-grid-item">
                <img src="${img.url}" alt="${role}" title="${role}">
            </div>
        `).join('') + 
    '</div>';
}

function updateThemePreview(themeId) {
    const theme = ThemeColors[themeId];
    if (!theme) return;
    
    const preview = document.getElementById('themePreview');
    if (!preview) return;
    
    const themeName = getColorThemeDisplayName(theme);
    preview.innerHTML = `
        <div class="w-8 h-8 rounded-lg" style="background: linear-gradient(135deg, ${theme.primary}, ${theme.dark})"></div>
        <div class="flex-1 h-8 rounded-lg bg-white/5 flex items-center px-3">
            <span class="text-xs text-slate-400">${themeName}</span>
        </div>
    `;
}

// Apply selected theme manually (only when user clicks Apply button)
function applySelectedTheme() {
    const themeSelector = document.getElementById('themeSelector');
    if (!themeSelector) return;
    
    const selectedTheme = themeSelector.value;
    if (!ThemeColors[selectedTheme]) return;
    
    // Apply theme to state and mark as applied
    AppState.currentTheme = selectedTheme;
    AppState.themeApplied = true;
    
    // Show success message
    const themeName = getColorThemeDisplayName(ThemeColors[selectedTheme]);
    showToast(`${t('toastThemeApplied') || 'تم تطبيق لوحة الألوان'}: ${themeName}`, 'success');
    
    refreshPreviewWithCurrentCustomization();
}

// ============================================
// EVENT HANDLERS
// ============================================
function initEventListeners() {
    // Image Upload
    document.getElementById('uploadZone').addEventListener('click', () => {
        document.getElementById('productImage').click();
    });
    
    document.getElementById('productImage').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            showToast('يرجى اختيار ملف صورة', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            AppState.uploadedImage = event.target.result;
            document.getElementById('previewImg').src = event.target.result;
            document.getElementById('uploadZone').classList.add('has-image');
            document.getElementById('uploadPlaceholder').classList.add('hidden');
            document.getElementById('uploadPreview').classList.remove('hidden');
            updateStatus('ready', 'ready');
            showToast('تم رفع الصورة بنجاح', 'success');
        };
        reader.readAsDataURL(file);
    });
    
    document.getElementById('removeImageBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        AppState.uploadedImage = null;
        document.getElementById('productImage').value = '';
        document.getElementById('uploadZone').classList.remove('has-image');
        document.getElementById('uploadPlaceholder').classList.remove('hidden');
        document.getElementById('uploadPreview').classList.add('hidden');
        updateStatus('waiting', 'waitingImage');
    });
    
    // Drag and drop
    const uploadZone = document.getElementById('uploadZone');
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                AppState.uploadedImage = event.target.result;
                document.getElementById('previewImg').src = event.target.result;
                document.getElementById('uploadZone').classList.add('has-image');
                document.getElementById('uploadPlaceholder').classList.add('hidden');
                document.getElementById('uploadPreview').classList.remove('hidden');
                updateStatus('ready', 'ready');
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Tone selection
    document.querySelectorAll('.tone-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tone-btn').forEach(b => {
                b.classList.remove('active', 'border-purple-500/50', 'bg-purple-500/20', 'text-purple-300');
                b.classList.add('border-white/10', 'bg-white/5', 'text-slate-400');
            });
            btn.classList.remove('border-white/10', 'bg-white/5', 'text-slate-400');
            btn.classList.add('active', 'border-purple-500/50', 'bg-purple-500/20', 'text-purple-300');
            AppState.currentTone = btn.dataset.value;
            document.getElementById('inputTone').value = btn.dataset.value;
        });
    });
    
    // Theme selector (Dropdown) - Only updates preview, doesn't apply automatically
    const themeSelector = document.getElementById('themeSelector');
    themeSelector.addEventListener('change', (e) => {
        // Only update preview, don't apply theme automatically
        updateThemePreview(e.target.value);
    });
    
    // View mode toggle
    document.getElementById('desktopViewBtn').addEventListener('click', () => {
        AppState.currentView = 'desktop';
        document.getElementById('desktopViewBtn').classList.add('active');
        document.getElementById('mobileViewBtn').classList.remove('active');
        document.getElementById('desktopMockup').classList.remove('hidden');
        document.getElementById('iphoneMockup').classList.add('hidden');
    });
    
    document.getElementById('mobileViewBtn').addEventListener('click', () => {
        AppState.currentView = 'mobile';
        document.getElementById('mobileViewBtn').classList.add('active');
        document.getElementById('desktopViewBtn').classList.remove('active');
        document.getElementById('iphoneMockup').classList.remove('hidden');
        document.getElementById('desktopMockup').classList.add('hidden');
    });
    
    // Generate button
    document.getElementById('generateBtn').addEventListener('click', handleGenerate);
    
    // Action buttons
    // Export header dropdown
    var exportHeaderBtn = document.getElementById('exportHeaderBtn');
    var exportDropdown = document.getElementById('exportDropdown');
    var exportDropdownWrap = document.getElementById('exportDropdownWrap');
    if (exportHeaderBtn && exportDropdown) {
        exportHeaderBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            exportDropdown.classList.toggle('hidden');
        });
        document.querySelectorAll('.export-dropdown-option').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var format = this.getAttribute('data-format');
                exportByFormat(format);
            });
        });
        document.addEventListener('click', function() {
            closeExportDropdown();
        });
        if (exportDropdownWrap) {
            exportDropdownWrap.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    }
    var themeToggleBtn = document.getElementById('themeToggleBtn');
    var themeDropdown = document.getElementById('themeDropdown');
    var themeDropdownTrigger = document.getElementById('themeDropdownTrigger');
    var themeToggleLabel = document.getElementById('themeToggleLabel');
    var themeSelectorWrap = document.getElementById('themeSelectorWrap');

    function updateDarkLightToggle(isLight) {
        if (!themeToggleBtn || !themeToggleLabel) return;
        if (isLight) {
            themeToggleBtn.classList.add('theme-toggle-light');
            themeToggleBtn.classList.remove('theme-toggle-dark');
            themeToggleBtn.setAttribute('aria-label', 'Light Mode');
            themeToggleLabel.textContent = 'Light Mode';
            themeToggleBtn.querySelector('.theme-icon-moon').classList.add('hidden');
            themeToggleBtn.querySelector('.theme-icon-sun').classList.remove('hidden');
        } else {
            themeToggleBtn.classList.add('theme-toggle-dark');
            themeToggleBtn.classList.remove('theme-toggle-light');
            themeToggleBtn.setAttribute('aria-label', 'Dark Mode');
            themeToggleLabel.textContent = 'Dark Mode';
            themeToggleBtn.querySelector('.theme-icon-moon').classList.remove('hidden');
            themeToggleBtn.querySelector('.theme-icon-sun').classList.add('hidden');
        }
    }

    if (themeToggleBtn && themeDropdown) {
        var savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && THEME_VARS[savedTheme]) {
            applyTheme(savedTheme);
            if (savedTheme === 'theme-light') updateDarkLightToggle(true);
            else updateDarkLightToggle(false);
        } else {
            applyTheme('theme-1');
            try { localStorage.setItem(THEME_STORAGE_KEY, 'theme-1'); } catch (e) {}
            updateDarkLightToggle(false);
        }

        themeToggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var isLight = themeToggleBtn.classList.contains('theme-toggle-light');
            if (isLight) {
                applyTheme('theme-dark');
                updateDarkLightToggle(false);
            } else {
                applyTheme('theme-light');
                updateDarkLightToggle(true);
            }
        });

        if (themeDropdownTrigger) {
            themeDropdownTrigger.addEventListener('click', function(e) {
                e.stopPropagation();
                themeDropdown.classList.toggle('hidden');
            });
        }

        document.querySelectorAll('.theme-dropdown-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var theme = btn.getAttribute('data-theme');
                if (theme) applyTheme(theme);
                themeDropdown.classList.add('hidden');
                if (theme === 'theme-light') updateDarkLightToggle(true);
                else if (theme === 'theme-dark') updateDarkLightToggle(false);
                else updateDarkLightToggle(false);
            });
        });

        if (themeSelectorWrap) {
            themeSelectorWrap.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
        document.addEventListener('click', function themeDropdownClose() {
            themeDropdown.classList.add('hidden');
        });
    }
    document.getElementById('regenerateBtn').addEventListener('click', regenerate);
    
    // Language switch
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => switchLanguage(btn.dataset.lang));
    });
    
    // Open preview in new tab
    const openInNewTabBtn = document.getElementById('openInNewTabBtn');
    if (openInNewTabBtn) openInNewTabBtn.addEventListener('click', openPreviewInNewTab);
    
    // Export modal backdrop
    document.getElementById('exportModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'exportModal') closeExportModal();
    });
}

function switchLanguage(lang) {
    AppState.currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    applyI18n();
    initFonts();
    initBackgrounds();
    renderSectionOrderList();
}

// ============================================
// SECTION ORDER (ترتيب الأقسام)
// ============================================
var SECTION_ORDER_LABELS = {
    hero: 'هيرو',
    problem: 'المشاكل',
    solution: 'الحلول',
    howItWorks: 'كيف يعمل',
    beforeAfter: 'قبل وبعد',
    testimonials: 'آراء العملاء',
    expert: 'توصية الخبير',
    faq: 'الأسئلة الشائعة',
    cta: 'الدعوة للإجراء',
    footer: 'التذييل'
};

function getFormInputsForRegenerate() {
    var nameEl = document.getElementById('inputName');
    return {
        name: (nameEl && nameEl.value && nameEl.value.trim()) ? nameEl.value.trim() : 'المنتج',
        category: (document.getElementById('inputCategory') && document.getElementById('inputCategory').value) || 'beauty',
        problem: (document.getElementById('inputProblem') && document.getElementById('inputProblem').value) || 'المشاكل اليومية',
        benefit: (document.getElementById('inputBenefit') && document.getElementById('inputBenefit').value) || 'نتائج مذهلة',
        price: (document.getElementById('inputPrice') && document.getElementById('inputPrice').value) || '299',
        currency: (document.getElementById('inputCurrency') && document.getElementById('inputCurrency').value) || 'ريال',
        goal: (document.getElementById('inputGoal') && document.getElementById('inputGoal').value) || 'sell',
        tone: AppState.currentTone
    };
}

function refreshPreviewWithCurrentCustomization() {
    if (!AppState.generatedHTML) return;
    var inputs = getFormInputsForRegenerate();
    var html = LandingPageGenerator.generate(inputs, {});
    AppState.generatedHTML = html;
    refreshBothPreviewsFromGeneratedHtml();
}

function regeneratePreviewFromSectionOrder(movedSectionId) {
    if (!AppState.generatedHTML) return;
    var inputs = getFormInputsForRegenerate();
    var html = LandingPageGenerator.generate(inputs, {});
    AppState.generatedHTML = html;
    refreshBothPreviewsFromGeneratedHtml();
    if (movedSectionId) {
        [document.getElementById('desktopContent'), document.getElementById('mobileContent')].forEach(function (container) {
            if (!container) return;
            var root = getPreviewRoot(container);
            if (!root) return;
            var scope = root.querySelector('.preview-content-wrapper') || root;
            var el = scope && scope.querySelector('[data-section-id="' + movedSectionId + '"]');
            if (el) {
                el.classList.add('section-reorder-highlight');
                setTimeout(function () { el.classList.remove('section-reorder-highlight'); }, 1800);
            }
        });
    }
}

function renderSectionOrderList() {
    var list = document.getElementById('sectionOrderList');
    if (!list) return;
    var order = (AppState.premium && AppState.premium.sectionOrder) ? AppState.premium.sectionOrder : ['hero', 'problem', 'solution', 'howItWorks', 'beforeAfter', 'testimonials', 'expert', 'faq', 'cta', 'footer'];
    var titleUp = t('sectionOrderUp') || 'أعلى';
    var titleDown = t('sectionOrderDown') || 'أسفل';
    list.innerHTML = order.map(function (id, index) {
        var label = t('sectionOrder_' + id) || SECTION_ORDER_LABELS[id] || id;
        var upDisabled = index === 0 ? ' disabled' : '';
        var downDisabled = index === order.length - 1 ? ' disabled' : '';
        return '<li class="section-order-item flex items-center justify-between gap-2 py-2 px-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20">' +
            '<span class="text-sm font-medium text-white truncate flex-1">' + (label) + '</span>' +
            '<div class="flex items-center gap-0.5 shrink-0">' +
            '<button type="button" class="section-order-btn up p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-white/10 transition-colors" title="' + titleUp + '" data-id="' + id + '" data-dir="up"' + upDisabled + '><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg></button>' +
            '<button type="button" class="section-order-btn down p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-white/10 transition-colors" title="' + titleDown + '" data-id="' + id + '" data-dir="down"' + downDisabled + '><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg></button>' +
            '</div></li>';
    }).join('');
    list.querySelectorAll('.section-order-btn').forEach(function (btn) {
        if (btn.disabled) return;
        btn.addEventListener('click', function () {
            var id = btn.getAttribute('data-id');
            var dir = btn.getAttribute('data-dir');
            if (dir === 'up') moveSectionUp(id);
            else moveSectionDown(id);
        });
    });
}

function moveSectionUp(sectionId) {
    var order = (AppState.premium && AppState.premium.sectionOrder) ? AppState.premium.sectionOrder : ['hero', 'problem', 'solution', 'howItWorks', 'beforeAfter', 'testimonials', 'expert', 'faq', 'cta', 'footer'];
    var i = order.indexOf(sectionId);
    if (i <= 0) return;
    order = order.slice();
    order[i] = order[i - 1];
    order[i - 1] = sectionId;
    AppState.premium.sectionOrder = order;
    renderSectionOrderList();
    regeneratePreviewFromSectionOrder(sectionId);
}

function moveSectionDown(sectionId) {
    var order = (AppState.premium && AppState.premium.sectionOrder) ? AppState.premium.sectionOrder : ['hero', 'problem', 'solution', 'howItWorks', 'beforeAfter', 'testimonials', 'expert', 'faq', 'cta', 'footer'];
    var i = order.indexOf(sectionId);
    if (i < 0 || i >= order.length - 1) return;
    order = order.slice();
    order[i] = order[i + 1];
    order[i + 1] = sectionId;
    AppState.premium.sectionOrder = order;
    renderSectionOrderList();
    regeneratePreviewFromSectionOrder(sectionId);
}

function initSectionOrder() {
    renderSectionOrderList();
}

// ============================================
// GENERATE HANDLER
// ============================================
async function handleGenerate() {
    if (AppState.isGenerating) return;
    
    if (!AppState.uploadedImage) {
        showToast('يرجى رفع صورة المنتج أولاً', 'error');
        return;
    }
    
    const name = document.getElementById('inputName').value.trim();
    if (!name) {
        showToast('يرجى إدخال اسم المنتج', 'error');
        return;
    }
    
    AppState.isGenerating = true;
    document.getElementById('generateBtn').disabled = true;
    document.getElementById('generateBtnText').textContent = t('generating');
    
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('desktopMockup').classList.add('hidden');
    document.getElementById('iphoneMockup').classList.add('hidden');
    document.getElementById('loadingState').classList.remove('hidden');
    updateStatus('generating', 'generating');
    
    const inputs = {
        name: name,
        category: document.getElementById('inputCategory').value,
        problem: document.getElementById('inputProblem').value || 'المشاكل اليومية',
        benefit: document.getElementById('inputBenefit').value || 'نتائج مذهلة',
        price: document.getElementById('inputPrice').value || '299',
        currency: document.getElementById('inputCurrency').value,
        goal: document.getElementById('inputGoal').value,
        tone: AppState.currentTone
    };
    
    try {
        updateProgress(50);
        document.getElementById('loadingText').textContent = t('building');
        
        // Generate HTML with customization settings
        const html = LandingPageGenerator.generate(inputs, {});
        AppState.generatedHTML = html;
        
        updateProgress(90);
        
        // Isolate preview in Shadow DOM so template colors/CSS never affect the app UI
        var desktopPreviewHtml = scopePreviewHtmlForShadow(html, false); // Desktop preview
        var mobilePreviewHtml = scopePreviewHtmlForShadow(html, true); // Mobile preview
        var desktopEl = document.getElementById('desktopContent');
        var mobileEl = document.getElementById('mobileContent');
        var desktopRoot = getPreviewRoot(desktopEl);
        var mobileRoot = getPreviewRoot(mobileEl);
        if (desktopRoot) {
            desktopRoot.innerHTML = desktopPreviewHtml;
            // Load font dynamically into preview
            loadFontIntoPreview(AppState.customization.font);
            // Make all scroll-reveal elements visible immediately and ensure all content is displayed
            setTimeout(function() {
                var scrollReveals = desktopRoot.querySelectorAll('.scroll-reveal, .reveal');
                scrollReveals.forEach(function(el) {
                    el.classList.add('visible', 'active');
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                    el.style.visibility = 'visible';
                });
                // Ensure all sections and content are visible
                var allSections = desktopRoot.querySelectorAll('section, .hero, .problem-section, .solution-section, .how-it-works, .before-after, .testimonials, .expert, .faq-section, .cta-section, .footer');
                allSections.forEach(function(el) {
                    el.style.display = 'block';
                    el.style.visibility = 'visible';
                    el.style.opacity = '1';
                });
            }, 50);
        }
        if (mobileRoot) {
            mobileRoot.innerHTML = mobilePreviewHtml;
            // Load font dynamically into preview
            loadFontIntoPreview(AppState.customization.font);
            // Make all scroll-reveal elements visible immediately and ensure all content is displayed
            setTimeout(function() {
                var scrollReveals = mobileRoot.querySelectorAll('.scroll-reveal, .reveal');
                scrollReveals.forEach(function(el) {
                    el.classList.add('visible', 'active');
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                    el.style.visibility = 'visible';
                });
                // Ensure all sections and content are visible
                var allSections = mobileRoot.querySelectorAll('section, .hero, .problem-section, .solution-section, .how-it-works, .before-after, .testimonials, .expert, .faq-section, .cta-section, .footer');
                allSections.forEach(function(el) {
                    el.style.display = 'block';
                    el.style.visibility = 'visible';
                    el.style.opacity = '1';
                });
            }, 50);
        }
        applyInlineEditingToPreview();
        
        document.getElementById('loadingState').classList.add('hidden');
        if (AppState.currentView === 'desktop') {
            document.getElementById('desktopMockup').classList.remove('hidden');
        } else {
            document.getElementById('iphoneMockup').classList.remove('hidden');
        }
        
        AppState.pagesCount++;
        document.getElementById('pagesCount').textContent = AppState.pagesCount;
        
        updateProgress(100);
        updateStatus('ready', 'created');
        showToast(t('created'), 'success');
        AppState.hasGeneratedOnce = true;
        openCustomizationPanel();
        
    } catch (error) {
        console.error('Generation error:', error);
        showToast(t('toastGenerationError'), 'error');
        updateStatus('error', 'toastGenerationError');
        
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('emptyState').classList.remove('hidden');
    } finally {
        AppState.isGenerating = false;
        document.getElementById('generateBtn').disabled = false;
        document.getElementById('generateBtnText').textContent = t('generate');
    }
}

// ============================================
// ACTION BUTTONS
// ============================================
function openExportModal() {
    if (!AppState.generatedHTML) {
        showToast(t('toastErrorNoExport'), 'error');
        return;
    }
    document.getElementById('exportModal')?.classList.remove('hidden');
}

function closeExportModal() {
    document.getElementById('exportModal')?.classList.add('hidden');
}

function exportByFormat(format) {
    if (!AppState.generatedHTML) {
        showToast(t('toastErrorNoExport'), 'error');
        return;
    }
    closeExportModal();
    closeExportDropdown();
    if (format === 'html') { doExportHtml(); return; }
    if (format === 'zip') { doExportZip(); return; }
    if (format === 'jpg' || format === 'jpeg') { doExportJpg(); return; }
    if (format === 'png') { doExportPng(); return; }
    if (format === 'pdf') { doExportPdf(); return; }
}

function closeExportDropdown() {
    var el = document.getElementById('exportDropdown');
    if (el) el.classList.add('hidden');
}

function doExportHtml() {
    const blob = new Blob([AppState.generatedHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `landing-page-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(t('toastDownloadSuccess'), 'success');
}

function doExportZip() {
    if (typeof JSZip === 'undefined') {
        doExportHtml();
        return;
    }
    const zip = new JSZip();
    zip.file('index.html', AppState.generatedHTML);
    zip.generateAsync({ type: 'blob' }).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `landing-page-${Date.now()}.zip`;
        a.click();
        URL.revokeObjectURL(url);
        showToast(t('toastDownloadSuccess'), 'success');
    });
}

function doExportJpg() {
    const previewEl = document.getElementById('desktopContent') || document.getElementById('mobileContent');
    if (!previewEl || typeof html2canvas === 'undefined') {
        showToast(t('toastDownloadSuccess'), 'info');
        doExportHtml();
        return;
    }
    const wrapper = previewEl.closest('.imac-content') || previewEl.closest('.monitor-content') || previewEl.closest('.iphone-content') || previewEl;
    html2canvas(wrapper, { useCORS: true, allowTaint: true, scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = `landing-page-${Date.now()}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.92);
        link.click();
        showToast(t('toastDownloadSuccess'), 'success');
    });
}

function doExportPng() {
    const previewEl = document.getElementById('desktopContent') || document.getElementById('mobileContent');
    if (!previewEl || typeof html2canvas === 'undefined') {
        showToast(t('toastDownloadSuccess'), 'info');
        doExportHtml();
        return;
    }
    const wrapper = previewEl.closest('.imac-content') || previewEl.closest('.monitor-content') || previewEl.closest('.iphone-content') || previewEl;
    html2canvas(wrapper, { useCORS: true, allowTaint: true, scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = `landing-page-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast(t('toastDownloadSuccess'), 'success');
    });
}

function doExportPdf() {
    const previewEl = document.getElementById('desktopContent') || document.getElementById('mobileContent');
    if (!previewEl || typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
        doExportHtml();
        return;
    }
    const wrapper = previewEl.closest('.imac-content') || previewEl.closest('.monitor-content') || previewEl.closest('.iphone-content') || previewEl;
    html2canvas(wrapper, { useCORS: true, allowTaint: true, scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = (canvas.height * pdfW) / canvas.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
        pdf.save(`landing-page-${Date.now()}.pdf`);
        showToast(t('toastDownloadSuccess'), 'success');
    });
}

function exportHTML() {
    openExportModal();
}

async function copyCode() {
    if (!AppState.generatedHTML) {
        showToast(t('toastNoCopy'), 'error');
        return;
    }
    try {
        await navigator.clipboard.writeText(AppState.generatedHTML);
        showToast(t('toastCopySuccess'), 'success');
    } catch (error) {
        showToast('فشل النسخ', 'error');
    }
}

function regenerate() {
    if (!AppState.generatedHTML) {
        showToast(t('toastNoRegenerate'), 'error');
        return;
    }
    handleGenerate();
}

function getNewWindowToolbarHtmlAndScript() {
    var toolbarHtml = '<div id="floatingTextToolbar" class="ft-new-window-toolbar hidden" aria-hidden="true">' +
        '<div class="ft-toolbar-inner">' +
        '<span class="ft-drag-handle" title="اسحب لتحريك الشريط">⋮⋮</span>' +
        '<div class="ft-toolbar-group"><button type="button" class="ft-btn ft-color" title="لون النص">' +
        '<svg class="ft-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c2.3 0 4.4-.8 6.1-2.1L7.9 7.9 12 2z"/><circle cx="17" cy="15" r="4"/></svg></button>' +
        '<div id="ftColorPalette" class="ft-color-palette hidden">' +
        '<button type="button" class="ft-palette-color" data-color="#1e293b" style="background:#1e293b"></button>' +
        '<button type="button" class="ft-palette-color" data-color="#ffffff" style="background:#fff;border:1px solid rgba(0,0,0,0.2)"></button>' +
        '<button type="button" class="ft-palette-color" data-color="#ef4444" style="background:#ef4444"></button>' +
        '<button type="button" class="ft-palette-color" data-color="#f97316" style="background:#f97316"></button>' +
        '<button type="button" class="ft-palette-color" data-color="#eab308" style="background:#eab308"></button>' +
        '<button type="button" class="ft-palette-color" data-color="#22c55e" style="background:#22c55e"></button>' +
        '<button type="button" class="ft-palette-color" data-color="#06b6d4" style="background:#06b6d4"></button>' +
        '<button type="button" class="ft-palette-color" data-color="#8b5cf6" style="background:#8b5cf6"></button>' +
        '<button type="button" class="ft-palette-color" data-color="#ec4899" style="background:#ec4899"></button></div></div>' +
        '<div class="ft-toolbar-divider"></div><div class="ft-toolbar-group">' +
        '<button type="button" class="ft-btn ft-bold" title="عريض">B</button>' +
        '<button type="button" class="ft-btn ft-align" data-align="left" title="يسار"><svg class="ft-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h10M4 18h16"/></svg></button>' +
        '<button type="button" class="ft-btn ft-align" data-align="center" title="توسيط"><svg class="ft-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M7 12h10M4 18h16"/></svg></button>' +
        '<button type="button" class="ft-btn ft-align" data-align="right" title="يمين"><svg class="ft-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M10 12h10M4 18h16"/></svg></button></div>' +
        '<div class="ft-toolbar-divider"></div><div class="ft-toolbar-group">' +
        '<button type="button" class="ft-btn ft-undo" id="ftUndoBtn" title="رجوع" disabled>↶</button>' +
        '<button type="button" class="ft-btn ft-redo" id="ftRedoBtn" title="تقدم" disabled>↷</button></div></div></div>';
    var toolbarCss = '<style id="ft-new-window-styles">.ft-new-window-toolbar{position:fixed;z-index:9999;opacity:0;transform:translateY(8px) scale(0.96);pointer-events:none;transition:opacity .2s ease,transform .2s ease}.ft-new-window-toolbar.visible{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}.ft-new-window-toolbar.hidden{display:none!important}.ft-new-window-toolbar:not(.hidden){display:block}.ft-toolbar-inner{display:flex;align-items:center;gap:2px;padding:6px 8px;border-radius:12px;background:linear-gradient(135deg,rgba(30,41,59,.85) 0%,rgba(15,23,42,.9) 100%);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.1);box-shadow:0 8px 32px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.06)}.ft-toolbar-group{display:flex;align-items:center;gap:2px;position:relative}.ft-toolbar-divider{width:1px;height:20px;background:rgba(255,255,255,.12);margin:0 4px}.ft-btn{width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border:none;border-radius:8px;background:transparent;color:rgba(255,255,255,.85);cursor:pointer;font-size:14px;font-weight:700}.ft-btn:hover:not(:disabled){background:rgba(255,255,255,.12);color:#fff}.ft-btn:disabled{opacity:.4;cursor:not-allowed}.ft-icon{width:18px;height:18px}.ft-color-palette{position:absolute;bottom:100%;left:0;margin-bottom:6px;padding:8px;border-radius:10px;background:rgba(30,41,59,.95);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.1);box-shadow:0 8px 24px rgba(0,0,0,.35);display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.ft-color-palette.hidden{display:none!important}.ft-palette-color{width:28px;height:28px;border-radius:6px;border:2px solid transparent;cursor:pointer}.ft-drag-handle{cursor:grab;padding:0 6px;margin-right:2px;color:rgba(255,255,255,.5);font-size:14px;user-select:none}.ft-drag-handle:active{cursor:grabbing}</style>';
    var editableSelector = 'h1, h2, h3, h4, p, a, .logo, .hero-badge, .section-label, .hero-trust-item, .hero-badge-item, .float-item span, .float-item div, .price-guarantee span, .price-guarantee-item, .footer-trust-item, .footer-trust-item span, .hero-benefits li span, .price-original, .price-discount, .urgency-text, .cta-guarantee';
    var script = '<script>(function(){var MAX_UNDO=10,undo=[],redo=[];function pushUndo(){var html=document.body.innerHTML;undo.push(html);if(undo.length>MAX_UNDO)undo.shift();redo=[];}function updateBtns(){var u=document.getElementById("ftUndoBtn"),r=document.getElementById("ftRedoBtn");if(u)u.disabled=undo.length===0;if(r)r.disabled=redo.length===0;}function applyCmd(cmd,val){pushUndo();document.execCommand(cmd,false,val||null);updateBtns();}function positionToolbar(el){var t=document.getElementById("floatingTextToolbar");if(!t||!el)return;var r=el.getBoundingClientRect(),tr=t.getBoundingClientRect(),g=10,top=r.top-(tr.height||44)-g,left=r.left+r.width/2-(tr.width||280)/2;left=Math.max(8,Math.min(window.innerWidth-(tr.width||280)-8,left));top=Math.max(8,top);t.style.top=top+"px";t.style.left=left+"px";}function showToolbar(el){var t=document.getElementById("floatingTextToolbar");if(!t)return;t.classList.remove("hidden");t.classList.add("visible");positionToolbar(el);updateBtns();}function hideToolbar(){var t=document.getElementById("floatingTextToolbar");if(!t)return;t.classList.add("hidden");t.classList.remove("visible");var p=document.getElementById("ftColorPalette");if(p)p.classList.add("hidden");}var hideT;document.body.addEventListener("focusin",function(e){var el=e.target;if(!el||el.getAttribute("contenteditable")!=="true")return;pushUndo();clearTimeout(hideT);showToolbar(el);});document.body.addEventListener("focusout",function(e){if(e.relatedTarget&&document.getElementById("floatingTextToolbar").contains(e.relatedTarget))return;hideT=setTimeout(hideToolbar,150);});var sel="'+ editableSelector.replace(/'/g, "\\'") +'";document.querySelectorAll(sel).forEach(function(el){el.setAttribute("contenteditable","true");});var pg=document.querySelector(".price-guarantee");if(pg)pg.setAttribute("contenteditable","false");var toolbar=document.getElementById("floatingTextToolbar");if(toolbar){var colorBtn=toolbar.querySelector(".ft-color"),palette=document.getElementById("ftColorPalette");if(colorBtn&&palette){colorBtn.onclick=function(e){e.stopPropagation();palette.classList.toggle("hidden");};palette.querySelectorAll(".ft-palette-color").forEach(function(b){b.onclick=function(e){e.preventDefault();var c=b.getAttribute("data-color");if(c)applyCmd("foreColor",c);palette.classList.add("hidden");};});}document.addEventListener("click",function(e){if(palette&&!palette.classList.contains("hidden")&&!palette.contains(e.target)&&!colorBtn.contains(e.target))palette.classList.add("hidden");});toolbar.querySelector(".ft-bold").onclick=function(){applyCmd("bold");};toolbar.querySelectorAll(".ft-align").forEach(function(b){b.onclick=function(){var a=b.getAttribute("data-align");applyCmd(a==="left"?"justifyLeft":a==="center"?"justifyCenter":"justifyRight");};});document.getElementById("ftUndoBtn").onclick=function(){if(undo.length===0)return;redo.push(document.body.innerHTML);document.body.innerHTML=undo.pop();updateBtns();};document.getElementById("ftRedoBtn").onclick=function(){if(redo.length===0)return;undo.push(document.body.innerHTML);document.body.innerHTML=redo.pop();updateBtns();};var handle=toolbar.querySelector(".ft-drag-handle");if(handle){var dx,dy,tx,ty;handle.onmousedown=function(e){e.preventDefault();var r=toolbar.getBoundingClientRect();dx=e.clientX;dy=e.clientY;tx=r.left;ty=r.top;function move(ev){toolbar.style.left=(tx+ev.clientX-dx)+"px";toolbar.style.top=(ty+ev.clientY-dy)+"px";}function up(){document.removeEventListener("mousemove",move);document.removeEventListener("mouseup",up);}document.addEventListener("mousemove",move);document.addEventListener("mouseup",up);};}})}})();<\/script>';
    return { html: toolbarHtml, css: toolbarCss, script: script };
}

function openPreviewInNewTab() {
    if (!AppState.generatedHTML) {
        showToast(t('toastErrorNoExport'), 'error');
        return;
    }
    var inject = getNewWindowToolbarHtmlAndScript();
    var html = AppState.generatedHTML;
    if (html.indexOf('</body>') !== -1) {
        html = html.replace('</body>', inject.css + '\n' + inject.html + '\n' + inject.script + '\n</body>');
    } else {
        html = html + inject.css + inject.html + inject.script;
    }
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    ApiClient.baseUrl = window.location.origin;
    initEventListeners();
    initFloatingTextToolbar();
    applyI18n();
    updateStatus('waiting', 'waitingImage');
    updateSavedStylesList();
    
    // Initialize theme selector with current theme
    const themeSelector = document.getElementById('themeSelector');
    if (themeSelector) {
        themeSelector.value = AppState.currentTheme;
        updateThemePreview(AppState.currentTheme);
    }
    
    window.addEventListener('scroll', function () {
        var el = getActiveEditableInPreview();
        if (el) positionFloatingToolbar(el);
    }, true);
    window.addEventListener('resize', function () {
        var el = getActiveEditableInPreview();
        if (el) positionFloatingToolbar(el);
    });
    
    console.log('PageGen Pro Enhanced initialized');
});
