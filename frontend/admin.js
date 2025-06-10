const adminCode = "9999"; // Vi är redan inloggade som admin

document.addEventListener("DOMContentLoaded", () => {
  loadMessages();
  loadStats();
});

// 🚀 Ladda alla meddelanden
async function loadMessages() {
  try {
    const res = await fetch(`https://matbot-1.onrender.com/admin/messages?code=${adminCode}`);
    const data = await res.json();
    const tbody = document.querySelector("#messageTable tbody");
    tbody.innerHTML = "";

    data.reverse().forEach(msg => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${new Date(msg.timestamp).toLocaleString()}</td>
        <td>${msg.content.split(",")[0]}</td>
        <td>${msg.family}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("❌ Kunde inte ladda meddelanden:", err);
  }
}

// ➕ Lägg till en familj
async function addFamily() {
  const pin = document.getElementById("newPin").value.trim();
  const name = document.getElementById("newName").value.trim();
  const status = document.getElementById("addStatus");

  if (!pin || !name) {
    status.textContent = "⚠️ Ange både PIN och namn.";
    return;
  }

  try {
    const res = await fetch("https://matbot-1.onrender.com/admin/families", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, name, code: adminCode })
    });

    if (res.ok) {
      status.textContent = "✅ Familj tillagd!";
      loadStats(); // Uppdatera statistiken
    } else {
      status.textContent = "❌ Kunde inte lägga till familjen.";
    }
  } catch (err) {
    status.textContent = "❌ Fel vid anslutning.";
    console.error(err);
  }
}

// 📊 Ladda statistik
async function loadStats() {
  try {
    const res = await fetch(`https://matbot-1.onrender.com/admin/stats?code=${adminCode}`);
    const stats = await res.json();
    const list = document.getElementById("statsList");
    list.innerHTML = "";

    Object.entries(stats).forEach(([family, count]) => {
      const li = document.createElement("li");
      li.textContent = `${family}: ${count} meddelanden`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("❌ Kunde inte hämta statistik:", err);
  }
}

// 🔍 Visa senaste 5 meddelanden från en viss familj (via PIN)
async function searchFamily() {
  const pin = document.getElementById("searchPin").value.trim();
  const status = document.getElementById("searchStatus");
  const list = document.getElementById("familyMessages");
  list.innerHTML = "";
  status.textContent = "🔄 Söker...";

  if (!pin) {
    status.textContent = "⚠️ Ange en PIN-kod.";
    return;
  }

  try {
    const res = await fetch(`https://matbot-1.onrender.com/admin/family-messages?code=${adminCode}&pin=${pin}`);
    const data = await res.json();

    if (!res.ok) {
      status.textContent = data.error || "❌ Kunde inte hämta meddelanden.";
      return;
    }

    status.textContent = `✅ ${data.family} – senaste 5 meddelanden:`;

    data.messages.forEach(msg => {
      const li = document.createElement("li");
      li.textContent = `${new Date(msg.timestamp).toLocaleString()}: ${msg.content}`;
      list.appendChild(li);
    });
  } catch (err) {
    status.textContent = "❌ Fel vid anslutning.";
    console.error(err);
  }
}