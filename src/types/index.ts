export interface SummarizerOptions {
    title?: string;
    sentenceCount?: number;
    language?: string;
}

export interface SummarizerResult {
    ok: boolean;
    sentiment: number;
    title?: string;
    topics: string[];
    words: number;
    difficulty: number;
    minutes: number;
    language: string;
    summary: string;
    image?: string;
}

export interface ResponseStructureObject {
    include?: string[];
    exclude?: string[];
}

export interface GeminiConfig {
    apiKey: string;
    model?: string;
    temperature?: number;
    maxOutputTokens?: number;
}

export interface SummarizeOptions {
    title?: string;
    sentenceCount: number;
    includeTitleFromContent: boolean;
    includeImage: boolean;
    minLength: number;
    maxLength: number;
    responseStructure?: string[] | ResponseStructureObject | null;
    gemini?: GeminiConfig | null;
    useAI?: boolean;
}

export interface SummaryResult {
    ok: boolean;
    title?: string;
    summary: string;
    language: string;
    languageName?: string;
    sentiment: string;
    topics: string[];
    relatedTopics?: string[];
    words: number;
    sentences?: number;
    readingTime: number;
    difficulty: string;
    image?: string;
    error?: string;
    message?: string;
}

export interface Topic {
    term: string;
    score: number;
}

export interface Sentence {
    text: string;
    score: number;
    index: number;
}

export interface LanguageDetectionResult {
    language: string;
    confidence: number;
}

export interface SentimentResult {
    score: number;
    comparative: number;
}

export interface ReadingTimeResult {
    text: string;
    minutes: number;
    time: number;
    words: number;
} 