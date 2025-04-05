# Bilingual Summarizer

A powerful text summarization package for Arabic and English content that provides sentiment analysis, topic extraction, and more.

## Features

- **Bilingual Support**: Works with both Arabic and English text
- **Advanced Arabic Processing**: Specialized algorithms for Arabic text summarization
- **HTML Support**: Extract titles and meaningful content from HTML documents
- **Sentiment Analysis**: Determine the sentiment of the text (positive, negative, neutral)
- **Topic Extraction**: Identify the main topics discussed in the text
- **Reading Time Estimation**: Calculate estimated reading time
- **Customizable Response**: Control which fields are included in the response
- **Google Gemini AI Integration**: Optional high-quality summaries using Google's Gemini models
- **Complete Sentence Guarantee**: Ensures all generated summaries contain grammatically complete sentences

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
const englishResult = await summarize('Your English text here. It can be multiple sentences with various topics.');

// Summarize Arabic text
const arabicResult = await summarize('النص العربي الخاص بك هنا. يمكن أن يكون جملًا متعددة بمواضيع مختلفة.');

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

## Using Google Gemini AI for Summaries

For enhanced summarization quality, you can use Google's Gemini AI models. This requires an API key from [Google AI Studio](https://ai.google.dev/).

```javascript
const { summarize } = require('bilingual-summarizer');

// Summarize using Gemini AI
const result = await summarize('Your text to summarize here.', {
  useAI: true,
  gemini: {
    apiKey: 'YOUR_GEMINI_API_KEY', // Required
    model: 'gemini-1.5-flash',     // Optional, defaults to gemini-1.5-flash
    temperature: 0.2,              // Optional, controls creativity (0.0-1.0)
    maxOutputTokens: 800,          // Optional, limits response length
    objective: true                // Optional, defined in the interface but not currently implemented in the prompt
  }
});

console.log(result);
```

The AI summarization uses a specialized prompt designed for both Arabic and English text. The current prompt format instructs the model to act as a professional linguist in the detected language, creating a brief summary with complete sentences. The prompt is provided in English regardless of the input language, as Gemini models have strong multilingual capabilities.

The prompt structure is:
```
Context:  
You are a professional linguist in the [detected language]. Your task is to create a brief summary of articles and posts in a paragraph containing no more than [N] complete sentences.

Instructions:  
Analyze the text carefully. Do not use bullet points or numbered lists. Provide a unique, complete summary as your answer, and ensure it is written in the [detected language].

Input:  
The text to summarize is:  
[Original text]
```

You can also directly use the Gemini AI summarizer:

```javascript
const { summarizeWithAI } = require('bilingual-summarizer');

const summary = await summarizeWithAI('Your text to summarize.', 3, {
  apiKey: 'YOUR_GEMINI_API_KEY',
  objective: true // Optional, defined in the interface but not currently implemented in the prompt
});

console.log(summary); // AI-generated summary with 3 sentences
```

### OpenAI Compatibility (Alternative Method)

If you prefer, you can also use the OpenAI library with Gemini models by setting the base URL. This approach might be useful if you're transitioning from OpenAI to Gemini:

```javascript
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: "YOUR_GEMINI_API_KEY",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

const response = await openai.chat.completions.create({
    model: "gemini-1.5-flash",
    messages: [
        { role: "system", content: "You are a summarization assistant." },
        { role: "user", content: "Summarize the following text: " + yourText },
    ],
});

console.log(response.choices[0].message.content);
```

## Customizing Response Structure

You can specify which fields you want to include in the response using the `responseStructure` option. It supports three formats:

### 1. Array Format (Include Only)

```javascript
const { summarize } = require('bilingual-summarizer');

// Only include specific fields in the response
const result = await summarize('Your text to summarize here.', {
  responseStructure: ['summary', 'language', 'sentiment']
});

console.log(result);
// {
//   ok: true, // 'ok' is always included unless explicitly excluded
//   summary: '...',
//   language: 'en',
//   sentiment: 'neutral'
// }
```

### 2. Object with Include Option

```javascript
const result = await summarize('Your text to summarize here.', {
  responseStructure: {
    include: ['summary', 'language', 'sentiment']
  }
});

// Result is the same as the array format
```

### 3. Object with Exclude Option

```javascript
const result = await summarize('Your text to summarize here.', {
  responseStructure: {
    exclude: ['topics', 'relatedTopics', 'difficulty']
  }
});

// Returns all fields except the excluded ones
```

Note: You cannot use both `include` and `exclude` options simultaneously in the same request. Doing so will throw an error.

## Advanced Arabic Summarization

