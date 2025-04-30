const puppeteer = require('puppeteer');
const { db } = require('./db');
const tf = require('@tensorflow/tfjs-node');

// Dummy function for text classification - replace with actual model loading and prediction
async function classifyText(text) {
  // For demonstration, classify based on keywords
  const lowerText = text.toLowerCase();
  if (lowerText.includes('exam')) return 'Exam';
  if (lowerText.includes('admission')) return 'Admission';
  if (lowerText.includes('placement')) return 'Placement';
  return 'General';
}

async function scrapeUrl(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Example selectors - these need to be adapted per site or made dynamic
    const articles = await page.evaluate(() => {
      const articleNodes = document.querySelectorAll('article');
      const results = [];
      articleNodes.forEach(node => {
        const headline = node.querySelector('h1, h2, h3') ? node.querySelector('h1, h2, h3').innerText : '';
        const summary = node.querySelector('p') ? node.querySelector('p').innerText : '';
        const date = node.querySelector('time') ? node.querySelector('time').getAttribute('datetime') || node.querySelector('time').innerText : '';
        results.push({ headline, summary, date });
      });
      return results;
    });

    await browser.close();

    // Classify and prepare articles
    const classifiedArticles = [];
    for (const article of articles) {
      const newsType = await classifyText(article.headline + ' ' + article.summary);
      classifiedArticles.push({
        headline: article.headline,
        summary: article.summary,
        published_at: article.date,
        news_type: newsType,
        tags: newsType,
      });
    }
    return classifiedArticles;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

async function scrapeAllUrls() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, url FROM urls', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const allArticles = [];
      for (const row of rows) {
        try {
          const articles = await scrapeUrl(row.url);
          // Insert articles into DB
          for (const article of articles) {
            db.run(
              'INSERT INTO articles (url_id, headline, summary, published_at, news_type, tags) VALUES (?, ?, ?, ?, ?, ?)',
              [row.id, article.headline, article.summary, article.published_at, article.news_type, article.tags]
            );
          }
          allArticles.push(...articles);
        } catch (error) {
          console.error(`Error scraping URL ${row.url}:`, error.message);
        }
      }
      resolve(allArticles);
    });
  });
}

module.exports = {
  scrapeAllUrls,
};
