let activeCheckoutSelection = null;

const getSelectionSummary = (selection) => ({
  kind: selection.type === "bundle" ? "Bundle unlock" : "Single course unlock",
  tracks: formatTrackNames(selection.trackIds, "Selected programs")
});

const attachModalDismissHandlers = (modal, onClose) => {
  modal.querySelectorAll("[data-close-modal='true']").forEach((node) => {
    node.addEventListener("click", onClose);
  });
};

const ensureCheckoutModal = () => {
  let modal = document.getElementById("paymentChoiceModal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "paymentChoiceModal";
  modal.className = "payment-modal hide";
  modal.innerHTML = `
    <div class="payment-modal-backdrop" data-close-modal="true"></div>
    <div class="payment-modal-dialog payment-choice-dialog" role="dialog" aria-modal="true" aria-labelledby="paymentChoiceTitle">
      <button class="payment-modal-close" type="button" aria-label="Close unlock dialog" data-close-modal="true">
        <span></span>
        <span></span>
      </button>
      <div class="payment-modal-header">
        <span class="eyebrow">Instant Access</span>
        <h2 id="paymentChoiceTitle">Unlock this course now</h2>
        <p id="paymentChoiceDescription">
          This build uses a dummy checkout so you can test the full access flow without Razorpay or manual payment.
        </p>
      </div>
      <div class="selection-summary">
        <div>
          <span class="helper">Selected plan</span>
          <strong id="paymentChoicePlanName">Plan name</strong>
        </div>
        <div class="selection-summary-side">
          <span class="helper">Access type</span>
          <strong id="paymentChoiceType">Course unlock</strong>
        </div>
      </div>
      <div class="selection-pill-list">
        <span class="pill" id="paymentChoiceAmount">₹0</span>
        <span class="pill" id="paymentChoiceTracks">Selected programs</span>
      </div>
      <div class="payment-choice-grid payment-choice-grid-single">
        <article class="payment-choice-card payment-choice-card-emphasis">
          <span class="eyebrow">Dummy Checkout</span>
          <h3>Complete test payment</h3>
          <p>We’ll unlock the selected course instantly and send the user straight to the My Courses page.</p>
          <ul class="notes-list compact-list">
            <li>Login is required before access is granted</li>
            <li>Progress will stay connected to the unlocked course</li>
            <li>No Razorpay, no UPI, no dead-end confirmation step</li>
          </ul>
          <div class="stack-actions">
            <button class="btn" type="button" id="chooseDemoPayment">Unlock Now</button>
            <button class="btn-outline" type="button" id="closeDummyCheckout">Keep Browsing</button>
          </div>
        </article>
      </div>
      <p id="paymentChoiceStatus" class="status-text"></p>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => {
    modal.classList.add("hide");
    document.body.classList.remove("modal-open");
  };

  attachModalDismissHandlers(modal, closeModal);
  modal.querySelector("#closeDummyCheckout").addEventListener("click", closeModal);

  modal.querySelector("#chooseDemoPayment").addEventListener("click", async () => {
    const statusNode = modal.querySelector("#paymentChoiceStatus");

    if (!activeCheckoutSelection) {
      setStatus(statusNode, "Please reopen checkout and try again.", "error");
      return;
    }

    closeModal();

    try {
      await startPurchaseFlow(activeCheckoutSelection, "demo");
    } catch (error) {
      showGlobalNotice(error.message, "error");
    }
  });

  return modal;
};

const openCheckoutModal = (selection) => {
  const modal = ensureCheckoutModal();
  const summary = getSelectionSummary(selection);
  activeCheckoutSelection = normalizePurchaseSelection(selection);

  modal.classList.remove("hide");
  document.body.classList.add("modal-open");

  modal.querySelector("#paymentChoicePlanName").textContent = selection.planName;
  modal.querySelector("#paymentChoiceType").textContent = summary.kind;
  modal.querySelector("#paymentChoiceAmount").textContent = currency(selection.amount);
  modal.querySelector("#paymentChoiceTracks").textContent = summary.tracks;
  setStatus(modal.querySelector("#paymentChoiceStatus"), "");
};

const beginCheckout = (selection) => {
  const normalized = normalizePurchaseSelection(selection);
  if (!normalized) return;
  openCheckoutModal(normalized);
};
