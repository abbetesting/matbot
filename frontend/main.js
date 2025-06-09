// 🔐 Giltiga användare
const users = {
  "1234": "Mamma",
  "5678": "Pappa",
  "2468": "Albin",
  "1111": "Jobbarkompisen",
  "2222": "Son till jobbarkompis"
};

const webhookURL = "https://matbot-1.onrender.com/send";

// 👉 Element
const pinDisplay = document.getElementById("pinDisplay");
const loginStatus = document.getElementById("loginStatus");
const loginScreen = document.getElementById("loginScreen");
const messageScreen = document.getElementById("messageScreen");
const loggedInAs = document.getElementById("loggedInAs");
const forgotText = document.getElementById("forgotText");
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("sendButton");
const status = document.getElementById("status");
const logoutButton = document.getElementById("logoutButton");

// 🍪 Cookie-hantering
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}
function getCookie(name) {
  const match = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return match ? decodeURIComponent(match.pop()) : null;
}
function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// 👉 Inloggningsvariabler
let enteredPIN = "";
let currentUser = null;
let selectedTime = null;

// 🟢 Automatisk inloggning via cookie
document.addEventListener("DOMContentLoaded", () => {
  const savedUser = getCookie("matbotUser");
  if (savedUser) {
    currentUser = savedUser;
    loginScreen.style.display = "none";
    messageScreen.style.display = "flex";
    loggedInAs.textContent = `Inloggad som: ${currentUser}`;
  }
});

// 🔢 PIN-inmatning
document.querySelectorAll(".keypad button").forEach(btn => {
  btn.addEventListener("click", () => {
    const val = btn.textContent;

    if (val === "⌫") {
      enteredPIN = enteredPIN.slice(0, -1);
    } else if (val === "✔️") {
      if (users[enteredPIN]) {
        currentUser = users[enteredPIN];
        setCookie("matbotUser", currentUser, 30); // 🍪 Spara i 30 dagar
        loginScreen.style.display = "none";
        messageScreen.style.display = "flex";
        loggedInAs.textContent = `Inloggad som: ${currentUser}`;
      } else {
        loginStatus.textContent = "❌ Fel kod. Försök igen.";
        enteredPIN = "";
      }
    } else if (enteredPIN.length < 4 && /^\d$/.test(val)) {
      enteredPIN += val;
    }

    pinDisplay.textContent = enteredPIN.padEnd(4, "_");
  });
});

// ⏰ Välj tid
document.querySelectorAll('.time-options button').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedTime = btn.getAttribute('data-time');
    document.querySelectorAll('.time-options button').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

// 📤 Skicka meddelande
sendButton.addEventListener('click', async () => {
  const message = messageInput.value.trim();

  if (!message || !selectedTime || !currentUser) {
    status.textContent = "⚠️ Fyll i meddelande och välj tid.";
    return;
  }

  const fullMessage = `${message}, ${selectedTime}, ${currentUser}`;
  console.log("🔧 Skickar till:", webhookURL);

  try {
    sendButton.disabled = true;
    status.textContent = "⏳ Skickar...";

    const res = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: fullMessage }),
    });

    if (res.status === 429) {
      const result = await res.json();
      status.textContent = result.error || "🚫 Discord rate limit.";
    } else if (res.ok) {
      status.textContent = "✅ Meddelande skickat!";
      messageInput.value = "";
      selectedTime = null;
      document.querySelectorAll('.time-options button').forEach(b => b.classList.remove('selected'));
    } else {
      status.textContent = "❌ Fel vid skickande.";
    }
  } catch (err) {
    status.textContent = "❌ Kunde inte kontakta servern.";
    console.error(err);
  } finally {
    sendButton.disabled = false;
  }
});

// 🔒 Logga ut
logoutButton.addEventListener("click", () => {
  currentUser = null;
  enteredPIN = "";
  deleteCookie("matbotUser");

  pinDisplay.textContent = "____";
  loginStatus.textContent = "";
  messageInput.value = "";
  status.textContent = "";
  forgotText.style.display = "none";
  document.querySelectorAll(".time-options button").forEach(b => b.classList.remove("selected"));

  loginScreen.style.display = "flex";
  messageScreen.style.display = "none";
});

// 🔐 "Glömt kod"
document.getElementById("forgotCode").addEventListener("click", () => {
  forgotText.style.display = "block";
});