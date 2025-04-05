import { Sentence } from '../types';
import { extractSentences } from '../utils/textPreprocessing';

// Optional imports for specialized Arabic NLP libraries
let arabicNLP: any = null;
let nodeArabic: any = null;
let arabicWordnet: any = null;
let arWordTokenizer: any = null;

// Try to import alternative Arabic NLP libraries
// We'll try multiple options in order of preference
try {
    // Try to load arabic-nlp
    arabicNLP = require('arabic-nlp');
} catch (error) {
    // Silent fail - will try alternatives
}

try {
    // Try to load node-arabic
    nodeArabic = require('node-arabic');
} catch (error) {
    // Silent fail - will try alternatives
}

try {
    // Try to load arabic-wordnet
    arabicWordnet = require('arabic-wordnet');
} catch (error) {
    // Silent fail - will try alternatives
}

try {
    // Try to load ar-word-tokenizer
    arWordTokenizer = require('ar-word-tokenizer');
} catch (error) {
    // Silent fail - will try alternatives
}

// Log only once what's available
if (!arabicNLP && !nodeArabic && !arabicWordnet && !arWordTokenizer) {
    console.log('Note: No specialized Arabic NLP libraries found. Using basic Arabic processing.');
    console.log('Optional Arabic NLP libraries can improve results but are not required.');
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
        const scoredSentences = hasAnyArabicLibrary()
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
 * Check if we have any of the specialized Arabic NLP libraries available
 * @returns Boolean indicating if any specialized libraries are available
 */
function hasAnyArabicLibrary(): boolean {
    return Boolean(arabicNLP || nodeArabic || arabicWordnet || arWordTokenizer);
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

        if (arabicNLP) {
            try {
                // Use arabic-nlp if available
                const analysis = arabicNLP.segment(sentence);
                words = analysis.tokens || sentence.split(/\s+/);
                nouns = analysis.nouns || [];
            } catch (e) {
                words = sentence.split(/\s+/);
            }
        } else if (nodeArabic) {
            try {
                // Use node-arabic if available
                const analysis = nodeArabic.tokenize(sentence);
                words = analysis || sentence.split(/\s+/);
            } catch (e) {
                words = sentence.split(/\s+/);
            }
        } else if (arWordTokenizer) {
            try {
                // Use ar-word-tokenizer if available
                const tokens = arWordTokenizer.tokenize(sentence);
                words = tokens || sentence.split(/\s+/);
            } catch (e) {
                words = sentence.split(/\s+/);
            }
        } else if (arabicWordnet) {
            try {
                // Use arabic-wordnet if available
                const tokens = arabicWordnet.tokenize(sentence);
                words = tokens || sentence.split(/\s+/);
            } catch (e) {
                words = sentence.split(/\s+/);
            }
        } else {
            // Basic splitting if no library is available
            words = sentence.split(/\s+/);
        }

        // Count word frequency
        words.forEach(word => {
            // Normalize Arabic word - remove diacritics
            const normalizedWord = word.normalize('NFD')
                .replace(/[\u064B-\u065F\u0670]/g, '');

            if (normalizedWord.length > 1) {
                wordFrequency[normalizedWord] = (wordFrequency[normalizedWord] || 0) + 1;
            }
        });

        // Store noun count for this sentence
        nounScores[idx] = nouns.length;
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

        // Check if sentence contains any important markers
        for (const marker of importantMarkers) {
            if (text.includes(marker)) {
                score *= 1.3; // Boost score for sentences with important markers
                break;
            }
        }

        return { text, score, index };
    });
}

/**
 * Basic scoring for Arabic sentences when specialized libraries aren't available
 * @param sentences Array of sentences
 * @returns Array of sentences with scores
 */
function scoreArabicSentencesBasic(sentences: string[]): Sentence[] {
    // Word frequency map
    const wordFrequency: Record<string, number> = {};

    // Calculate word frequency across all sentences
    sentences.forEach(sentence => {
        // Split sentence into words
        const words = sentence.split(/\s+/);

        // Count word frequency
        words.forEach(word => {
            // Skip very short words
            if (word.length <= 1) return;

            // Normalize Arabic word - remove diacritics
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