This package includes specialized support for Arabic text summarization:

```javascript
const { summarizeArabic } = require('bilingual-summarizer');

// Use the dedicated Arabic summarizer
const summary = summarizeArabic('النص العربي الذي تريد تلخيصه هنا.', 3);
console.log(summary); // Returns a concise summary with 3 sentences
```

### Optional Arabic NLP Libraries

For enhanced Arabic text processing, the package attempts to use several Arabic NLP libraries if they're available. The built-in Arabic processing will work well without these libraries, but they can enhance the results.

If you want to try optional Arabic NLP enhancements, you can install these packages:

```bash
npm install arabic-nlp@0.0.4 @flowdegree/arabic-strings arabic-persian-reshaper
```

Each library provides different capabilities:
- `arabic-nlp`: Basic Arabic natural language processing utilities
- `@flowdegree/arabic-strings`: Enhanced Arabic string manipulation and processing
- `arabic-persian-reshaper`: Helps with proper rendering of Arabic characters (using either PersianShaper.convertArabic or ArabicShaper.convertArabic methods)

The package is designed to work even without these optional dependencies - it will automatically fall back to basic Arabic processing methods if the libraries aren't available.

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
  - `responseStructure` (array | object): Control the response format:
    - As an array: Fields to include (e.g., `['summary', 'language', 'sentiment']`)
    - As an object: With either `include` or `exclude` property (e.g., `{include: ['summary']}` or `{exclude: ['topics']}`)
  - `useAI` (boolean): Whether to use Google Gemini AI for summarization (default: false).
  - `gemini` (object): Configuration for Gemini AI (required if `useAI` is true):
    - `apiKey` (string): Your Gemini API key from Google AI Studio.
    - `model` (string): The Gemini model to use (default: 'gemini-1.5-flash').
    - `temperature` (number): Controls creativity in the output (default: 0.2).
    - `maxOutputTokens` (number): Limits response length (default: 800).
    - `objective` (boolean): Defined in the interface for future implementation (not currently used).

**Returns:** A Promise that resolves to an object with the following properties (unless filtered by responseStructure):
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

### summarizeWithAI(text, sentenceCount, geminiConfig)

Directly summarize text using Google's Gemini AI models.

**Parameters:**
- `text` (string): The text to summarize.
- `sentenceCount` (number, optional): Number of sentences in the summary (default: 5).
- `geminiConfig` (object): Configuration for Gemini AI:
  - `apiKey` (string): Your Gemini API key from Google AI Studio (required).
  - `model` (string): The Gemini model to use (default: 'gemini-1.5-flash').
  - `temperature` (number): Controls creativity in the output (default: 0.2).
  - `maxOutputTokens` (number): Limits response length (default: 800).
  - `objective` (boolean): Defined in the interface for future implementation (not currently used).

**Returns:** A Promise that resolves to the AI-generated summary.

## Getting a Gemini API Key

To use the Gemini AI features:

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Create an account or sign in with your Google account
3. Navigate to the API keys section
4. Create a new API key
5. Copy the key and use it in your application

## Available Gemini Models

Gemini offers several models with different capabilities and performance characteristics:

- `gemini-1.5-flash`: Fastest model, good for most summarization tasks
- `gemini-1.5-pro`: More powerful model for complex tasks
- `gemini-1.0-pro`: Previous generation model
- `gemini-1.0-pro-vision`: For processing images and text (if needed for future features)

For the latest model names and capabilities, see the [Gemini documentation](https://ai.google.dev/models/gemini).

## Troubleshooting

### Arabic Libraries Messages

If you see the message:
```
Note: No specialized Arabic NLP libraries found. Using basic Arabic processing.
```

Don't worry - this is normal and does not affect functionality. The package has built-in basic Arabic processing that works well for most cases.

If you see 404 errors when installing optional Arabic libraries:
```
GET https://registry.npmjs.org/arabicjs - 404
```

This is because some of the Arabic NLP packages suggested may no longer be available or maintained. The package is designed to work without these libraries. You can safely ignore these errors, or try installing one of the other suggested libraries.

### Gemini API Errors

If you encounter errors with Gemini API integration:
1. Make sure your API key is valid and hasn't expired
2. Check that you're using a correct model name (model names may change over time)
3. Verify your internet connection
4. The package will automatically fall back to regular summarization if Gemini is unavailable

## References

This package implements techniques from academic research on Arabic text summarization:

- Modified PageRank algorithm for Arabic text (Ahmed Soliman, 2019)
- Advanced morphological analysis for Arabic text
- Specialized keyword extraction for Arabic content

## License

MIT 