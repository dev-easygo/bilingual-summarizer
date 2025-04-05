import { Sentence } from '../types';
import { extractSentences } from '../utils/textPreprocessing';

// Optional imports for specialized Arabic NLP libraries
let camelTools: any = null;
let farasa: any = null;

// Try to import optional Arabic NLP libraries
try {
    camelTools = require('@iamtung/camel-tools');
} catch (error) {
    console.log('CamelTools not available, falling back to basic Arabic processing');
}

try {
    farasa = require('farasa');
} catch (error) {
    console.log('Farasa not available, falling back to basic Arabic processing');
}

/**
 * Advanced Arabic text summarization using specialized NLP techniques
 * Based on research on Arabic text processing from academic papers
 * @param text The Arabic text to summarize
 * @param sentenceCount The number of sentences to include in the summary
 * @returns A summarized version of the text
 */
export function summarizeArabicText(text: string, sentenceCount: number = 5): string {
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

        // Use advanced Arabic scoring if specialized libraries are available
        // Otherwise fall back to basic scoring
        const scoredSentences = hasFarasaOrCamel()
            ? scoreArabicSentencesAdvanced(sentences)
            : scoreArabicSentencesBasic(sentences);

        // Sort sentences by score in descending order
        const sortedSentences = [...scoredSentences].sort((a, b) => b.score - a.score);

        // Take the top N sentences
        const topSentences = sortedSentences.slice(0, sentenceCount);

        // Sort the top sentences by their original position to maintain flow
        topSentences.sort((a, b) => a.index - b.index);

        // Combine the top sentences
        return topSentences.map(s => s.text).join(' ');
    } catch (error) {
        console.error('Arabic summarization error:', error);
        // Return a truncated version of the original text as fallback
        const truncated = text.split('.').slice(0, sentenceCount).join('.').trim();
        return truncated || text;
    }
}

/**
 * Checks if specialized Arabic NLP libraries are available
 * @returns True if either Farasa or CamelTools is available
 */
function hasFarasaOrCamel(): boolean {
    return camelTools !== null || farasa !== null;
}

/**
 * Advanced scoring for Arabic sentences using specialized NLP libraries
 * Based on research from: https://github.com/AhmedSoliman1999/Arabic-text-summarization
 * and https://medium.com/@alroumi.abdulmajeed/exploring-advanced-arabic-text-summarization-with-python-transformers-and-large-language-models-c9c637046827
 * @param sentences Array of sentences
 * @returns Array of sentences with scores
 */
