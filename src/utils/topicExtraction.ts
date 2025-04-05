import { isArabic } from './languageDetection';

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
 * @param limit Optional limit for the number of topics to return
 * @returns An array of extracted topics
 */
export function extractTopics(text: string, limit?: number): string[] {
    try {
        if (!text || text.trim().length === 0) {
            return [];
        }

        // Set default limit if not provided
        const topicLimit = limit || 5;

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

        // Limit to top topics
        return foundTopics.slice(0, topicLimit);
    } catch (error) {
        console.error('Topic extraction error:', error);
        return [];
    }
}

/**
 * Suggests related topics based on the extracted topics
 * @param topics The already extracted topics
 * @returns An array of related topics
 */
export function suggestRelatedTopics(topics: string[]): string[] {
    try {
        if (!topics || topics.length === 0) {
            return [];
        }

        const allTopics = [...commonEnglishTopics, ...commonArabicTopics];

        // Simple related topics suggestion based on common co-occurrences
        // In a real-world scenario, this would use a more sophisticated algorithm
        const relatedMap: Record<string, string[]> = {
            'Technology': ['Programming', 'Web', 'Software', 'Data', 'AI'],
            'Science': ['Health', 'Environment', 'Technology', 'Data'],
            'Programming': ['JavaScript', 'Web', 'Development', 'Software'],
            'Business': ['Economy', 'Finance', 'Cryptocurrency'],
            // Add more mappings as needed
        };

        let related: string[] = [];

        // For each topic, add related topics
        topics.forEach(topic => {
            const topicKey = Object.keys(relatedMap).find(
                key => key.toLowerCase() === topic.toLowerCase()
            );

            if (topicKey && relatedMap[topicKey]) {
                related = [...related, ...relatedMap[topicKey]];
            }
        });

        // Filter out topics that are already in the main topics list
        const uniqueRelated = related.filter(topic =>
            !topics.some(t => t.toLowerCase() === topic.toLowerCase())
        );

        // Return up to 3 related topics
        return [...new Set(uniqueRelated)].slice(0, 3);
    } catch (error) {
        console.error('Related topics suggestion error:', error);
        return [];
    }
} 