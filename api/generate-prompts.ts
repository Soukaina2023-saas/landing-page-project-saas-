import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generatePromptsSchema } from "../lib/validation/generatePrompts.schema.js";
import { checkRateLimit } from "../lib/utils/rateLimiter.js";

// Environment Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Background Style Options
const BACKGROUND_STYLES = {
    TRANSPARENT: 'transparent',
    WHITE_STUDIO: 'white_studio',
    LIFESTYLE: 'lifestyle'
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateLocalPrompts(productName: string, category: string, problem: string, benefit: string) {
    const categoryPrompts: Record<string, Record<string, string>> = {
        beauty: {
            hero: `Professional product photography of ${productName}, elegant beauty product, soft lighting, premium packaging, clean background, high-end cosmetic advertisement style`,
            before: `Woman with damaged dry hair looking concerned, before using hair care product, realistic portrait, natural lighting`,
            after: `Same woman with beautiful healthy shiny hair looking happy and confident, after using ${productName}, radiant glow, professional beauty photography`,
            expert: `Professional dermatologist in white coat recommending skincare product, trustworthy medical expert, clean clinical background`,
            lifestyle: `Woman doing hair care routine in elegant bathroom, using ${productName}, morning routine, natural light from window, lifestyle photography`,
            detail: `Close-up macro shot of ${productName} showing texture and quality, premium product detail, soft focus background`
        },
        health: {
            hero: `Premium health supplement ${productName}, professional product photography, clean white background, pharmaceutical quality, vibrant colors`,
            before: `Tired stressed person at work, low energy, unhealthy lifestyle, needs health supplement`,
            after: `Energetic happy person active lifestyle, healthy and fit, after taking ${productName}, vitality and wellness`,
            expert: `Professional nutritionist doctor recommending health supplement, medical office background, trustworthy healthcare professional`,
            lifestyle: `Active person exercising outdoors, healthy lifestyle, taking ${productName} as part of wellness routine, morning workout`,
            detail: `Close-up of ${productName} supplement capsules, high quality product detail, pharmaceutical grade`
        },
        kitchen: {
            hero: `Modern kitchen appliance ${productName}, sleek design, professional product photography, stainless steel finish, premium quality`,
            before: `Messy kitchen with frustrated person cooking, chaotic cooking environment, needs better appliances`,
            after: `Clean organized modern kitchen with happy person cooking easily with ${productName}, efficient cooking, beautiful kitchen interior`,
            expert: `Professional chef demonstrating kitchen appliance, culinary expert, professional kitchen background`,
            lifestyle: `Family cooking together in modern kitchen using ${productName}, happy family moment, warm home atmosphere`,
            detail: `Close-up detail shot of ${productName} showing quality craftsmanship, premium materials, elegant design`
        },
        fitness: {
            hero: `Premium fitness device ${productName}, sleek sporty design, professional product photography, modern tech aesthetic`,
            before: `Overweight person struggling with exercise, low motivation, needs fitness help`,
            after: `Fit athletic person confident workout, healthy body transformation, using ${productName} for fitness tracking`,
            expert: `Professional fitness trainer recommending workout device, gym background, fitness expert`,
            lifestyle: `Group fitness class outdoor exercise, active healthy lifestyle, people using ${productName} during workout`,
            detail: `Close-up of ${productName} fitness tracker showing screen and details, premium wearable technology`
        },
        tech: {
            hero: `Modern tech gadget ${productName}, sleek minimalist design, professional product photography, floating on transparent background, premium technology`,
            before: `Frustrated person with slow outdated device, technology problems, needs upgrade`,
            after: `Happy person using modern ${productName}, productive and satisfied, modern workspace, technology improving life`,
            expert: `Tech reviewer professional unboxing and reviewing gadget, modern studio setup, technology expert`,
            lifestyle: `Person using ${productName} in coffee shop, modern mobile lifestyle, productive on-the-go, urban setting`,
            detail: `Close-up macro shot of ${productName} showing premium build quality, detailed product photography, technology craftsmanship`
        }
    };
    
    const prompts = categoryPrompts[category] || categoryPrompts.beauty;
    
    return [
        { image_role: 'hero', prompt_text: prompts.hero, aspect_ratio: '4:3' },
        { image_role: 'before', prompt_text: prompts.before, aspect_ratio: '3:4' },
        { image_role: 'after', prompt_text: prompts.after, aspect_ratio: '3:4' },
        { image_role: 'expert', prompt_text: prompts.expert, aspect_ratio: '1:1' },
        { image_role: 'lifestyle', prompt_text: prompts.lifestyle, aspect_ratio: '16:9' },
        { image_role: 'detail', prompt_text: prompts.detail, aspect_ratio: '1:1' }
    ];
}

function determineBackgroundStyle(category: string, productName: string) {
    const transparentProducts = ['phone', 'laptop', 'tablet', 'watch', 'headphone', 'speaker', 'camera', 'device', 'gadget'];
    const productLower = (productName || '').toLowerCase();
    
    if (transparentProducts.some(p => productLower.includes(p))) {
        return BACKGROUND_STYLES.TRANSPARENT;
    }
    
    const categoryStyles: Record<string, string> = {
        beauty: BACKGROUND_STYLES.WHITE_STUDIO,
        health: BACKGROUND_STYLES.WHITE_STUDIO,
        kitchen: BACKGROUND_STYLES.LIFESTYLE,
        fitness: BACKGROUND_STYLES.LIFESTYLE,
        tech: BACKGROUND_STYLES.TRANSPARENT
    };
    
    return categoryStyles[category] || BACKGROUND_STYLES.WHITE_STUDIO;
}

function generateId() {
    return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

// ============================================
// VERCEL SERVERLESS FUNCTION
// ============================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
        req.socket?.remoteAddress ||
        "unknown";

    const rate = checkRateLimit(ip);

    if (!rate.allowed) {
        return res.status(429).json({
            success: false,
            error: "Too many requests. Please try again later."
        });
    }

    const parsed = generatePromptsSchema.safeParse(req.body);
    
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            error: "Invalid request body",
            details: parsed.error.flatten()
        });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(200).json({
            success: true,
            prompts: [
                {
                    image_role: "hero",
                    prompt_text: "Mock professional product photography",
                    aspect_ratio: "4:3"
                }
            ]
        });
    }

    try {
        const { productName } = parsed.data;
        const { category, problem, benefit } = req.body;
        
        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Generate 6 image prompts for a landing page product: "${productName}" (${category}). 
Problem: ${problem}. Benefit: ${benefit}.

Return STRICT JSON object with:
1. "prompts": Array of 6 objects with:
   - image_role: (hero|before|after|expert|lifestyle|detail)
   - prompt_text: detailed prompt for AI image generation
   - aspect_ratio: (1:1|3:4|4:3|16:9|9:16)
   
2. "background_style": ONE of: "transparent", "white_studio", "lifestyle"

JSON ONLY, no markdown, no explanations.`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048
                    }
                })
            }
        );
        
        if (!geminiResponse.ok) {
            throw new Error(`Gemini API error: ${geminiResponse.status}`);
        }
        
        const geminiData = await geminiResponse.json();
        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        
        let geminiParsed;
        try {
            const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            geminiParsed = JSON.parse(cleanText);
        } catch (e) {
            geminiParsed = {
                prompts: generateLocalPrompts(productName, category, problem, benefit),
                background_style: determineBackgroundStyle(category, productName)
            };
        }
        
        const prompts = geminiParsed.prompts || generateLocalPrompts(productName, category, problem, benefit);
        const backgroundStyle = geminiParsed.background_style || determineBackgroundStyle(category, productName);
        
        res.json({
            success: true,
            prompts,
            backgroundStyle,
            source: 'gemini',
            consistencyId: generateId()
        });
        
    } catch (error: any) {
        console.error('[Gemini Error]', error);
        
        const { productName } = parsed.data;
        const { category, problem, benefit } = req.body;
        return res.json({
            success: true,
            prompts: generateLocalPrompts(productName, category, problem, benefit),
            backgroundStyle: determineBackgroundStyle(category, productName),
            source: 'fallback',
            consistencyId: generateId()
        });
    }
}
