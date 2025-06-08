const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const webhookURL = process.env.DISCORD_WEBHOOK_URL;
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("🔧 Discord webhook URL:", process.env.DISCORD_WEBHOOK_URL);

await fetch(webhookURL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content }),
});

catch (error) {
  console.error('❌ Render fel:', error);  // ← Lägg till detta
  res.status(500).json({ error: 'Kunde inte skicka meddelandet till Discord.' });
}

app.post('/send', async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Inget meddelande skickades.' });

  try {
    const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) throw new Error('Discord fel');
    res.status(200).json({ message: '✅ Skickat!' });
  } catch (err) {
    res.status(500).json({ error: '❌ Fel vid skickande till Discord.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy körs på port ${PORT}`));