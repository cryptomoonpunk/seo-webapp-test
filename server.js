/**
 * server.js
 *
 * A Node/Express server that:
 * 1) Serves static files in the "public" folder (your index.html, script.js)
 * 2) Provides an /analyze endpoint to fetch, parse, and analyze a user-supplied URL
 * 3) Returns JSON data with:
 *    - Cleaned frequency analysis (stopwords + punctuation removed)
 *    - Bigrams & trigrams sorted by frequency
 *    - Basic placeholders for competitor_keywords, google_trends, ai_suggestions
 */

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");

// Expanded stopword list, including "free", "account", "dont", "try", etc.
const STOPWORDS = new Set([
  "the","and","for","you","your","with","that","from","this","are","was","have","will",
  "been","would","could","should","they","their","there","some","very","just","like",
  "such","than","into","over","also","those","these","here","what","when","where",
  "which","while","about","more","much","many","any","has","had","were","did","does",
  "done","our","can","not","all","too","who","its","it's","only","because","let's",
  "out","via","etc","any","use","then","once","after","before","being","every","http",
  "free","account","dont","try","miss","products","click","advertising","marketing",
  "else","some","still","either","them","him","her","also","couldnt","shouldnt"
]);

const app = express();
const PORT = 3000;

// If your front-end is on a different port, use CORS
app.use(cors());

// Serve static files from "public" folder
app.use(express.static("public"));

// Basic route to confirm server is running
app.get("/", (req, res) => {
  res.send("Hello from Node server! Visit /analyze?url=...");
});

/**
 * GET /analyze?url=<someUrl>
 * 1) Fetch the HTML from <someUrl>
 * 2) Parse it with Cheerio
 * 3) Remove script/style/noscript + optional header/footer nav
 * 4) Clean and tokenize text (punctuation removal, stopword filtering)
 * 5) Build frequency, bigrams, trigrams, sorted by frequency
 * 6) Return JSON data
 */
app.get("/analyze", async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "No URL provided" });
  }

  try {
    console.log(`🔍 Fetching URL: ${url}`);
    const response = await axios.get(url);
    const html = response.data;

    // Parse with Cheerio
    const $ = cheerio.load(html);

    // Remove script, style, noscript
    $("script, style, noscript").remove();
    // Optional: remove nav, header, footer for even cleaner text
    // $("header, footer, nav").remove();

    // Extract text from body
    const rawText = $("body").text() || "";
    // Clean whitespace
    const cleanedText = rawText.replace(/\s+/g, " ").trim();

    // Tokenize
    let tokens = cleanedText
      .split(" ")
      .map(t => t.toLowerCase())
      // Remove punctuation, keep only letters/digits
      .map(t => t.replace(/[^\p{L}\p{N}]+/gu, ""))
      .filter(t => t.length > 2)
      .filter(t => !STOPWORDS.has(t));

    // Frequency map
    const freqMap = {};
    tokens.forEach(token => {
      freqMap[token] = (freqMap[token] || 0) + 1;
    });

    // Convert freqMap to array, sort descending
    let tfidf_terms = Object.entries(freqMap).map(([term, score]) => ({ term, score }));
    tfidf_terms.sort((a, b) => b.score - a.score);
    tfidf_terms = tfidf_terms.slice(0, 20);

    // Bigrams with frequency
    const bigramsFreq = {};
    for (let i = 0; i < tokens.length - 1; i++) {
      const bg = tokens[i] + " " + tokens[i + 1];
      bigramsFreq[bg] = (bigramsFreq[bg] || 0) + 1;
    }
    // Convert to array, sort descending by freq
    let bigramsArr = Object.entries(bigramsFreq).map(([bg, freq]) => ({ bg, freq }));
    bigramsArr.sort((a, b) => b.freq - a.freq);
    bigramsArr = bigramsArr.slice(0, 10).map(obj => obj.bg);

    // Trigrams with frequency
    const trigramsFreq = {};
    for (let i = 0; i < tokens.length - 2; i++) {
      const tg = tokens[i] + " " + tokens[i + 1] + " " + tokens[i + 2];
      trigramsFreq[tg] = (trigramsFreq[tg] || 0) + 1;
    }
    let trigramsArr = Object.entries(trigramsFreq).map(([tg, freq]) => ({ tg, freq }));
    trigramsArr.sort((a, b) => b.freq - a.freq);
    trigramsArr = trigramsArr.slice(0, 10).map(obj => obj.tg);

    // Example placeholders
    const competitor_keywords = ["competitor1", "competitor2"];
    const google_trends = {
      "SEO": [
        { date: "2025-01-01", value: 50 },
        { date: "2025-01-02", value: 60 }
      ]
    };
    const ai_suggestions = ["Add structured data", "Improve page speed"];

    // Build final JSON
    const data = {
      text: cleanedText.slice(0, 200) + "...",
      tfidf_terms,
      bigrams: bigramsArr,
      trigrams: trigramsArr,
      competitor_keywords,
      google_trends,
      ai_suggestions
    };

    res.json(data);
  } catch (err) {
    console.error("❌ Error analyzing URL:", err.message);
    res.status(500).json({ error: "Failed to analyze URL." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});