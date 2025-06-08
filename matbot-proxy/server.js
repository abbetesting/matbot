const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/send', async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Inget meddelande angivet.' });
  }

  try {
    const webhookURL = process.env.DISCORD_WEBHOOK_URL;
    console.log("🔧 Webhook används:", webhookURL); // Logga för felsökning

    const response = await fetch(webhookURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`Discord svarade med status ${response.status}`);
    }

    res.status(200).json({ message: '✅ Meddelande skickat till Discord!' });
  } catch (error) {
    console.error('❌ Fel i Render server:', error);
    res.status(500).json({ error: '❌ Kunde inte skicka meddelandet till Discord.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servern kör på port ${PORT}`);
});