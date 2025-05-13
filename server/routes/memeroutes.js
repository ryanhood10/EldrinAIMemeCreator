const router = require('express').Router();
const {
  getTrendingMemes,
  searchMemes,
  captionImage,
  generateAIMeme,
} = require('../contollers/memeController.js');

// GET  /api/v1/memes/trending
router.get('/trending', getTrendingMemes);
// POST /api/v1/memes/search    { query }
router.post('/search',      searchMemes);
// POST /api/v1/memes/caption   { template_id, boxes: […] }
router.post('/caption',     captionImage);
// POST /api/v1/memes/ai        { prompt, model? }
router.post('/ai',          generateAIMeme);

module.exports = router;
