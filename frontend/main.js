const BASE_URL = "https://matbot-1.onrender.com";
const users = {
  "1234": "Familj1",
  "5678": "Familj2",
  "9999": "admin" // skickas till adminpanel
};

let enteredPIN = "";
let currentUser = null;

const pinDisplay = document.getElementById("pinDisplay");
const loginStatus = document.getElementById("loginStatus");
const loginScreen = document.getElementById("loginScreen");
const messageScreen = document.getElementById("messageScreen");
const loggedInAs = document.getElementById("loggedInAs");

document.querySelectorAll(".keypad button").forEach(btn => {
  btn.addEventListener("click", () => {
    const val = btn.textContent;

    if (val === "⌫") {
      enteredPIN = enteredPIN.slice(0, -1);
    } else if (val === "✔️") {
      if (users[enteredPIN]) {
        if (enteredPIN === "9999") {
          window.location.href = "admin.html";
        } else {
          currentUser = users[enteredPIN];
          loginScreen.style.display = "none";
          messageScreen.style.display = "flex";
          loggedInAs.textContent = `Inloggad som: ${currentUser}`;
        }
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

document.getElementById("forgotCode").addEventListener("click", () => {
  document.getElementById("forgotText").style.display = "block";
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
  loginScreen.style.display = "flex";
  messageScreen.style.display = "none";
});

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
    const res = await fetch(`${BASE_URL}/send`, {
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
    status.textContent = "❌ Kunde inte kontakta servern.";
    console.error(err);
  }
});