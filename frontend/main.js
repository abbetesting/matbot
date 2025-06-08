document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("messageForm");
  const input = document.getElementById("message");
  const sendButton = document.getElementById("sendButton");
  const timeButtons = document.querySelectorAll(".time-option");
  const status = document.getElementById("status");

  let selectedTime = "";
  const webhookURL = "https://matbot-vdla.onrender.com/send"; // ✅ Din proxy

  timeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      timeButtons.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedTime = btn.innerText.trim();
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const text = input.value.trim();
    if (!text) return;

    const message = selectedTime ? `${text}, ${selectedTime}` : text;

    try {
      sendButton.disabled = true;
      status.innerText = "⏳ Skickar...";

      const response = await fetch(webhookURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      });

      if (response.ok) {
        status.innerText = "✅ Skickat!";
        input.value = "";
        timeButtons.forEach((b) => b.classList.remove("selected"));
        selectedTime = "";
      } else {
        status.innerText = "❌ Fel vid skickande.";
      }
    } catch (err) {
      console.error(err);
      status.innerText = "❌ Kunde inte kontakta servern.";
    } finally {
      sendButton.disabled = false;
    }
  });
});