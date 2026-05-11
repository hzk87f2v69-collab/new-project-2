const HOME_TRACKER_DEFAULT_DAYS = {
  monday: { muscles: "Chest · Shoulder", exercises: [] },
  tuesday: { muscles: "Back · Biceps", exercises: [] },
  wednesday: { muscles: "Legs", exercises: [] },
  thursday: { muscles: "Push", exercises: [] },
  friday: { muscles: "Pull", exercises: [] },
  saturday: { muscles: "Arms · Abs", exercises: [] },
  sunday: { muscles: "Rest · Recovery", exercises: [] }
};

const escapeHomeTrackerHtml = value => String(value || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const parseHomeTrackerJson = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (error) {
    return fallback;
  }
};

const formatHomeTrackerNumber = value => {
  if (value >= 100000) return `${Math.round(value / 1000)}k`;
  if (value >= 10000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
};

const getHomeTrackerWeekStats = logs => {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();
  const start = end - 6 * 86400000;
  const days = new Set();
  let sets = 0;
  let volume = 0;

  logs.forEach(log => {
    if (!log?.date || !log.sets) return;
    const ts = new Date(log.date.replace(/-/g, "/")).getTime();
    if (isNaN(ts) || ts < start || ts > end) return;
    days.add(log.date);
    log.sets.forEach(set => {
      sets += 1;
      volume += (Number(set.reps) || 0) * (Number(set.weight) || 0);
    });
  });

  return { sets, volume: Math.round(volume), days: days.size };
};

const initHomeTrackerWidget = () => {
  const widget = document.getElementById("homeTrackerWidget");
  if (!widget) return;

  // --- Calorie Data ---
  const todayKey = () => new Date().toISOString().split("T")[0];
  const logs = parseHomeTrackerJson("ace_cal_logs", {});
  const todayLogs = logs[todayKey()] || [];
  const targets = parseHomeTrackerJson("ace_cal_targets", { calories: 2400, protein: 180, carbs: 250, fat: 70 });
  
  const totals = todayLogs.reduce((a, c) => ({ 
    cals: a.cals + (c.cals || 0), 
    p: a.p + (c.p || 0), 
    c: a.c + (c.c || 0) 
  }), { cals: 0, p: 0, c: 0 });

  const percent = Math.min(100, Math.round((totals.cals / targets.calories) * 100));
  const ring = document.getElementById("homeTrackerRing");

  const elements = {
    day: document.getElementById("homeTrackerDay"),
    muscles: document.getElementById("homeTrackerMuscles"),
    sets: document.getElementById("homeTrackerSets"),
    volume: document.getElementById("homeTrackerVolume"),
    streak: document.getElementById("homeTrackerStreak"),
    percent: document.getElementById("homeTrackerPercent"),
    exercises: document.getElementById("homeTrackerExercises")
  };

  // Update UI Labels
  if (elements.day) elements.day.textContent = "Nutrition Today";
  if (elements.muscles) elements.muscles.textContent = `${totals.cals} kcal consumed / ${targets.calories} target`;
  
  // Update Stats Row (Changing Labels in HTML next)
  if (elements.sets) elements.sets.textContent = totals.cals;
  if (elements.volume) elements.volume.textContent = totals.p + "g";
  if (elements.streak) elements.streak.textContent = totals.c + "g";
  
  if (elements.percent) elements.percent.textContent = totals.cals;

  if (ring) {
    // Circumference is ~264 for r=42
    ring.style.strokeDashoffset = String(264 - (264 * percent / 100));
  }

  // Handle Bottom Links/Labels in HTML
};

document.addEventListener("DOMContentLoaded", async () => {
  const pricingGrid = document.getElementById("pricingGrid");
  const contactForm = document.getElementById("contactForm");
  const contactStatus = document.getElementById("contactStatus");

  initHomeTrackerWidget();
  window.addEventListener("storage", event => {
    if (["ace_wt_plan", "ace_wt_library", "ace_wt_logs", "ace_cal_logs", "ace_cal_targets"].includes(event.key)) {
      initHomeTrackerWidget();
    }
  });

  const renderLoadingState = () => {
    if (!pricingGrid) return;

    pricingGrid.innerHTML = Array.from({ length: 3 }, () => `
      <article class="pricing-card pricing-card-loading">
        <div class="eyebrow">Loading</div>
        <h3>Fetching program details...</h3>
        <p class="muted">A cleaner checkout and preview experience is loading for you.</p>
      </article>
    `).join("");
  };

  const renderPricing = (tracks, bundles) => {
    if (!pricingGrid) return;

    pricingGrid.innerHTML = [
      ...tracks.map(
        (track, index) => `
          <article class="pricing-card ${index === 1 ? "featured" : ""}">
            <div class="eyebrow">${track.icon} Track</div>
            <h3>${track.name}</h3>
            <p>${track.target}</p>
            <div class="price">${currency(track.price)} <small>/ one-time</small></div>
            <div class="pill-list">
              <span class="pill">${track.durationWeeks} weeks</span>
              <span class="pill">${track.classesCount} classes</span>
            </div>
            <ul class="benefits-list">
              ${track.benefits.map((benefit) => `<li>${benefit}</li>`).join("")}
            </ul>
            <div class="stack-actions">
              <a class="btn-outline" href="player.html?track=${track.trackId}&preview=true">Preview Modules</a>
              <button class="btn" data-track-buy="${track.trackId}">Unlock Instantly</button>
            </div>
          </article>
        `
      ),
      ...bundles.map(
        (bundle) => `
          <article class="pricing-card">
            <div class="eyebrow">Bundle Offer</div>
            <h3>${bundle.name}</h3>
            <p>${bundle.description}</p>
            <div class="price">${currency(bundle.price)} <small>/ bundle</small></div>
            <p class="muted">You save ${currency(bundle.savings)} instantly.</p>
            <div class="stack-actions">
              ${
                bundle.bundleId === "duo"
                  ? `<a class="btn" href="programs.html#bundle-${bundle.bundleId}">Customize Bundle</a>`
                  : `<button class="btn" data-bundle-buy="${bundle.bundleId}">Unlock Instantly</button>`
              }
              <a class="btn-outline" href="programs.html#bundle-${bundle.bundleId}">View Details</a>
            </div>
          </article>
        `
      )
    ].join("");

    pricingGrid.querySelectorAll("[data-track-buy]").forEach((button) => {
      button.addEventListener("click", () => {
        try {
          beginCheckout(buildTrackPurchaseSelection(button.dataset.trackBuy));
        } catch (error) {
          showGlobalNotice(error.message, "error");
        }
      });
    });

    pricingGrid.querySelectorAll("[data-bundle-buy]").forEach((button) => {
      button.addEventListener("click", () => {
        try {
          beginCheckout(buildBundlePurchaseSelection(button.dataset.bundleBuy));
        } catch (error) {
          showGlobalNotice(error.message, "error");
        }
      });
    });
  };

  if (pricingGrid) {
    renderLoadingState();

    try {
      const { tracks, bundles } = await fetchTracks();
      renderPricing(tracks, bundles);
    } catch (error) {
      pricingGrid.innerHTML = `
        <article class="pricing-card page-message-card">
          <h3>Programs could not load right now</h3>
          <p class="status-text error">${error.message}</p>
          <div class="stack-actions">
            <a class="btn" href="programs.html">Open Programs Page</a>
          </div>
        </article>
      `;
    }
  }

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
      setStatus(contactStatus, "Inquiry sent. The Ace Fitness team will reach out shortly.", "success");
    } catch (error) {
      setStatus(contactStatus, error.message, "error");
    } finally {
      setButtonBusy(submitButton, false);
    }
  });
});
