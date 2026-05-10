document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("pageContactForm");
  const contactStatus = document.getElementById("pageContactStatus");

  if (!contactForm || !contactStatus) {
    return;
  }

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector("button[type='submit']");
    const payload = Object.fromEntries(new FormData(contactForm).entries());

    setButtonBusy(submitButton, true, "Sending...");
    setStatus(contactStatus, "Sending your message...");

    try {
      await api("/contact", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      contactForm.reset();
      setStatus(contactStatus, "Thanks. Your message is in and our team will reach out soon.", "success");
    } catch (error) {
      setStatus(contactStatus, error.message, "error");
    } finally {
      setButtonBusy(submitButton, false);
    }
  });
});
