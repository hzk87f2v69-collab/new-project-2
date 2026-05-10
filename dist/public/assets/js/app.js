// ── DYNAMIC API BASE CONFIGURATION ─────────────────────────
// Set your deployed backend URL here if different from frontend domain
const PROD_BACKEND_URL = "https://your-backend-api.vercel.app"; 

const getApiBase = () => {
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  if (isLocal) return "/api";
  
  // If deployed, use the full backend URL or relative if same domain
  return PROD_BACKEND_URL + "/api";
};

const API_BASE = getApiBase();
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
  tracksLoaded: false,
  appConfigLoaded: false,
  appConfig: {
    demoMode: false,
    databaseConnected: true
  }
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
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, options);
  } catch (error) {
    throw new Error("Local server is not running.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
    }

    throw new Error(data.message || "Something went wrong.");
  }

  return data;
};

const loadAppConfig = async (force = false) => {
  if (state.appConfigLoaded && !force) {
    return state.appConfig;
  }

  try {
    const response = await fetch(`${API_BASE.replace("/api", "")}/health`);
    const data = await response.json().catch(() => ({}));
    state.appConfig = {
      demoMode: Boolean(data.demoMode),
      databaseConnected: data.databaseConnected !== false
    };
    state.appConfigLoaded = true;
  } catch (error) {
    state.appConfig = {
      demoMode: false,
      databaseConnected: true
    };
  }

  return state.appConfig;
};

const isDemoMode = () => Boolean(state.appConfig.demoMode);

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
    link.textContent = isLoggedIn() ? "Profile" : "Login";
    link.setAttribute("href", isLoggedIn() ? "/profile.html" : "/auth");
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
    paymentMethod: ["demo"].includes(selection.paymentMethod) ? selection.paymentMethod : ""
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
  await loadAppConfig(force).catch(() => null);

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

const buildCheckoutPayload = (selection) => {
  const payload = {
    trackIds: selection.trackIds
  };

  if (selection.bundleId) {
    payload.bundleId = selection.bundleId;
  }

  return payload;
};

const launchDemoUnlock = async (selection) => {
  const normalized = purchaseSelection(selection);

  if (!normalized || !ensureAuth()) {
    return false;
  }

  const unlockData = await api("/payment/dev-unlock", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(buildCheckoutPayload(normalized))
  });

  if (state.user) {
    state.user.purchasedTracks = unlockData.purchasedTracks;
    localStorage.setItem("acefitness_user", JSON.stringify(state.user));
  }

  clearPurchaseSelection();
  window.location.href = window.location.protocol === "file:" ? "my-courses.html" : (unlockData.redirectTo || "/my-courses");
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

  if (paymentMethod === "demo") {
    if (!ensureAuth()) {
      return false;
    }

    await launchDemoUnlock(normalized);
    return true;
  }

  throw new Error("Please choose a valid unlock option.");
};

const resumePendingPurchase = async () => {
  const pendingSelection = getPurchaseSelection();

  if (!pendingSelection?.paymentMethod) {
    return false;
  }

  await launchDemoUnlock({
    ...pendingSelection,
    paymentMethod: "demo"
  });
  return true;
};

const rewriteFilePreviewLinks = () => {
  if (window.location.protocol !== "file:") return;

  const routeMap = {
    "/": "index.html",
    "/index": "index.html",
    "/auth": "auth.html",
    "/dashboard": "dashboard.html",
    "/programs": "programs.html",
    "/workout-tracker": "workout-tracker.html",
    "/find-gyms": "map.html",
    "/profile": "profile.html",
    "/profile.html": "profile.html",
    "/my-courses": "my-courses.html",
    "/player": "player.html",
    "/contact": "contact.html",
    "/payment-success": "payment-success.html",
    "/ai": "ai.html"
  };

  document.querySelectorAll("a[href^='/']").forEach(link => {
    const rawHref = link.getAttribute("href");
    const match = rawHref.match(/^([^?#]+)(.*)$/);
    const route = match?.[1] || rawHref;
    const suffix = match?.[2] || "";
    const fileName = routeMap[route];

    if (fileName) {
      link.setAttribute("href", `${fileName}${suffix}`);
    }
  });
};


document.addEventListener("DOMContentLoaded", async () => {
  rewriteFilePreviewLinks();
  updateNav();
  await loadAppConfig().catch(() => null);

  if (typeof initSocialContactButtons === "function") {
    initSocialContactButtons();
  }

  if (typeof initFloatingWhatsApp === "function") {
    initFloatingWhatsApp();
  }

  // Note: .toggle-btn listener removed here as it is handled by specific module scripts (e.g. workout-tracker.js) to avoid conflicts.

  // ── Bottom Navigation Active State ──────────────────────────
  const path = window.location.pathname;
  const bottomNavItems = document.querySelectorAll(".bottom-nav .nav-item");
  bottomNavItems.forEach(item => {
    const itemPath = item.getAttribute("href");
    if (path === itemPath || (path === "/" && itemPath === "/")) {
      bottomNavItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
    }
  });

  // Animations disabled as per request
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  revealElements.forEach(el => {
    el.classList.add('is-revealed');
  });

});


// Register Service Worker for PWA
if (window.location.protocol !== "file:" && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered', reg))
      .catch(err => console.error('Service Worker registration failed', err));
  });
}
