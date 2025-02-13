// text_utils.js
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

/**
 * Extract the main article content using Mozilla's readability
 */
export function extractMainContent(html) {
  const dom = new JSDOM(html, { url: 'https://example.com' });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();
  // If no main content found, fallback to entire body text
  return article?.textContent || dom.window.document.body.textContent || '';
}

/**
 * Basic cleaning: remove extra spaces, newlines, etc.
 */
export function cleanText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Build a simple word frequency map from cleaned text
 */
export function getWordFrequency(text) {
  const freq = {};
  const words = text.toLowerCase().split(/\s+/);
  for (const w of words) {
    if (!freq[w]) freq[w] = 0;
    freq[w]++;
  }
  return freq;
}