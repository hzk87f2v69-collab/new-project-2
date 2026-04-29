const ACE_QR_IMAGE_SRC = "/public/assets/images/upi-qr.png";

let activeCheckoutSelection = null;
let activeUpiSelection = null;

const isMobileDevice = () =>
  /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(navigator.userAgent) || window.innerWidth < 768;

const createUPILink = (selection) => {
  const params = new URLSearchParams({
    pa: ACE_PAYMENT_CONFIG.upiId,
    pn: ACE_PAYMENT_CONFIG.businessName,
    am: String(selection.amount),
    tn: selection.planName,
    cu: "INR"
  });

  return `upi://pay?${params.toString()}`;
};

const createSuccessUrl = (selection) => {
  const params = new URLSearchParams({
    type: selection.type,
    plan: selection.planName,
    amount: String(selection.amount),
    bundle: selection.bundleId || "",
    tracks: selection.trackIds.join(","),
    payment: "upi"
  });

  return `/payment-success?${params.toString()}`;
};

const getSelectionSummary = (selection) => {
  const trackLabel = selection.type === "bundle" ? "Included tracks" : "Selected track";
  return {
    kind: selection.type === "bundle" ? "Bundle purchase" : "Single track purchase",
    trackLabel,
    tracks: formatTrackNames(selection.trackIds, "Selected programs")
  };
};

const attachModalDismissHandlers = (modal, onClose) => {
  modal.querySelectorAll("[data-close-modal='true']").forEach((node) => {
    node.addEventListener("click", onClose);
  });
};

