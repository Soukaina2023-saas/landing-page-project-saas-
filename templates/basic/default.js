/**
 * Default landing page template (basic tier).
 * id: default, tier: basic, isDefault: true
 * Structure/layout from reference only; all content is dynamic (bindings from generator).
 */
(function (global) {
    'use strict';

    function renderDefaultTemplate(data) {
        var d = data || {};
        var i18n = d.i18n || {};
        var themeVars = d.themeVarsCss || '';
        var fontLink = d.fontLink || '';
        var fontFamily = d.fontFamily || "'Cairo', sans-serif";
        var heroBg = d.heroBackground || 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 50%, #f0f4ff 100%)';
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
        var heroImage = d.heroImage || '';
        var beforeImage = d.beforeImage || '';
        var afterImage = d.afterImage || '';
        var expertImage = d.expertImage || '';
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
        var beforeText = i18n.beforeText || 'قبل الاستخدام';
        var afterText = i18n.afterText || 'بعد الاستخدام';
        var priceSecure = i18n.priceSecure || 'دفع آمن';
        var priceShipping = i18n.priceShipping || 'شحن مجاني';
        var priceWarranty = i18n.priceWarranty || 'ضمان 30 يوم';
        var trustSecure = i18n.trustSecure || 'دفع آمن 100%';
        var trustShipping = i18n.trustShipping || 'شحن مجاني';
        var trustRefund = i18n.trustRefund || 'ضمان استرداد';
        var problemCardSuffix = i18n.problemCardSuffix || 'نحن نفهم ما تمر به، ولذلك طورنا';
        var lang = d.lang || 'ar';
        var dir = lang === 'ar' ? 'rtl' : 'ltr';

        function esc(s) { return (s == null ? '' : String(s)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

        var defaultSectionOrder = ['hero', 'problem', 'solution', 'howItWorks', 'beforeAfter', 'testimonials', 'expert', 'faq', 'cta', 'footer'];
        var sectionOrder = (d.sectionOrder && Array.isArray(d.sectionOrder) && d.sectionOrder.length) ? d.sectionOrder : defaultSectionOrder;

        var sections = {};
        sections.hero = '<!-- Hero -->\n<div class="hero-badge">\u26a1 ' + esc(heroBadge) + '</div>\n<section class="hero" data-section-id="hero">\n<div class="hero-bg-shapes">\n<div class="shape shape-1"></div>\n<div class="shape shape-2"></div>\n<div class="shape shape-3"></div>\n<div class="shape shape-4"></div>\n<div class="shape shape-5"></div>\n</div>\n<div class="hero-content">\n<div class="hero-text scroll-reveal">\n<div class="hero-badges">\n' +
            trustBadges.slice(0, 3).map(function (b) { return '<span class="hero-badge-item">' + (b.icon || '') + ' ' + esc(b.text) + '</span>'; }).join('\n') + '\n</div>\n' +
            '<h1 class="hero-title">' + esc(headline) + '</h1>\n<p class="hero-description">' + esc(description) + '</p>\n<div class="hero-trust-bar">\n<div class="hero-trust-item"><i class="fas fa-lock"></i> ' + esc(trustSecure) + '</div>\n<div class="hero-trust-item"><i class="fas fa-truck"></i> ' + esc(trustShipping) + '</div>\n<div class="hero-trust-item"><i class="fas fa-undo"></i> ' + esc(trustRefund) + '</div>\n</div>\n<ul class="hero-benefits">\n' +
            benefits.slice(0, 4).map(function (b) { return '<li><span><i class="fas fa-check"></i></span><span>' + esc(b) + '</span></li>'; }).join('\n') + '\n</ul>\n<div class="price-box scroll-reveal scroll-reveal-delay-1">\n<div>\n<span class="price-original">' + esc(oldPrice) + ' ' + esc(currency) + '</span>\n<span class="price-discount">\u0648\u0641\u0651\u0631 33%</span>\n</div>\n<div class="price-current">' + esc(price) + ' <span class="price-current-currency">' + esc(currency) + '</span></div>\n<p class="price-guarantee">\n<span class="price-guarantee-item"><i class="fas fa-lock"></i> ' + esc(priceSecure) + '</span>\n<span class="price-guarantee-item"><i class="fas fa-truck"></i> ' + esc(priceShipping) + '</span>\n<span class="price-guarantee-item"><i class="fas fa-shield-alt"></i> ' + esc(priceWarranty) + '</span>\n</p>\n</div>\n' +
            '<a href="#order" class="cta-button scroll-reveal scroll-reveal-delay-2">' + esc(ctaText) + ' <i class="fas fa-arrow-left"></i></a>\n<p class="urgency-text"><i class="fas fa-clock"></i> ' + esc(urgencyLabel) + ': <span id="urgency-countdown">23:59:59</span></p>\n</div>\n' +
            '<div class="hero-image scroll-reveal scroll-reveal-delay-2">\n<div class="product-showcase">\n<div class="product-circle"></div>\n<div class="product-circle-2"></div>\n<div class="product-circle-3"></div>\n' +
            (heroImage ? '<img src="' + esc(heroImage) + '" alt="' + esc(name) + '" class="product-image">' : '<div class="product-image">\n<i class="fas fa-pump-soap"></i>\n<h3>' + esc(name) + '</h3>\n</div>') + '\n<div class="floating-elements">\n<div class="float-item float-item-1"><i class="fas fa-star"></i><div><div style="font-size:0.8rem;color:var(--gray)">\u062a\u0642\u064a\u064a\u0645 \u0627\u0644\u0639\u0645\u0644\u0627\u0621</div><div class="stars">★★★★★</div></div></div>\n<div class="float-item float-item-2"><i class="fas fa-users"></i><span>50,000+ \u0639\u0645\u064a\u0644</span></div>\n<div class="float-item float-item-3"><i class="fas fa-check-circle"></i><span>\u0645\u0636\u0645\u0648\u0646 100%</span></div>\n<div class="float-item float-item-4"><i class="fas fa-fire"></i><span>' + esc(heroBadge.split('|')[0].trim()) + '</span></div>\n</div>\n</div>\n</div>\n</div>\n</section>\n';
        sections.problem = '<!-- Problem -->\n<section class="problem-section" id="benefits" data-section-id="problem">\n<div class="problem-container">\n<span class="section-label scroll-reveal">' + esc(sectionProblems) + '</span>\n<h2 class="section-title scroll-reveal">' + esc(sectionProblemsTitle) + '</h2>\n<p class="section-subtitle scroll-reveal">' + esc(sectionProblemsSub) + '</p>\n<div class="problem-grid">\n' +
            problemPoints.map(function (p, i) { return '<div class="problem-card scroll-reveal scroll-reveal-delay-' + (i + 1) + '">\n<div class="problem-icon">' + (p.icon || '') + '</div>\n<h3>' + esc(p.text) + '</h3>\n<p>' + esc(problemCardSuffix) + ' ' + esc(name) + ' \u062e\u0635\u064a\u0635\u0627\u064b \u0644\u062d\u0644 \u0647\u0630\u0647 \u0627\u0644\u0645\u0634\u0643\u0644\u0629 \u0646\u0647\u0627\u0626\u064b\u0627</p>\n</div>'; }).join('\n') + '\n</div>\n</div>\n</section>\n';
        sections.solution = '<!-- Solution -->\n<section class="solution-section" id="gallery" data-section-id="solution">\n<div class="solution-container">\n<div class="solution-header">\n<span class="section-label scroll-reveal">' + esc(sectionSolution) + '</span>\n<h2 class="section-title scroll-reveal">' + esc(sectionSolutionTitle) + ' ' + esc(name) + ' \u0647\u0648 <span>' + esc(sectionSolutionTitleSpan) + '</span></h2>\n<p class="section-subtitle scroll-reveal">' + esc(sectionSolutionSub) + '</p>\n</div>\n<div class="features-grid">\n' +
            benefits.map(function (b, i) { return '<div class="feature-card scroll-reveal scroll-reveal-delay-' + ((i % 3) + 1) + '">\n<div class="feature-number">' + (i + 1) + '</div>\n<div class="feature-content">\n<h3>' + esc(b) + '</h3>\n<p>\u062a\u0645 \u062a\u0637\u0648\u064a\u0631 \u0647\u0630\u0647 \u0627\u0644\u0645\u064a\u0632\u0629 \u0628\u0639\u0646\u0627\u064a\u0629 \u0641\u0627\u0626\u0642\u0629 \u0644\u0636\u0645\u0627\u0646 \u0631\u0636\u0627\u0643 \u0627\u0644\u062a\u0627\u0645 \u0648\u062a\u062d\u0642\u064a\u0642 \u0627\u0644\u0646\u062a\u0627\u0626\u062c \u0627\u0644\u0645\u0631\u062c\u0648\u0629 \u0628\u0623\u0633\u0631\u0639 \u0648\u0642\u062a \u0645\u0645\u0643\u0646</p>\n</div>\n</div>'; }).join('\n') + '\n</div>\n</div>\n</section>\n';
        sections.howItWorks = '<!-- How It Works -->\n<section class="how-it-works" data-section-id="howItWorks">\n<div class="how-container">\n<span class="section-label scroll-reveal">' + esc(sectionHow) + '</span>\n<h2 class="section-title scroll-reveal">' + esc(sectionHowTitle) + '</h2>\n<div class="steps-container">\n<div class="steps-line"></div>\n<div class="steps-grid">\n' +
            howItWorks.map(function (step, i) { return '<div class="step-card scroll-reveal scroll-reveal-delay-' + (i + 1) + '">\n<div class="step-number">' + (step.step || i + 1) + '</div>\n<h3>' + esc(step.title) + '</h3>\n<p>' + esc(step.desc) + '</p>\n</div>'; }).join('\n') + '\n</div>\n</div>\n</div>\n</section>\n';
        sections.beforeAfter = '<!-- Before/After -->\n<section class="before-after" data-section-id="beforeAfter">\n<div class="before-after-container">\n<span class="section-label scroll-reveal">' + esc(sectionBeforeAfter) + '</span>\n<h2 class="section-title scroll-reveal">' + esc(sectionBeforeAfterTitle) + '</h2>\n<p class="section-subtitle scroll-reveal">' + esc(sectionBeforeAfterSub) + ' ' + esc(name) + '</p>\n<div class="before-after-grid">\n' +
            '<div class="before-after-card scroll-reveal">\n<div class="result-image result-image-before">' + (beforeImage ? '<img src="' + esc(beforeImage) + '" alt="\u0642\u0628\u0644" style="width:100%;height:100%;object-fit:cover">' : '<div class="result-placeholder"><i class="fas fa-image"></i><span>' + esc(beforeText) + '</span></div>') + '</div>\n<div class="before-after-label before-label">' + esc(beforeLabel) + '</div>\n</div>\n' +
            '<div class="before-after-card scroll-reveal scroll-reveal-delay-1">\n<div class="result-image result-image-after">' + (afterImage ? '<img src="' + esc(afterImage) + '" alt="\u0628\u0639\u062f" style="width:100%;height:100%;object-fit:cover">' : '<div class="result-placeholder"><i class="fas fa-image"></i><span>' + esc(afterText) + '</span></div>') + '</div>\n<div class="before-after-label after-label">' + esc(afterLabel) + '</div>\n</div>\n</div>\n</div>\n</section>\n';
        sections.testimonials = '<!-- Testimonials -->\n<section class="testimonials" id="testimonials" data-section-id="testimonials">\n<div class="testimonials-container">\n<span class="section-label scroll-reveal">' + esc(sectionTestimonials) + '</span>\n<h2 class="section-title scroll-reveal">' + esc(sectionTestimonialsTitle) + '</h2>\n<p class="section-subtitle scroll-reveal">' + esc(sectionTestimonialsSub) + '</p>\n<div class="testimonials-grid">\n' +
            testimonials.map(function (t, i) { return '<div class="testimonial-card scroll-reveal scroll-reveal-delay-' + (i + 1) + '">\n<div class="testimonial-stars">' + (t.rating ? '\u2605'.repeat(t.rating) : '\u2605\u2605\u2605\u2605\u2605') + '</div>\n<p class="testimonial-text">' + esc(t.text) + '</p>\n<div class="testimonial-author">\n<div class="testimonial-avatar">' + esc((t.name || '').charAt(0)) + '</div>\n<div class="testimonial-info">\n<h4>' + esc(t.name) + '</h4>\n<p>' + esc(t.location) + '</p>\n</div>\n</div>\n</div>'; }).join('\n') + '\n</div>\n</div>\n</section>\n';
        sections.expert = '<!-- Expert -->\n<section class="expert" id="pricing" data-section-id="expert">\n<div class="expert-content">\n<div class="expert-image-wrapper scroll-reveal">\n<div class="expert-image-glow"></div>\n' + (expertImage ? '<img src="' + esc(expertImage) + '" alt="\u062e\u0628\u064a\u0631" class="expert-image">' : '<div class="expert-image">\n<i class="fas fa-user-md"></i>\n<span>\u062e\u0628\u064a\u0631</span>\n</div>') + '\n</div>\n<div class="scroll-reveal">\n<span class="expert-label">' + esc(sectionExpertLabel) + '</span>\n<p class="expert-quote">"' + esc(sectionExpertQuote) + ' ' + esc(name) + ' \u0644\u062c\u0645\u064a\u0639 \u0645\u0631\u0636\u0627\u064a \u0628\u0639\u062f \u0633\u0646\u0648\u0627\u062a \u0645\u0646 \u0627\u0644\u062e\u0628\u0631\u0629"</p>\n<p class="expert-description">' + esc(sectionExpertDesc) + ' \u0641\u064a \u0645\u062c\u0627\u0644 ' + esc(categoryName) + '\u060c \u0623\u0624\u0643\u062f \u0623\u0646 ' + esc(name) + ' \u064a\u0645\u062b\u0644 \u0646\u0642\u0644\u0629 \u0646\u0648\u0639\u064a\u0629 \u062d\u0642\u064a\u0642\u064a\u0629. \u0627\u0644\u062a\u0631\u0643\u064a\u0628\u0629 \u0627\u0644\u0639\u0644\u0645\u064a\u0629 \u0648\u0627\u0644\u0645\u0643\u0648\u0646\u0627\u062a \u0627\u0644\u0637\u0628\u064a\u0639\u064a\u0629 \u062a\u062c\u0639\u0644\u0647 \u0627\u0644\u062e\u064a\u0627\u0631 \u0627\u0644\u0623\u0645\u062b\u0644 \u0644\u0644\u062d\u0635\u0648\u0644 \u0639\u0644\u0649 \u0646\u062a\u0627\u0626\u062c \u0645\u0636\u0645\u0648\u0646\u0629.</p>\n<div class="expert-stats">\n<div class="expert-stat scroll-reveal scroll-reveal-delay-1"><div class="expert-stat-value">98%</div><div class="expert-stat-label">\u0631\u0636\u0627 \u0627\u0644\u0639\u0645\u0644\u0627\u0621</div></div>\n<div class="expert-stat scroll-reveal scroll-reveal-delay-2"><div class="expert-stat-value">50K+</div><div class="expert-stat-label">\u0639\u0645\u064a\u0644 \u0633\u0639\u064a\u062f</div></div>\n<div class="expert-stat scroll-reveal scroll-reveal-delay-3"><div class="expert-stat-value">4.9</div><div class="expert-stat-label">\u062a\u0642\u064a\u064a\u0645</div></div>\n</div>\n</div>\n</div>\n</section>\n';
        sections.faq = '<!-- FAQ -->\n<section class="faq-section" id="trust" data-section-id="faq">\n<div class="faq-container">\n<span class="section-label scroll-reveal">' + esc(sectionFaq) + '</span>\n<h2 class="section-title scroll-reveal">' + esc(sectionFaqTitle) + '</h2>\n<div class="faq-list">\n' +
            faqs.map(function (faq, i) { return '<div class="faq-item scroll-reveal scroll-reveal-delay-' + (i + 1) + '">\n<div class="faq-question" onclick="toggleFaq(this)">' + esc(faq.q) + '\n<div class="faq-icon"><i class="fas fa-plus"></i></div>\n</div>\n<div class="faq-answer"><p>' + esc(faq.a) + '</p></div>\n</div>'; }).join('\n') + '\n</div>\n</div>\n</section>\n';
        sections.cta = '<!-- CTA -->\n<section class="cta-section" id="order" data-section-id="cta">\n<div class="cta-content">\n<h2 class="cta-title scroll-reveal">' + esc(ctaTitle) + '</h2>\n<p class="cta-subtitle scroll-reveal">' + esc(ctaSubtitle) + '</p>\n<a href="#" class="cta-button-white scroll-reveal scroll-reveal-delay-1">' + esc(ctaButton) + ' ' + esc(price) + ' ' + esc(currency) + ' \u0641\u0642\u0637 <i class="fas fa-shopping-cart"></i></a>\n<p class="cta-guarantee scroll-reveal scroll-reveal-delay-2"><i class="fas fa-shield-alt"></i> ' + esc(ctaGuarantee) + '</p>\n</div>\n</section>\n';
        sections.footer = '<!-- Footer -->\n<footer class="footer" data-section-id="footer">\n<div class="footer-content">\n<div class="footer-trust">\n<div class="footer-trust-item"><i class="fas fa-lock"></i><span>' + esc(footerSecure) + '</span></div>\n<div class="footer-trust-item"><i class="fas fa-truck"></i><span>' + esc(footerShipping) + '</span></div>\n<div class="footer-trust-item"><i class="fas fa-shield-alt"></i><span>' + esc(footerWarranty) + '</span></div>\n<div class="footer-trust-item"><i class="fas fa-headset"></i><span>' + esc(footerSupport) + '</span></div>\n</div>\n<div class="footer-divider"></div>\n<p class="footer-copyright">\u00a9 2026 ' + esc(footerCopyright) + ' | ' + esc(name) + '</p>\n</div>\n</footer>\n';

        var bodySections = sectionOrder.map(function (id) { return sections[id] || ''; }).join('\n');

        var restCss = (d.extraCss || '');
        var fullCss = themeVars + '\n' + restCss + '\n.hero { background: ' + heroBg + ' !important; }\nbody { font-family: ' + fontFamily + ' !important; }\n';
        return '<!DOCTYPE html>\n<html lang="' + lang + '" dir="' + dir + '">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>' + esc(name) + ' - ' + esc(headline) + '</title>\n' +
            (fontLink ? '<link href="' + fontLink + '" rel="stylesheet">\n' : '') +
            '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\n<style>\n' + fullCss + '\n</style>\n</head>\n<body>\n' +
            '<!-- Navigation -->\n<nav class="nav" id="navbar">\n<div class="nav-content">\n<div class="logo">' + esc(name) + '</div>\n<ul class="nav-links">\n' +
            '<li><a href="#benefits" class="nav-link">' + esc(navFeatures) + '</a></li>\n<li><a href="#gallery" class="nav-link">' + esc(navUse) + '</a></li>\n<li><a href="#testimonials" class="nav-link">' + esc(navReviews) + '</a></li>\n<li><a href="#pricing" class="nav-link">' + esc(navPricing) + '</a></li>\n<li><a href="#trust" class="nav-link">' + esc(navFaq) + '</a></li>\n</ul>\n' +
            '<a href="#order" class="nav-cta">' + esc(navOrder) + '</a>\n</div>\n</nav>\n' +
            bodySections + '\n' +
            '<script>\n' + (d.inlineScript || '') + '\n</script>\n</body>\n</html>';
    }

    global.renderDefaultTemplate = renderDefaultTemplate;
})(typeof window !== 'undefined' ? window : this);
