import * as SummarizerManager from 'node-summarizer';
import { Sentence } from '../types';
import { isArabic, detectLanguage } from '../utils/languageDetection';
import { cleanText, extractSentences } from '../utils/textPreprocessing';
import { extractTopics } from './topicExtractor';

/**
 * Generates a summary of the given text
 * @param text The text to summarize
 * @param sentenceCount The number of sentences to include in the summary
 * @returns A summarized version of the text
 */
export function summarizeText(text: string, sentenceCount: number = 5): string {
    try {
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return '';
        }

        // Extract sentences from the text
        const sentences = extractSentences(text);

        // If there are fewer sentences than the requested count, return the original text
        if (sentences.length <= sentenceCount) {
            return text;
        }

        // Check if the text is in Arabic
        const isArabicText = isArabic(text);

        // Calculate sentence scores based on language
        const scoredSentences = isArabicText
            ? scoreArabicSentences(sentences)
            : scoreEnglishSentences(sentences);

        // Sort sentences by score in descending order
        const sortedSentences = [...scoredSentences].sort((a, b) => b.score - a.score);

        // Take the top N sentences
        const topSentences = sortedSentences.slice(0, sentenceCount);

        // Sort the top sentences by their original position to maintain flow
        topSentences.sort((a, b) => a.index - b.index);

        // Combine the top sentences
        const summary = topSentences.map(s => s.text).join(' ');

        return summary;
    } catch (error) {
        console.error('Summarization error:', error);
        // Return a truncated version of the original text as fallback
        const truncated = text.split('.').slice(0, sentenceCount).join('.').trim();
        return truncated || text;
    }
}

/**
 * Scores English sentences based on their importance
 * @param sentences Array of sentences
 * @returns Array of sentences with scores
 */
function scoreEnglishSentences(sentences: string[]): Sentence[] {
    // Word frequency map
    const wordFrequency: Record<string, number> = {};

    // Calculate word frequency across all sentences
    sentences.forEach(sentence => {
        // Split sentence into words and convert to lowercase
        const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];

        // Count word frequency
        words.forEach(word => {
            // Skip very short words (likely not meaningful)
            if (word.length <= 1) return;

            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        });
    });

    // Score each sentence based on word frequency and length
    return sentences.map((text, index) => {
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];

        // Skip very short sentences
        if (words.length < 3) {
            return { text, score: 0, index };
        }

        // Calculate score based on word frequency
        let score = words.reduce((total, word) => {
            if (word.length > 1) {
                return total + (wordFrequency[word] || 0);
            }
            return total;
        }, 0);

        // Normalize score by sentence length to avoid bias towards longer sentences
        score = score / (words.length || 1);

        // Boost score for sentences that appear at the beginning or end (often more important)
        if (index === 0 || index === sentences.length - 1) {
            score *= 1.25;
        } else if (index < sentences.length * 0.1) {
            // Boost sentences in the first 10% of the text
            score *= 1.1;
        }

        return { text, score, index };
    });
}

/**
 * Scores Arabic sentences based on their importance
 * @param sentences Array of sentences
 * @returns Array of sentences with scores
 */
function scoreArabicSentences(sentences: string[]): Sentence[] {
    // Word frequency map for Arabic
    const wordFrequency: Record<string, number> = {};

    // Calculate word frequency across all sentences
    sentences.forEach(sentence => {
        // Split sentence into words
        const words = sentence.split(/\s+/);

        // Count word frequency
        words.forEach(word => {
            // Skip very short words
            if (word.length <= 1) return;

            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        });
    });

    // Score each sentence
    return sentences.map((text, index) => {
        const words = text.split(/\s+/);

        // Skip very short sentences
        if (words.length < 2) {
            return { text, score: 0, index };
        }

        // Calculate score based on word frequency
        let score = words.reduce((total, word) => {
            if (word.length > 1) {
                return total + (wordFrequency[word] || 0);
            }
            return total;
        }, 0);

        // Normalize score by sentence length
        score = score / (words.length || 1);

        // Boost score for sentences that appear at the beginning or end
        if (index === 0 || index === sentences.length - 1) {
            score *= 1.25;
        } else if (index < sentences.length * 0.1) {
            // Boost sentences in the first 10% of the text
            score *= 1.1;
        }

        // Add special weighting for sentences containing important Arabic terms
        // These are indicators of important information in Arabic texts
        const importantTerms = ['من أهم', 'يجب', 'ضروري', 'أساسي', 'مهم', 'خلاصة', 'نتيجة', 'إنّ', 'إن'];

        for (const term of importantTerms) {
            if (text.includes(term)) {
                score *= 1.15; // Boost score by 15%
                break;
            }
        }

        return { text, score, index };
    });
}

/**
 * Summarizes English text using node-summarizer
 * @param text The English text to summarize
 * @param sentenceCount The number of sentences for the summary
 * @returns The summarized text
 */
function summarizeEnglishText(text: string, sentenceCount: number): string {
    try {
        // Use node-summarizer for English text
        const summarizer = new SummarizerManager({
            text,
            sentences: sentenceCount
        });

        const result = summarizer.getSummaryByFrequency();
        if (result && result.summary) {
            return result.summary;
        }

        // Fallback to our custom summarization if node-summarizer fails
        return customSummarize(text, sentenceCount);
    } catch (error) {
        console.error('English summarization error:', error);
        return customSummarize(text, sentenceCount);
    }
}

/**
 * Summarizes Arabic text using custom implementation
 * @param text The Arabic text to summarize
 * @param sentenceCount The number of sentences for the summary
 * @returns The summarized text
 */
function summarizeArabicText(text: string, sentenceCount: number): string {
    // Use custom summarizer for Arabic text
    return customSummarize(text, sentenceCount);
}

/**
 * Custom implementation of text summarization that works for both Arabic and English
 * @param text The text to summarize
 * @param sentenceCount The number of sentences for the summary
 * @returns The summarized text
 */
function customSummarize(text: string, sentenceCount: number): string {
    // Clean the text
    const cleanedText = cleanText(text);

    // Extract sentences
    const sentences = extractSentences(cleanedText);

    // If too few sentences, return the original text
    if (sentences.length <= sentenceCount) {
        return cleanedText;
    }

    // Extract the main topics to use for scoring sentences
    const topics = extractTopics(cleanedText, 10);
    const topicSet = new Set(topics);

    // Score each sentence based on its importance
    const scoredSentences: Sentence[] = sentences.map((sentence, index) => {
        // Calculate a score based on several factors
        let score = 0;

        // Position bias: earlier sentences often contain important information
        score += (1.0 - (index / sentences.length)) * 0.1;

        // Topic relevance: sentences containing important topics get higher scores
        const words = sentence.split(/\s+/);
        for (const word of words) {
            if (topicSet.has(word.toLowerCase())) {
                score += 0.3;
            }
        }

        // Length preference: avoid very short sentences
        if (words.length > 5) {
            score += 0.1;
        }

        return {
            text: sentence,
            score,
            index
        };
    });

    // Sort sentences by score in descending order
    const topSentences = scoredSentences
        .sort((a, b) => b.score - a.score)
        .slice(0, sentenceCount);

    // Sort selected sentences by original position to maintain narrative flow
    topSentences.sort((a, b) => a.index - b.index);

    // Join the sentences to create the summary
    return topSentences.map(sentence => sentence.text).join(' ');
} 