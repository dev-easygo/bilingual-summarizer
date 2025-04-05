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
        const lang = isArabic ? 'Arabic' : 'English';

        // Use a consistent English prompt format for all languages
        const prompt = `
**Context**

You are acting as a language specialist for the specified language (${lang}). Your task is to summarize articles or posts into a short paragraph containing no more than a specific number of sentences (${sentenceCount}). You must ensure every sentence is complete and the summary feels finished.

**Instructions**

* Carefully analyze the provided text.
* Do not use bullet points or numbered lists in your summary.
* Generate a complete and unique summary.
* Your response must consist only of the summary itself.${geminiConfig.objective ? '\n* Your summary must be completely objective, without any opinions or personal interpretations. Stick strictly to the facts and information presented in the original text.' : ''}

**Input**

The text to be summarized is:
${text}
`;

        // Generate content using the model
        const result = await model.generateContent(prompt);
        const response = result.response;

        // Get the summary text and ensure it ends with proper punctuation
        let summaryText = response.text().trim();

        // Post-process the summary to ensure complete sentences
        summaryText = ensureCompleteSentences(summaryText, isArabic);

        return summaryText;
    } catch (error) {
        console.error('Error using Gemini API for summarization:', error);
        throw new Error(`Failed to summarize using Gemini AI: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Post-processes a summary to ensure all sentences are complete
 * @param text The summary text to process
 * @param isArabic Whether the text is in Arabic
 * @returns The processed summary with complete sentences
 */
function ensureCompleteSentences(text: string, isArabic: boolean): string {
    // Define sentence terminators for both languages
    const terminators = isArabic ? ['.', '!', '؟', '؛', ':', '…'] : ['.', '!', '?', ';', ':', '...'];

    // Check if the text ends with a terminator
    const endsWithTerminator = terminators.some(term => text.endsWith(term));
    if (!endsWithTerminator) {
        // Add a period if the text doesn't end with a terminator
        text += isArabic ? '.' : '.';
    }

    // Ensure spaces between sentences (for readability)
    let processedText = text;

    // Replace multiple spaces with a single space
    processedText = processedText.replace(/\s+/g, ' ');

    // For Arabic text, handle specific punctuation spacing
    if (isArabic) {
        // Ensure proper spacing in Arabic text
        terminators.forEach(terminator => {
            if (terminator !== '.') { // Skip period for Arabic as it's handled differently
                const regex = new RegExp(`${terminator}\\s*`, 'g');
                processedText = processedText.replace(regex, `${terminator} `);
            }
        });

        // Handle Arabic period specifically (both Arabic and Latin periods)
        processedText = processedText.replace(/\.\s*/g, '. ');
    } else {
        // For English, ensure space after punctuation
        terminators.forEach(terminator => {
            const regex = new RegExp(`${terminator}\\s*`, 'g');
            processedText = processedText.replace(regex, `${terminator} `);
        });
    }

    // Trim any trailing spaces
    return processedText.trim();
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