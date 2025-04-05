import * as langdetect from 'langdetect';
import { LanguageDetectionResult } from '../types';

// Create a fallback for the arajs module since it might not be properly initialized in tests
let eld: any;
try {
    // Try to import arajs
    const arajs = require('arajs');
    eld = arajs.eld;
} catch (error) {
    // Create a mock if arajs is not available
    eld = {
        detect: (text: string) => ({
            language: '',
            isReliable: () => false
        })
    };
}

/**
 * Detects the language of a given text using multiple libraries for improved accuracy
 * @param text The text to detect the language of
 * @returns An object with the detected language code and confidence level
 */
export function detectLanguage(text: string): LanguageDetectionResult {
    try {
        // Check for Arabic text patterns
        const hasArabicChars = /[\u0600-\u06FF]/.test(text);

        if (hasArabicChars) {
            return {
                language: 'ar',
                confidence: 0.9
            };
        }

        // Try using arajs first for better Arabic detection
        if (eld && typeof eld.detect === 'function') {
            const arabicResult = eld.detect(text);

            if (arabicResult.language === 'ar' && arabicResult.isReliable()) {
                return {
                    language: 'ar',
                    confidence: 0.9 // High confidence for arabic detection with arajs
                };
            }
        }

        // Use langdetect as fallback
        try {
            const results = langdetect.detect(text);

            if (results && results.length > 0) {
                // Get the most confident result
                const bestResult = results[0];

                return {
                    language: bestResult.lang,
                    confidence: bestResult.prob
                };
            }
        } catch (langError) {
            console.error('Language detection library error:', langError);
        }

        // Default to English if nothing detected
        return {
            language: 'en',
            confidence: 0.5
        };
    } catch (error) {
        console.error('Language detection error:', error);
        // Default to English on error
        return {
            language: 'en',
            confidence: 0.3
        };
    }
}

/**
 * Checks if the detected language is Arabic
 * @param text The text to check
 * @returns True if the text is detected as Arabic
 */
export function isArabic(text: string): boolean {
    // First do a simple check for Arabic characters
    if (/[\u0600-\u06FF]/.test(text)) {
        return true;
    }

    const result = detectLanguage(text);
    return result.language === 'ar';
}

/**
 * Gets the language name from a language code
 * @param langCode The ISO language code
 * @returns The full language name
 */
export function getLanguageName(langCode: string): string {
    const languages: Record<string, string> = {
        'ar': 'Arabic',
        'en': 'English',
        'fr': 'French',
        'es': 'Spanish',
        'de': 'German',
        'zh': 'Chinese',
        'ru': 'Russian',
        'ja': 'Japanese'
    };

    return languages[langCode] || 'Unknown';
} 