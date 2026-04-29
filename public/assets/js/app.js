const API_BASE = "/api";
const PURCHASE_SELECTION_KEY = "acefitness_selection";

const ACE_PAYMENT_CONFIG = {
  upiId: "kushwaharahul@ptyes",
  businessName: "Rahul Kushwaha",
  whatsappNumber: "7223888352",
  whatsappHref: "https://wa.me/917223888352",
  email: "primefficialyt@gmail.com",
  instagramUrl: "https://instagram.com/yourusername"
};

const state = {
  token: localStorage.getItem("acefitness_token") || "",
  user: JSON.parse(localStorage.getItem("acefitness_user") || "null"),
  tracks: [],
  bundles: [],
  tracksLoaded: false
};

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(amount) || 0);

const getHeaders = (isJson = true) => {
  const headers = {};
  if (isJson) headers["Content-Type"] = "application/json";
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  return headers;
};

const api = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
};

const saveAuth = (token, user) => {
  state.token = token;
  state.user = user;
  localStorage.setItem("acefitness_token", token);
  localStorage.setItem("acefitness_user", JSON.stringify(user));
  updateNav();
};

const clearAuth = () => {
  state.token = "";
  state.user = null;
  localStorage.removeItem("acefitness_token");
  localStorage.removeItem("acefitness_user");
  updateNav();
};

const isLoggedIn = () => Boolean(state.token);

const updateNav = () => {
  document.querySelectorAll("[data-auth-link]").forEach((link) => {
    link.textContent = isLoggedIn() ? "Dashboard" : "Login";
    link.setAttribute("href", isLoggedIn() ? "/dashboard" : "/auth");
  });
};

const setStatus = (element, message, type = "") => {
  if (!element) return;
  element.className = `status-text ${type}`.trim();
  element.textContent = message || "";
  element.hidden = !message;
};

const setButtonBusy = (button, isBusy, busyLabel) => {
  if (!button) return;

  if (!button.dataset.defaultLabel) {
    button.dataset.defaultLabel = button.textContent;
  }

  button.disabled = isBusy;
  button.setAttribute("aria-busy", String(isBusy));
  button.textContent = isBusy ? busyLabel : button.dataset.defaultLabel;
};

const ensureGlobalNoticeRoot = () => {
  let root = document.getElementById("globalNoticeRoot");
  if (root) return root;

  root = document.createElement("div");
  root.id = "globalNoticeRoot";
  root.className = "global-notice-stack";
  root.setAttribute("aria-live", "polite");
  document.body.appendChild(root);
  return root;
};

const showGlobalNotice = (message, type = "", timeout = 3600) => {
  if (!message) return;

  const root = ensureGlobalNoticeRoot();
  const notice = document.createElement("div");
  notice.className = `global-notice ${type}`.trim();
  notice.textContent = message;
  root.appendChild(notice);

  window.setTimeout(() => {
    notice.remove();
    if (!root.childElementCount) {
      root.remove();
    }
  }, timeout);
};

const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "true");
    input.style.position = "absolute";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();
    return copied;
  } catch (error) {
    return false;
  }
};

const normalizePurchaseSelection = (selection) => {
  if (!selection || typeof selection !== "object") {
    return null;
  }

  return {
    type: selection.type === "bundle" ? "bundle" : "track",
    trackIds: [...new Set((selection.trackIds || []).filter(Boolean))],
    bundleId: selection.bundleId || null,
    planName: selection.planName || selection.name || "Ace Fitness Program",
    amount: Number(selection.amount) || 0,
    paymentMethod: ["upi", "razorpay"].includes(selection.paymentMethod) ? selection.paymentMethod : ""
  };
};

const purchaseSelection = (selection) => {
  const normalized = normalizePurchaseSelection(selection);
  if (!normalized) return null;
  sessionStorage.setItem(PURCHASE_SELECTION_KEY, JSON.stringify(normalized));
  return normalized;
};

const getPurchaseSelection = () => {
  const raw = sessionStorage.getItem(PURCHASE_SELECTION_KEY);
  if (!raw) return null;

  try {
    return normalizePurchaseSelection(JSON.parse(raw));
  } catch (error) {
    clearPurchaseSelection();
    return null;
  }
};

const clearPurchaseSelection = () => {
  sessionStorage.removeItem(PURCHASE_SELECTION_KEY);
};

const fetchTracks = async (force = false) => {
  if (state.tracksLoaded && !force) {
    return { tracks: state.tracks, bundles: state.bundles };
  }

  const data = await api("/tracks");
  state.tracks = Array.isArray(data.tracks) ? data.tracks : [];
  state.bundles = Array.isArray(data.bundles) ? data.bundles : [];
  state.tracksLoaded = true;
  return data;
};

