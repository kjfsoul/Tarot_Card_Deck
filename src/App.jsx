import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [images, setImages] = useState([]);
  const [theme, setTheme] = useState('');
  const [style, setStyle] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const response = await axios.get('/api/images');
    setImages(response.data);
  };

  const generateImage = async () => {
    await axios.post('/api/generate-image', { theme, style });
    fetchImages();
  };

  const approveImage = async (id) => {
    await axios.post(`/api/approve-image/${id}`);
    fetchImages();
  };

  return (
    <div>
      <h1>Tarot Card Deck</h1>
      <div>
        <input
          type="text"
          placeholder="Theme"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        />
        <input
          type="text"
          placeholder="Style"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        />
        <button onClick={generateImage}>Generate Image</button>
      </div>
      <div>
        {images.map((image) => (
          <div key={image.id}>
            <img src={image.imageUrl} alt={`Tarot Card ${image.id}`} />
            {image.status === 'pending' && (
              <button onClick={() => approveImage(image.id)}>Approve</button>
            )}
            {image.status === 'approved' && (
              <img src={`/api/generate-qr/${image.id}`} alt="QR Code" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
