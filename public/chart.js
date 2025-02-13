<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI SEO Keyword Analyzer</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div class="container">
    <h1>🔍 AI SEO Keyword Analyzer</h1>
    
    <!-- Analysis Form -->
    <form id="analyzeForm">
      <input type="text" id="urlInput" placeholder="Enter a URL to analyze" required>
      <button type="submit" id="analyzeButton">Analyze</button>
    </form>

    <!-- Results Section -->
    <div id="results">
      <h2>Keyword Data</h2>
      
      <h3>🔷 Top Keywords</h3>
      <ul id="topKeywordsList"></ul>

      <h3>🔷 Bigrams</h3>
      <ul id="bigramsList"></ul>

      <h3>🔷 Trigrams</h3>
      <ul id="trigramsList"></ul>

      <h3>📊 Keyword Importance Chart</h3>
      <canvas id="keywordChart"></canvas>

      <h3>📉 Google Trends Data</h3>
      <div id="googleTrends"></div>

      <h3>🏆 Competitor Keywords</h3>
      <div id="competitorKeywords"></div>

      <h3>💡 AI-Powered Suggestions</h3>
      <div id="aiSuggestions"></div>

      <h3>🧠 NLP Analysis</h3>
      <div id="nlpAnalysis"></div>
    </div>
  </div>

  <!-- Load external scripts with defer so they run after the DOM is parsed -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="/script.js" defer></script>
</body>
</html>