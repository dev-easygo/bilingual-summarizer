import * as natural from 'natural';
import { Topic } from '../types';
import { isArabic } from '../utils/languageDetection';
import { sanitizeArabicText } from '../utils/textPreprocessing';

// Stop words for English and Arabic
const ENGLISH_STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'against', 'between', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down', 'of', 'off', 'over', 'under',
    'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
    'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
    'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don',
    'should', 'now', 'this', 'that', 'these', 'those', 'what', 'which'
]);

const ARABIC_STOP_WORDS = new Set([
    'من', 'إلى', 'عن', 'على', 'في', 'هو', 'هي', 'هم', 'انت', 'انتم', 'انتن', 'انا', 'نحن',
    'هذا', 'هذه', 'ذلك', 'تلك', 'هؤلاء', 'هناك', 'الذي', 'التي', 'الذين', 'اللواتي', 'ما',
    'ماذا', 'كيف', 'متى', 'لماذا', 'من', 'أين', 'و', 'أو', 'ثم', 'لكن', 'بل', 'إن', 'إذا',
    'حتى', 'كان', 'كانت', 'كانوا', 'يكون', 'تكون', 'يكونوا', 'كن', 'كنت', 'كنتم', 'قد', 'لا',
    'لم', 'لن', 'مع', 'عند', 'عندما', 'فوق', 'تحت', 'بين', 'بعد', 'قبل', 'كل', 'بعض', 'أكثر',
    'أقل', 'آخر', 'غير', 'أن'
]);

// Stemmer initialization
const englishStemmer = natural.PorterStemmer;

// Common topics in English
const commonEnglishTopics = [
    'Technology', 'Science', 'Health', 'Politics', 'Business', 'Economy',
    'Entertainment', 'Sports', 'Education', 'Environment', 'Art', 'Music',
    'Food', 'Travel', 'Fashion', 'Lifestyle', 'Religion', 'History',
    'JavaScript', 'Programming', 'Web', 'Development', 'Software', 'Data',
    'AI', 'Machine Learning', 'Blockchain', 'Cryptocurrency', 'Finance'
];

// Common topics in Arabic (with English translations)
const commonArabicTopics = [
    'تكنولوجيا', 'علوم', 'صحة', 'سياسة', 'أعمال', 'اقتصاد',
    'ترفيه', 'رياضة', 'تعليم', 'بيئة', 'فن', 'موسيقى',
    'طعام', 'سفر', 'أزياء', 'نمط الحياة', 'دين', 'تاريخ',
    'جافاسكريبت', 'برمجة', 'ويب', 'تطوير', 'برمجيات', 'بيانات',
    'ذكاء اصطناعي', 'تعلم آلي', 'بلوكتشين', 'عملات رقمية', 'مالية'
];

/**
 * Extracts topics from the given text
 * @param text The text to extract topics from
 * @param limit Optional limit for the number of topics to return (default: 5)
 * @returns An array of extracted topics
 */
export function extractTopics(text: string, limit: number = 5): string[] {
    try {
        if (!text || text.trim().length === 0) {
            return [];
        }

        // Determine if the text is in Arabic
        const isArabicText = isArabic(text);

        // Use the appropriate topic list
        const relevantTopics = isArabicText ? commonArabicTopics : commonEnglishTopics;

        // Convert text to lowercase for matching
        const lowerText = text.toLowerCase();

        // Find topics that are mentioned in the text (case insensitive)
        const foundTopics = relevantTopics.filter(topic => {
            const lowerTopic = topic.toLowerCase();
            return lowerText.includes(lowerTopic);
        });

        // Limit to specified number of topics
        return foundTopics.slice(0, limit);
    } catch (error) {
        console.error('Topic extraction error:', error);
        return [];
    }
}

/**
 * Calculates the difficulty score of the text based on word length, sentence complexity, etc.
 * @param text The text to analyze
 * @returns A difficulty score between 0 (easy) and 1 (difficult)
 */
export function calculateDifficulty(text: string): number {
    try {
        if (!text || text.trim().length === 0) {
            return 0.5; // Default to medium difficulty
        }

        // Calculate average word length
        const words = text.split(/\s+/).filter(Boolean);
        const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;

        // Calculate average sentence length
        const sentences = text.split(/[.!?]+/).filter(Boolean);
        const avgSentenceLength = words.length / sentences.length;

        // Calculate complexity metrics
        const complexWords = words.filter(word => word.length > 6).length;
        const complexityRatio = complexWords / words.length;

        // Calculate overall difficulty score (normalized between 0 and 1)
        let difficultyScore = (
            (avgWordLength / 10) * 0.3 +
            (avgSentenceLength / 30) * 0.3 +
            complexityRatio * 0.4
        );

        // Ensure the score is between 0 and 1
        return Math.max(0, Math.min(1, difficultyScore));
    } catch (error) {
        console.error('Difficulty calculation error:', error);
        return 0.5; // Default to medium difficulty on error
    }
} 