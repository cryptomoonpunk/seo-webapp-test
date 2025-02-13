import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { extractMainContent, cleanText, getWordFrequency } from './text_utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON & URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GET homepage
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

    // Use a realistic user agent to avoid 404 / anti-bot issues
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                      'Chrome/111.0.0.0 Safari/537.36'
      }
    });

    // If site returns non-200, bail out
    if (response.status !== 200) {
      return res.status(400).json({
        error: `Non-200 status code: ${response.status}`
      });
    }

    const html = response.data;
    // Extract main content & clean
    const mainContent = extractMainContent(html);
    const cleaned = cleanText(mainContent);
    // Basic word frequency
    const freq = getWordFrequency(cleaned);

    // Return JSON
    res.json({ text: cleaned, frequency: freq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the URL.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});