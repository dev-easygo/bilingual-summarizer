# Bilingual Summarizer

A powerful text summarization package for Arabic and English content that provides sentiment analysis, topic extraction, and more.

## Features

- **Bilingual Support**: Works with both Arabic and English text
- **Advanced Arabic Processing**: Specialized algorithms for Arabic text summarization
- **HTML Support**: Extract titles and meaningful content from HTML documents
- **Sentiment Analysis**: Determine the sentiment of the text (positive, negative, neutral)
- **Topic Extraction**: Identify the main topics discussed in the text
- **Reading Time Estimation**: Calculate estimated reading time

## Installation

```bash
npm install bilingual-summarizer
```

Or using yarn:

```bash
yarn add bilingual-summarizer
```

## Basic Usage

```javascript
const { summarize } = require('bilingual-summarizer');

// Summarize English text
const englishResult = summarize('Your English text here. It can be multiple sentences with various topics.');

// Summarize Arabic text
const arabicResult = summarize('النص العربي الخاص بك هنا. يمكن أن يكون جملًا متعددة بمواضيع مختلفة.');

console.log(englishResult);
// {
//   ok: true,
//   title: '',
//   summary: '...',
//   language: 'en',
//   languageName: 'English',
//   sentiment: 'neutral',
//   topics: ['...'],
//   relatedTopics: ['...'],
//   words: 12,
//   sentences: 2,
//   readingTime: 1,
//   difficulty: 'easy'
// }
```

## Advanced Arabic Summarization

This package includes specialized support for Arabic text using advanced NLP techniques:

```javascript
const { summarizeArabic } = require('bilingual-summarizer');

// Use the dedicated Arabic summarizer
const summary = summarizeArabic('النص العربي الذي تريد تلخيصه هنا.', 3);
console.log(summary); // Returns a concise summary with 3 sentences
```

For even better Arabic text processing, you can install optional dependencies:

```bash
npm install @iamtung/camel-tools farasa
```

These libraries will be automatically used when available to improve Arabic summarization quality.

## API Reference

### summarize(text, options)

Analyze and summarize the provided text.

**Parameters:**
- `text` (string): The text to summarize.
- `options` (object, optional): Configuration options.
  - `sentenceCount` (number): Number of sentences in the summary (default: 5).
  - `title` (string): Custom title for the summary.
  - `includeTitleFromContent` (boolean): Extract title from HTML content if available (default: true).
  - `includeImage` (boolean): Extract image URL from HTML content if available (default: true).

**Returns:** An object with the following properties:
- `ok` (boolean): Whether the summarization was successful.
- `title` (string): Title of the content (extracted or provided).
- `summary` (string): The summarized text.
- `language` (string): Detected language code.
- `languageName` (string): Full name of the detected language.
- `sentiment` (string): 'positive', 'negative', or 'neutral'.
- `topics` (array): List of detected topics.
- `relatedTopics` (array): List of related topics.
- `words` (number): Word count of the original text.
- `sentences` (number): Sentence count of the original text.
- `readingTime` (number): Estimated reading time in minutes.
- `difficulty` (string): 'easy', 'medium', or 'hard'.
- `image` (string, optional): URL of the extracted image if available.

### summarizeArabic(text, sentenceCount)

Directly summarize Arabic text using specialized techniques.

**Parameters:**
- `text` (string): The Arabic text to summarize.
- `sentenceCount` (number, optional): Number of sentences in the summary (default: 5).

**Returns:** A summarized version of the input text.

## References

This package implements techniques from academic research on Arabic text summarization:

- Modified PageRank algorithm for Arabic text (Ahmed Soliman, 2019)
- Advanced morphological analysis for Arabic text
- Specialized keyword extraction for Arabic content

## License

MIT 