/**
 * server.js
 *
 * A Node/Express server that:
 * 1) Serves static files in the "public" folder (index.html, script.js)
 * 2) Provides an /analyze endpoint to fetch, parse, and analyze a user-supplied URL
 * 3) Cleans out marketing text, placeholders, short tokens, punctuation, and known junk phrases
 * 4) Returns JSON data with frequency-based terms, bigrams, trigrams
 */

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");

// Stopword list: combine English + marketing/junk words
const STOPWORDS = new Set([
  // Basic English
  "the","and","for","you","your","with","that","from","this","are","was","have","will",
  "been","would","could","should","they","their","there","some","very","just","like",
  "such","than","into","over","also","those","these","here","what","when","where",
  "which","while","about","more","much","many","any","has","had","were","did","does",
  "done","our","can","not","all","too","who","its","it's","only","because","let's",
  "out","via","etc","any","use","then","once","after","before","being","every","http",
  "else","some","still","either","them","him","her","couldnt","shouldnt","com","www",
  "https","paid","also","some","etc","www","dont","try","miss","products",
  // Marketing or leftover words
  "free","account","advertising","marketing","model","cpc","cost","click",
  "featurespricingapp","centerenterprisesemrushblogcreate","accountdont","freecreate",
  "accountmarketing","advertisingbenefits","semrush"
]);

// For lines that contain known junk phrases:
const noiseKeywords = [
  "featurespricingapp",
  "centerenterprisesemrushblogcreate",
  "accountdont",
  "freecreate",
  "accountmarketing",
  "advertisingbenefits",
  "modelsemrush"
];

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Hello from Node server! Visit /analyze?url=...");
});

/**
 * GET /analyze?url=<someUrl>
 * 1) Fetch the HTML
 * 2) Remove script/style/noscript + optional header/footer/nav
 * 3) Remove lines with known noise
 * 4) Tokenize + remove punctuation/short tokens/stopwords
 * 5) Build freq, bigrams, trigrams (sorted by freq)
 * 6) Final pass: remove bigrams/trigrams containing noise
 * 7) Return JSON
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
    const $ = cheerio.load(html);

    // Remove script, style, noscript
    $("script, style, noscript").remove();
    // Optional: remove nav, header, footer if you want
    // $("header, footer, nav").remove();

    // Extract text from <body>
    const rawText = $("body").text() || "";
    // Split into lines, remove empty lines
    let lines = rawText.split("\n").map(line => line.trim()).filter(line => line.length > 0);

    // Remove lines containing known noise keywords
    lines = lines.filter(line => {
      const lowerLine = line.toLowerCase();
      return !noiseKeywords.some(keyword => lowerLine.includes(keyword));
    });

    // Join lines back into one big text
    let cleanedText = lines.join(" ");
    cleanedText = cleanedText.replace(/\s+/g, " ").trim();

    // Tokenize
    let tokens = cleanedText
      .split(" ")
      .map(t => t.toLowerCase())
      // Keep letters/digits, remove punctuation
      .map(t => t.replace(/[^\p{L}\p{N}]+/gu, ""))
      .filter(t => t.length > 2)
      .filter(t => !STOPWORDS.has(t));

    // Frequency
    const freqMap = {};
    tokens.forEach(token => {
      freqMap[token] = (freqMap[token] || 0) + 1;
    });
    let tfidf_terms = Object.entries(freqMap).map(([term, score]) => ({ term, score }));
    // Sort descending
    tfidf_terms.sort((a, b) => b.score - a.score);
    tfidf_terms = tfidf_terms.slice(0, 20);

    // Bigrams
    const bigramsFreq = {};
    for (let i = 0; i < tokens.length - 1; i++) {
      const bg = tokens[i] + " " + tokens[i + 1];
      bigramsFreq[bg] = (bigramsFreq[bg] || 0) + 1;
    }
    let bigramsArr = Object.entries(bigramsFreq).map(([bg, freq]) => ({ bg, freq }));
    bigramsArr.sort((a, b) => b.freq - a.freq);
    bigramsArr = bigramsArr.slice(0, 10);

    // Trigrams
    const trigramsFreq = {};
    for (let i = 0; i < tokens.length - 2; i++) {
      const tg = tokens[i] + " " + tokens[i + 1] + " " + tokens[i + 2];
      trigramsFreq[tg] = (trigramsFreq[tg] || 0) + 1;
    }
    let trigramsArr = Object.entries(trigramsFreq).map(([tg, freq]) => ({ tg, freq }));
    trigramsArr.sort((a, b) => b.freq - a.freq);
    trigramsArr = trigramsArr.slice(0, 10);

    // Final pass: remove bigrams/trigrams containing known noise
    bigramsArr = bigramsArr.filter(obj => {
      return !noiseKeywords.some(junk => obj.bg.includes(junk));
    });
    trigramsArr = trigramsArr.filter(obj => {
      return !noiseKeywords.some(junk => obj.tg.includes(junk));
    });

    // Convert bigrams/trigrams back to string arrays for front-end
    const bigrams = bigramsArr.map(obj => obj.bg);
    const trigrams = trigramsArr.map(obj => obj.tg);

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
      bigrams,
      trigrams,
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