import readingTime from 'reading-time';
import { SummarizeOptions, SummaryResult } from './types';
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

/**
 * Default options for the summarize function
 */
const DEFAULT_OPTIONS: SummarizeOptions = {
    sentenceCount: 5,
    includeTitleFromContent: true,
    includeImage: true,
    minLength: 100,
    maxLength: 2000
};

/**
 * Summarizes and analyzes the provided text or HTML content
 * @param content The text or HTML content to summarize
 * @param options Optional configuration options
 * @returns A summary result object
 */
export function summarize(content: string, options: Partial<SummarizeOptions> = {}): SummaryResult {
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

            return result;
        }

        // Detect language of the text
        const languageResult = detectLanguage(cleanedText);
        const language = languageResult.language;

        // Generate summary using the appropriate algorithm for the language
        // Make sure we respect the sentenceCount option
        const rawSummary = summarizeText(cleanedText, Math.min(finalOptions.sentenceCount, 5));

        // Split summary into sentences
        const sentencesArr = extractSentences(rawSummary);

        // Limit to the specified number of sentences
        const limitedSentences = sentencesArr.slice(0, finalOptions.sentenceCount);

        // Join the limited sentences back into a summary
        const summary = limitedSentences.join(' ');

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

        return result;
    } catch (error) {
        console.error('Summarization error:', error);
        return {
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

// Re-export utility functions
export { extractTopics, isArabic }; 