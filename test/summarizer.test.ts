import { summarize, extractTopics, isArabic } from '../src';

describe('Summarizer', () => {
    describe('summarize function', () => {
        it('should return a valid result for English text', () => {
            const text = 'This is a test paragraph in English. It contains several sentences that should be analyzed. The summarizer should extract the most important information and return a summary along with metadata.';

            const result = summarize(text);

            expect(result.ok).toBe(true);
            expect(result.language).toBe('en');
            expect(result.topics.length).toBeGreaterThan(0);
            expect(result.words).toBeGreaterThan(0);
            expect(result.summary).toBeTruthy();
        });

        it('should return a valid result for Arabic text', () => {
            const text = 'هذا مثال لفقرة باللغة العربية. تحتوي على عدة جمل يجب تحليلها. يجب على الملخص استخراج أهم المعلومات وإرجاع ملخص مع البيانات الوصفية.';

            const result = summarize(text);

            expect(result.ok).toBe(true);
            expect(result.language).toBe('ar');
            expect(result.topics.length).toBeGreaterThan(0);
            expect(result.words).toBeGreaterThan(0);
            expect(result.summary).toBeTruthy();
        });

        it('should handle HTML content', () => {
            const html = `
        <h1>Test Article</h1>
        <p>This is a paragraph in an HTML document. It contains information that should be extracted.</p>
        <img src="https://example.com/image.jpg" />
        <p>Second paragraph with additional information.</p>
      `;

            const result = summarize(html);

            expect(result.ok).toBe(true);
            expect(result.title).toBe('Test Article');
            expect(result.image).toBe('https://example.com/image.jpg');
            expect(result.summary).toBeTruthy();
        });

        it('should respect custom options', () => {
            const text = 'This is a test paragraph. It has multiple sentences. Each with different information. The summarizer should respect the sentenceCount option.';

            const result = summarize(text, {
                sentenceCount: 2,
                title: 'Custom Title'
            });

            expect(result.title).toBe('Custom Title');
            // Count sentences in summary (roughly)
            const sentenceCount = result.summary.split(/[.!?]+/).filter(Boolean).length;
            expect(sentenceCount).toBeLessThanOrEqual(2);
        });
    });

    describe('utility functions', () => {
        it('should extract topics correctly', () => {
            const text = 'JavaScript is a programming language. TypeScript adds static typing to JavaScript.';

            const topics = extractTopics(text, 3);

            expect(topics.length).toBeLessThanOrEqual(3);
            expect(topics).toContain('JavaScript');
        });

        it('should detect Arabic text correctly', () => {
            const arabicText = 'هذا نص باللغة العربية';
            const englishText = 'This is English text';

            expect(isArabic(arabicText)).toBe(true);
            expect(isArabic(englishText)).toBe(false);
        });
    });
}); 