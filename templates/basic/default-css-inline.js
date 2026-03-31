window.DEFAULT_TEMPLATE_CSS=".generated-landing-root { --background: var(--light); --text-color: var(--dark); }\n\
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }\n\
html { scroll-behavior: smooth; font-size: 16px; }\n\
body { font-family: 'Cairo', sans-serif; background: var(--background); color: var(--text-color); overflow-x: hidden; line-height: 1.7; }\n\
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }\n\
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }\n\
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }\n\
@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }\n\
@keyframes glow { 0%, 100% { box-shadow: 0 0 30px color-mix(in srgb, var(--primary) 30%, transparent); } 50% { box-shadow: 0 0 50px color-mix(in srgb, var(--primary) 50%, transparent); } }\n\
@keyframes skeleton-pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }\n\
.scroll-reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1); }\n\
.scroll-reveal.visible { opacity: 1; transform: translateY(0); }\n\
.scroll-reveal-delay-1 { transition-delay: 0.1s; }\n\
.scroll-reveal-delay-2 { transition-delay: 0.2s; }\n\
.scroll-reveal-delay-3 { transition-delay: 0.3s; }\n\
.scroll-reveal-delay-4 { transition-delay: 0.4s; }\n\
.reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1); }\n\
.reveal.active { opacity: 1; transform: translateY(0); }\n\
\n\
/* AI Image Slot Architecture */\n\
.ai-image-slot { position: relative; overflow: hidden; background: var(--skeleton-base, var(--gray)); transition: all 0.5s ease; }\n\
.ai-image-slot:hover { transform: scale(1.02); }\n\
.ai-image-skeleton { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, var(--skeleton-base, var(--gray)) 0%, var(--skeleton-highlight, var(--light)) 50%, var(--skeleton-base, var(--gray)) 100%); background-size: 200% 100%; animation: shimmer 1.5s ease-in-out infinite; }\n\
.ai-image-slot img, .ai-image-slot .ai-generated-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; opacity: 0; transition: opacity 0.3s ease; }\n\
.ai-image-slot img.loaded, .ai-image-slot .ai-generated-image.loaded { opacity: 1; }\n\
.ai-slot-ratio-1-1 { aspect-ratio: 1/1; }\n\
.ai-slot-ratio-4-3 { aspect-ratio: 4/3; }\n\
.ai-slot-hero-product { width: 350px; height: 350px; border-radius: 50%; margin: 0 auto; box-shadow: 0 30px 80px color-mix(in srgb, var(--primary) 30%, transparent); border: 5px solid white; position: relative; z-index: 2; }\n\
.ai-slot-hero-product .ai-image-skeleton { border-radius: 50%; }\n\
.ai-slot-lifestyle { width: 100%; height: 400px; border-radius: 30px; box-shadow: var(--shadow-2xl); }\n\
.ai-slot-lifestyle .ai-image-skeleton { border-radius: 30px; }\n\
.ai-slot-before-after { width: 100%; height: 350px; }\n\
.ai-slot-before .ai-image-skeleton { background: linear-gradient(90deg, #fee2e2 0%, #fecaca 50%, #fee2e2 100%); background-size: 200% 100%; }\n\
.ai-slot-after .ai-image-skeleton { background: linear-gradient(90deg, #d1fae5 0%, #a7f3d0 50%, #d1fae5 100%); background-size: 200% 100%; }\n\
.ai-slot-ingredient { width: 350px; height: 350px; border-radius: 30px; margin: 0 auto; box-shadow: var(--shadow-2xl); }\n\
.ai-slot-ingredient .ai-image-skeleton { border-radius: 30px; }\n\
.ai-slot-avatar { width: 55px; height: 55px; border-radius: 50%; flex-shrink: 0; box-shadow: var(--shadow-lg); }\n\
.ai-slot-avatar .ai-image-skeleton { border-radius: 50%; }\n\
.ai-slot-expert { width: 280px; height: 280px; border-radius: 50%; box-shadow: var(--shadow-2xl); border: 5px solid white; }\n\
.ai-slot-expert .ai-image-skeleton { border-radius: 50%; }\n\
\n\
/* Navigation */\n\
.nav { position: fixed; top: 0; width: 100%; z-index: 1000; padding: 1rem 2rem; transform: translateY(-100%); transition: all 0.4s ease; }\n\
.nav.visible { transform: translateY(0); }\n\
.nav-inner { max-width: 1300px; margin: 0 auto; background: var(--gradient-glass, linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)); backdrop-filter: blur(20px); border-radius: 100px; padding: 0.8rem 2rem; display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-soft, var(--shadow-md)); border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent); }\n\
.logo { font-size: 1.6rem; font-weight: 900; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }\n\
.nav-links { display: flex; gap: 2rem; list-style: none; }\n\
.nav-link { color: var(--text-color); font-weight: 600; text-decoration: none; position: relative; padding: 0.5rem 0; transition: color 0.3s; }\n\
.nav-link::after { content: ''; position: absolute; bottom: 0; right: 0; width: 0; height: 2px; background: var(--primary); transition: width 0.3s; }\n\
.nav-link:hover { color: var(--primary); }\n\
.nav-link:hover::after { width: 100%; }\n\
.nav-cta { background: var(--gradient-primary); color: white; padding: 0.8rem 2rem; border-radius: 100px; font-weight: 700; text-decoration: none; box-shadow: var(--shadow-lg); transition: all 0.3s; }\n\
.nav-cta:hover { transform: translateY(-2px); box-shadow: var(--shadow-2xl); }\n\
@media (max-width: 768px) { .nav-links { display: none; } }\n\
\n\
/* Hero */\n\
.hero-badge-bar { background: var(--gradient-primary); color: white; text-align: center; padding: 0.8rem; font-size: 0.95rem; font-weight: 700; position: relative; overflow: hidden; }\n\
.hero-badge-bar::before { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation: shimmer 2s infinite; }\n\
.hero { min-height: 100vh; background: linear-gradient(180deg, var(--background) 0%, var(--secondary) 50%, var(--background) 100%); position: relative; overflow: hidden; padding-top: 80px; }\n\
.hero-pattern { position: absolute; inset: 0; background-image: url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='1' fill='%236b6560' fill-opacity='0.1'/%3E%3C/svg%3E\"); opacity: 0.5; }\n\
.hero-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; animation: float 8s ease-in-out infinite; }\n\
.hero-orb-1 { width: 500px; height: 500px; background: var(--primary-light); top: -150px; right: -100px; }\n\
.hero-orb-2 { width: 400px; height: 400px; background: var(--accent); bottom: -100px; left: -100px; animation-delay: 2s; }\n\
.hero-orb-3 { width: 300px; height: 300px; background: var(--secondary); top: 40%; left: 30%; animation-delay: 4s; }\n\
.hero-content { max-width: 1300px; margin: 0 auto; padding: 4rem 2rem; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; position: relative; z-index: 1; }\n\
@media (max-width: 968px) { .hero-content { grid-template-columns: 1fr; text-align: center; gap: 3rem; } }\n\
.hero-text { text-align: right; }\n\
@media (max-width: 968px) { .hero-text { text-align: center; } }\n\
.hero-tags { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem; justify-content: flex-end; }\n\
@media (max-width: 968px) { .hero-tags { justify-content: center; } }\n\
.hero-tag { display: inline-flex; align-items: center; gap: 0.5rem; background: white; color: var(--primary); padding: 0.6rem 1.2rem; border-radius: 100px; font-size: 0.9rem; font-weight: 600; box-shadow: var(--shadow-md); border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent); transition: all 0.3s; }\n\
.hero-tag:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }\n\
.hero-title { font-size: 3.2rem; font-weight: 900; color: var(--text-color); margin-bottom: 1.5rem; line-height: 1.2; position: relative; }\n\
.hero-title span { background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }\n\
.hero-title::after { content: ''; display: block; width: 80px; height: 4px; background: var(--gradient-primary); margin-top: 1rem; border-radius: 2px; }\n\
@media (max-width: 968px) { .hero-title { font-size: 2.3rem; } .hero-title::after { margin: 1rem auto 0; } }\n\
.hero-desc { font-size: 1.15rem; color: var(--gray); margin-bottom: 2rem; line-height: 1.9; }\n\
.hero-features { list-style: none; margin-bottom: 2rem; }\n\
.hero-feature { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.8rem; font-size: 1.05rem; color: var(--text-color); }\n\
@media (max-width: 968px) { .hero-feature { justify-content: center; } }\n\
.hero-feature-icon { width: 28px; height: 28px; background: var(--gradient-primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; flex-shrink: 0; }\n\
.hero-trust { display: flex; gap: 2rem; margin-bottom: 2rem; flex-wrap: wrap; }\n\
.hero-trust-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: var(--gray); font-weight: 600; }\n\
.hero-trust-item i { color: var(--primary); }\n\
.price-card { background: white; padding: 2.5rem; border-radius: 30px; box-shadow: var(--shadow-2xl); margin-bottom: 1.5rem; border: 1px solid color-mix(in srgb, var(--primary) 20%, transparent); position: relative; overflow: hidden; }\n\
.price-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--gradient-primary); }\n\
.price-old { font-size: 1.4rem; color: var(--gray); text-decoration: line-through; }\n\
.price-save { background: linear-gradient(135deg, var(--rose) 0%, #c0392b 100%); color: white; padding: 0.4rem 1rem; border-radius: 100px; font-size: 0.85rem; font-weight: 700; margin-right: 0.5rem; animation: pulse 2s infinite; }\n\
.price-new { font-size: 3.5rem; font-weight: 900; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 1rem 0; }\n\
.price-badges { display: flex; justify-content: center; gap: 1.5rem; margin-top: 1.5rem; font-size: 0.85rem; color: var(--gray); flex-wrap: wrap; }\n\
.cta-btn { display: inline-flex; align-items: center; justify-content: center; gap: 1rem; background: var(--gradient-primary); color: white; padding: 1.4rem 3rem; border-radius: 100px; font-weight: 700; font-size: 1.2rem; text-decoration: none; box-shadow: var(--shadow-lg); transition: all 0.3s; width: 100%; border: none; cursor: pointer; position: relative; overflow: hidden; }\n\
.cta-btn::before { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); transform: translateX(-100%); transition: 0.5s; }\n\
.cta-btn:hover::before { transform: translateX(100%); }\n\
.cta-btn:hover { transform: translateY(-3px); box-shadow: var(--shadow-2xl); animation: glow 2s infinite; }\n\
.urgency { text-align: center; margin-top: 1.5rem; padding: 1rem; background: color-mix(in srgb, var(--rose) 8%, transparent); border-radius: 20px; border: 1px solid color-mix(in srgb, var(--rose) 20%, transparent); color: var(--rose); font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }\n\
.urgency-time { font-family: 'Courier New', monospace; font-size: 1.1rem; background: white; padding: 0.3rem 0.8rem; border-radius: 10px; box-shadow: var(--shadow-sm); }\n\
.hero-visual { position: relative; display: flex; justify-content: center; align-items: center; }\n\
.product-stage { position: relative; width: 100%; max-width: 500px; }\n\
.product-ring { position: absolute; border-radius: 50%; border: 2px dashed color-mix(in srgb, var(--primary) 30%, transparent); animation: rotate 30s linear infinite; }\n\
.product-ring-1 { width: 500px; height: 500px; top: 50%; left: 50%; transform: translate(-50%, -50%); }\n\
.product-ring-2 { width: 400px; height: 400px; top: 50%; left: 50%; transform: translate(-50%, -50%); animation-direction: reverse; animation-duration: 25s; }\n\
.product-glow { position: absolute; width: 350px; height: 350px; top: 50%; left: 50%; transform: translate(-50%, -50%); background: radial-gradient(circle, color-mix(in srgb, var(--primary) 30%, transparent) 0%, transparent 70%); filter: blur(30px); }\n\
.float-card { position: absolute; background: white; padding: 1rem 1.5rem; border-radius: 20px; box-shadow: var(--shadow-lg); display: flex; align-items: center; gap: 0.8rem; font-weight: 700; font-size: 0.9rem; z-index: 10; transition: all 0.3s; animation: float 4s ease-in-out infinite; }\n\
.float-card:hover { transform: scale(1.05); box-shadow: var(--shadow-2xl); }\n\
.float-card i { width: 36px; height: 36px; background: var(--gradient-primary); color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; }\n\
.float-card-1 { top: 5%; left: -20px; }\n\
.float-card-2 { bottom: 20%; right: -30px; animation-delay: 1s; }\n\
.float-card-3 { top: 45%; left: -40px; animation-delay: 2s; }\n\
@media (max-width: 968px) { .float-card { display: none; } }\n\
\n\
/* Section common */\n\
.section-header { text-align: center; margin-bottom: 4rem; }\n\
.section-label { display: inline-block; background: color-mix(in srgb, var(--primary) 15%, transparent); color: var(--primary); padding: 0.6rem 1.5rem; border-radius: 100px; font-weight: 700; font-size: 0.9rem; margin-bottom: 1rem; border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent); }\n\
.section-title { font-size: 2.8rem; font-weight: 900; color: var(--text-color); margin-bottom: 1rem; line-height: 1.2; }\n\
.section-title span { background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }\n\
.section-subtitle { font-size: 1.15rem; color: var(--gray); max-width: 600px; margin: 0 auto; }\n\
\n\
/* Problems */\n\
.problems { padding: 8rem 2rem; background: var(--background); }\n\
.problems-container { max-width: 1100px; margin: 0 auto; }\n\
.problems-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }\n\
@media (max-width: 968px) { .problems-grid { grid-template-columns: 1fr; } }\n\
.problem-card { background: var(--light); padding: 2.5rem 2rem; border-radius: 30px; text-align: center; transition: all 0.4s ease; border: 1px solid transparent; position: relative; overflow: hidden; }\n\
.problem-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 0; background: var(--gradient-primary); transition: height 0.3s; }\n\
.problem-card:hover::before { height: 4px; }\n\
.problem-card:hover { transform: translateY(-10px); box-shadow: var(--shadow-2xl); border-color: color-mix(in srgb, var(--primary) 30%, transparent); }\n\
.problem-icon { width: 90px; height: 90px; background: linear-gradient(135deg, var(--accent) 0%, var(--primary-light) 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 2.5rem; position: relative; }\n\
.problem-icon::after { content: ''; position: absolute; inset: -5px; border-radius: 50%; border: 2px dashed var(--primary); animation: rotate 15s linear infinite; }\n\
.problem-card h3 { font-size: 1.2rem; color: var(--text-color); margin-bottom: 0.75rem; font-weight: 700; }\n\
.problem-card p { color: var(--gray); font-size: 0.95rem; line-height: 1.8; }\n\
\n\
/* Solution */\n\
.solution { padding: 8rem 2rem; background: linear-gradient(180deg, var(--background) 0%, var(--secondary) 100%); }\n\
.solution-container { max-width: 1100px; margin: 0 auto; }\n\
.solution-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; margin-top: 4rem; }\n\
@media (max-width: 968px) { .solution-grid { grid-template-columns: 1fr; } }\n\
.solution-card { background: white; padding: 2rem; border-radius: 24px; display: flex; gap: 1.5rem; align-items: flex-start; transition: all 0.4s ease; border: 1px solid color-mix(in srgb, var(--primary) 15%, transparent); position: relative; overflow: hidden; }\n\
.solution-card::after { content: ''; position: absolute; top: 0; right: 0; width: 0; height: 100%; background: var(--gradient-primary); opacity: 0.1; transition: width 0.3s; }\n\
.solution-card:hover::after { width: 5px; opacity: 1; }\n\
.solution-card:hover { transform: translateX(-10px) translateY(-5px); box-shadow: var(--shadow-2xl); border-color: var(--primary); }\n\
.solution-number { width: 55px; height: 55px; background: var(--gradient-primary); color: white; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.4rem; flex-shrink: 0; box-shadow: var(--shadow-md); transition: all 0.3s; }\n\
.solution-card:hover .solution-number { transform: scale(1.1) rotate(5deg); }\n\
.solution-content h3 { font-size: 1.2rem; color: var(--text-color); margin-bottom: 0.5rem; font-weight: 700; }\n\
.solution-content p { color: var(--gray); font-size: 0.95rem; line-height: 1.8; }\n\
\n\
/* Lifestyle */\n\
.lifestyle-section { padding: 6rem 2rem; background: var(--background); }\n\
.lifestyle-container { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }\n\
@media (max-width: 968px) { .lifestyle-container { grid-template-columns: 1fr; gap: 3rem; } }\n\
.lifestyle-desc { color: var(--gray); font-size: 1.1rem; line-height: 1.9; margin-bottom: 2rem; text-align: right; }\n\
@media (max-width: 968px) { .lifestyle-desc { text-align: center; } }\n\
\n\
/* How it works */\n\
.how-it-works { padding: 8rem 2rem; background: linear-gradient(135deg, var(--secondary) 0%, var(--background) 100%); }\n\
.how-container { max-width: 1000px; margin: 0 auto; text-align: center; }\n\
.steps-wrapper { position: relative; margin-top: 4rem; }\n\
.steps-line { position: absolute; top: 50px; left: 15%; right: 15%; height: 3px; background: var(--gradient-primary); border-radius: 2px; }\n\
@media (max-width: 768px) { .steps-line { display: none; } }\n\
.steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; position: relative; z-index: 1; }\n\
@media (max-width: 768px) { .steps-grid { grid-template-columns: 1fr; } }\n\
.step-card { background: white; padding: 2.5rem 2rem; border-radius: 30px; box-shadow: var(--shadow-lg); transition: all 0.4s ease; }\n\
.step-card:hover { transform: translateY(-15px) scale(1.03); box-shadow: var(--shadow-2xl); }\n\
.step-num { width: 90px; height: 90px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 2rem; font-weight: 800; color: var(--primary); box-shadow: var(--shadow-lg); border: 3px solid var(--primary-light); position: relative; transition: all 0.4s; }\n\
.step-card:hover .step-num { border-color: var(--primary); transform: scale(1.15); box-shadow: var(--shadow-2xl), 0 0 30px color-mix(in srgb, var(--primary) 30%, transparent); }\n\
.step-num::after { content: ''; position: absolute; inset: -8px; border-radius: 50%; border: 2px dashed var(--primary-light); animation: rotate 20s linear infinite; }\n\
.step-card h3 { font-size: 1.4rem; color: var(--text-color); margin-bottom: 0.75rem; font-weight: 700; }\n\
.step-card p { color: var(--gray); font-size: 0.95rem; line-height: 1.7; }\n\
\n\
/* Before/After */\n\
.before-after { padding: 8rem 2rem; background: var(--background); }\n\
.before-after-container { max-width: 1000px; margin: 0 auto; }\n\
.ba-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-top: 4rem; }\n\
@media (max-width: 768px) { .ba-grid { grid-template-columns: 1fr; } }\n\
.ba-card { background: var(--light); border-radius: 30px; overflow: hidden; box-shadow: var(--shadow-lg); transition: all 0.5s ease; }\n\
.ba-card:hover { transform: translateY(-10px); box-shadow: var(--shadow-2xl); }\n\
.ba-image { height: 350px; position: relative; }\n\
.ba-label { padding: 1.5rem; text-align: center; font-weight: 700; font-size: 1.15rem; }\n\
.ba-before .ba-label { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); color: #991b1b; }\n\
.ba-after .ba-label { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); color: #065f46; }\n\
\n\
/* Ingredients */\n\
.ingredients { padding: 8rem 2rem; background: linear-gradient(180deg, var(--background) 0%, var(--secondary) 100%); }\n\
.ingredients-container { max-width: 1100px; margin: 0 auto; }\n\
.ingredients-content { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; margin-top: 4rem; }\n\
@media (max-width: 968px) { .ingredients-content { grid-template-columns: 1fr; gap: 3rem; } }\n\
.ingredients-subtitle { font-size: 1.5rem; color: var(--text-color); margin-bottom: 1.5rem; font-weight: 700; }\n\
\n\
/* Testimonials */\n\
.testimonials { padding: 8rem 2rem; background: linear-gradient(135deg, var(--secondary) 0%, white 50%, var(--secondary) 100%); position: relative; overflow: hidden; }\n\
.testimonials::before { content: '\"'; position: absolute; top: 50px; left: 50px; font-size: 400px; color: var(--primary); opacity: 0.05; font-family: serif; line-height: 1; }\n\
.testimonials-container { max-width: 1100px; margin: 0 auto; position: relative; z-index: 1; }\n\
.testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 4rem; }\n\
@media (max-width: 968px) { .testimonials-grid { grid-template-columns: 1fr; } }\n\
.testimonial-card { background: white; padding: 2.5rem 2rem; border-radius: 30px; box-shadow: var(--shadow-lg); transition: all 0.5s ease; position: relative; }\n\
.testimonial-card::before { content: '\"'; position: absolute; top: 10px; right: 15px; font-size: 4rem; color: var(--primary); opacity: 0.15; font-family: serif; line-height: 1; }\n\
.testimonial-card:hover { transform: translateY(-15px); box-shadow: var(--shadow-2xl); }\n\
.testimonial-stars { color: var(--primary); font-size: 1.1rem; margin-bottom: 1.5rem; letter-spacing: 3px; }\n\
.testimonial-text { font-size: 1.05rem; line-height: 1.9; color: var(--text-color); margin-bottom: 2rem; font-style: italic; }\n\
.testimonial-author { display: flex; align-items: center; gap: 1rem; }\n\
.testimonial-info h4 { font-size: 1.05rem; color: var(--text-color); margin-bottom: 0.2rem; font-weight: 700; }\n\
.testimonial-info p { font-size: 0.85rem; color: var(--gray); }\n\
\n\
/* Expert */\n\
.expert { padding: 8rem 2rem; background: var(--background); }\n\
.expert-container { max-width: 1000px; margin: 0 auto; }\n\
.expert-content { display: grid; grid-template-columns: 350px 1fr; gap: 5rem; align-items: center; }\n\
@media (max-width: 968px) { .expert-content { grid-template-columns: 1fr; text-align: center; gap: 3rem; } }\n\
.expert-image-wrapper { position: relative; display: flex; justify-content: center; }\n\
.expert-ring { position: absolute; width: 350px; height: 350px; top: 50%; left: 50%; transform: translate(-50%, -50%); border: 2px dashed var(--primary); border-radius: 50%; animation: rotate 30s linear infinite; }\n\
.expert-badge { display: inline-block; background: var(--gradient-primary); color: white; padding: 0.8rem 2rem; border-radius: 100px; font-weight: 600; margin-bottom: 1.5rem; box-shadow: var(--shadow-md); }\n\
.expert-quote { font-size: 1.7rem; font-weight: 700; color: var(--text-color); line-height: 1.5; margin-bottom: 1.5rem; padding-right: 2rem; border-right: 4px solid var(--primary); }\n\
@media (max-width: 968px) { .expert-quote { border-right: none; border-bottom: 4px solid var(--primary); padding-right: 0; padding-bottom: 1.5rem; } }\n\
.expert-desc { color: var(--gray); margin-bottom: 2rem; font-size: 1.05rem; line-height: 1.9; }\n\
.expert-stats { display: flex; gap: 2rem; }\n\
@media (max-width: 968px) { .expert-stats { justify-content: center; } }\n\
.expert-stat { background: var(--light); padding: 1.5rem 2rem; border-radius: 20px; text-align: center; box-shadow: var(--shadow-md); transition: all 0.4s; }\n\
.expert-stat:hover { transform: translateY(-8px); box-shadow: var(--shadow-lg); }\n\
.expert-stat-value { font-size: 2.2rem; font-weight: 900; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }\n\
.expert-stat-label { font-size: 0.85rem; color: var(--gray); margin-top: 0.3rem; }\n\
\n\
/* FAQ */\n\
.faq { padding: 8rem 2rem; background: linear-gradient(180deg, var(--background) 0%, var(--secondary) 100%); }\n\
.faq-container { max-width: 800px; margin: 0 auto; }\n\
.faq-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 4rem; }\n\
.faq-item { background: white; border-radius: 20px; box-shadow: var(--shadow-md); overflow: hidden; transition: all 0.4s; border: 1px solid transparent; }\n\
.faq-item:hover { box-shadow: var(--shadow-lg); border-color: color-mix(in srgb, var(--primary) 30%, transparent); }\n\
.faq-item.active { border-color: var(--primary); box-shadow: var(--shadow-lg); }\n\
.faq-question { padding: 1.8rem 2rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-weight: 700; font-size: 1.05rem; color: var(--text-color); transition: all 0.3s; }\n\
.faq-question:hover { color: var(--primary); }\n\
.faq-icon { width: 35px; height: 35px; background: color-mix(in srgb, var(--primary) 15%, transparent); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--primary); font-size: 1.2rem; transition: all 0.3s; }\n\
.faq-item.active .faq-icon { background: var(--gradient-primary); color: white; transform: rotate(45deg); }\n\
.faq-answer { max-height: 0; overflow: hidden; transition: all 0.4s ease; padding: 0 2rem; }\n\
.faq-item.active .faq-answer { max-height: 300px; padding: 0 2rem 2rem; }\n\
.faq-answer p { color: var(--gray); line-height: 1.9; }\n\
\n\
/* Final CTA */\n\
.final-cta { padding: 8rem 2rem; background: var(--gradient-primary); text-align: center; color: white; position: relative; overflow: hidden; }\n\
.final-cta::before { content: ''; position: absolute; inset: 0; background-image: url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\"); opacity: 0.5; }\n\
.cta-content { position: relative; z-index: 1; max-width: 700px; margin: 0 auto; }\n\
.cta-title { font-size: 3rem; font-weight: 900; margin-bottom: 1rem; }\n\
@media (max-width: 768px) { .cta-title { font-size: 2.3rem; } }\n\
.cta-subtitle { font-size: 1.25rem; margin-bottom: 3rem; opacity: 0.95; }\n\
.cta-btn-white { display: inline-flex; align-items: center; gap: 1rem; background: white; color: var(--primary); padding: 1.5rem 4rem; border-radius: 100px; font-size: 1.25rem; font-weight: 800; box-shadow: var(--shadow-2xl); transition: all 0.4s; text-decoration: none; }\n\
.cta-btn-white:hover { transform: translateY(-5px) scale(1.05); }\n\
.cta-guarantee { margin-top: 2rem; font-size: 1.05rem; opacity: 0.9; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }\n\
\n\
/* Footer */\n\
.footer { background: var(--dark); color: white; padding: 4rem 2rem 2rem; }\n\
.footer-container { max-width: 1000px; margin: 0 auto; text-align: center; }\n\
.footer-trust { display: flex; justify-content: center; gap: 3rem; margin-bottom: 3rem; flex-wrap: wrap; }\n\
.footer-trust-item { display: flex; align-items: center; gap: 0.8rem; color: var(--gray); font-size: 0.95rem; transition: all 0.3s; }\n\
.footer-trust-item:hover { color: white; transform: translateY(-3px); }\n\
.footer-trust-item i { font-size: 1.4rem; color: var(--primary); transition: all 0.3s; }\n\
.footer-trust-item:hover i { color: white; transform: scale(1.2); }\n\
.footer-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent); margin: 2rem 0; }\n\
.footer-copyright { color: var(--gray); font-size: 0.9rem; }\n\
\n\
@media (max-width: 768px) { .section-title { font-size: 2.2rem; } section { padding: 5rem 1.5rem; } }\n\
";
