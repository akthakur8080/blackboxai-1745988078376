const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DBSOURCE = path.join(__dirname, 'news_monitor.db');

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

const initDb = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS colleges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        college_id TEXT UNIQUE,
        college_name TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS urls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        college_id TEXT,
        url TEXT,
        FOREIGN KEY (college_id) REFERENCES colleges(college_id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS keywords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url_id INTEGER,
        keyword TEXT,
        FOREIGN KEY (url_id) REFERENCES urls(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url_id INTEGER,
        headline TEXT,
        summary TEXT,
        published_at TEXT,
        news_type TEXT,
        tags TEXT,
        uploaded INTEGER DEFAULT 0,
        FOREIGN KEY (url_id) REFERENCES urls(id)
      )
    `);
  });
};

module.exports = {
  db,
  initDb,
};