function scoreArabicSentencesAdvanced(sentences: string[]): Sentence[] {
    // Word frequency map for Arabic with morphological analysis
    const wordFrequency: Record<string, number> = {};
    const nounScores: Record<number, number> = {}; // Sentence index to noun count

    // Process sentences with specialized Arabic NLP tools if available
    sentences.forEach((sentence, idx) => {
        let words: string[] = [];
        let nouns: string[] = [];

        if (farasa !== null) {
            // Use Farasa for segmentation and POS tagging
            try {
                const analysis = farasa.segmentAndPOS(sentence);
                words = analysis.segments || sentence.split(/\s+/);
                // Extract nouns from POS tagging
                nouns = analysis.segments.filter((w: any) =>
                    w.pos && (w.pos === 'NOUN' || w.pos === 'PROP_NOUN')
                ).map((w: any) => w.segment);
            } catch (e) {
                words = sentence.split(/\s+/);
            }
        } else if (camelTools !== null) {
            // Use CamelTools for morphological analysis
            try {
                const analysis = camelTools.analyze(sentence);
                words = analysis.tokens || sentence.split(/\s+/);
                // Extract nouns from analysis
                nouns = analysis.tokens
                    .filter((t: any) => t.pos && t.pos.startsWith('NOUN'))
                    .map((t: any) => t.surface);
            } catch (e) {
                words = sentence.split(/\s+/);
            }
        } else {
            // Fallback to simple splitting
            words = sentence.split(/\s+/);
        }

        // Store noun count for initial PageRank score
        nounScores[idx] = nouns.length;

        // Count word frequency for TF-IDF style scoring
        words.forEach(word => {
            if (word.length <= 1) return;

            // Remove diacritics for better matching
            const normalizedWord = word.normalize('NFD')
                .replace(/[\u064B-\u065F\u0670]/g, ''); // Remove Arabic diacritics

            wordFrequency[normalizedWord] = (wordFrequency[normalizedWord] || 0) + 1;
        });
    });

    // Score sentences using a modified PageRank approach
    // Following techniques from Arabic text summarization research papers
    return sentences.map((text, index) => {
        // Skip very short sentences
        if (text.length < 20) {
            return { text, score: 0, index };
        }

        // Calculate word-frequency based score
        const words = text.split(/\s+/);
        let score = words.reduce((total, word) => {
            if (word.length > 1) {
                const normalizedWord = word.normalize('NFD')
                    .replace(/[\u064B-\u065F\u0670]/g, '');
                return total + (wordFrequency[normalizedWord] || 0);
            }
            return total;
        }, 0);

        // Normalize by sentence length
        score = score / (words.length || 1);

        // Add noun-based score components (Modified PageRank initial score)
        const nounScore = nounScores[index] || 0;
        score += nounScore * 0.5;

        // Position weighting based on Arabic document structure research
        if (index === 0) {
            score *= 1.5; // First sentence is very important in Arabic texts
        } else if (index === sentences.length - 1) {
            score *= 1.3; // Last sentence often contains conclusions
        } else if (index < sentences.length * 0.2) {
            // First 20% of sentences typically contain key information in Arabic texts
            score *= 1.2;
        }

        // Linguistic markers important in Arabic
        const importantMarkers = [
            'من أهم', 'يجب', 'ضروري', 'أساسي', 'مهم', 'خلاصة',
            'نتيجة', 'إنّ', 'إن', 'لذلك', 'وبالتالي', 'وخلاصة القول',
            'باختصار', 'بشكل أساسي', 'من الجدير بالذكر', 'لا بد من',
            'من الضروري', 'حيث أن', 'بالإضافة إلى ذلك', 'وعلاوة على ذلك'
        ];

        for (const marker of importantMarkers) {
            if (text.includes(marker)) {
                score *= 1.25;
                break;
            }
        }

        return { text, score, index };
    });
}

/**
 * Basic scoring for Arabic sentences as fallback
 * @param sentences Array of sentences
 * @returns Array of sentences with scores
 */
function scoreArabicSentencesBasic(sentences: string[]): Sentence[] {
    // Word frequency map
    const wordFrequency: Record<string, number> = {};

    // Calculate word frequency across all sentences
    sentences.forEach(sentence => {
        const words = sentence.split(/\s+/);

        words.forEach(word => {
            if (word.length <= 1) return;

            // Remove diacritics
            const normalizedWord = word.normalize('NFD')
                .replace(/[\u064B-\u065F\u0670]/g, '');

            wordFrequency[normalizedWord] = (wordFrequency[normalizedWord] || 0) + 1;
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
                const normalizedWord = word.normalize('NFD')
                    .replace(/[\u064B-\u065F\u0670]/g, '');
                return total + (wordFrequency[normalizedWord] || 0);
            }
            return total;
        }, 0);

        // Normalize score by sentence length
        score = score / (words.length || 1);

        // Position weighting
        if (index === 0) {
            score *= 1.5;
        } else if (index === sentences.length - 1) {
            score *= 1.3;
        } else if (index < sentences.length * 0.2) {
            score *= 1.2;
        }

        // Key phrases that indicate important sentences in Arabic
        const importantTerms = [
            'من أهم', 'يجب', 'ضروري', 'أساسي', 'مهم', 'خلاصة',
            'نتيجة', 'إنّ', 'إن', 'لذلك', 'وبالتالي'
        ];

        for (const term of importantTerms) {
            if (text.includes(term)) {
                score *= 1.25;
                break;
            }
        }

        return { text, score, index };
    });
} 