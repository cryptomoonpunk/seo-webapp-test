/**
 * server.js
 *
 * Minimal Node/Express server that serves:
 * - Static files in the "public" folder
 * - An /analyze endpoint that returns dummy JSON for demonstration
 */

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Enable CORS if your front-end runs on a different port
app.use(express.json());

// Serve static files from "public" folder
app.use(express.static("public"));

// Example /analyze route
app.get("/analyze", (req, res) => {
  const urlParam = req.query.url;
  if (!urlParam) {
    return res.status(400).json({ error: "No URL provided" });
  }

  // For demo, return dummy JSON
  // In reality, you'd fetch & parse the page at `urlParam` or run an SEO analysis
  const data = {
    text: "Sample text from " + urlParam,
    tfidf_terms: [
      { term: "seo", score: 10 },
      { term: "analysis", score: 8 }
    ],
    bigrams: ["seo analysis", "analysis example"],
    trigrams: ["seo analysis example"],
    competitor_keywords: ["competitor1", "competitor2"],
    google_trends: {
      "SEO": [
        { date: "2025-01-01", value: 50 },
        { date: "2025-01-02", value: 60 }
      ]
    },
    ai_suggestions: ["Optimize images", "Add structured data"]
  };

  res.json(data);
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});