const initFloatingWhatsApp = () => {
  if (window.location.pathname === "/contact") {
    return;
  }

  if (document.querySelector("[data-floating-whatsapp]")) {
    return;
  }

  const link = document.createElement("a");
  link.href = ACE_SOCIALS.whatsapp.href;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.className = "floating-whatsapp";
  link.setAttribute("aria-label", "Chat with Ace Fitness on WhatsApp");
  link.setAttribute("data-floating-whatsapp", "true");
  link.innerHTML = `
    <span class="floating-whatsapp-ring"></span>
    <span class="floating-whatsapp-icon" aria-hidden="true">${ACE_SOCIAL_ICONS.whatsapp}</span>
    <span class="floating-whatsapp-text">
      <strong>WhatsApp</strong>
      <span>Talk to Ace Fitness</span>
    </span>
  `;

  document.body.appendChild(link);
};
