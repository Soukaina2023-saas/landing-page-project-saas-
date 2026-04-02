export const config = {
  runtime: 'nodejs',
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FEATURE_FLAGS } from "../src/config/featureFlags.js";
import { generatePromptsSchema } from "../lib/validation/generatePrompts.schema.js";
import { ApiError } from "../lib/utils/apiError.js";
import { logger } from "../lib/utils/logger.js";
import { isForceExternalFailureEnabled } from "../lib/testing/envFlags.js";
import { createEndpoint, type OrchestratedRequest } from "../lib/middleware/orchestrator.js";
import {
    checkOperationLimits,
    incrementUsage,
} from "../usage/usage.service.js";
import { prisma } from "../lib/db/client.js";
import {
    calculateCost,
    checkBalance,
    finalizeCredits,
    reserveCredits,
    rollbackCredits,
} from "../lib/credits/credits.service.js";
import type { CreditOperation } from "../lib/credits/credits.types.js";
import { randomUUID } from "node:crypto";

const LOW_BALANCE_THRESHOLD = 0.2;

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

type GeneratePromptsBody = {
    productName: string;
    description: string;
    category?: string;
    problem?: string;
    benefit?: string;
    imagesRequested?: number;
};

function parseGeneratePromptsBody(body: unknown): GeneratePromptsBody {
    let requestBody: unknown = body;
    if (typeof body === "string") {
        try {
            requestBody = JSON.parse(body);
        } catch {
            throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body");
        }
    }

    if (requestBody === null || typeof requestBody !== "object") {
        throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body");
    }

    const parsed = generatePromptsSchema.safeParse(requestBody);
    if (!parsed.success) {
        throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body");
    }

    return requestBody as GeneratePromptsBody;
}

// ============================================
// VERCEL SERVERLESS FUNCTION
// ============================================

