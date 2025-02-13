// text_utils.js - Utility functions for text processing

function cleanText(text) {
    return text.replace(/[^\w\s]/gi, '').toLowerCase();
}

function extractWords(text) {
    return text.split(/\s+/).filter(word => word.length > 2);
}

module.exports = { cleanText, extractWords };