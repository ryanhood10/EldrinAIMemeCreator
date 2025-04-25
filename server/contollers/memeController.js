const axios = require('axios');
const qs    = require('qs');

const IMGFLIP = 'https://api.imgflip.com';

exports.getTrendingMemes = async (req, res) => {
  try {
    const { data } = await axios.get(`${IMGFLIP}/get_memes`);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch trending memes.' });
  }
};

exports.searchMemes = async (req, res) => {
  try {
    const payload = qs.stringify({ q: req.body.query });
    const { data } = await axios.post(
      `${IMGFLIP}/search_memes`,
      payload,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to search memes.' });
  }
};

exports.captionImage = async (req, res) => {
  try {
    const { template_id, boxes } = req.body;
    const payload = qs.stringify({
      template_id,
      username: process.env.IMGFLIP_USERNAME,
      password: process.env.IMGFLIP_PASSWORD,
      boxes: JSON.stringify(boxes),
    });
    const { data } = await axios.post(
      `${IMGFLIP}/caption_image`,
      payload,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to caption image.' });
  }
};

exports.generateAIMeme = async (req, res) => {
  try {
    const { prompt, model } = req.body;
    const toSend = { prompt };
    if (model) toSend.model = model;
    const payload = qs.stringify(toSend);
    const { data } = await axios.post(
      `${IMGFLIP}/ai_meme`,
      payload,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate AI meme.' });
  }
};
