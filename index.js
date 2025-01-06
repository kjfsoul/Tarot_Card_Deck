const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const QRCode = require('qrcode');
const app = express();
const port = 3000;

let db = new sqlite3.Database('./tarot.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the tarot database.');
});

app.use(express.json());

app.post('/generate-image', async (req, res) => {
  const { theme, style } = req.body;
  try {
    const response = await axios.post('https://api.openai.com/v1/images/generate', {
      prompt: `Create a tarot card image with theme: ${theme} and style: ${style}`,
      n: 1,
      size: "1024x1024"
    }, {
      headers: {
        'Authorization': `Bearer YOUR_OPENAI_API_KEY`,
        'Content-Type': 'application/json'
      }
    });

    const imageUrl = response.data.data[0].url;
    db.run(`INSERT INTO images(imageUrl, theme, style, status) VALUES(?, ?, ?, ?)`, [imageUrl, theme, style, 'pending'], function(err) {
      if (err) {
        return console.error(err.message);
      }
      res.send(`Image generated and added with ID: ${this.lastID}`);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating image');
  }
});

app.post('/approve-image/:id', (req, res) => {
  const { id } = req.params;
  db.run(`UPDATE images SET status = 'approved' WHERE id = ?`, [id], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.send(`Image with ID: ${id} approved`);
  });
});

app.get('/images', (req, res) => {
  db.all(`SELECT * FROM images`, [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json(rows);
  });
});

app.get('/generate-qr/:id', async (req, res) => {
  const { id } = req.params;
  db.get(`SELECT imageUrl FROM images WHERE id = ?`, [id], async (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    try {
      const qrCode = await QRCode.toDataURL(row.imageUrl);
      res.send(`<img src="${qrCode}" alt="QR Code"/>`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error generating QR code');
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
