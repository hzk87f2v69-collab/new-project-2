const ACE_SOCIALS = {
  whatsapp: {
    label: "WhatsApp",
    href: ACE_PAYMENT_CONFIG.whatsappHref,
    text: `+91 ${ACE_PAYMENT_CONFIG.whatsappNumber.slice(0, 5)} ${ACE_PAYMENT_CONFIG.whatsappNumber.slice(5)}`,
    subtext: "Fastest way to ask about programs",
    action: "Chat now"
  },
  gmail: {
    label: "Gmail",
    href: `mailto:${ACE_PAYMENT_CONFIG.email}`,
    text: ACE_PAYMENT_CONFIG.email,
    subtext: "Mail us your goal and current challenge",
    action: "Send email"
  },
  instagram: {
    label: "Instagram",
    href: ACE_PAYMENT_CONFIG.instagramUrl,
    text: "@yourusername",
    subtext: "DM for updates, content, and transformations",
    action: "Open profile"
  }
};

const ACE_SOCIAL_ICONS = {
  whatsapp: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.5 0 .17 5.33.17 11.9c0 2.1.55 4.14 1.59 5.94L0 24l6.33-1.66a11.9 11.9 0 0 0 5.74 1.47h.01c6.57 0 11.9-5.33 11.9-11.9 0-3.18-1.24-6.17-3.46-8.43Zm-8.45 18.31h-.01a9.94 9.94 0 0 1-5.07-1.39l-.36-.22-3.76.99 1-3.66-.24-.38A9.89 9.89 0 0 1 2.2 11.9c0-5.45 4.43-9.88 9.88-9.88 2.64 0 5.11 1.03 6.97 2.9a9.8 9.8 0 0 1 2.9 6.98c0 5.45-4.43 9.89-9.88 9.89Zm5.42-7.43c-.3-.15-1.75-.86-2.02-.96-.27-.1-.46-.15-.66.15-.19.3-.76.96-.92 1.15-.16.2-.33.22-.62.08-.3-.15-1.24-.46-2.35-1.47-.87-.77-1.45-1.73-1.62-2.02-.17-.3-.02-.46.13-.61.13-.12.3-.33.44-.5.15-.16.2-.29.3-.49.1-.2.05-.37-.02-.52-.08-.15-.67-1.63-.92-2.23-.24-.58-.49-.5-.66-.51h-.57c-.2 0-.52.07-.79.37-.27.29-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.09 3.19 5.06 4.48.71.31 1.27.49 1.7.63.72.23 1.38.2 1.9.12.58-.09 1.75-.71 1.99-1.4.25-.69.25-1.28.17-1.4-.07-.12-.27-.2-.57-.35Z"
      />
    </svg>
  `,
  gmail: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M2 6.75A2.75 2.75 0 0 1 4.75 4h14.5A2.75 2.75 0 0 1 22 6.75v10.5A2.75 2.75 0 0 1 19.25 20H4.75A2.75 2.75 0 0 1 2 17.25V6.75Zm2.2-.45 7.12 5.46a1.15 1.15 0 0 0 1.36 0L19.8 6.3a.75.75 0 0 0-.55-.3H4.75a.75.75 0 0 0-.55.3Zm15.8 2.54-6.11 4.68a3.15 3.15 0 0 1-3.78 0L4 8.84v8.41c0 .41.34.75.75.75h14.5c.41 0 .75-.34.75-.75V8.84Z"
      />
    </svg>
  `,
  instagram: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm9.75 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
      />
    </svg>
  `
};

const copyText = async (text, statusNode) => {
  const copied = await copyToClipboard(text);

  if (statusNode) {
    statusNode.textContent = copied ? "Email copied" : "Copy failed";
    statusNode.classList.add("show");
    setTimeout(() => statusNode.classList.remove("show"), 1800);
  }
};

const buildSocialCard = (key) => {
  const social = ACE_SOCIALS[key];

  const isMail = key === "gmail";
  const copyButton = isMail
    ? `
      <button class="social-copy" type="button" data-copy-email="${social.text}">
        Copy
      </button>
    `
    : "";

  return `
    <article class="social-card social-card-${key}">
      <a class="social-card-link" href="${social.href}" target="${isMail ? "_self" : "_blank"}" rel="noreferrer">
        <span class="social-icon-wrap" aria-hidden="true">${ACE_SOCIAL_ICONS[key]}</span>
        <span class="social-content">
          <span class="social-label">${social.label}</span>
          <strong>${social.text}</strong>
          <span class="social-subtext">${social.subtext}</span>
        </span>
      </a>
      <div class="social-card-actions">
        <a class="btn-subtle social-action" href="${social.href}" target="${isMail ? "_self" : "_blank"}" rel="noreferrer">
          ${social.action}
        </a>
        ${copyButton}
      </div>
      <span class="copy-status" aria-live="polite"></span>
    </article>
  `;
};

const buildFooterIcon = (key) => {
  const social = ACE_SOCIALS[key];
  const label = social.label === "Gmail" ? social.text : social.label;

  return `
    <a class="footer-social-link" href="${social.href}" aria-label="${social.label}" target="_blank" rel="noreferrer">
      <span class="footer-social-icon" aria-hidden="true">${ACE_SOCIAL_ICONS[key]}</span>
      <span>${label}</span>
    </a>
  `;
};

const initSocialContactButtons = () => {
  document.querySelectorAll("[data-social-contact]").forEach((container) => {
    container.innerHTML = `
      <div class="social-contact-grid">
        ${buildSocialCard("whatsapp")}
        ${buildSocialCard("gmail")}
        ${buildSocialCard("instagram")}
      </div>
    `;
  });

  document.querySelectorAll("[data-footer-social]").forEach((container) => {
    container.innerHTML = `
      <div class="footer-socials">
        ${buildFooterIcon("whatsapp")}
        ${buildFooterIcon("gmail")}
        ${buildFooterIcon("instagram")}
      </div>
    `;
  });

  document.querySelectorAll("[data-copy-email]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      const statusNode = button.closest(".social-card")?.querySelector(".copy-status");
      await copyText(button.dataset.copyEmail, statusNode);
    });
  });
};
