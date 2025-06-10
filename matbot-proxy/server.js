const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;
const ADMIN_CODE = process.env.ADMIN_CODE || '9999';

const families = {
  "1234": "Familj1",
  "5678": "Familj2"
};

// 📁 Filväg – Render tillåter bara skrivning till /tmp
const MESSAGES_FILE = path.join('/tmp', 'messages.json');

app.use(cors());
app.use(express.json());

// 🧾 Hjälpfunktioner
function readMessages() {
  try {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveMessages(messages) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

// 📨 Skicka meddelande
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
      const retry = response.headers.get('retry-after') || '?';
      return res.status(429).json({ error: `⏳ Vänta ${retry} sekunder` });
    }

    if (!response.ok) throw new Error(`❌ Discord svarade med ${response.status}`);

    const messages = readMessages();
    messages.push({ content, family, timestamp: new Date().toISOString() });
    saveMessages(messages);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '❌ Fel vid skickande' });
  }
});

// 🔐 Admin-login
app.post('/admin/login', (req, res) => {
  const { code } = req.body;
  if (code === ADMIN_CODE) return res.sendStatus(200);
  res.status(401).json({ error: 'Fel kod' });
});

// 📄 Hämta alla meddelanden
app.get('/admin/messages', (req, res) => {
  if (req.query.code !== ADMIN_CODE) return res.status(403).json({ error: '⛔ Otillåtet' });
  res.json(readMessages());
});

// ➕ Lägg till familj
app.post('/admin/families', (req, res) => {
  const { pin, name, code } = req.body;
  if (code !== ADMIN_CODE) return res.status(403).json({ error: '⛔ Otillåtet' });
  if (!pin || !name) return res.status(400).json({ error: '⚠️ Ange PIN och namn' });

  families[pin] = name;
  res.json({ success: true });
});

// 📊 Statistik
app.get('/admin/stats', (req, res) => {
  if (req.query.code !== ADMIN_CODE) return res.status(403).json({ error: '⛔ Otillåtet' });

  const stats = {};
  for (const msg of readMessages()) {
    stats[msg.family] = (stats[msg.family] || 0) + 1;
  }
  res.json(stats);
});

// 🔍 Sök senaste 5 för PIN
app.get('/admin/family-messages', (req, res) => {
  const { code, pin } = req.query;
  if (code !== ADMIN_CODE) return res.status(403).json({ error: '⛔ Otillåtet' });

  const family = families[pin];
  if (!family) return res.status(404).json({ error: '❌ Ingen familj med den PIN' });

  const filtered = readMessages()
    .filter(m => m.family === family)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  res.json({ family, messages: filtered });
});

app.listen(PORT, () => {
  console.log(`🚀 Server kör på port ${PORT}`);
});