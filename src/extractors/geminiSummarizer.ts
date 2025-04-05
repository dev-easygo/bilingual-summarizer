import { GoogleGenerativeAI, GenerateContentRequest, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { GeminiConfig } from '../types';

/**
 * Generates a summary using Google's Gemini AI
 * @param text The text to summarize
 * @param sentenceCount The maximum number of sentences in the summary
 * @param geminiConfig Configuration for the Gemini API
 * @returns The AI-generated summary
 */
export async function summarizeWithGeminiAI(
    text: string,
    sentenceCount: number = 5,
    geminiConfig: GeminiConfig
): Promise<string> {
    if (!geminiConfig.apiKey) {
        throw new Error('Gemini API key is required. Get one from Google AI Studio (https://ai.google.dev/)');
    }

    try {
        // Initialize the Google Generative AI with the provided API key
        const genAI = new GoogleGenerativeAI(geminiConfig.apiKey);

        // Get the model - default to gemini-1.5-flash if not specified
        // Using newer model names based on the API error message
        const model = genAI.getGenerativeModel({
            model: geminiConfig.model || 'gemini-1.5-flash',
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
            ],
            generationConfig: {
                temperature: geminiConfig.temperature || 0.2,
                maxOutputTokens: geminiConfig.maxOutputTokens || 800,
            },
        });

        // Determine language to create appropriate prompt
        const isArabic = /[\u0600-\u06FF]/.test(text);

        // Create a prompt that clearly specifies what we want the model to do
        let prompt = isArabic
            ? `أرجو تلخيص النص التالي في ${sentenceCount} جمل أو أقل، مع الحفاظ على النقاط الرئيسية والمعلومات الأساسية.${geminiConfig.objective ? ' يجب أن يكون التلخيص موضوعيًا تمامًا، دون أي آراء أو استنتاجات شخصية. اقتصر فقط على الحقائق والمعلومات الواردة في النص الأصلي.' : ''
            } النص هو:\n\n${text}`
            : `Please summarize the following text in ${sentenceCount} sentences or less, preserving the key points and essential information.${geminiConfig.objective ? ' Your summary must be completely objective, without any opinions or personal interpretations. Stick strictly to the facts and information presented in the original text.' : ''
            } The text is:\n\n${text}`;

        // Generate content using the model
        const result = await model.generateContent(prompt);
        const response = result.response;

        // Return the text from the response
        return response.text().trim();
    } catch (error) {
        console.error('Error using Gemini API for summarization:', error);
        throw new Error(`Failed to summarize using Gemini AI: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Validates that a Gemini configuration is properly set up
 * @param config The Gemini configuration to validate
 * @returns True if the configuration is valid, false otherwise
 */
export function isGeminiConfigValid(config: GeminiConfig | null | undefined): boolean {
    if (!config) return false;
    return Boolean(config.apiKey && config.apiKey.trim().length > 0);
} 