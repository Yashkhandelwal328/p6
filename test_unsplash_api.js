const https = require('https');

async function searchUnsplash(query) {
  const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=5&page=1`;
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          console.error("Parse error. Status:", res.statusCode, data.substring(0, 100));
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

searchUnsplash("Indian food").then(data => {
  if(data && data.results && data.results.length > 0) {
    console.log("Success! Image URL:", data.results[0].urls.regular);
  } else {
    console.log("Failed or no results.");
  }
});
