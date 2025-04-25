require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const memeRoutes = require('./routes/memeroutes');
 
const app = express();

// → allow React dev server or any other origin
app.use(cors());
// → to parse JSON bodies
app.use(express.json());

// mount your meme routes
app.use('/api/v1/memes', memeRoutes);

// serve React build in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server listening on port ${PORT}`),
);
