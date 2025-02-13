// public/script.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM Loaded & Script Running");

  const analyzeButton = document.getElementById("analyzeButton");
  const urlInput = document.getElementById("urlInput");
  const resultsDiv = document.getElementById("results");

  if (!analyzeButton || !urlInput || !resultsDiv) {
    console.error("❌ Critical elements not found in DOM.");
    return;
  }

  // In-memory cache to store analysis results by URL
  const cache = {};

  // Debounce helper to delay function calls (prevents multiple rapid requests)
  function debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // Validate if the input is a proper URL
  function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Fetch analysis data; use cached data if available
  async function fetchAnalysis(url) {
    if (cache[url]) {
      console.log("✅ Using cached data");
      return cache[url];
    }
    const response = await fetch(`/analyze?url=${encodeURIComponent(url)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    cache[url] = data;
    return data;
  }

  // Create a helper function to create a section with a list of data
  function createSection(title, data, formatFn = item => item, description = "") {
    if (!data || !data.length) return null;
    const section = document.createElement("section");
    const heading = document.createElement("h2");
    heading.textContent = title;
    section.appendChild(heading);

    // If a description is provided, add it below the heading
    if (description) {
      const descPara = document.createElement("p");
      descPara.textContent = description;
      descPara.style.fontSize = "0.9rem";
      descPara.style.color = "#666";
      descPara.style.marginBottom = "10px";
      section.appendChild(descPara);
    }

    const list = document.createElement("ul");
    data.forEach(item => {
      const li = document.createElement("li");
      li.textContent = formatFn(item);
      list.appendChild(li);
    });
    section.appendChild(list);
    return section;
  }

  // Build the Summary section with key metrics
  function createSummarySection(data) {
    const section = document.createElement("section");
    section.classList.add("summary-section");
    const heading = document.createElement("h2");
    heading.textContent = "Summary";
    section.appendChild(heading);

    const descPara = document.createElement("p");
    descPara.textContent = "A quick overview of the key SEO metrics derived from your content.";
    descPara.style.fontSize = "0.9rem";
    descPara.style.color = "#666";
    descPara.style.marginBottom = "10px";
    section.appendChild(descPara);

    const list = document.createElement("ul");

    if (data.tfidf_terms && data.tfidf_terms.length) {
      const topTerm = data.tfidf_terms[0];
      const tfidfItem = document.createElement("li");
      tfidfItem.textContent = `Top TF-IDF Term: ${topTerm.term} (Score: ${topTerm.score})`;
      list.appendChild(tfidfItem);
    }

    const bigramsCount = data.bigrams ? data.bigrams.length : 0;
    const trigramsCount = data.trigrams ? data.trigrams.length : 0;
    const competitorCount = data.competitor_keywords ? data.competitor_keywords.length : 0;
    const trendsCount = data.google_trends ? Object.keys(data.google_trends).length : 0;
    const aiCount = data.ai_suggestions ? data.ai_suggestions.length : 0;

    const counts = [
      `Bigrams Available: ${bigramsCount}`,
      `Trigrams Available: ${trigramsCount}`,
      `Competitor Keywords: ${competitorCount}`,
      `Google Trends Categories: ${trendsCount}`,
      `AI Suggestions: ${aiCount}`
    ];

    counts.forEach(text => {
      const li = document.createElement("li");
      li.textContent = text;
      list.appendChild(li);
    });

    section.appendChild(list);
    return section;
  }

  // Display the analysis data
  function displayAnalysis(data) {
    // Clear previous results
    resultsDiv.innerHTML = "";

    // Create a fragment to batch DOM changes
    const fragment = document.createDocumentFragment();

    // Summary
    const summarySection = createSummarySection(data);
    if (summarySection) fragment.appendChild(summarySection);

    // TF-IDF Terms
    const tfidfDesc = "These are the most significant terms based on their TF-IDF scores.";
    const tfidfSection = createSection("TF-IDF Terms", data.tfidf_terms, item => `${item.term}: ${item.score}`, tfidfDesc);
    if (tfidfSection) fragment.appendChild(tfidfSection);

    // Bigrams
    const bigramsDesc = "Common two-word combinations extracted from your content.";
    const bigramsSection = createSection("Bigrams", data.bigrams, undefined, bigramsDesc);
    if (bigramsSection) fragment.appendChild(bigramsSection);

    // Trigrams
    const trigramsDesc = "Common three-word combinations extracted from your content.";
    const trigramsSection = createSection("Trigrams", data.trigrams, undefined, trigramsDesc);
    if (trigramsSection) fragment.appendChild(trigramsSection);

    // Google Trends
    // If you have Chart.js loaded, you can use createGoogleTrendsSection. Otherwise, just show them as a list
    if (data.google_trends && Object.keys(data.google_trends).length > 0) {
      const trendsSection = document.createElement("section");
      const heading = document.createElement("h2");
      heading.textContent = "Google Trends";
      trendsSection.appendChild(heading);

      const descPara = document.createElement("p");
      descPara.textContent = "Visual representations of trending search data over time.";
      descPara.style.fontSize = "0.9rem";
      descPara.style.color = "#666";
      descPara.style.marginBottom = "10px";
      trendsSection.appendChild(descPara);

      Object.entries(data.google_trends).forEach(([trendKey, trendData]) => {
        const subHeading = document.createElement("h3");
        subHeading.textContent = trendKey;
        trendsSection.appendChild(subHeading);

        const list = document.createElement("ul");
        trendData.forEach(item => {
          const li = document.createElement("li");
          li.textContent = `${item.date}: ${item.value}`;
          list.appendChild(li);
        });
        trendsSection.appendChild(list);
      });

      fragment.appendChild(trendsSection);
    }

    // Competitor Keywords
    const competitorDesc = "Keywords your competitors are using.";
    const competitorSection = createSection("Competitor Keywords", data.competitor_keywords, undefined, competitorDesc);
    if (competitorSection) fragment.appendChild(competitorSection);

    // AI Suggestions
    const aiDesc = "AI-generated suggestions to improve your SEO.";
    const aiSection = createSection("AI Suggestions", data.ai_suggestions, undefined, aiDesc);
    if (aiSection) fragment.appendChild(aiSection);

    // Append everything
    resultsDiv.appendChild(fragment);
  }

  // Debounced analyze function
  function debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  const debouncedAnalyze = debounce(async () => {
    const url = urlInput.value.trim();
    if (!url || !isValidUrl(url)) {
      alert("⚠️ Please enter a valid URL.");
      return;
    }
    analyzeButton.disabled = true;
    console.log(`🔍 Fetching analysis for: ${url}`);
    resultsDiv.innerHTML = `<p>⏳ Loading analysis...</p>`;

    try {
      const data = await fetchAnalysis(url);
      console.log("✅ Analysis data received:", data);
      displayAnalysis(data);
    } catch (error) {
      console.error("❌ Error fetching analysis:", error);
      resultsDiv.innerHTML = `<p>❌ Error loading analysis. Please try again later.</p>`;
    } finally {
      analyzeButton.disabled = false;
    }
  }, 300);

  analyzeButton.addEventListener("click", debouncedAnalyze);

  // Helper: Validate URL
  function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Helper: Cache to avoid repeated calls
  const cache = {};
  async function fetchAnalysis(url) {
    if (cache[url]) {
      console.log("✅ Using cached data");
      return cache[url];
    }
    const response = await fetch(`/analyze?url=${encodeURIComponent(url)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    cache[url] = data;
    return data;
  }
});