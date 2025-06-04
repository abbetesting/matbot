// 🔐 Lista över giltiga PIN-koder
const users = {
  "1234": "Mamma",
  "5678": "Pappa",
  "2468": "Albin"
};

// 🔗 Din Discord-webhook här:
const webhookURL = "https://discord.com/api/webhooks/XXX/YYY"; // <-- Byt ut

// 👉 Variabler för login
let enteredPIN = "";
let currentUser = null;

// 👉 Element
const pinDisplay = document.getElementById("pinDisplay");
const loginStatus = document.getElementById("loginStatus");
const loginScreen = document.getElementById("loginScreen");
const messageScreen = document.getElementById("messageScreen");
const loggedInAs = document.getElementById("loggedInAs");

// 🔢 När man trycker på PIN-knapparna
document.querySelectorAll(".keypad button").forEach(btn => {
  btn.addEventListener("click", () => {
    const val = btn.textContent;

    if (val === "⌫") {
      enteredPIN = enteredPIN.slice(0, -1);
    } else if (val === "✔️") {
      if (users[enteredPIN]) {
        currentUser = users[enteredPIN];
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

    // Visa PIN med siffror
    pinDisplay.textContent = enteredPIN.padEnd(4, "_");
  });
});

document.getElementById("forgotCode").addEventListener("click", () => {
  const text = document.getElementById("forgotText");
  text.style.display = "block";
});

document.getElementById("logoutButton").addEventListener("click", () => {
  currentUser = null;
  enteredPIN = "";
  pinDisplay.textContent = "____";
  loginStatus.textContent = "";
  document.getElementById("message").value = "";
  document.getElementById("status").textContent = "";
  document.getElementById("forgotText").style.display = "none";
  document.querySelectorAll(".time-options button").forEach(b => b.classList.remove("selected"));

  // Visa login, dölj meddelande
  loginScreen.style.display = "flex";
  messageScreen.style.display = "none";
});
// 📤 Meddelandesidan
let selectedTime = null;

document.querySelectorAll('.time-options button').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedTime = btn.getAttribute('data-time');
    document.querySelectorAll('.time-options button').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

document.getElementById('sendButton').addEventListener('click', async () => {
  const message = document.getElementById('message').value.trim();
  const status = document.getElementById('status');

  if (!message || !selectedTime || !currentUser) {
    status.textContent = "⚠️ Fyll i meddelande och välj tid.";
    return;
  }

  const fullMessage = `${message}, ${selectedTime}, ${currentUser}`;

  try {
    const res = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: fullMessage }),
    });

    if (res.ok) {
      status.textContent = "✅ Meddelande skickat!";
      document.getElementById('message').value = "";
      selectedTime = null;
      document.querySelectorAll('.time-options button').forEach(b => b.classList.remove('selected'));
    } else {
      status.textContent = "❌ Fel vid skickande.";
    }
  } catch (err) {
    status.textContent = "❌ Kunde inte kontakta Discord.";
  }
});
