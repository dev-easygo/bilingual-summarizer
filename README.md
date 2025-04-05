# Bilingual Summarizer

A text summarization and analysis package for both Arabic and English content. It provides a comprehensive analysis of text including language detection, sentiment analysis, topic extraction, reading time estimation, and text summarization.

## Features

- Automatic language detection (Arabic, English, and other languages)
- Text summarization optimized for both Arabic and English
- Sentiment analysis
- Topic extraction
- Reading time calculation
- Text difficulty estimation
- HTML content handling (title and image extraction)

## Installation

```bash
# Using pnpm (recommended)
pnpm add bilingual-summarizer

# Using npm
npm install bilingual-summarizer

# Using yarn
yarn add bilingual-summarizer
```

## Usage

### Basic Usage

```typescript
import { summarize } from 'bilingual-summarizer';

// Simple example with plain text
const englishText = "This is a sample text in English that we want to summarize. It contains multiple sentences with different topics. The summarizer will extract the most important sentences and provide additional analysis like sentiment, topics, and reading time.";

const result = summarize(englishText);
console.log(result);
/*
{
  ok: true,
  sentiment: 0.2,
  topics: ['summarizer', 'sentences', 'sentiment', 'text', 'topics', 'English'],
  words: 35,
  difficulty: 0.43,
  minutes: 1,
  language: 'en',
  summary: "This is a sample text in English that we want to summarize. The summarizer will extract the most important sentences and provide additional analysis like sentiment, topics, and reading time."
}
*/

// Arabic text example
const arabicText = "هذا مثال لنص باللغة العربية نريد تلخيصه. يحتوي النص على عدة جمل بمواضيع مختلفة. سيقوم الملخص باستخراج أهم الجمل وتقديم تحليل إضافي مثل المشاعر والموضوعات ووقت القراءة.";

const arabicResult = summarize(arabicText);
console.log(arabicResult);
```

### Advanced Usage

```typescript
import { summarize, isArabic, extractTopics } from 'bilingual-summarizer';

// With HTML content
const htmlContent = `
<h1>Article Title</h1>
<p>First paragraph of the article with important information.</p>
<p>Second paragraph with less important details.</p>
<img src="https://example.com/image.jpg" />
<p>Third paragraph with key conclusions.</p>
`;

const result = summarize(htmlContent, {
  sentenceCount: 2,  // Control the number of sentences in the summary
  language: 'en'     // Force a specific language (optional)
});

// Using individual functions
const text = "Some text to analyze";
const isArabicText = isArabic(text);
const topics = extractTopics(text, 5); // Get top 5 topics
```

## API Reference

### Main Function

#### `summarize(content: string, options?: SummarizerOptions): SummarizerResult`

Summarizes and analyzes a given text, returning a comprehensive result object.

**Parameters:**
- `content`: String containing HTML or plain text to analyze
- `options`: (Optional) Configuration options
  - `title`: Custom title (will override any extracted title)
  - `sentenceCount`: Number of sentences to include in the summary
  - `language`: Force a specific language (ISO code, e.g., 'en', 'ar')

**Returns:**
An object containing:
- `ok`: Boolean indicating if the operation was successful
- `sentiment`: Numerical sentiment score (positive/negative)
- `title`: Extracted or provided title
- `topics`: Array of extracted topics
- `words`: Word count
- `difficulty`: Text complexity score (0-1)
- `minutes`: Estimated reading time in minutes
- `language`: Detected or provided language code
- `summary`: The generated summary
- `image`: URL of an image if one was found in the HTML content

### Utility Functions

The package also exports several utility functions for finer-grained control:

- `extractTopics(text: string, maxTopics?: number): string[]`
- `analyzeSentiment(text: string): SentimentResult`
- `detectLanguage(text: string): LanguageDetectionResult`
- `isArabic(text: string): boolean`
- `getLanguageName(langCode: string): string`
- `summarizeText(text: string, sentenceCount?: number): string`
- `calculateDifficulty(text: string): number`
- `cleanText(text: string): string`

## License

MIT 