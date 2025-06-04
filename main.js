const webhookURL = "https://discord.com/api/webhooks/1379859552631128155/bD4gyUslyJqTZ7j_XyqjGw1B0tRWQ_xcSdJ9aJSn1qgI9SbABx1VtPehtQpCAIj9jMlT"; // <-- Byt ut till din egen


const messageInput = document.getElementById("message");
const sendButton = document.getElementById("sendButton");
const timeOptions = document.getElementById("timeOptions");
const statusText = document.getElementById("status");

let selectedTime = null;

// Hantera val av tid
timeOptions.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    selectedTime = e.target.getAttribute("data-time");
    document.querySelectorAll(".time-options button").forEach((btn) => {
      btn.classList.remove("selected");
    });
    e.target.classList.add("selected");
  }
});

// Skicka meddelande
sendButton.addEventListener("click", async () => {
  const message = messageInput.value.trim();

  if (!message || !selectedTime) {
    statusText.textContent = "⚠️ Fyll i ett meddelande och välj en tid.";
    return;
  }

  const fullMessage = `**${selectedTime}**, ${message}`;

  try {
    const response = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: fullMessage }),
    });

    if (response.ok) {
      statusText.textContent = "✅ Meddelandet skickades till Discord!";
      messageInput.value = "";
      selectedTime = null;
      document.querySelectorAll(".time-options button").forEach((btn) => btn.classList.remove("selected"));
    } else {
      statusText.textContent = "❌ Något gick fel vid skickandet.";
    }
  } catch (error) {
    console.error("Webhook error:", error);
    statusText.textContent = "❌ Kunde inte kontakta Discord.";
  }
});