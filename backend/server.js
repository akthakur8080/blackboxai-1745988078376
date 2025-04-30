const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { db, initDb } = require('./db');
const { startScheduler } = require('./scheduler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

initDb();
startScheduler();

// API to get all articles with optional filters: collegeName, collegeId, keywords, tags
app.get('/api/articles', (req, res) => {
  const { collegeName, collegeId, keywords, tags } = req.query;

  let query = `
    SELECT articles.*, urls.url, colleges.college_name, colleges.college_id
    FROM articles
    JOIN urls ON articles.url_id = urls.id
    JOIN colleges ON urls.college_id = colleges.college_id
    WHERE 1=1
  `;

  const params = [];

  if (collegeName) {
    query += ' AND colleges.college_name LIKE ?';
    params.push('%' + collegeName + '%');
  }
  if (collegeId) {
    query += ' AND colleges.college_id = ?';
    params.push(collegeId);
  }
  if (keywords) {
    query += ' AND articles.headline LIKE ?';
    params.push('%' + keywords + '%');
  }
  if (tags) {
    query += ' AND articles.tags LIKE ?';
    params.push('%' + tags + '%');
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// API to upload an article to another server (dummy implementation)
app.post('/api/articles/:id/upload', (req, res) => {
  const articleId = req.params.id;
  // Here you would implement the logic to send the article to another server
  // For now, just mark as uploaded in DB
  const query = 'UPDATE articles SET uploaded = 1 WHERE id = ?';
  db.run(query, [articleId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Article uploaded successfully' });
  });
});

// API to get statistics
app.get('/api/stats', (req, res) => {
  const stats = {};
  const today = new Date().toISOString().slice(0, 10);

  db.get(`SELECT COUNT(*) as count FROM articles WHERE DATE(published_at) = ?`, [today], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    stats.articlesFetchedToday = row.count;

    db.get(`SELECT COUNT(*) as count FROM articles WHERE uploaded = 1`, [], (err2, row2) => {
      if (err2) {
        res.status(500).json({ error: err2.message });
        return;
      }
      stats.articlesUploaded = row2.count;

      db.get(`SELECT COUNT(*) as count FROM articles WHERE uploaded = 0`, [], (err3, row3) => {
        if (err3) {
          res.status(500).json({ error: err3.message });
          return;
        }
        stats.articlesRemaining = row3.count;
        res.json(stats);
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
