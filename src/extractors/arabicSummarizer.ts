import { Sentence } from '../types';
import { extractSentences } from '../utils/textPreprocessing';
import { isArabic } from '../utils/languageDetection';

// Import available Arabic libraries
let arabicNLP: any = null;
let arabicStrings: any = null;
let arabicReshaper: any = null;

try {
    arabicNLP = require('arabic-nlp');
} catch (error) {
    // Optional dependency not installed
}

try {
    arabicStrings = require('@flowdegree/arabic-strings');
} catch (error) {
    // Optional dependency not installed
}

try {
    arabicReshaper = require('arabic-persian-reshaper');
} catch (error) {
    // Optional dependency not installed
}

/**
 * Summarizes Arabic text using available Arabic NLP libraries
 * @param text The text to summarize
 * @param sentenceCount The number of sentences to include in the summary
 * @returns A summarized version of the text
 */
export function summarizeArabicText(text: string, sentenceCount: number = 5): string {
    // Check if text is Arabic
    if (!isArabic(text)) {
        throw new Error('The provided text is not in Arabic');
    }

    // Check if we have any Arabic NLP tools available
    const hasArabicNLP = !!arabicNLP;
    const hasArabicStrings = !!arabicStrings;
    const hasArabicReshaper = !!arabicReshaper;

    try {
        // Extract sentences
        const sentences = extractArabicSentences(text);

        if (sentences.length <= sentenceCount) {
            return text; // Text is already short enough
        }

        // Score sentences
        const scoredSentences = scoreArabicSentences(sentences, hasArabicNLP, hasArabicStrings);

        // Sort sentences by score
        const sortedSentences = [...scoredSentences].sort((a, b) => b.score - a.score);

        // Select top sentences and maintain original order
        const topSentenceIndices = sortedSentences
            .slice(0, sentenceCount)
            .map(s => s.index)
            .sort((a, b) => a - b);

        // Generate summary
        const summary = topSentenceIndices.map(i => sentences[i]).join(' ');

        // Apply Arabic reshaping if available
        if (hasArabicReshaper) {
            return arabicReshaper.reshape(summary);
        }

        return summary;
    } catch (error) {
        console.error('Error in Arabic summarization:', error);
        // Fallback to simple extraction of first few sentences
        return extractArabicSentences(text).slice(0, sentenceCount).join(' ');
    }
}

/**
 * Extracts Arabic sentences from text
 * @param text The text to extract sentences from
 * @returns An array of sentences
 */
function extractArabicSentences(text: string): string[] {
    // Arabic sentence endings: periods, question marks, exclamation marks
    const sentenceEndMarkers = ['.', '?', '!', '؟', '!', ':', '؛', '\n\n'];

    let sentences: string[] = [];
    let currentSentence = '';

    for (let i = 0; i < text.length; i++) {
        currentSentence += text[i];

        if (sentenceEndMarkers.includes(text[i]) &&
            (i === text.length - 1 || text[i + 1] === ' ' || text[i + 1] === '\n')) {
            sentences.push(currentSentence.trim());
            currentSentence = '';
        }
    }

    // Add any remaining text as a sentence
    if (currentSentence.trim().length > 0) {
        sentences.push(currentSentence.trim());
    }

    return sentences.filter(s => s.trim().length > 0);
}

/**
 * Scores Arabic sentences for importance
 * @param sentences Array of Arabic sentences
 * @param hasArabicNLP Whether the arabic-nlp library is available
 * @param hasArabicStrings Whether the @flowdegree/arabic-strings library is available
 * @returns Array of scored sentences
 */
function scoreArabicSentences(
    sentences: string[],
    hasArabicNLP: boolean,
    hasArabicStrings: boolean
): Array<{ index: number; score: number; }> {
    // Calculate word frequencies
    const wordFrequencies = calculateArabicWordFrequencies(sentences, hasArabicStrings);

    // Score each sentence
    return sentences.map((sentence, index) => {
        let score = 0;

        // Basic scoring by word frequency
        const words = sentence.split(/\s+/);
        words.forEach(word => {
            score += wordFrequencies[word] || 0;
        });

        // Normalize by sentence length to avoid favoring long sentences too much
        score = words.length > 0 ? score / Math.sqrt(words.length) : 0;

        // Position scoring - first and last sentences are usually important
        if (index === 0 || index === sentences.length - 1) {
            score *= 1.25;
        }

        // Boost sentences with common Arabic indicator phrases
        const indicatorPhrases = [
            'في الختام',
            'من أهم',
            'بشكل أساسي',
            'يعتبر',
            'الهدف الرئيسي',
            'من الضروري',
            'يجب أن نلاحظ',
            'تبين أن'
        ];

        for (const phrase of indicatorPhrases) {
            if (sentence.includes(phrase)) {
                score *= 1.3;
                break;
            }
        }

        // Additional scoring using arabic-nlp if available
        if (hasArabicNLP) {
            try {
                // Use available functions from arabic-nlp
                // This is a placeholder for actual implementation
                const importance = arabicNLP.getImportance ? arabicNLP.getImportance(sentence) : 0;
                score += importance * 0.5;
            } catch (error) {
                // Ignore errors in optional library
            }
        }

        return { index, score };
    });
}

/**
 * Calculates word frequencies in Arabic text
 * @param sentences Array of Arabic sentences
 * @param hasArabicStrings Whether the @flowdegree/arabic-strings library is available
 * @returns Object mapping words to their frequencies
 */
function calculateArabicWordFrequencies(
    sentences: string[],
    hasArabicStrings: boolean
): Record<string, number> {
    const frequencies: Record<string, number> = {};
    const stopWords = getArabicStopWords();

    sentences.forEach(sentence => {
        let words: string[];

        if (hasArabicStrings && arabicStrings.tokenize) {
            try {
                // Use the library's tokenizer if available
                words = arabicStrings.tokenize(sentence);
            } catch (error) {
                words = sentence.split(/\s+/);
            }
        } else {
            words = sentence.split(/\s+/);
        }

        words.forEach(word => {
            const normalizedWord = word.trim().toLowerCase();

            // Skip stop words and very short words
            if (normalizedWord.length < 2 || stopWords.includes(normalizedWord)) {
                return;
            }

            frequencies[normalizedWord] = (frequencies[normalizedWord] || 0) + 1;
        });
    });

    return frequencies;
}

/**
 * Gets a list of common Arabic stop words
 * @returns Array of Arabic stop words
 */
function getArabicStopWords(): string[] {
    // Common Arabic stop words
    return [
        'من', 'إلى', 'عن', 'على', 'في', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك',
        'أنا', 'أنت', 'هو', 'هي', 'نحن', 'هم', 'كان', 'كانت', 'يكون', 'أن',
        'لا', 'ما', 'و', 'أو', 'ثم', 'إن', 'إذا', 'حتى', 'قد', 'لقد',
        'جدا', 'فقط', 'كل', 'بعض', 'مثل', 'عندما', 'كيف', 'لماذا', 'متى',
        'أين', 'لكن', 'كما', 'بعد', 'قبل', 'خلال', 'منذ', 'بين', 'يا',
        'ولكن', 'لذلك', 'بل', 'بينما', 'الذي', 'التي', 'الذين', 'اللواتي'
    ];
} 