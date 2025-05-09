import readingTime from 'reading-time';
import { SummarizeOptions, SummaryResult, ResponseStructureObject, GeminiConfig } from './types';
import { analyzeSentiment, getSentimentLabel } from './analyzers/sentimentAnalyzer';
import { detectLanguage, getLanguageName, isArabic } from './utils/languageDetection';
import {
    extractTitleFromHTML,
    extractImageFromHTML,
    cleanText,
    extractSentences
} from './utils/textPreprocessing';
import { extractTopics, suggestRelatedTopics } from './utils/topicExtraction';
import { summarizeText } from './extractors/summarizer';
import { summarizeArabicText } from './extractors/arabicSummarizer';
import { summarizeWithGeminiAI, isGeminiConfigValid } from './extractors/geminiSummarizer';

/**
 * Default options for the summarize function
 */
const DEFAULT_OPTIONS: SummarizeOptions = {
    sentenceCount: 5,
    includeTitleFromContent: true,
    includeImage: true,
    minLength: 100,
    maxLength: 2000,
    responseStructure: null,
    gemini: null,
    useAI: false
};

/**
 * Processes the responseStructure option to determine which fields to include or exclude
 * @param result The full result object
 * @param responseStructure The responseStructure option value
 * @returns A filtered result object
 */
function filterResultFields(result: Record<string, any>, responseStructure: string[] | ResponseStructureObject): Record<string, any> {
    // If responseStructure is an array, use it as an include list
    if (Array.isArray(responseStructure)) {
        // Always include 'ok' field for error handling, unless explicitly filtered out
        const includeOk = !responseStructure.includes('ok') && result.ok !== undefined;

        // Create a new object with only the specified fields
        const filteredResult: Record<string, any> = {};

        // Add 'ok' if needed
        if (includeOk) {
            filteredResult.ok = result.ok;
        }

        // Add requested fields
        responseStructure.forEach(field => {
            if (field in result) {
                filteredResult[field] = result[field];
            }
        });

        return filteredResult;
    }

    // If responseStructure is an object, handle include/exclude options
    const responseObj = responseStructure as ResponseStructureObject;

    // Validate that both include and exclude aren't used together
    if (responseObj.include && responseObj.exclude) {
        throw new Error("Cannot use both 'include' and 'exclude' in responseStructure simultaneously");
    }

    // Handle include option
    if (responseObj.include && Array.isArray(responseObj.include)) {
        return filterResultFields(result, responseObj.include);
    }

    // Handle exclude option
    if (responseObj.exclude && Array.isArray(responseObj.exclude)) {
        const filteredResult: Record<string, any> = { ...result };

        responseObj.exclude.forEach(field => {
            if (field in filteredResult) {
                delete filteredResult[field];
            }
        });

        return filteredResult;
    }

    // If the object doesn't have valid include or exclude properties, return the original result
    return result;
}

/**
 * Summarizes and analyzes the provided text or HTML content
 * @param content The text or HTML content to summarize
 * @param options Optional configuration options
 * @returns A summary result object
 */
