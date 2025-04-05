import sentiment from 'sentiment';
import { SentimentResult } from '../types';
import { isArabic } from '../utils/languageDetection';

// Try to import sentiment-multilang or create a mock
let multiSentiment: any;
try {
    multiSentiment = require('sentiment-multilang');
} catch (error) {
    multiSentiment = {
        analyze: (text: string, options: any) => ({
            score: 0,
            comparative: 0
        })
    };
}

/**
 * Analyzes the sentiment of the given text based on its language
 * @param text The text to analyze
 * @returns An object with the sentiment score and comparative value
 */
export function analyzeSentiment(text: string): SentimentResult {
    try {
        // Check if text is Arabic
        if (isArabic(text)) {
            return analyzeArabicSentiment(text);
        } else {
            return analyzeEnglishSentiment(text);
        }
    } catch (error) {
        console.error('Sentiment analysis error:', error);
        // Return neutral sentiment on error
        return {
            score: 0,
            comparative: 0
        };
    }
}

/**
 * Analyzes sentiment for English text
 * @param text The English text to analyze
 * @returns An object with the sentiment score and comparative value
 */
function analyzeEnglishSentiment(text: string): SentimentResult {
    try {
        // Use the sentiment library directly as a function
        // Ensure we handle the result properly even if undefined
        const result = sentiment(text);

        if (!result || typeof result !== 'object') {
            return {
                score: 0,
                comparative: 0
            };
        }

        return {
            score: result.score || 0,
            comparative: result.comparative || 0
        };
    } catch (error) {
        console.error('English sentiment analysis error:', error);
        return {
            score: 0,
            comparative: 0
        };
    }
}

/**
 * Analyzes sentiment for Arabic text
 * @param text The Arabic text to analyze
 * @returns An object with the sentiment score and comparative value
 */
function analyzeArabicSentiment(text: string): SentimentResult {
    try {
        // First try with sentiment-multilang which supports Arabic
        if (multiSentiment && typeof multiSentiment.analyze === 'function') {
            const result = multiSentiment.analyze(text, { language: 'ar' });

            if (!result || typeof result !== 'object') {
                return {
                    score: 0,
                    comparative: 0
                };
            }

            return {
                score: result.score || 0,
                comparative: result.comparative || result.score / (text.split(/\s+/).length || 1) || 0
            };
        }

        // Fallback to basic sentiment analysis
        const basicResult = sentiment(text);

        if (!basicResult || typeof basicResult !== 'object') {
            return {
                score: 0,
                comparative: 0
            };
        }

        return {
            score: basicResult.score || 0,
            comparative: basicResult.comparative || 0
        };
    } catch (error) {
        console.error('Arabic sentiment analysis error:', error);

        // Use basic sentiment as another fallback
        try {
            const basicResult = sentiment(text);

            if (!basicResult || typeof basicResult !== 'object') {
                return {
                    score: 0,
                    comparative: 0
                };
            }

            return {
                score: basicResult.score || 0,
                comparative: basicResult.comparative || 0
            };
        } catch (innerError) {
            return {
                score: 0,
                comparative: 0
            };
        }
    }
}

/**
 * Maps a sentiment score to a human-readable label
 * @param score The sentiment score
 * @returns A sentiment label (positive, negative, or neutral)
 */
export function getSentimentLabel(score: number): string {
    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
} 