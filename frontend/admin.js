let adminCode = "";

async function login() {
  adminCode = document.getElementById("adminCodeInput").value.trim();

  const res = await fetch("https://matbot-1.onrender.com/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: adminCode })
  });

  if (res.ok) {
    document.getElementById("loginSection").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    loadMessages();
    loadStats();
  } else {
    document.getElementById("loginError").textContent = "❌ Fel kod!";
  }
}

async function loadMessages() {
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
}

async function addFamily() {
  const pin = document.getElementById("newPin").value.trim();
  const name = document.getElementById("newName").value.trim();
  const status = document.getElementById("addStatus");

  if (!pin || !name) {
    status.textContent = "⚠️ Ange både PIN och namn.";
    return;
  }

  const res = await fetch("https://matbot-1.onrender.com/admin/families", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin, name, code: adminCode })
  });

  if (res.ok) {
    status.textContent = "✅ Familj tillagd!";
  } else {
    status.textContent = "❌ Kunde inte lägga till.";
  }
}

async function loadStats() {
  const res = await fetch(`https://matbot-1.onrender.com/admin/stats?code=${adminCode}`);
  const stats = await res.json();
  const list = document.getElementById("statsList");
  list.innerHTML = "";

  Object.entries(stats).forEach(([family, count]) => {
    const li = document.createElement("li");
    li.textContent = `${family}: ${count} meddelanden`;
    list.appendChild(li);
  });
}