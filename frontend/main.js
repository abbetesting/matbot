const users = {
  "1234": "Familj1",
  "5678": "Familj2"
};

const webhookURL = "https://matbot-1.onrender.com/send";

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

let enteredPIN = "";
let currentUser = null;
let selectedTime = null;

document.addEventListener("DOMContentLoaded", () => {
  const savedUser = getCookie("matbotUser");
  if (savedUser) {
    currentUser = savedUser;
    loginScreen.style.display = "none";
    messageScreen.style.display = "flex";
    loggedInAs.textContent = `Inloggad som: ${currentUser}`;
  }
});

document.querySelectorAll(".keypad button").forEach(btn => {
  btn.addEventListener("click", () => {
    const val = btn.textContent;

    if (val === "⌫") {
      enteredPIN = enteredPIN.slice(0, -1);
    } else if (val === "✔️") {
      if (enteredPIN === "9999") {
        window.location.href = "admin.html"; // 🔐 Gå till adminpanel
      } else if (users[enteredPIN]) {
        currentUser = users[enteredPIN];
        setCookie("matbotUser", currentUser, 30);
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

document.querySelectorAll('.time-options button').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedTime = btn.getAttribute('data-time');
    document.querySelectorAll('.time-options button').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

sendButton.addEventListener('click', async () => {
  const message = messageInput.value.trim();

  if (!message || !selectedTime || !currentUser) {
    status.textContent = "⚠️ Fyll i meddelande och välj tid.";
    return;
  }

  const fullMessage = `${message}, ${selectedTime}, ${currentUser}`;

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

document.getElementById("forgotCode").addEventListener("click", () => {
  forgotText.style.display = "block";
});