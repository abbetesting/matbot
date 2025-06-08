const express = require('express');
const fetch = require('node-fetch'); // v2!
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Lägg till flera webhooks i en array
const webhooks = [
  process.env.DISCORD_WEBHOOK_URL_1,
  process.env.DISCORD_WEBHOOK_URL_2
];

app.post('/send', async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Inget meddelande angivet.' });
  }

  let sent = false;

  for (const url of webhooks) {
    try {
      console.log("🔧 Försöker skicka till:", url);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (response.status === 429) {
        console.warn('⚠️ Rate limited på denna webhook, försöker nästa...');
        continue; // testa nästa webhook
      }

      if (!response.ok) throw new Error(`Status: ${response.status}`);

      sent = true;
      break; // Skickat, avbryt loopen
    } catch (err) {
      console.error('❌ Fel med webhook:', err.message);
    }
  }

  if (sent) {
    res.status(200).json({ message: '✅ Meddelande skickat!' });
  } else {
    res.status(500).json({ error: '❌ Alla webhooks misslyckades.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Kör på port ${PORT}`);
});