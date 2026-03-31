/**
 * Default landing page template (basic tier).
 * id: default, tier: basic, isDefault: true
 * AI Image Slot Architecture; content dynamic via bindings from generator.
 */
(function (global) {
    'use strict';

    function renderDefaultTemplate(data) {
        var d = data || {};
        var i18n = d.i18n || {};
        var themeVars = d.themeVarsCss || '';
        var fontLink = d.fontLink || '';
        var fontFamily = d.fontFamily || "'Cairo', sans-serif";
        var heroBg = d.heroBackground || 'linear-gradient(135deg, var(--background) 0%, var(--secondary) 50%, var(--background) 100%)';
        var name = d.name || 'المنتج';
        var headline = d.headline || name;
        var description = d.description || '';
        var benefits = d.benefits || [];
        var trustBadges = d.trustBadges || [];
        var problemPoints = d.problemPoints || [];
        var howItWorks = d.howItWorks || [];
        var testimonials = d.testimonials || [];
        var faqs = d.faqs || [];
        var categoryName = d.categoryName || '';
        var price = d.price || '199';
        var oldPrice = d.oldPrice || '299';
        var currency = d.currency || 'ريال';
        var ctaText = d.ctaText || 'اطلب الآن';
        var urgencyLabel = d.urgencyLabel || 'العرض ينتهي خلال';
        var navFeatures = i18n.navFeatures || 'المميزات';
        var navUse = i18n.navUse || 'الاستخدام';
        var navReviews = i18n.navReviews || 'الآراء';
        var navPricing = i18n.navPricing || 'السعر';
        var navFaq = i18n.navFaq || 'الأسئلة';
        var navOrder = i18n.navOrder || 'اطلب الآن';
        var heroBadge = i18n.heroBadge || 'الأكثر مبيعاً | شحن مجاني + ضمان استرداد 30 يوم';
        var sectionProblems = i18n.sectionProblems || 'المشاكل';
        var sectionProblemsTitle = i18n.sectionProblemsTitle || 'هل تعاني من هذه المشاكل؟';
        var sectionProblemsSub = i18n.sectionProblemsSub || 'أنت لست وحدك...';
        var sectionSolution = i18n.sectionSolution || 'الحل الأمثل';
        var sectionSolutionTitle = i18n.sectionSolutionTitle || 'لماذا';
        var sectionSolutionTitleSpan = i18n.sectionSolutionTitleSpan || 'الحل المثالي؟';
        var sectionSolutionSub = i18n.sectionSolutionSub || 'تركيبة فريدة تجمع بين العلم والطبيعة';
        var sectionHow = i18n.sectionHow || 'طريقة الاستخدام';
        var sectionHowTitle = i18n.sectionHowTitle || 'كيف يعمل؟';
        var sectionBeforeAfter = i18n.sectionBeforeAfter || 'التحول المذهل';
        var sectionBeforeAfterTitle = i18n.sectionBeforeAfterTitle || 'النتائج تتحدث عن نفسها';
        var sectionBeforeAfterSub = i18n.sectionBeforeAfterSub || 'تحول مذهل في 30 يوم فقط مع';
        var sectionTestimonials = i18n.sectionTestimonials || 'آراء العملاء';
        var sectionTestimonialsTitle = i18n.sectionTestimonialsTitle || 'ماذا يقول عملاؤنا؟';
        var sectionTestimonialsSub = i18n.sectionTestimonialsSub || 'انضم لـ 50,000+ عميل سعيد';
        var sectionFaq = i18n.sectionFaq || 'الأسئلة الشائعة';
        var sectionFaqTitle = i18n.sectionFaqTitle || 'الأسئلة الأكثر شيوعاً';
        var sectionExpertLabel = i18n.sectionExpertLabel || 'توصية الخبراء';
        var sectionExpertQuote = i18n.sectionExpertQuote || 'أنصح بـ';
        var sectionExpertDesc = i18n.sectionExpertDesc || 'بعد سنوات من الخبرة';
        var ctaTitle = i18n.ctaTitle || 'لا تفوت الفرصة!';
        var ctaSubtitle = i18n.ctaSubtitle || 'انضم لـ 50,000+ عميل سعيد وغيّر حياتك اليوم';
        var ctaButton = i18n.ctaButton || 'اطلب الآن بـ';
        var ctaGuarantee = i18n.ctaGuarantee || 'ضمان استرداد كامل لمدة 30 يوم';
        var footerSecure = i18n.footerSecure || 'دفع آمن';
        var footerShipping = i18n.footerShipping || 'شحن مجاني';
        var footerWarranty = i18n.footerWarranty || 'ضمان 30 يوم';
        var footerSupport = i18n.footerSupport || 'دعم 24/7';
        var footerCopyright = i18n.footerCopyright || 'جميع الحقوق محفوظة';
        var beforeLabel = i18n.beforeLabel || 'قبل ❌';
        var afterLabel = i18n.afterLabel || 'بعد ✓';
        var priceSecure = i18n.priceSecure || 'دفع آمن';
        var priceShipping = i18n.priceShipping || 'شحن مجاني';
        var priceWarranty = i18n.priceWarranty || 'ضمان 30 يوم';
        var trustSecure = i18n.trustSecure || 'دفع آمن 100%';
        var trustShipping = i18n.trustShipping || 'شحن مجاني';
        var trustRefund = i18n.trustRefund || 'ضمان استرداد';
        var problemCardSuffix = i18n.problemCardSuffix || 'نحن نفهم ما تمر به، ولذلك طورنا';
        var sectionLifestyleLabel = i18n.sectionLifestyleLabel || 'تجربة فاخرة';
        var sectionLifestyleTitle = i18n.sectionLifestyleTitle || 'روتين عناية فاخر';
        var sectionLifestyleTitleSpan = i18n.sectionLifestyleTitleSpan || 'صحي';
        var sectionLifestyleDesc = i18n.sectionLifestyleDesc || 'استمتع بتجربة عناية فاخرة مع زيت Soukaina. تركيبتنا الفريدة تخترق جذور الشعر لتغذيته من العمق، مما يمنحك شعراً أقوى، أكثف، وأكثر لمعاناً.';
        var sectionIngredientsLabel = i18n.sectionIngredientsLabel || 'المكونات الطبيعية';
        var sectionIngredientsTitle = i18n.sectionIngredientsTitle || 'قوة الطبيعة في كل قطرة';
        var sectionIngredientsSub = i18n.sectionIngredientsSub || 'مكونات طبيعية 100% من أجود المصادر';
        var lang = d.lang || 'ar';
        var dir = lang === 'ar' ? 'rtl' : 'ltr';

        function esc(s) { return (s == null ? '' : String(s)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

        var defaultOrder = ['hero', 'problem', 'solution', 'lifestyle', 'howItWorks', 'beforeAfter', 'ingredients', 'testimonials', 'expert', 'faq', 'cta', 'footer'];
        var sectionOrder = (d.sectionOrder && Array.isArray(d.sectionOrder) && d.sectionOrder.length) ? d.sectionOrder : defaultOrder;

        var defaultIngredients = ['زيت الأرغان المغربي الأصلي', 'زيت إكليل الجبل الطبيعي', 'زيت الخروع البارد', 'زيت جوز الهند العضوي', 'خالي من المواد الكيميائية'];
        var lifestyleBenefits = (d.lifestyleBenefits && d.lifestyleBenefits.length) ? d.lifestyleBenefits : ['سهل التطبيق وامتصاص سريع', 'رائحة عطرية طبيعية منعشة', 'مناسب لجميع أنواع الشعر'];
        var ingredientsList = (d.ingredientsList && d.ingredientsList.length) ? d.ingredientsList : defaultIngredients;

        var sections = {};

        sections.hero = '<!-- Hero -->\n<div class="hero-badge-bar">⚡ ' + esc(heroBadge) + '</div>\n<section class="hero" data-section-id="hero">\n<div class="hero-pattern"></div>\n<div class="hero-orb hero-orb-1"></div>\n<div class="hero-orb hero-orb-2"></div>\n<div class="hero-orb hero-orb-3"></div>\n<div class="hero-content">\n<div class="hero-text scroll-reveal">\n<div class="hero-tags">\n' +
            trustBadges.slice(0, 3).map(function (b) { return '<span class="hero-tag">' + (b.icon ? b.icon + ' ' : '') + esc(b.text) + '</span>'; }).join('\n') + '\n</div>\n<h1 class="hero-title">' + esc(headline) + '</h1>\n<p class="hero-desc">' + esc(description) + '</p>\n<ul class="hero-features">\n' +
            benefits.slice(0, 4).map(function (b) { return '<li class="hero-feature"><span class="hero-feature-icon"><i class="fas fa-check"></i></span><span>' + esc(b) + '</span></li>'; }).join('\n') + '\n</ul>\n<div class="hero-trust">\n<div class="hero-trust-item"><i class="fas fa-lock"></i> ' + esc(trustSecure) + '</div>\n<div class="hero-trust-item"><i class="fas fa-truck"></i> ' + esc(trustShipping) + '</div>\n<div class="hero-trust-item"><i class="fas fa-undo"></i> ' + esc(trustRefund) + '</div>\n</div>\n<div class="price-card">\n<div>\n<span class="price-old">' + esc(oldPrice) + ' ' + esc(currency) + '</span>\n<span class="price-save">وفّر 33%</span>\n</div>\n<div class="price-new">' + esc(price) + '</div>\n<div class="price-badges">\n<span><i class="fas fa-lock"></i> ' + esc(priceSecure) + '</span>\n<span><i class="fas fa-truck"></i> ' + esc(priceShipping) + '</span>\n<span><i class="fas fa-shield-alt"></i> ' + esc(priceWarranty) + '</span>\n</div>\n</div>\n<a href="#order" class="cta-btn">' + esc(ctaText) + ' <i class="fas fa-arrow-left"></i></a>\n<div class="urgency"><i class="fas fa-clock"></i> <span class="urgency-label">' + esc(urgencyLabel) + '</span> <span class="urgency-time" id="urgency-countdown">23:59:59</span></div>\n</div>\n<div class="hero-visual scroll-reveal scroll-reveal-delay-2">\n<div class="product-stage">\n<div class="product-ring product-ring-1"></div>\n<div class="product-ring product-ring-2"></div>\n<div class="product-glow"></div>\n<div class="ai-image-slot ai-slot-hero-product" data-image-type="hero-product" data-image-context="Premium luxury hair oil bottle with gold accents and elegant packaging, professional product photography on white background, studio lighting, cosmetic beauty product, amber glass dropper bottle" data-image-style="studio" data-ratio="1:1">\n<div class="ai-image-skeleton"></div>\n</div>\n<div class="float-card float-card-1"><i class="fas fa-star"></i><div><div style="font-size:0.75rem;color:var(--gray)">تقييم العملاء</div><div style="color:var(--primary);letter-spacing:2px">★★★★★</div></div></div>\n<div class="float-card float-card-2"><i class="fas fa-users"></i><span>50,000+ عميل</span></div>\n<div class="float-card float-card-3"><i class="fas fa-check-circle"></i><span>مضمون 100%</span></div>\n</div>\n</div>\n</div>\n</section>\n';

        sections.problem = '<!-- Problem -->\n<section class="problems" id="problems" data-section-id="problem">\n<div class="problems-container">\n<div class="section-header">\n<span class="section-label scroll-reveal">' + esc(sectionProblems) + '</span>\n<h2 class="section-title scroll-reveal scroll-reveal-delay-1">' + esc(sectionProblemsTitle) + '</h2>\n<p class="section-subtitle scroll-reveal scroll-reveal-delay-2">' + esc(sectionProblemsSub) + '</p>\n</div>\n<div class="problems-grid">\n' +
            problemPoints.map(function (p, i) { return '<div class="problem-card scroll-reveal scroll-reveal-delay-' + (i + 1) + '">\n<div class="problem-icon">' + (p.icon || '') + '</div>\n<h3>' + esc(p.text) + '</h3>\n<p>' + esc(problemCardSuffix) + ' ' + esc(name) + ' خصيصاً لحل هذه المشكلة نهائياً</p>\n</div>'; }).join('\n') + '\n</div>\n</div>\n</section>\n';

        sections.solution = '<!-- Solution -->\n<section class="solution" id="solution" data-section-id="solution">\n<div class="solution-container">\n<div class="section-header">\n<span class="section-label scroll-reveal">' + esc(sectionSolution) + '</span>\n<h2 class="section-title scroll-reveal scroll-reveal-delay-1">' + esc(sectionSolutionTitle) + ' ' + esc(name) + ' هو <span>' + esc(sectionSolutionTitleSpan) + '</span></h2>\n<p class="section-subtitle scroll-reveal scroll-reveal-delay-2">' + esc(sectionSolutionSub) + '</p>\n</div>\n<div class="solution-grid">\n' +
            benefits.map(function (b, i) { return '<div class="solution-card scroll-reveal scroll-reveal-delay-' + ((i % 3) + 1) + '">\n<div class="solution-number">' + (i + 1) + '</div>\n<div class="solution-content">\n<h3>' + esc(b) + '</h3>\n<p>تم تطوير هذه الميزة بعناية فائقة لضمان رضاك التام وتحقيق النتائج المرجوة بأسرع وقت ممكن</p>\n</div>\n</div>'; }).join('\n') + '\n</div>\n</div>\n</section>\n';

        sections.lifestyle = '<!-- Lifestyle / Luxury Routine -->\n<section class="lifestyle-section" data-section-id="lifestyle">\n<div class="lifestyle-container">\n<div class="scroll-reveal">\n<div class="ai-image-slot ai-slot-lifestyle" data-image-type="hero-lifestyle" data-image-context="Beautiful Middle Eastern woman applying hair oil treatment in elegant bathroom, self-care moment, soft natural lighting through window, luxury spa atmosphere, healthy hair care routine, lifestyle beauty photography" data-image-style="lifestyle" data-ratio="4:3">\n<div class="ai-image-skeleton"></div>\n</div>\n</div>\n<div class="scroll-reveal scroll-reveal-delay-2">\n<span class="section-label">' + esc(sectionLifestyleLabel) + '</span>\n<h2 class="section-title" style="text-align:right">' + esc(sectionLifestyleTitle) + ' <span>' + esc(sectionLifestyleTitleSpan) + '</span></h2>\n<p class="lifestyle-desc">' + esc(sectionLifestyleDesc) + '</p>\n<ul class="hero-features">\n' +
            lifestyleBenefits.map(function (b) { return '<li class="hero-feature"><span class="hero-feature-icon"><i class="fas fa-check"></i></span><span>' + esc(b) + '</span></li>'; }).join('\n') + '\n</ul>\n</div>\n</div>\n</section>\n';

        sections.howItWorks = '<!-- How It Works -->\n<section class="how-it-works" data-section-id="howItWorks">\n<div class="how-container">\n<span class="section-label scroll-reveal">' + esc(sectionHow) + '</span>\n<h2 class="section-title scroll-reveal scroll-reveal-delay-1">' + esc(sectionHowTitle) + '</h2>\n<div class="steps-wrapper">\n<div class="steps-line"></div>\n<div class="steps-grid">\n' +
            howItWorks.map(function (step, i) { return '<div class="step-card scroll-reveal scroll-reveal-delay-' + (i + 1) + '">\n<div class="step-num">' + (step.step || i + 1) + '</div>\n<h3>' + esc(step.title) + '</h3>\n<p>' + esc(step.desc) + '</p>\n</div>'; }).join('\n') + '\n</div>\n</div>\n</div>\n</section>\n';

        sections.beforeAfter = '<!-- Before/After -->\n<section class="before-after" data-section-id="beforeAfter">\n<div class="before-after-container">\n<div class="section-header">\n<span class="section-label scroll-reveal">' + esc(sectionBeforeAfter) + '</span>\n<h2 class="section-title scroll-reveal scroll-reveal-delay-1">' + esc(sectionBeforeAfterTitle) + '</h2>\n<p class="section-subtitle scroll-reveal scroll-reveal-delay-2">' + esc(sectionBeforeAfterSub) + ' ' + esc(name) + '</p>\n</div>\n<div class="ba-grid">\n<div class="ba-card ba-before scroll-reveal">\n<div class="ba-image">\n<div class="ai-image-slot ai-slot-before-after ai-slot-before" data-image-type="before-image" data-image-context="Person showing hair thinning and hair loss problem, damaged weak hair before treatment, realistic photography showing scalp visibility, concerned expression, clinical before photo style" data-image-style="photorealistic" data-ratio="4:3" style="width:100%;height:100%">\n<div class="ai-image-skeleton"></div>\n</div>\n</div>\n<div class="ba-label">' + esc(beforeLabel) + '</div>\n</div>\n<div class="ba-card ba-after scroll-reveal scroll-reveal-delay-1">\n<div class="ba-image">\n<div class="ai-image-slot ai-slot-before-after ai-slot-after" data-image-type="after-image" data-image-context="Person with thick healthy shiny hair showing amazing results after treatment, confident happy expression, strong voluminous hair growth, glowing healthy hair, clinical after photo style" data-image-style="photorealistic" data-ratio="4:3" style="width:100%;height:100%">\n<div class="ai-image-skeleton"></div>\n</div>\n</div>\n<div class="ba-label">' + esc(afterLabel) + '</div>\n</div>\n</div>\n</div>\n</section>\n';

        sections.ingredients = '<!-- Ingredients -->\n<section class="ingredients" data-section-id="ingredients">\n<div class="ingredients-container">\n<div class="section-header">\n<span class="section-label scroll-reveal">' + esc(sectionIngredientsLabel) + '</span>\n<h2 class="section-title scroll-reveal scroll-reveal-delay-1">' + esc(sectionIngredientsTitle) + '</h2>\n</div>\n<div class="ingredients-content">\n<div class="scroll-reveal">\n<div class="ai-image-slot ai-slot-ingredient" data-image-type="ingredient-closeup" data-image-context="Close-up macro photography of natural hair oil ingredients, argan oil drops in glass container, rosemary sprigs, lavender flowers, natural herbs arranged beautifully, earth tones, wellness aesthetic, product ingredient flatlay" data-image-style="studio" data-ratio="1:1">\n<div class="ai-image-skeleton"></div>\n</div>\n</div>\n<div class="scroll-reveal scroll-reveal-delay-2">\n<h3 class="ingredients-subtitle">' + esc(sectionIngredientsSub) + '</h3>\n<ul class="hero-features">\n' +
            ingredientsList.map(function (item) { return '<li class="hero-feature"><span class="hero-feature-icon"><i class="fas fa-check"></i></span><span>' + esc(item) + '</span></li>'; }).join('\n') + '\n</ul>\n</div>\n</div>\n</div>\n</section>\n';

        sections.testimonials = '<!-- Testimonials -->\n<section class="testimonials" id="testimonials" data-section-id="testimonials">\n<div class="testimonials-container">\n<div class="section-header">\n<span class="section-label scroll-reveal">' + esc(sectionTestimonials) + '</span>\n<h2 class="section-title scroll-reveal scroll-reveal-delay-1">' + esc(sectionTestimonialsTitle) + '</h2>\n<p class="section-subtitle scroll-reveal scroll-reveal-delay-2">' + esc(sectionTestimonialsSub) + '</p>\n</div>\n<div class="testimonials-grid">\n' +
            testimonials.slice(0, 3).map(function (t, i) { return '<div class="testimonial-card scroll-reveal scroll-reveal-delay-' + (i + 1) + '">\n<div class="testimonial-stars">★★★★★</div>\n<p class="testimonial-text">' + esc(t.text) + '</p>\n<div class="testimonial-author">\n<div class="ai-image-slot ai-slot-avatar" data-image-type="testimonial-avatar-' + (i + 1) + '" data-image-context="Portrait of happy satisfied Arab woman customer, professional headshot, soft natural lighting, neutral background" data-image-style="portrait" data-ratio="1:1">\n<div class="ai-image-skeleton"></div>\n</div>\n<div class="testimonial-info">\n<h4>' + esc(t.name) + '</h4>\n<p>' + esc(t.location) + '</p>\n</div>\n</div>\n</div>'; }).join('\n') + '\n</div>\n</div>\n</section>\n';

        sections.expert = '<!-- Expert -->\n<section class="expert" id="pricing" data-section-id="expert">\n<div class="expert-container">\n<div class="expert-content">\n<div class="expert-image-wrapper scroll-reveal">\n<div class="expert-ring"></div>\n<div class="ai-image-slot ai-slot-expert" data-image-type="expert-photo" data-image-context="Professional Middle Eastern female dermatologist or hair specialist doctor, wearing white lab coat, confident expert expression, professional medical portrait, studio lighting, trustworthy appearance" data-image-style="portrait" data-ratio="1:1">\n<div class="ai-image-skeleton"></div>\n</div>\n</div>\n<div class="scroll-reveal scroll-reveal-delay-2">\n<span class="expert-badge">' + esc(sectionExpertLabel) + '</span>\n<p class="expert-quote">"' + esc(sectionExpertQuote) + ' ' + esc(name) + ' لجميع مرضاي بعد سنوات من الخبرة في مجال العناية بالشعر"</p>\n<p class="expert-desc">' + esc(sectionExpertDesc) + ' في مجال ' + esc(categoryName) + '، أؤكد أن ' + esc(name) + ' يمثل نقلة نوعية حقيقية. التركيبة العلمية والمكونات الطبيعية تجعله الخيار الأمثل للحصول على نتائج مضمونة.</p>\n<div class="expert-stats">\n<div class="expert-stat"><div class="expert-stat-value">98%</div><div class="expert-stat-label">رضا العملاء</div></div>\n<div class="expert-stat"><div class="expert-stat-value">50K+</div><div class="expert-stat-label">عميل سعيد</div></div>\n<div class="expert-stat"><div class="expert-stat-value">4.9</div><div class="expert-stat-label">تقييم</div></div>\n</div>\n</div>\n</div>\n</div>\n</section>\n';

        sections.faq = '<!-- FAQ -->\n<section class="faq" id="faq" data-section-id="faq">\n<div class="faq-container">\n<div class="section-header">\n<span class="section-label scroll-reveal">' + esc(sectionFaq) + '</span>\n<h2 class="section-title scroll-reveal scroll-reveal-delay-1">' + esc(sectionFaqTitle) + '</h2>\n</div>\n<div class="faq-list">\n' +
            faqs.map(function (faq, i) { return '<div class="faq-item scroll-reveal scroll-reveal-delay-' + (i + 1) + '">\n<div class="faq-question" onclick="toggleFaq(this)">' + esc(faq.q) + '\n<div class="faq-icon"><i class="fas fa-plus"></i></div>\n</div>\n<div class="faq-answer"><p>' + esc(faq.a) + '</p></div>\n</div>'; }).join('\n') + '\n</div>\n</div>\n</section>\n';

        sections.cta = '<!-- CTA -->\n<section class="final-cta" id="order" data-section-id="cta">\n<div class="cta-content">\n<h2 class="cta-title scroll-reveal">' + esc(ctaTitle) + '</h2>\n<p class="cta-subtitle scroll-reveal scroll-reveal-delay-1">' + esc(ctaSubtitle) + '</p>\n<a href="#" class="cta-btn-white scroll-reveal scroll-reveal-delay-2">' + esc(ctaButton) + ' ' + esc(price) + ' ' + esc(currency) + ' فقط <i class="fas fa-shopping-cart"></i></a>\n<p class="cta-guarantee scroll-reveal scroll-reveal-delay-3"><i class="fas fa-shield-alt"></i> ' + esc(ctaGuarantee) + '</p>\n</div>\n</section>\n';

        sections.footer = '<!-- Footer -->\n<footer class="footer" data-section-id="footer">\n<div class="footer-container">\n<div class="footer-trust">\n<div class="footer-trust-item"><i class="fas fa-lock"></i><span>' + esc(footerSecure) + '</span></div>\n<div class="footer-trust-item"><i class="fas fa-truck"></i><span>' + esc(footerShipping) + '</span></div>\n<div class="footer-trust-item"><i class="fas fa-shield-alt"></i><span>' + esc(footerWarranty) + '</span></div>\n<div class="footer-trust-item"><i class="fas fa-headset"></i><span>' + esc(footerSupport) + '</span></div>\n</div>\n<div class="footer-divider"></div>\n<p class="footer-copyright">© 2026 ' + esc(footerCopyright) + ' | ' + esc(name) + '</p>\n</div>\n</footer>\n';

        var bodySections = sectionOrder.map(function (id) { return sections[id] || ''; }).join('\n');

        var luxuryGoldVars = ':root {\n' +
            '--gold-light: #f5e6d3;\n--gold: #d4a574;\n--gold-dark: #b8956a;\n--champagne: #f7e7ce;\n--cream: #faf6f0;\n--charcoal: #2c2c2c;\n--warm-gray: #6b6560;\n--soft-black: #1a1a1a;\n--rose-gold: #e8c4b8;\n' +
            '--gradient-luxury: linear-gradient(135deg, #d4a574 0%, #b8956a 50%, #96724a 100%);\n--gradient-hero: linear-gradient(180deg, #faf6f0 0%, #f5e6d3 50%, #f7e7ce 100%);\n--gradient-glass: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);\n' +
            '--shadow-soft: 0 4px 20px rgba(180, 149, 106, 0.15);\n--shadow-medium: 0 10px 40px rgba(180, 149, 106, 0.2);\n--shadow-luxury: 0 25px 80px rgba(180, 149, 106, 0.25);\n--skeleton-base: #e8e0d8;\n--skeleton-highlight: #f5f0eb;\n' +
            '--primary: #d4a574;\n--primary-dark: #96724a;\n--primary-light: #f5e6d3;\n--secondary: #f7e7ce;\n--accent: #b8956a;\n--dark: #1a1a1a;\n--gray: #6b6560;\n--light: #faf6f0;\n--background: #faf6f0;\n--text-color: #1a1a1a;\n' +
            '--gradient-primary: linear-gradient(135deg, #d4a574 0%, #b8956a 50%, #96724a 100%);\n' +
            '--shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05);\n--shadow-md: 0 4px 20px rgba(180, 149, 106, 0.15);\n--shadow-lg: 0 10px 40px rgba(180, 149, 106, 0.2);\n--shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1);\n--shadow-2xl: 0 25px 80px rgba(180, 149, 106, 0.25);\n' +
            '--glow-backdrop: color-mix(in srgb, var(--primary) 15%, transparent);\n--glow-button: 0 0 20px rgba(212, 165, 116, 0.4);\n--glow-button-strong: 0 0 40px rgba(212, 165, 116, 0.5);\n--success: #10b981;\n--rose: #e11d48;\n' +
            '--section-padding: 48px;\n--section-gap: 24px;\n--section-border-radius: 24px;\n--container-max: 1200px;\n}\n';
        var isDefaultTheme = (themeVars && themeVars.indexOf('--primary: #6366f1') !== -1);
        var themeVarsToUse = isDefaultTheme ? luxuryGoldVars : themeVars;

        var aiSlotScript = [
            'function registerAIImageSlots(){var s=document.querySelectorAll(".ai-image-slot"),r=[];s.forEach(function(el,i){r.push({id:"slot-"+i,type:el.dataset.imageType,context:el.dataset.imageContext,style:el.dataset.imageStyle||"photorealistic",ratio:el.dataset.ratio||"1:1",element:el})});window.AI_IMAGE_SLOTS=r;return r;}',
            'function injectAIImage(slotType,imageUrl){var slot=document.querySelector(\'[data-image-type="\'+slotType+\'"]\');if(!slot)return false;var sk=slot.querySelector(".ai-image-skeleton");var img=document.createElement("img");img.src=imageUrl;img.alt=slotType;img.className="ai-generated-image";img.onload=function(){img.classList.add("loaded");if(sk)sk.style.display="none";};slot.appendChild(img);return true;}',
            'document.addEventListener("DOMContentLoaded",function(){registerAIImageSlots();});',
            'window.AIImageAPI={register:registerAIImageSlots,inject:injectAIImage,getSlots:function(){return window.AI_IMAGE_SLOTS||[];}};'
        ].join('\n');

        var restCss = (d.extraCss || '');
        var fullCss = themeVarsToUse + '\n' + restCss + '\n.hero { background: ' + (isDefaultTheme ? 'var(--gradient-hero)' : heroBg) + ' !important; }\nbody { font-family: ' + fontFamily + ' !important; }\n.generated-landing-root { --background: var(--light); --text-color: var(--dark); }\n';
        return '<!DOCTYPE html>\n<html lang="' + lang + '" dir="' + dir + '">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>' + esc(name) + ' - ' + esc(headline) + '</title>\n' +
            (fontLink ? '<link href="' + fontLink + '" rel="stylesheet">\n' : '') +
            '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\n<style>\n' + fullCss + '\n</style>\n</head>\n<body>\n<div class="generated-landing-root">\n<!-- Navigation -->\n<nav class="nav" id="navbar">\n<div class="nav-inner">\n<div class="logo">' + esc(name) + '</div>\n<ul class="nav-links">\n<li><a href="#problems" class="nav-link">' + esc(navFeatures) + '</a></li>\n<li><a href="#solution" class="nav-link">' + esc(navUse) + '</a></li>\n<li><a href="#testimonials" class="nav-link">' + esc(navReviews) + '</a></li>\n<li><a href="#faq" class="nav-link">' + esc(navFaq) + '</a></li>\n</ul>\n<a href="#order" class="nav-cta">' + esc(navOrder) + '</a>\n</div>\n</nav>\n' +
            bodySections + '\n</div>\n<script>\n' + (d.inlineScript || '') + '\n' + aiSlotScript + '\n</script>\n</body>\n</html>';
    }

    global.renderDefaultTemplate = renderDefaultTemplate;
})(typeof window !== 'undefined' ? window : this);
