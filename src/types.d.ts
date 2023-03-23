declare enum FetchMethod {
    GET = "GET",
    POST = "POST",
}

interface FetchOptions {
    method: FetchMethod;
    headers: Record<string, string>;
    body?: string;
}

/**
 * The format of JSON response from GPTZero
 */
interface GPTZeroResponse {
    documents: DocumentPrediction[];
}

interface DocumentPrediction {
    average_generated_prob: number;
    completely_generated_prob: number;
    overall_burstiness: number;
    paragraphs: ParagraphResult[];
    sentences: SentenceResult[];
}

/**
 * GPTZero's evaluation on the performance of a paragraph
 */
interface ParagraphResult {
    completely_generated_prob: number;
    start_sentence_index: number;
    num_sentences: number;
}

/**
 * GPTZero's evaluation on a sentence's performance
 */
interface SentenceResult {
    generated_prob: number;
    perplexity: number;
    sentence: string;
}