export async function summarize(content: string, options: Partial<SummarizeOptions> = {}): Promise<SummaryResult | Record<string, any>> {
    try {
        // Merge default and user options
        const finalOptions: SummarizeOptions = {
            ...DEFAULT_OPTIONS,
            ...options
        };

        // Clean the text (remove HTML, normalize spacing, etc.)
        const cleanedText = cleanText(content);

        // If content is too short, return it as is
        if (cleanedText.length < finalOptions.minLength) {
            const languageResult = detectLanguage(cleanedText);
            const result: SummaryResult = {
                ok: true,
                title: options.title || extractTitleFromHTML(content) || '',
                summary: cleanedText,
                language: languageResult.language,
                languageName: getLanguageName(languageResult.language),
                sentiment: getSentimentLabel(analyzeSentiment(cleanedText).score),
                topics: extractTopics(cleanedText),
                relatedTopics: [],
                words: cleanedText.split(/\s+/).filter(Boolean).length,
                sentences: extractSentences(cleanedText).length,
                readingTime: Math.ceil(readingTime(cleanedText).minutes || 1),
                difficulty: 'easy'
            };

            if (finalOptions.includeImage) {
                result.image = extractImageFromHTML(content);
            }

            // Filter result if responseStructure is provided
            if (finalOptions.responseStructure) {
                return filterResultFields(result, finalOptions.responseStructure);
            }

            return result;
        }

        // Detect language of the text
        const languageResult = detectLanguage(cleanedText);
        const language = languageResult.language;

        // Generate summary using the appropriate method
        let summary: string;

        // Check if Gemini AI should be used
        if (finalOptions.useAI && finalOptions.gemini) {
            // Validate Gemini configuration
            if (!isGeminiConfigValid(finalOptions.gemini)) {
                throw new Error('Invalid Gemini configuration. API key is required.');
            }

            // Generate summary using Gemini AI
            try {
                summary = await summarizeWithGeminiAI(
                    cleanedText,
                    finalOptions.sentenceCount,
                    finalOptions.gemini
                );
            } catch (aiError) {
                console.error('Gemini AI summarization failed, falling back to default summarizer:', aiError);
                // Fall back to traditional summarization if AI fails
                summary = summarizeText(cleanedText, finalOptions.sentenceCount);
            }
        } else {
            // Use traditional summarization
            summary = summarizeText(cleanedText, finalOptions.sentenceCount);
        }

        // Extract topics
        const topics = extractTopics(cleanedText);

        // Calculate reading time
        const readingTimeResult = readingTime(cleanedText);

        // Get sentiment analysis
        const sentimentResult = analyzeSentiment(cleanedText);

        // Determine difficulty level based on average word length and sentence complexity
        let difficulty = 'medium';
        const avgWordLength = cleanedText.length / cleanedText.split(/\s+/).filter(Boolean).length;

        if (avgWordLength < 4.5) {
            difficulty = 'easy';
        } else if (avgWordLength > 6) {
            difficulty = 'hard';
        }

        // Construct the result object
        const result: SummaryResult = {
            ok: true,
            title: options.title || extractTitleFromHTML(content) || '',
            summary,
            language,
            languageName: getLanguageName(language),
            sentiment: getSentimentLabel(sentimentResult.score),
            topics,
            relatedTopics: suggestRelatedTopics(topics),
            words: cleanedText.split(/\s+/).filter(Boolean).length,
            sentences: extractSentences(cleanedText).length,
            readingTime: Math.ceil(readingTimeResult.minutes || 1),
            difficulty
        };

        // Add image URL if requested
        if (finalOptions.includeImage) {
            result.image = extractImageFromHTML(content);
        }

        // Filter result if responseStructure is provided
        if (finalOptions.responseStructure) {
            return filterResultFields(result, finalOptions.responseStructure);
        }

        return result;
    } catch (error) {
        const errorResult = {
            ok: false,
            error: 'Failed to summarize the content',
            message: error instanceof Error ? error.message : String(error),
            language: 'en',
            summary: '',
            sentiment: 'neutral',
            topics: [],
            words: 0,
            readingTime: 0,
            difficulty: 'medium'
        };

        // Filter error result if responseStructure is provided
        if (options.responseStructure) {
            try {
                return filterResultFields(errorResult, options.responseStructure);
            } catch (filterError) {
                // If filtering itself causes an error (e.g., invalid responseStructure),
                // return the original error with an additional message
                errorResult.message = `${errorResult.message}. Additionally: ${filterError instanceof Error ? filterError.message : String(filterError)}`;
                return errorResult;
            }
        }

        return errorResult;
    }
}

/**
 * Direct API to summarize Arabic text using the specialized Arabic summarizer
 * @param text The Arabic text to summarize
 * @param sentenceCount The number of sentences to include in the summary
 * @returns The summarized text
 */
export function summarizeArabic(text: string, sentenceCount: number = 5): string {
    return summarizeArabicText(text, sentenceCount);
}

/**
 * Direct API to summarize text using Google's Gemini AI
 * @param text The text to summarize
 * @param sentenceCount The number of sentences to include in the summary
 * @param geminiConfig Configuration for the Gemini API
 * @returns A promise that resolves to the summarized text
 */
export async function summarizeWithAI(text: string, sentenceCount: number = 5, geminiConfig: GeminiConfig): Promise<string> {
    if (!isGeminiConfigValid(geminiConfig)) {
        throw new Error('Invalid Gemini configuration. API key is required.');
    }

    return summarizeWithGeminiAI(text, sentenceCount, geminiConfig);
}

// Re-export utility functions
export { extractTopics, isArabic, isGeminiConfigValid }; 