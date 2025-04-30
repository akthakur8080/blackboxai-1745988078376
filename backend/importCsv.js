const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { db, initDb } = require('./db');

const csvFilePath = path.join(__dirname, 'colleges_data.csv');

const insertCollege = (collegeId, collegeName) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT OR IGNORE INTO colleges (college_id, college_name) VALUES (?, ?)';
    db.run(query, [collegeId, collegeName], function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

const getCollegeDbId = (collegeId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT id FROM colleges WHERE college_id = ?';
    db.get(query, [collegeId], (err, row) => {
      if (err) reject(err);
      else resolve(row ? row.id : null);
    });
  });
};

const insertUrl = (collegeDbId, url) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO urls (college_id, url) VALUES (?, ?)';
    db.run(query, [collegeDbId, url], function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

const insertKeyword = (urlId, keyword) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO keywords (url_id, keyword) VALUES (?, ?)';
    db.run(query, [urlId, keyword], function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

const importCsvData = async () => {
  initDb();

  const records = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      records.push(row);
    })
    .on('end', async () => {
      try {
        for (const record of records) {
          const { 'College Name': collegeName, 'College ID': collegeId, Keywords, URLs } = record;
          await insertCollege(collegeId, collegeName);
          const collegeDbId = await getCollegeDbId(collegeId);
          if (!collegeDbId) {
            console.error(`College DB ID not found for ${collegeId}`);
            continue;
          }
          const urlList = URLs.split(';').map(u => u.trim()).filter(u => u.length > 0);
          const keywordList = Keywords.split(';').map(k => k.trim()).filter(k => k.length > 0);

          for (const url of urlList) {
            const urlId = await insertUrl(collegeDbId, url);
            for (const keyword of keywordList) {
              await insertKeyword(urlId, keyword);
            }
          }
        }
        console.log('CSV data imported successfully.');
        process.exit(0);
      } catch (error) {
        console.error('Error importing CSV data:', error);
        process.exit(1);
      }
    });
};

importCsvData();
