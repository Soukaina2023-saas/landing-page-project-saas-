/**
 * PageGen Pro - Production Server
 * Real Image Generation API Integration with Replicate
 */

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

// Environment Configuration
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ENGINE_SECRET = process.env.ENGINE_SECRET || 'dev-secret';

// Pipeline Configuration
const BACKGROUND_REMOVAL_ENABLED = process.env.BACKGROUND_REMOVAL_ENABLED === 'true';
const IMAGE_GENERATION_ENABLED = process.env.IMAGE_GENERATION_ENABLED !== 'false';
const BIREFNET_MODEL = process.env.BIREFNET_MODEL || 'men1scus/birefnet';
const FLUX_MODEL = process.env.FLUX_MODEL || 'black-forest-labs/flux-1.1-pro';

// Background Style Options
const BACKGROUND_STYLES = {
    TRANSPARENT: 'transparent',
    WHITE_STUDIO: 'white_studio',
    LIFESTYLE: 'lifestyle'
};

// Request tracking
const requestTracker = {
    total: 0,
    gemini: 0,
    flux: 0,
    birefnet: 0,
    errors: 0
};

// ============================================
// AUTH MIDDLEWARE
// ============================================
function checkAuth(req, res, next) {
    const key = req.headers['x-engine-key'];
    if (key !== ENGINE_SECRET) {
        return res.status(403).json({ error: 'Unauthorized', message: 'Invalid engine key' });
    }
    next();
}

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        pipeline: {
            backgroundRemoval: BACKGROUND_REMOVAL_ENABLED,
            imageGeneration: IMAGE_GENERATION_ENABLED
        },
        stats: requestTracker,
        config: {
            fluxModel: FLUX_MODEL,
            birefnetModel: BIREFNET_MODEL
        }
    });
});

// ============================================
// GENERATE PROMPTS WITH GEMINI
// ============================================
app.post('/api/generate-prompts', checkAuth, async (req, res) => {
    try {
        requestTracker.total++;
        requestTracker.gemini++;
        
        const { productName, category, problem, benefit } = req.body;
        
        if (!GEMINI_API_KEY) {
            const prompts = generateLocalPrompts(productName, category, problem, benefit);
            const backgroundStyle = determineBackgroundStyle(category, productName);
            
            return res.json({
                success: true,
                prompts,
                backgroundStyle,
                source: 'local',
                consistencyId: generateId()
            });
        }
        
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
        
        let parsed;
        try {
            const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            parsed = JSON.parse(cleanText);
        } catch (e) {
            parsed = {
                prompts: generateLocalPrompts(productName, category, problem, benefit),
                background_style: determineBackgroundStyle(category, productName)
            };
        }
        
        const prompts = parsed.prompts || generateLocalPrompts(productName, category, problem, benefit);
        const backgroundStyle = parsed.background_style || determineBackgroundStyle(category, productName);
        
        res.json({
            success: true,
            prompts,
            backgroundStyle,
            source: 'gemini',
            consistencyId: generateId()
        });
        
    } catch (error) {
        requestTracker.errors++;
        console.error('[Gemini Error]', error);
        
        const { productName, category, problem, benefit } = req.body;
        res.json({
            success: true,
            prompts: generateLocalPrompts(productName, category, problem, benefit),
            backgroundStyle: determineBackgroundStyle(category, productName),
            source: 'fallback',
            consistencyId: generateId()
        });
    }
});

// ============================================
// REMOVE BACKGROUND WITH BIREFNET
// ============================================
app.post('/api/remove-background', checkAuth, async (req, res) => {
    try {
        requestTracker.total++;
        
        if (!BACKGROUND_REMOVAL_ENABLED || !REPLICATE_API_TOKEN) {
            return res.json({
                success: true,
                skipped: true,
                reason: 'Background removal disabled or not configured',
                imageUrl: req.body.imageUrl
            });
        }
        
        const { imageUrl } = req.body;
        
        const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${REPLICATE_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                version: BIREFNET_MODEL,
                input: { image: imageUrl }
            })
        });
        
        if (!response.ok) {
            throw new Error(`BiRefNet API error: ${response.status}`);
        }
        
        const prediction = await response.json();
        const result = await pollReplicatePrediction(prediction.id);
        
        requestTracker.birefnet++;
        
        res.json({
            success: true,
            url: result.output,
            predictionId: prediction.id
        });
        
    } catch (error) {
        requestTracker.errors++;
        console.error('[BiRefNet Error]', error);
        res.status(500).json({
            success: false,
            error: error.message,
            imageUrl: req.body.imageUrl
        });
    }
});

