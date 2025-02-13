import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { extractMainContent, cleanText, getWordFrequency } from './text_utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from "public"
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GET route for homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST route to analyze a URL
app.post('/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required.' });
    }

    // Fetch webpage content
    console.log(`🔍 Fetching URL: ${url}`);
    const response = await axios.get(url);
    const html = response.data;

    // Extract main content and clean
    const mainContent = extractMainContent(html);
    const cleaned = cleanText(mainContent);

    // Word frequency (basic)
    const freq = getWordFrequency(cleaned);

    // Return JSON with text + frequency
    return res.json({ text: cleaned, frequency: freq });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while processing the URL.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});