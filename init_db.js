const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./tarot.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the tarot database.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    imageUrl TEXT NOT NULL,
    theme TEXT,
    style TEXT,
    status TEXT
  )`);
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});
