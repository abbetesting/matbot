const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const ADMIN_CODE = process.env.ADMIN_CODE || '9999';

const families = {
  "1234": "Familj1",
  "5678": "Familj2"
};

let messages = [];

// 📨 POST /send
app.post('/send', async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: '⚠️ Inget meddelande' });

  const match = content.match(/,\s*([^,]+)$/);
  const family = match ? match[1] : null;
  const webhook = process.env[`WEBHOOK_${family}`];

  if (!webhook) return res.status(400).json({ error: '❌ Webhook saknas för familj' });

  try {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      return res.status(429).json({ error: `🚫 Rate limit. Vänta ${retryAfter} sekunder.` });
    }

    if (!response.ok) throw new Error(`Discord fel: ${response.status}`);

    messages.push({ content, family, timestamp: new Date().toISOString() });

    res.status(200).json({ message: '✅ Skickat' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '❌ Discord-fel' });
  }
});

// 🔐 POST /admin/login
app.post('/admin/login', (req, res) => {
  const { code } = req.body;
  if (code === ADMIN_CODE) return res.status(200).json({ success: true });
  return res.status(401).json({ error: '❌ Fel adminkod' });
});

// 📄 GET /admin/messages
app.get('/admin/messages', (req, res) => {
  const { code } = req.query;
  if (code !== ADMIN_CODE) return res.status(403).json({ error: '⛔ Otillåtet' });
  res.json(messages);
});

// ➕ POST /admin/families
app.post('/admin/families', (req, res) => {
  const { pin, name, code } = req.body;
  if (code !== ADMIN_CODE) return res.status(403).json({ error: '⛔ Otillåtet' });

  if (!pin || !name) return res.status(400).json({ error: '⚠️ Inget namn eller kod' });

  families[pin] = name;
  res.json({ message: '✅ Familj tillagd' });
});

// 📊 GET /admin/stats
app.get('/admin/stats', (req, res) => {
  const { code } = req.query;
  if (code !== ADMIN_CODE) return res.status(403).json({ error: '⛔ Otillåtet' });

  const stats = {};
  messages.forEach(msg => {
    if (!stats[msg.family]) stats[msg.family] = 0;
    stats[msg.family]++;
  });

  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`🚀 Kör på port ${PORT}`);
});