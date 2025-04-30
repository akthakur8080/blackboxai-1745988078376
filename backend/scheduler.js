const schedule = require('node-schedule');
const { scrapeAllUrls } = require('./scraper');

function startScheduler() {
  // Schedule scraping every hour
  schedule.scheduleJob('0 * * * *', async () => {
    console.log('Starting scheduled scraping task...');
    try {
      const articles = await scrapeAllUrls();
      console.log(`Scraped ${articles.length} articles.`);
    } catch (error) {
      console.error('Error during scheduled scraping:', error);
    }
  });
}

module.exports = {
  startScheduler,
};
