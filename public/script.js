// script.js

document.getElementById('urlForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = document.getElementById('urlInput').value;
  const spinner = document.getElementById('spinner');
  const resultContainer = document.getElementById('result');
  
  // Clear previous result and show spinner
  resultContainer.textContent = '';
  spinner.classList.remove('hidden');
  
  try {
    const response = await fetch('/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await response.json();
    if (data.error) {
      resultContainer.textContent = data.error;
    } else {
      // For now, display the cleaned text.
      // Future: Process the text to generate a word cloud.
      resultContainer.textContent = data.text;
    }
  } catch (error) {
    console.error(error);
    resultContainer.textContent = 'An error occurred. Please try again.';
  } finally {
    spinner.classList.add('hidden');
  }
});