// ============================================
// GENERATE BATCH OF IMAGES
// ============================================
app.post('/api/generate-batch', checkAuth, async (req, res) => {
    try {
        requestTracker.total++;
        
        if (!IMAGE_GENERATION_ENABLED) {
            return res.json({
                success: false,
                error: 'Image generation disabled',
                results: [],
                demo: true
            });
        }
        
        if (!REPLICATE_API_TOKEN) {
            return res.status(500).json({
                success: false,
                error: 'Replicate API token not configured'
            });
        }
        
        const { prompts, referenceImage, backgroundRemovedImage, backgroundStyle } = req.body;
        
        const results = [];
        const errors = [];
        
        for (let i = 0; i < prompts.length; i++) {
            const prompt = prompts[i];
            
            try {
                let modifiedPrompt = prompt.prompt_text;
                if (backgroundStyle === 'white_studio') {
                    modifiedPrompt = `${modifiedPrompt}, clean white studio background, professional product photography, isolated on white, high quality, 8k`;
                } else if (backgroundStyle === 'transparent') {
                    modifiedPrompt = `${modifiedPrompt}, floating product, no background, isolated subject, transparent background, high quality, 8k`;
                } else if (backgroundStyle === 'lifestyle') {
                    modifiedPrompt = `${modifiedPrompt}, natural lifestyle setting, contextual environment, real-world scene, high quality, 8k`;
                }
                
                const dimensions = parseAspectRatio(prompt.aspect_ratio || '1:1');
                
                const input = {
                    prompt: modifiedPrompt,
                    width: dimensions.width,
                    height: dimensions.height,
                    num_inference_steps: 28,
                    guidance_scale: 3.5,
                    output_format: 'webp',
                    output_quality: 90,
                    disable_safety_checker: true
                };
                
                const imageToUse = backgroundRemovedImage || referenceImage;
                if (imageToUse) {
                    input.image = imageToUse;
                    input.prompt_strength = 0.15;
                }
                
                const response = await fetch('https://api.replicate.com/v1/predictions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        version: FLUX_MODEL,
                        input
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                const prediction = await response.json();
                const result = await pollReplicatePrediction(prediction.id);
                
                results.push({
                    success: true,
                    role: prompt.image_role,
                    url: result.output,
                    prompt: prompt
                });
                
                requestTracker.flux++;
                await delay(500);
                
            } catch (error) {
                console.error(`[Batch Error] Prompt ${i}:`, error);
                errors.push({
                    role: prompt.image_role,
                    error: error.message
                });
                results.push({
                    success: false,
                    role: prompt.image_role,
                    error: error.message,
                    prompt
                });
            }
        }
        
        res.json({
            success: true,
            results,
            generated: results.filter(r => r.success).length,
            errors: errors.length
        });
        
    } catch (error) {
        requestTracker.errors++;
        console.error('[Batch Error]', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// PACKAGE RESULT
// ============================================
app.post('/api/package-result', checkAuth, (req, res) => {
    const { html, images, metadata } = req.body;
    
    const singleFile = generateSingleFileHTML(html, images);
    
    res.json({
        success: true,
        package: {
            html,
            images,
            metadata,
            export: {
                singleFile,
                structured: { html, images, metadata }
            },
            timestamp: new Date().toISOString()
        }
    });
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function pollReplicatePrediction(predictionId) {
    const maxAttempts = 60;
    const delayMs = 2000;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: {
                'Authorization': `Token ${REPLICATE_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Polling error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'succeeded') {
            return result;
        }
        
        if (result.status === 'failed' || result.status === 'canceled') {
            throw new Error(result.error || 'Generation failed');
        }
        
        await delay(delayMs);
    }
    
    throw new Error('Generation timeout');
}

function parseAspectRatio(ratio) {
    const ratios = {
        '1:1': { width: 1024, height: 1024 },
        '3:4': { width: 768, height: 1024 },
        '4:3': { width: 1024, height: 768 },
        '16:9': { width: 1024, height: 576 },
        '9:16': { width: 576, height: 1024 },
        '3:2': { width: 1024, height: 683 },
        '2:3': { width: 683, height: 1024 },
        '4:5': { width: 819, height: 1024 }
    };
    return ratios[ratio] || ratios['1:1'];
}

function generateLocalPrompts(productName, category, problem, benefit) {
    const categoryPrompts = {
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

function determineBackgroundStyle(category, productName) {
    const transparentProducts = ['phone', 'laptop', 'tablet', 'watch', 'headphone', 'speaker', 'camera', 'device', 'gadget'];
    const productLower = (productName || '').toLowerCase();
    
    if (transparentProducts.some(p => productLower.includes(p))) {
        return BACKGROUND_STYLES.TRANSPARENT;
    }
    
    const categoryStyles = {
        beauty: BACKGROUND_STYLES.WHITE_STUDIO,
        health: BACKGROUND_STYLES.WHITE_STUDIO,
        kitchen: BACKGROUND_STYLES.LIFESTYLE,
        fitness: BACKGROUND_STYLES.LIFESTYLE,
        tech: BACKGROUND_STYLES.TRANSPARENT
    };
    
    return categoryStyles[category] || BACKGROUND_STYLES.WHITE_STUDIO;
}

function generateSingleFileHTML(html, images) {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Landing Page</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600&display=swap" rel="stylesheet">
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Cairo',sans-serif;font-weight:600}</style>
</head>
<body>
${html}
</body>
</html>`;
}

function generateId() {
    return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║           PageGen Pro Server - Production Ready            ║
╠════════════════════════════════════════════════════════════╣
║  Port:        ${PORT}                                         ║
║  Flux Model:  ${FLUX_MODEL}                    ║
║  BiRefNet:    ${BACKGROUND_REMOVAL_ENABLED ? 'ENABLED' : 'DISABLED'}                              ║
║  Image Gen:   ${IMAGE_GENERATION_ENABLED ? 'ENABLED' : 'DISABLED'}                              ║
╚════════════════════════════════════════════════════════════╝
    `);
});
