import { summarize } from '../index';

// Example with English text
const englishText = `
Natural language processing (NLP) is a subfield of linguistics, computer science, and artificial intelligence concerned with the interactions between computers and human language, in particular how to program computers to process and analyze large amounts of natural language data.

The goal is a computer capable of "understanding" the contents of documents, including the contextual nuances of the language within them. The technology can then accurately extract information and insights contained in the documents as well as categorize and organize the documents themselves.

Challenges in natural language processing frequently involve speech recognition, natural language understanding, and natural language generation.
`;

console.log("=== English Text Analysis ===");
const englishResult = summarize(englishText);
console.log(JSON.stringify(englishResult, null, 2));

// Example with Arabic text
const arabicText = `
معالجة اللغة الطبيعية (NLP) هي مجال فرعي من اللسانيات وعلوم الكمبيوتر والذكاء الاصطناعي يهتم بالتفاعلات بين أجهزة الكمبيوتر واللغة البشرية، وبشكل خاص كيفية برمجة أجهزة الكمبيوتر لمعالجة وتحليل كميات كبيرة من بيانات اللغة الطبيعية.

والهدف هو كمبيوتر قادر على "فهم" محتويات الوثائق، بما في ذلك الفروق الدقيقة السياقية للغة التي تحتويها. يمكن للتكنولوجيا بعد ذلك استخراج المعلومات والرؤى الواردة في الوثائق بدقة بالإضافة إلى تصنيف وتنظيم الوثائق نفسها.

غالبًا ما تتضمن التحديات في معالجة اللغة الطبيعية التعرف على الكلام وفهم اللغة الطبيعية وتوليد اللغة الطبيعية.
`;

console.log("\n=== Arabic Text Analysis ===");
const arabicResult = summarize(arabicText);
console.log(JSON.stringify(arabicResult, null, 2));

// Example with HTML content
const htmlContent = `
<h1>What is Natural Language Processing?</h1>
<img src="https://example.com/nlp-image.jpg" alt="NLP Concept" />
<p>Natural Language Processing (NLP) is a branch of artificial intelligence that helps computers understand, interpret and manipulate human language.</p>
<p>NLP draws from many disciplines, including computer science and computational linguistics.</p>
<p>Current approaches to NLP are based on machine learning, especially deep learning neural networks.</p>
`;

console.log("\n=== HTML Content Analysis ===");
const htmlResult = summarize(htmlContent);
console.log(JSON.stringify(htmlResult, null, 2));

// Example with custom options
console.log("\n=== Analysis with Custom Options ===");
const customResult = summarize(englishText, {
    sentenceCount: 1,
    title: "Custom NLP Overview"
});
console.log(JSON.stringify(customResult, null, 2)); 