async function handler(req: OrchestratedRequest<GeneratePromptsBody>, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    logger.info("Incoming request", { endpoint: req.url, method: req.method });
    logger.info("generate-prompts body (pre-parse)", {
        typeofReqBody: typeof req.body,
        reqBody: req.body,
    });

    const requestBody = parseGeneratePromptsBody(req.body);

    logger.info("generate-prompts body (post-parse)", {
        typeofRequestBody: typeof requestBody,
        requestBodyKeys: Object.keys((requestBody as object) || {}),
    });

    const requestedImages = (requestBody as { imagesRequested?: number }).imagesRequested ?? 1;
    checkOperationLimits({ imagesRequested: requestedImages, batchSize: 1 });

    if (!FEATURE_FLAGS.ENABLE_PROMPT_ANALYSIS) {
        throw new ApiError(
            503,
            "FEATURE_DISABLED",
            "Prompt analysis is temporarily unavailable"
        );
    }

    const usageContext = req.context?.usage;
    if (!usageContext) {
        throw new ApiError(500, "INTERNAL_ERROR", "Missing usage context");
    }

    const userId = req.context?.auth?.userId || "test-user";
    const useCredits = true;

    const coreLogic = async () => {
        const { productName } = requestBody;
        const category = String((requestBody as Record<string, unknown>).category ?? "");
        const problem = String((requestBody as Record<string, unknown>).problem ?? "");
        const benefit = String((requestBody as Record<string, unknown>).benefit ?? "");

        if (!GEMINI_API_KEY) {
            if (isForceExternalFailureEnabled()) {
                throw {
                    code: "RETRY_FAILED",
                    statusCode: 500,
                    message: "External service failed after retries",
                    isOperational: true,
                    originalError: new Error("FORCE_EXTERNAL_FAILURE"),
                };
            }
            const prompts = generateLocalPrompts(productName, category, problem, benefit);
            const backgroundStyle = determineBackgroundStyle(category, productName);
            await incrementUsage(usageContext, requestedImages);
            return {
                success: true,
                prompts,
                backgroundStyle,
                source: "gemini" as const,
                consistencyId: generateId(),
            };
        }

        if (isForceExternalFailureEnabled()) {
            throw {
                code: "RETRY_FAILED",
                statusCode: 500,
                message: "External service failed after retries",
                isOperational: true,
                originalError: new Error("FORCE_EXTERNAL_FAILURE"),
            };
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

        await incrementUsage(usageContext, requestedImages);

        return {
            success: true,
            prompts,
            backgroundStyle,
            source: 'gemini' as const,
            consistencyId: generateId()
        };
    };

    let responsePayload;

    if (useCredits) {
        const operation: CreditOperation = "generate_prompts";
        const requiredCredits = calculateCost(operation, { imagesRequested: requestedImages });

        if (userId === "test-user") {
            await prisma.user.upsert({
                where: { id: "test-user" },
                create: {
                    id: "test-user",
                    email: "test-user@credit-test.invalid",
                },
                update: {},
            });
            await prisma.creditBalance.upsert({
                where: { userId: "test-user" },
                create: { userId: "test-user", credits: 10_000 },
                update: { credits: 10_000 },
            });
        }

        const headerKey = req.headers?.["x-idempotency-key"];
        const idempotencyKey =
            typeof headerKey === "string" && headerKey.trim().length > 0
                ? headerKey.trim()
                : randomUUID();

        const generationRequest = await prisma.generationRequest.create({
            data: {
                userId,
                operation,
                status: "CREATED",
                input: requestBody as any,
                idempotencyKey,
            },
            select: { id: true },
        });

        await checkBalance(userId, requiredCredits);

        const { reservationId } = await reserveCredits(
            userId,
            requiredCredits,
            idempotencyKey
        );

        try {
            if (process.env.CREDIT_DEBUG_INJECT_AFTER_RESERVE === "1") {
                throw new Error("Injected failure after reserveCredits");
            }

            await prisma.generationRequest.update({
                where: { id: generationRequest.id },
                data: {
                    creditReservationId: reservationId,
                    status: "RUNNING",
                },
            });

            const result = await coreLogic();

            await prisma.generationRequest.update({
                where: { id: generationRequest.id },
                data: { status: "SUCCEEDED" },
            });

            await finalizeCredits(reservationId, generationRequest.id);

            const balance = await prisma.creditBalance.findUnique({
                where: { userId },
                select: { credits: true },
            });
            const remainingBalance = balance?.credits ?? 0;

            const lowBalanceWarning = remainingBalance <= requiredCredits * LOW_BALANCE_THRESHOLD;

            responsePayload = {
                ...result,
                credits: {
                    used: requiredCredits,
                    remaining: remainingBalance,
                    requiredCredits,
                    ...(lowBalanceWarning && { warning: true }),
                },
            };
        } catch (err) {
            await prisma.generationRequest
                .update({
                    where: { id: generationRequest.id },
                    data: { status: "FAILED" },
                })
                .catch(() => {});

            await rollbackCredits(reservationId).catch((rollbackErr) => {
                logger.error("credits.rollback.failed", {
                    reservationId,
                    err:
                        rollbackErr instanceof Error
                            ? rollbackErr.message
                            : String(rollbackErr),
                });
            });
            throw err;
        }
    } else {
        responsePayload = await coreLogic();
    }

    logger.info("Request successful", { endpoint: req.url });
    return res.status(200).json(responsePayload);
}

export default createEndpoint<GeneratePromptsBody>({
    auth: true,
    usage: {
        requestedUnits: (req) => {
            try {
                const parsedBody = parseGeneratePromptsBody(req.body);
                return parsedBody.imagesRequested ?? 1;
            } catch {
                return 1;
            }
        },
    },
    validation: {
        schema: generatePromptsSchema,
        readBody: (req) => parseGeneratePromptsBody(req.body),
    },
    rateLimit: true,
    retry: false,
    handler,
});