const ensureAuth = () => {
  if (!isLoggedIn()) {
    window.location.href = "/auth";
    return false;
  }
  return true;
};

const buildTrackPurchaseSelection = (trackId) => {
  const track = state.tracks.find((item) => item.trackId === trackId);

  if (!track) {
    throw new Error("This program is unavailable right now. Please refresh and try again.");
  }

  return normalizePurchaseSelection({
    type: "track",
    trackIds: [track.trackId],
    bundleId: null,
    planName: track.name,
    amount: track.price
  });
};

const buildBundlePurchaseSelection = (bundleId, selectedTrackIds = []) => {
  const bundle = state.bundles.find((item) => item.bundleId === bundleId);
  const validTrackIds = new Set(state.tracks.map((item) => item.trackId));

  if (!bundle) {
    throw new Error("This bundle is unavailable right now. Please refresh and try again.");
  }

  let trackIds = [...new Set(selectedTrackIds.filter(Boolean))];

  if (bundleId === "duo") {
    if (trackIds.length !== 2) {
      throw new Error("Choose exactly 2 tracks for the duo bundle.");
    }

    if (!trackIds.every((trackId) => validTrackIds.has(trackId))) {
      throw new Error("Please choose valid tracks for the duo bundle.");
    }
  }

  if (bundleId === "all-access") {
    trackIds = state.tracks.map((track) => track.trackId);
  }

  return normalizePurchaseSelection({
    type: "bundle",
    trackIds,
    bundleId,
    planName: bundle.name,
    amount: bundle.price
  });
};

const formatTrackNames = (trackIds, fallback = "Selected programs") => {
  if (!trackIds?.length) return fallback;

  const names = trackIds
    .map((trackId) => state.tracks.find((track) => track.trackId === trackId)?.name || trackId)
    .filter(Boolean);

  return names.length ? names.join(", ") : fallback;
};

const launchPayment = async (selection) => {
  const normalized = purchaseSelection(selection);

  if (!normalized || !ensureAuth()) {
    return false;
  }

  if (typeof window.Razorpay !== "function") {
    throw new Error("Razorpay checkout is unavailable on this page right now.");
  }

  const createData = await api("/payment/create-order", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      trackIds: normalized.trackIds,
      bundleId: normalized.bundleId
    })
  });

  const options = {
    key: createData.key,
    amount: createData.order.amount,
    currency: createData.order.currency,
    name: "Ace Fitness",
    description: normalized.planName,
    order_id: createData.order.id,
    handler: async function handleSuccess(response) {
      const verifyData = await api("/payment/verify", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(response)
      });

      if (state.user) {
        state.user.purchasedTracks = verifyData.purchasedTracks;
        localStorage.setItem("acefitness_user", JSON.stringify(state.user));
      }

      clearPurchaseSelection();
      window.location.href = "/dashboard";
    },
    prefill: {
      name: state.user?.name || "",
      email: state.user?.email || ""
    },
    theme: {
      color: "#20c7ff"
    },
    modal: {
      ondismiss: function onDismiss() {
        showGlobalNotice("Razorpay checkout closed. You can continue this payment anytime.", "info");
      }
    }
  };

  const razorpayInstance = new window.Razorpay(options);
  razorpayInstance.open();
  return true;
};

const startPurchaseFlow = async (selection, paymentMethod) => {
  const normalized = purchaseSelection({
    ...selection,
    paymentMethod
  });

  if (!normalized) {
    return false;
  }

  if (paymentMethod === "upi") {
    beginUPIPayment(normalized);
    return true;
  }

  if (paymentMethod === "razorpay") {
    if (!ensureAuth()) {
      return false;
    }

    await launchPayment(normalized);
    return true;
  }

  throw new Error("Please choose a valid payment method.");
};

const resumePendingPurchase = async () => {
  const pendingSelection = getPurchaseSelection();

  if (!pendingSelection?.paymentMethod) {
    return false;
  }

  if (pendingSelection.paymentMethod === "upi") {
    await fetchTracks().catch(() => null);
    beginUPIPayment(pendingSelection);
    return true;
  }

  if (pendingSelection.paymentMethod === "razorpay") {
    await launchPayment(pendingSelection);
    return true;
  }

  return false;
};

document.addEventListener("DOMContentLoaded", () => {
  updateNav();

  if (typeof initSocialContactButtons === "function") {
    initSocialContactButtons();
  }

  if (typeof initFloatingWhatsApp === "function") {
    initFloatingWhatsApp();
  }
});