const ensurePaymentChoiceModal = () => {
  let modal = document.getElementById("paymentChoiceModal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "paymentChoiceModal";
  modal.className = "payment-modal hide";
  modal.innerHTML = `
    <div class="payment-modal-backdrop" data-close-modal="true"></div>
    <div class="payment-modal-dialog payment-choice-dialog" role="dialog" aria-modal="true" aria-labelledby="paymentChoiceTitle">
      <button class="payment-modal-close" type="button" aria-label="Close payment choice" data-close-modal="true">
        <span></span>
        <span></span>
      </button>
      <div class="payment-modal-header">
        <span class="eyebrow">Choose Payment</span>
        <h2 id="paymentChoiceTitle">Pick the checkout method that fits you best</h2>
        <p>Both options use the same program selection. Choose instant Razorpay checkout or manual UPI payment.</p>
      </div>
      <div class="selection-summary">
        <div>
          <span class="helper">Selected plan</span>
          <strong id="paymentChoicePlanName">Plan name</strong>
        </div>
        <div class="selection-summary-side">
          <span class="helper">Purchase type</span>
          <strong id="paymentChoiceType">Track purchase</strong>
        </div>
      </div>
      <div class="selection-pill-list">
        <span class="pill" id="paymentChoiceAmount">₹0</span>
        <span class="pill" id="paymentChoiceTracks">Selected programs</span>
      </div>
      <div class="payment-choice-grid">
        <article class="payment-choice-card">
          <span class="eyebrow">UPI / QR</span>
          <h3>Manual payment</h3>
          <p>Scan the QR code, pay in your UPI app, then send your screenshot or UTR for verification.</p>
          <ul class="notes-list compact-list">
            <li>Works well on both desktop and mobile</li>
            <li>No login required before opening the UPI step</li>
          </ul>
          <button class="btn" type="button" id="chooseUpiPayment">Continue with UPI</button>
        </article>
        <article class="payment-choice-card">
          <span class="eyebrow">Razorpay</span>
          <h3>Instant unlock</h3>
          <p>Pay online and unlock your purchased programs automatically after successful verification.</p>
          <ul class="notes-list compact-list">
            <li>Login is required before checkout</li>
            <li>Best if you want instant dashboard access</li>
          </ul>
          <button class="btn-outline" type="button" id="chooseRazorpayPayment">Continue with Razorpay</button>
        </article>
      </div>
      <p id="paymentChoiceStatus" class="status-text"></p>
    </div>
  `;

  document.body.appendChild(modal);

  attachModalDismissHandlers(modal, closePaymentChoiceModal);

  modal.querySelector("#chooseUpiPayment").addEventListener("click", async () => {
    const statusNode = modal.querySelector("#paymentChoiceStatus");

    if (!activeCheckoutSelection) {
      setStatus(statusNode, "Please reopen checkout and try again.", "error");
      return;
    }

    closePaymentChoiceModal();

    try {
      await startPurchaseFlow(activeCheckoutSelection, "upi");
    } catch (error) {
      showGlobalNotice(error.message, "error");
    }
  });

  modal.querySelector("#chooseRazorpayPayment").addEventListener("click", async () => {
    const statusNode = modal.querySelector("#paymentChoiceStatus");

    if (!activeCheckoutSelection) {
      setStatus(statusNode, "Please reopen checkout and try again.", "error");
      return;
    }

    closePaymentChoiceModal();

    try {
      await startPurchaseFlow(activeCheckoutSelection, "razorpay");
    } catch (error) {
      showGlobalNotice(error.message, "error");
    }
  });

  return modal;
};

const openPaymentChoiceModal = (selection) => {
  const modal = ensurePaymentChoiceModal();
  const summary = getSelectionSummary(selection);
  activeCheckoutSelection = normalizePurchaseSelection(selection);

  modal.classList.remove("hide");
  document.body.classList.add("modal-open");

  modal.querySelector("#paymentChoicePlanName").textContent = selection.planName;
  modal.querySelector("#paymentChoiceType").textContent = summary.kind;
  modal.querySelector("#paymentChoiceAmount").textContent = currency(selection.amount);
  modal.querySelector("#paymentChoiceTracks").textContent = summary.tracks;

  const razorpayButton = modal.querySelector("#chooseRazorpayPayment");
  razorpayButton.textContent = isLoggedIn() ? "Continue with Razorpay" : "Login and pay with Razorpay";

  setStatus(modal.querySelector("#paymentChoiceStatus"), "");
};

const closePaymentChoiceModal = () => {
  const modal = document.getElementById("paymentChoiceModal");
  if (!modal) return;

  modal.classList.add("hide");

  if (document.getElementById("upiPaymentModal")?.classList.contains("hide") !== false) {
    document.body.classList.remove("modal-open");
  }
};

const ensureUPIPaymentModal = () => {
  let modal = document.getElementById("upiPaymentModal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "upiPaymentModal";
  modal.className = "payment-modal hide";
  modal.innerHTML = `
    <div class="payment-modal-backdrop" data-close-modal="true"></div>
    <div class="payment-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="paymentModalTitle">
      <button class="payment-modal-close" type="button" aria-label="Close payment modal" data-close-modal="true">
        <span></span>
        <span></span>
      </button>
      <div class="payment-modal-header">
        <span class="eyebrow">Scan & Pay</span>
        <h2 id="paymentModalTitle">Complete your UPI payment</h2>
        <p>Open any UPI app, scan the QR, and then confirm your payment details below.</p>
      </div>
      <div class="payment-modal-qr-shell">
        <img id="paymentModalQr" class="payment-modal-qr" src="${ACE_QR_IMAGE_SRC}" alt="UPI QR Code for Rahul Kushwaha" />
      </div>
      <div class="payment-modal-plan">
        <div>
          <span class="helper">Selected Plan</span>
          <strong id="paymentModalPlanName">Plan name</strong>
        </div>
        <div class="payment-modal-amount-wrap">
          <span class="helper">Amount</span>
          <strong id="paymentModalPlanAmount">₹0</strong>
        </div>
      </div>
      <div class="payment-track-summary">
        <span class="helper" id="paymentModalTrackLabel">Selected programs</span>
        <strong id="paymentModalTrackNames">Selected programs</strong>
      </div>
      <div class="payment-upi-card">
        <div>
          <span class="helper">UPI ID</span>
          <strong id="paymentModalUpiId">${ACE_PAYMENT_CONFIG.upiId}</strong>
        </div>
        <button class="social-copy" id="copyUpiButton" type="button">Copy UPI ID</button>
      </div>
      <div class="payment-modal-actions">
        <button class="btn" id="paymentPaidButton" type="button">I Have Paid</button>
        <button class="btn-outline" id="paymentSwitchMethodButton" type="button">Use Razorpay Instead</button>
        <a class="btn-outline" href="${ACE_PAYMENT_CONFIG.whatsappHref}" target="_blank" rel="noreferrer">WhatsApp Support</a>
      </div>
      <p class="payment-modal-note">After payment, send your screenshot or UTR on WhatsApp for faster confirmation.</p>
      <p id="paymentModalCopyStatus" class="status-text"></p>
    </div>
  `;

  document.body.appendChild(modal);

  attachModalDismissHandlers(modal, closePaymentModal);

  modal.querySelector("#copyUpiButton").addEventListener("click", async () => {
    const statusNode = modal.querySelector("#paymentModalCopyStatus");
    const copied = await copyToClipboard(ACE_PAYMENT_CONFIG.upiId);
    setStatus(statusNode, copied ? "UPI ID copied." : "Could not copy the UPI ID. Please copy it manually.", copied ? "success" : "error");
  });

  modal.querySelector("#paymentSwitchMethodButton").addEventListener("click", async () => {
    if (!activeUpiSelection) return;

    closePaymentModal();

    try {
      await startPurchaseFlow(activeUpiSelection, "razorpay");
    } catch (error) {
      showGlobalNotice(error.message, "error");
    }
  });

  return modal;
};

const openPaymentModal = (selection) => {
  const modal = ensureUPIPaymentModal();
  const summary = getSelectionSummary(selection);

  activeUpiSelection = normalizePurchaseSelection(selection);
  modal.classList.remove("hide");
  document.body.classList.add("modal-open");

  modal.querySelector("#paymentModalPlanName").textContent = selection.planName;
  modal.querySelector("#paymentModalPlanAmount").textContent = currency(selection.amount);
  modal.querySelector("#paymentModalTrackLabel").textContent = summary.trackLabel;
  modal.querySelector("#paymentModalTrackNames").textContent = summary.tracks;
  modal.querySelector("#paymentPaidButton").onclick = () => {
    window.location.href = createSuccessUrl(selection);
  };
  setStatus(modal.querySelector("#paymentModalCopyStatus"), "");
};

const closePaymentModal = () => {
  const modal = document.getElementById("upiPaymentModal");
  if (!modal) return;
  modal.classList.add("hide");

  if (document.getElementById("paymentChoiceModal")?.classList.contains("hide") !== false) {
    document.body.classList.remove("modal-open");
  }
};

const beginCheckout = (selection) => {
  const normalized = normalizePurchaseSelection(selection);
  if (!normalized) return;
  openPaymentChoiceModal(normalized);
};

const beginUPIPayment = (selection) => {
  const normalized = purchaseSelection({
    ...selection,
    paymentMethod: "upi"
  });

  if (!normalized) return;

  const successUrl = createSuccessUrl(normalized);

  if (isMobileDevice()) {
    const upiLink = createUPILink(normalized);
    window.location.href = upiLink;
    setTimeout(() => {
      window.location.href = successUrl;
    }, 1800);
    return;
  }

  openPaymentModal(normalized);
};
