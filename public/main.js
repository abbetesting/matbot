const webhookURL = "https://discord.com/api/webhooks/1379859552631128155/bD4gyUslyJqTZ7j_XyqjGw1B0tRWQ_xcSdJ9aJSn1qgI9SbABx1VtPehtQpCAIj9jMlT"; // <-- Byt ut till din egen

const messageInput = document.getElementById("message");
const sendButton = document.getElementById("sendButton");
const timeOptions = document.getElementById("timeOptions");
const statusText = document.getElementById("status");

let selectedTime = null;

timeOptions.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    document.querySelectorAll(".time-options button").forEach(btn => {
      btn.classList.remove("selected");
    });

    e.target.classList.add("selected");
    selectedTime = e.target.getAttribute("data-time");
  }
});

sendButton.addEventListener("click", async () => {
  const message = messageInput.value.trim();
  if (!message || !selectedTime) {
    statusText.textContent = "Fyll i både meddelande och välj tid.";
    return;
  }

  const content = `**${selectedTime}**, ${message}`;

  try {
    const res = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (res.ok) {
      statusText.textContent = "✅ Meddelande skickat!";
      messageInput.value = "";
      selectedTime = null;
      document.querySelectorAll(".time-options button").forEach(btn => btn.classList.remove("selected"));
    } else {
      statusText.textContent = "❌ Något gick fel. Försök igen.";
    }
  } catch (err) {
    statusText.textContent = "❌ Kunde inte nå Discord.";
  }
});