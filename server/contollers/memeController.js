const axios = require("axios");
const qs = require("qs");

const IMGFLIP = "https://api.imgflip.com";

exports.getTrendingMemes = async (req, res) => {
  try {
    const { data } = await axios.get(`${IMGFLIP}/get_memes`);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch trending memes." });
  }
};

exports.searchMemes = async (req, res) => {
  console.log("sssss", req.body);
  try {
    const payload = qs.stringify({
      q: req.body,
      username: "EldrinAI",
      password: "Eldrin5578!",
    });
    const { data } = await axios.post(`${IMGFLIP}/search_memes`, payload, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    console.log("data", data);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to search memes." });
  }
};

exports.captionImage = async (req, res) => {
  try {
    const { template_id, boxes } = req.body;

    if (!process.env.IMGFLIP_USERNAME || !process.env.IMGFLIP_PASSWORD) {
      return res
        .status(500)
        .json({ error: "Imgflip username/password not set in environment." });
    }

    const payload = qs.stringify({
      template_id,
      username: "EldrinAI",
      password: "Eldrin5578!",
      boxes: JSON.stringify(boxes),
    });

    const { data } = await axios.post(`${IMGFLIP}/caption_image`, payload, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to caption image." });
  }
};

exports.generateAIMeme = async (req, res) => {
  console.log("req.body", req.body)
  try {
    const { prompt, model } = req.body;
    const toSend = { prompt, username: "EldrinAI",
      password: "Eldrin5578!", };
    if (model) toSend.model = model;
    const payload = qs.stringify(toSend);
    const { data } = await axios.post(
      `${IMGFLIP}/ai_meme`,
      payload,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    console.log("data", data)
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate AI meme.' });
  }
};

// exports.generateAIMeme = async (req, res) => {
//   const { prompt } = req.body;
//   console.log("prompt", prompt)

//   try {
//     const { prompt, model } = req.body;
//     const toSend = { prompt, username: "EldrinAI", password: "Eldrin5578!" };
//     if (model) toSend.model = model;
//     const payload = qs.stringify(toSend);
//     // const aiResponse = await someAiService(prompt); // Replace with your actual call
//     const aiResponse = await axios.post(`${IMGFLIP}/ai_meme`, payload, {
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     });
//     console.log("aiResponse", aiResponse.data.data.texts )
//     const texts = aiResponse.data.data.texts || [];

//     const responseText = texts.join(" ").toLowerCase();
//     // console.log("responseText", responseText)

//     // Define common stopwords to ignore
//     const stopwords = new Set([
//       "the",
//       "is",
//       "and",
//       "but",
//       "or",
//       "a",
//       "an",
//       "in",
//       "on",
//       "at",
//       "to",
//       "for",
//       "of",
//       "with",
//       "that",
//       "this",
//       "it",
//       "as",
//       "by",
//       "from",
//       "are",
//       "was",
//       "were",
//       "be",
//       "been",
//       "have",
//       "has",
//       "had",
//       "do",
//       "does",
//       "did",
//       "not",
//     ]);

//     // Get meaningful words from prompt
//     const promptWords = prompt
//       .toLowerCase()
//       .split(/\s+/)
//       .filter((word) => !stopwords.has(word) && word.trim().length > 0);

//     const hasRelevantWord = promptWords.some((word) =>
//       responseText.includes(word)
//     );

//     if (!hasRelevantWord) {
//       return res.status(200).json({
//         success: false,
//         message: `AI does not have any relevant data to your prompt "${prompt}"`,
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: aiResponse.data,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to generate meme from AI",
//     });
//   }
// };
