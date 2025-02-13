// script.js

document.getElementById('urlForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const url = document.getElementById('urlInput').value;
  const spinner = document.getElementById('spinner');
  const result = document.getElementById('result');

  // Clear previous results
  result.innerHTML = '';
  spinner.classList.remove('hidden');

  try {
    const response = await fetch('/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    const data = await response.json();
    if (data.error) {
      result.innerHTML = `<p style="color:red;">${data.error}</p>`;
    } else {
      const { text, frequency } = data;

      // Display text
      const textSection = document.createElement('div');
      textSection.style.marginBottom = '1rem';
      textSection.innerHTML = `<h3>Main Content:</h3><p>${text}</p>`;

      // Display top 10 frequent words
      const freqSection = document.createElement('div');
      freqSection.innerHTML = `<h3>Top Words (sample):</h3>`;
      
      // Convert freq object to array and sort by count desc
      const freqArray = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // top 10

      const list = document.createElement('ul');
      freqArray.forEach(([word, count]) => {
        const li = document.createElement('li');
        li.textContent = `${word}: ${count}`;
        list.appendChild(li);
      });
      freqSection.appendChild(list);

      result.appendChild(textSection);
      result.appendChild(freqSection);
    }
  } catch (err) {
    console.error(err);
    result.innerHTML = '<p style="color:red;">An error occurred. Please try again.</p>';
  } finally {
    spinner.classList.add('hidden');
  }
});