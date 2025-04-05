import { isArabic } from './languageDetection';

// Create a fallback for the arajs module
let sanitize: (text: string) => string;
try {
    // Try to import arajs
    const arajs = require('arajs');
    sanitize = arajs.sanitize;
} catch (error) {
    // Create a mock if arajs is not available
    sanitize = (text: string) => text;
}

/**
 * Extracts the title from HTML content if available
 * @param htmlContent The HTML content
 * @returns The extracted title or undefined
 */
export function extractTitleFromHTML(htmlContent: string): string | undefined {
    try {
        // Look for common title patterns in the HTML
        const titleRegex = /<h1[^>]*>(.*?)<\/h1>|<title[^>]*>(.*?)<\/title>/i;
        const match = htmlContent.match(titleRegex);

        if (match) {
            const title = match[1] || match[2];
            return title ? cleanText(title) : undefined;
        }

        return undefined;
    } catch (error) {
        console.error('Error extracting title:', error);
        return undefined;
    }
}

/**
 * Finds potential image URLs in the HTML content
 * @param htmlContent The HTML content
 * @returns The first potential image URL or undefined
 */
export function extractImageFromHTML(htmlContent: string): string | undefined {
    try {
        // Look for image tags with src attributes
        const imgRegex = /<img[^>]+src="([^">]+)"/i;
        const match = htmlContent.match(imgRegex);

        if (match && match[1]) {
            return match[1];
        }

        return undefined;
    } catch (error) {
        console.error('Error extracting image:', error);
        return undefined;
    }
}

/**
 * Cleans and normalizes text based on its detected language
 * @param text The text to clean
 * @returns The cleaned text
 */
export function cleanText(text: string): string {
    // First check if text looks like HTML
    if (/<\/?[a-z][\s\S]*>/i.test(text)) {
        // Remove all HTML tags but preserve their content
        let cleaned = text.replace(/<style[^>]*>[\s\S]*?<\/style>|<script[^>]*>[\s\S]*?<\/script>|<(?!h1|h2|h3|h4|h5|h6|p|li|ul|ol)[^>]*>|<\/(?!h1|h2|h3|h4|h5|h6|p|li|ul|ol)[^>]*>/gi, '');

        // Preserve header and paragraph boundaries with spaces
        cleaned = cleaned.replace(/<\/(h1|h2|h3|h4|h5|h6|p|li)>/gi, '. ');
        cleaned = cleaned.replace(/<(br|hr)[^>]*>/gi, ' ');

        // Finally remove remaining tags
        cleaned = cleaned.replace(/<[^>]*>/g, ' ');

        // Handle HTML entities
        cleaned = cleaned.replace(/&nbsp;/g, ' ');
        cleaned = cleaned.replace(/&amp;/g, '&');
        cleaned = cleaned.replace(/&lt;/g, '<');
        cleaned = cleaned.replace(/&gt;/g, '>');
        cleaned = cleaned.replace(/&quot;/g, '"');
        cleaned = cleaned.replace(/&#39;/g, "'");

        // Replace multiple spaces with a single space
        cleaned = cleaned.replace(/\s+/g, ' ');

        // Remove special characters except for punctuation needed for NLP
        cleaned = cleaned.replace(/[^\p{L}\p{N}\p{P}\s]/gu, '');

        // Trim whitespace
        cleaned = cleaned.trim();

        // Apply Arabic-specific cleaning if needed
        if (isArabic(cleaned)) {
            cleaned = sanitizeArabicText(cleaned);
        }

        return cleaned;
    }

    // For non-HTML text
    // Remove special characters except for punctuation needed for NLP
    let cleaned = text.replace(/[^\p{L}\p{N}\p{P}\s]/gu, '');

    // Replace multiple spaces with a single space
    cleaned = cleaned.replace(/\s+/g, ' ');

    // Trim whitespace
    cleaned = cleaned.trim();

    // Apply Arabic-specific cleaning if needed
    if (isArabic(cleaned)) {
        cleaned = sanitizeArabicText(cleaned);
    }

    return cleaned;
}

/**
 * Applies Arabic-specific text sanitization
 * @param text The Arabic text to sanitize
 * @returns The sanitized text
 */
export function sanitizeArabicText(text: string): string {
    try {
        // Use arajs sanitize for Arabic text if available
        if (typeof sanitize === 'function') {
            return sanitize(text);
        }
        return text;
    } catch (error) {
        console.error('Error sanitizing Arabic text:', error);
        return text;
    }
}

/**
 * Extracts sentences from text
 * @param text The text to extract sentences from
 * @returns An array of sentences
 */
export function extractSentences(text: string): string[] {
    // Arabic sentence endings can be more complex, so we handle them specially
    if (isArabic(text)) {
        // Split on Arabic full stops, question marks, and exclamation marks
        return text.split(/[。؟!\.!\?]+/).filter(Boolean).map(s => s.trim());
    }

    // For English and other languages, use a more comprehensive regex
    return text.split(/(?<=[.!?])\s+/).filter(Boolean).map(s => s.trim());
} 