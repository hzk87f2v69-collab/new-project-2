/* ═══════════════════════════════════════════════════════════
   CALORIE TRACKER  –  Ace Fitness
   ═══════════════════════════════════════════════════════════ */

const CT_KEY = "ace_ct_v2";
const CT_PROFILE_KEY = "ace_ct_profile";
const USDA_KEY = "DEMO_KEY"; // Free USDA key — works for dev

const DAYS_OF_WEEK = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
const MEAL_CONFIG = [
  { key: "breakfast", label: "Breakfast", icon: "🥞" },
  { key: "lunch",     label: "Lunch",     icon: "🥗" },
  { key: "dinner",    label: "Dinner",    icon: "🍝" },
  { key: "snacks",    label: "Snacks",    icon: "🍎" },
  { key: "custom",   label: "Custom Meal", icon: "✏️" },
];

/* ── State ── */
const CS = {
  activeMeal: null,   // key of meal being edited
  activeDate: null,   // "YYYY-MM-DD"
  selectedFood: null, // from USDA lookup
  searchDebounce: null,
};

/* ── Storage ── */
const getCTLogs  = () => JSON.parse(localStorage.getItem(CT_KEY) || "{}");
const saveCTLogs = v  => localStorage.setItem(CT_KEY, JSON.stringify(v));
const getCTProfile  = () => JSON.parse(localStorage.getItem(CT_PROFILE_KEY) || "{}");
const saveCTProfile = v  => localStorage.setItem(CT_PROFILE_KEY, JSON.stringify(v));

/* ── Date helpers ── */
const todayCT = () => new Date().toISOString().slice(0,10);
const getWeekDates = () => {
  const today = new Date();
  const day   = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7));
  return DAYS_OF_WEEK.map((d, i) => {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + i);
    return dt.toISOString().slice(0,10);
  });
};
const dayLabel = dateStr => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "long" }).toUpperCase();
};

/* ── Data helpers ── */
const ensureDay = (logs, date) => {
  if (!logs[date]) {
    logs[date] = { date, meals:{breakfast:[],lunch:[],dinner:[],snacks:[],custom:[]}, waterMl: 0 };
  }
  return logs[date];
};

const dayTotal = (dayData) =>
  Object.values(dayData.meals).flat().reduce((s, f) => s + (f.cals || 0), 0);

const mealTotal = (foods) => foods.reduce((s, f) => s + (f.cals || 0), 0);

const getGoal = () => {
  const p = getCTProfile();
  return p.goalCals ? parseInt(p.goalCals) : null;
};

const getStreak = () => {
  const logs = getCTLogs();
  let streak = 0;
  const dt = new Date();
  for (let i = 0; i < 365; i++) {
    const key = new Date(dt.getTime() - i * 86400000).toISOString().slice(0,10);
    const d = logs[key];
    if (d && dayTotal(d) > 0) streak++;
    else break;
  }
  return streak;
};

/* ── USDA Food Search ── */
const searchUSDA = async (query) => {
  if (!query || query.length < 2) return [];
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=8&api_key=${USDA_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return (data.foods || []).map(f => ({
      fdcId: f.fdcId,
      name: f.description,
      brand: f.brandOwner || "",
      calsper100g: (f.foodNutrients || []).find(n => n.nutrientId === 1008)?.value || 0,
    })).filter(f => f.calsper100g > 0);
  } catch(e) {
    return [];
  }
};

/* ── Calculate calories from quantity + unit ── */
const calcCals = (calsper100g, qty, unit) => {
  const unitGrams = { g:1, kg:1000, ml:1, piece:100, bowl:250, cup:240, tbsp:15, tsp:5 };
  const grams = qty * (unitGrams[unit] || 1);
  return Math.round((calsper100g * grams) / 100);
};

/* ── Open / Close modal ── */
const ctOpenModal  = id => document.getElementById(id)?.classList.remove("hide");
const ctCloseModal = id => document.getElementById(id)?.classList.add("hide");

/* ── Navigate between Calorie views ── */
let _ctGoBack = null;
const ctGoTo = (viewId, backFn) => {
  document.querySelectorAll(".wt-view").forEach(v => {
    v.classList.remove("is-active");
    v.classList.remove("slide-behind");
  });
  document.getElementById(viewId)?.classList.add("is-active");
  _ctGoBack = backFn || null;
};

/* ══════════════════════════════════════════════
   RENDER WEEKLY LIST
   ══════════════════════════════════════════════ */
const renderCTWeekList = () => {
  const logs = getCTLogs();
  const goal = getGoal();
  const dates = getWeekDates();
  const container = document.getElementById("ctDayList");
  if (!container) return;

  container.innerHTML = dates.map(date => {
    const dayData = logs[date] || null;
    const total   = dayData ? dayTotal(dayData) : 0;
    const hasData = total > 0;
    const label   = dayLabel(date);
    const isToday = date === todayCT();

    let status = "No meals logged";
    let statusClass = "ct-status-empty";
    if (hasData && goal && total >= goal * 0.95) {
      status = "🎯 Goal reached"; statusClass = "ct-status-goal";
    } else if (hasData) {
      status = "Meals added"; statusClass = "ct-status-ok";
    }

    const pct = goal && total ? Math.min(100, Math.round(total / goal * 100)) : 0;
    const remaining = goal ? (goal - total) : null;

    return `
    <div class="wt-day-card ct-day-card ${isToday ? "ct-today" : ""}" data-ct-date="${date}">
      <div class="wt-day-card-left">
        <div class="wt-day-icon" style="background: ${isToday ? "rgba(10,132,255,0.2)" : "rgba(255,255,255,0.05)"};">
          ${isToday ? "📅" : "📆"}
        </div>
        <div>
          <div class="wt-day-name">${label}${isToday ? " <span class='ct-today-dot'>• Today</span>" : ""}</div>
          <div class="ct-day-status ${statusClass}">${status}</div>
        </div>
      </div>
      <div class="ct-day-right">
        <div class="ct-day-cals">${hasData ? total.toLocaleString() : "—"} <small>kcal</small></div>
        <div class="ct-day-pct">${goal ? pct + "%" : ""}</div>
      </div>
      <div class="wt-day-card-chevron">›</div>
      ${goal ? `<div class="ct-day-prog-bar"><div class="ct-day-prog-fill" style="width:${pct}%"></div></div>` : ""}
    </div>`;
  }).join("");

  // Click handlers
  container.querySelectorAll(".ct-day-card").forEach(card => {
    card.addEventListener("click", () => openCTDay(card.dataset.ctDate));
  });

  // Streak
  const streak = getStreak();
  const sb = document.getElementById("ctStreakBadge");
  if (sb) sb.textContent = `🔥 ${streak} day streak`;

  // Weekly avg
  const wa = document.getElementById("ctWeeklyAvg");
  if (wa) {
    const totals = dates.map(d => logs[d] ? dayTotal(logs[d]) : 0).filter(t => t > 0);
    wa.textContent = totals.length ? Math.round(totals.reduce((a,b)=>a+b,0)/totals.length).toLocaleString() + " kcal" : "— kcal";
  }

  // Water today
  const wtd = document.getElementById("ctWaterDisplay");
  if (wtd) {
    const td = logs[todayCT()];
    wtd.textContent = td ? `${td.waterMl} ml` : "0 ml";
  }
};

/* ══════════════════════════════════════════════
   OPEN DAY DETAIL
   ══════════════════════════════════════════════ */
const openCTDay = (date) => {
  CS.activeDate = date;

  // Title
  const title = document.getElementById("ctDayTitle");
  if (title) title.textContent = dayLabel(date);

  // Switch to cal-day view
  ctGoTo("viewCalDay", () => {
    document.querySelectorAll(".wt-view").forEach(v => v.classList.remove("is-active","slide-behind"));
    document.getElementById("viewCalories").classList.add("is-active");
  });

  // Reset tabs
  document.querySelectorAll("[data-ct-tab]").forEach(t => t.classList.remove("is-active"));
  document.querySelectorAll(".ct-tab-pane").forEach(p => p.classList.remove("is-active"));
  document.querySelector("[data-ct-tab='foods']")?.classList.add("is-active");
  document.getElementById("ctTabFoods")?.classList.add("is-active");

  renderCTDay();
};

/* ── Render Day (all tabs) ── */
const renderCTDay = () => {
  if (!CS.activeDate) return;
  const logs = getCTLogs();
  const dayData = ensureDay(logs, CS.activeDate);
  saveCTLogs(logs);

  const goal = getGoal();
  const total = dayTotal(dayData);
  const remaining = goal ? goal - total : null;
  const pct = goal ? Math.min(100, Math.round(total / goal * 100)) : 0;
  const circumference = 201;
  const offset = circumference - (circumference * pct / 100);

  // Summary strip
  document.getElementById("ctDsConsumed").textContent  = total.toLocaleString();
  document.getElementById("ctDsRemaining").textContent  = remaining !== null ? remaining.toLocaleString() : "—";
  document.getElementById("ctDayRingFill").setAttribute("stroke-dashoffset", offset);
  document.getElementById("ctDayRingFill").style.stroke = pct >= 100 ? "#FF453A" : pct >= 80 ? "#32D74B" : "var(--accent)";
  document.getElementById("ctDayRingPct").textContent   = pct + "%";
  document.getElementById("ctDayGoalDisplay").textContent = goal ? goal.toLocaleString() + " kcal" : "Not set — tap ⊙";

  // Foods tab
  renderMealSections(dayData);

  // Total tab
  renderTotalTab(dayData, goal, total, pct);

  // Goal tab
  const profile = getCTProfile();
  if (profile.goalCals) document.getElementById("ctGoalInput").value = profile.goalCals;
  const fitnessGoal = profile.fitnessGoal || null;
  document.querySelectorAll(".ct-goal-pill").forEach(b => {
    b.classList.toggle("active", b.dataset.goal === fitnessGoal);
  });
};

/* ── Render Meal Sections (Foods tab) ── */
const renderMealSections = (dayData) => {
  const container = document.getElementById("ctMealSections");
  if (!container) return;

  container.innerHTML = MEAL_CONFIG.map(m => {
    const foods = dayData.meals[m.key] || [];
    const total = mealTotal(foods);
    const hasFoods = foods.length > 0;

    const foodItems = hasFoods ? foods.map((f, i) => `
      <div class="ct-food-card" data-meal="${m.key}" data-idx="${i}">
        <div class="ct-food-card-info">
          <div class="ct-food-name">${f.name}</div>
          <div class="ct-food-meta">${f.qty}${f.unit} · ${f.cals} kcal</div>
        </div>
        <div class="ct-food-card-actions">
          <button class="ct-food-del" data-meal="${m.key}" data-idx="${i}" title="Remove">✕</button>
        </div>
      </div>`).join("") : `<div class="ct-meal-empty">Add your first food here</div>`;

    return `
    <div class="ct-meal-section" id="ctMeal_${m.key}">
      <div class="ct-meal-sec-header" data-meal="${m.key}">
        <div class="ct-meal-sec-left">
          <span class="ct-meal-sec-icon">${m.icon}</span>
          <span class="ct-meal-sec-name">${m.label}</span>
        </div>
        <div class="ct-meal-sec-right">
          <span class="ct-meal-sec-cals">${total > 0 ? total+" kcal" : "0 kcal"}</span>
          <button class="ct-meal-add-food-btn" data-meal="${m.key}" data-label="${m.label}">+ Add</button>
        </div>
      </div>
      <div class="ct-meal-sec-body" id="ctMealBody_${m.key}">${foodItems}</div>
    </div>`;
  }).join("");

  // Delete food
  container.querySelectorAll(".ct-food-del").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const { meal, idx } = btn.dataset;
      const logs = getCTLogs();
      const day = ensureDay(logs, CS.activeDate);
      day.meals[meal].splice(parseInt(idx), 1);
      saveCTLogs(logs);
      renderCTDay();
      renderCTWeekList();
    });
  });

  // Add food button
  container.querySelectorAll(".ct-meal-add-food-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      openAddFoodModal(btn.dataset.meal, btn.dataset.label);
    });
  });
};

/* ── Render Total Tab ── */
const renderTotalTab = (dayData, goal, total, pct) => {
  // Big ring
  const circumference = 402;
  const offset = circumference - (circumference * Math.min(100,pct) / 100);
  const fill = document.getElementById("ctTotalRingFill");
  if (fill) {
    fill.setAttribute("stroke-dashoffset", offset);
    fill.style.stroke = pct >= 100 ? "#FF453A" : pct >= 80 ? "#32D74B" : "var(--accent)";
  }
  const tv = document.getElementById("ctTotalConsumed");
  if (tv) tv.textContent = total.toLocaleString();

  // Meal breakdown
  const mb = document.getElementById("ctMealBreakdown");
  if (mb) {
    if (total === 0) {
      mb.innerHTML = `<div class="ct-empty-state">🍽 No meals logged yet.<br><span>Tap Foods → Add to start tracking.</span></div>`;
    } else {
      mb.innerHTML = MEAL_CONFIG.map(m => {
        const mt = mealTotal(dayData.meals[m.key] || []);
        const mpct = total ? Math.round(mt / total * 100) : 0;
        return `
        <div class="ct-breakdown-row">
          <span>${m.icon} ${m.label}</span>
          <div class="ct-breakdown-bar-wrap">
            <div class="ct-breakdown-bar"><div class="ct-breakdown-fill" style="width:${mpct}%"></div></div>
          </div>
          <span class="ct-breakdown-val">${mt} kcal</span>
        </div>`;
      }).join("");
    }
  }

  // Remaining pill
  const rp = document.getElementById("ctRemainingPill");
  if (rp) {
    if (!goal) {
      rp.textContent = "Set a goal in the Goal tab";
      rp.className = "ct-remaining-pill";
    } else {
      const rem = goal - total;
      if (rem > 0) { rp.textContent = `${rem.toLocaleString()} kcal remaining`; rp.className = "ct-remaining-pill ct-pill-ok"; }
      else { rp.textContent = `${Math.abs(rem).toLocaleString()} kcal over goal`; rp.className = "ct-remaining-pill ct-pill-over"; }
    }
  }
};

/* ══════════════════════════════════════════════
   ADD FOOD MODAL
   ══════════════════════════════════════════════ */
const openAddFoodModal = (mealKey, mealLabel) => {
  CS.activeMeal = mealKey;
  CS.selectedFood = null;
  document.getElementById("ctAddFoodTitle").textContent = `Add to ${mealLabel}`;
  document.getElementById("ctFoodSearch").value = "";
  document.getElementById("ctFoodQty").value = "100";
  document.getElementById("ctFoodUnit").value = "g";
  document.getElementById("ctFoodSuggestions").innerHTML = "";
  document.getElementById("ctFoodPreview").innerHTML = "";
  document.getElementById("ctManualCalsWrap").style.display = "none";
  document.getElementById("ctManualCals").value = "";
  ctOpenModal("ctAddFoodModal");
};

/* ── Food Search debounce ── */
const handleFoodSearch = async () => {
  const q = document.getElementById("ctFoodSearch").value.trim();
  const list = document.getElementById("ctFoodSuggestions");
  if (q.length < 2) { list.innerHTML = ""; return; }

  list.innerHTML = `<div class="ct-suggestion-loading">Searching…</div>`;
  const results = await searchUSDA(q);
  CS.selectedFood = null;
  document.getElementById("ctFoodPreview").innerHTML = "";
  document.getElementById("ctManualCalsWrap").style.display = "none";

  if (results.length === 0) {
    list.innerHTML = `<div class="ct-suggestion-none">No results — enter calories manually below</div>`;
    document.getElementById("ctManualCalsWrap").style.display = "block";
    return;
  }

  list.innerHTML = results.map((r, i) => `
    <div class="ct-suggestion-item" data-idx="${i}">
      <div class="ct-suggestion-name">${r.name}</div>
      ${r.brand ? `<div class="ct-suggestion-brand">${r.brand}</div>` : ""}
      <div class="ct-suggestion-cals">${r.calsper100g} kcal / 100g</div>
    </div>`).join("");

  const stored = results;
  list.querySelectorAll(".ct-suggestion-item").forEach(item => {
    item.addEventListener("click", () => {
      const food = stored[parseInt(item.dataset.idx)];
      CS.selectedFood = food;
      document.getElementById("ctFoodSearch").value = food.name;
      list.innerHTML = "";
      updateFoodPreview();
    });
  });
};

const updateFoodPreview = () => {
  const preview = document.getElementById("ctFoodPreview");
  const qty  = parseFloat(document.getElementById("ctFoodQty").value) || 0;
  const unit = document.getElementById("ctFoodUnit").value;
  if (!CS.selectedFood || !qty) { preview.innerHTML = ""; return; }
  const cals = calcCals(CS.selectedFood.calsper100g, qty, unit);
  preview.innerHTML = `<div class="ct-preview-box">✅ <strong>${CS.selectedFood.name}</strong> — <strong>${cals} kcal</strong> (${qty}${unit})</div>`;
};

/* ── Save food ── */
const saveFood = () => {
  const qty  = parseFloat(document.getElementById("ctFoodQty").value);
  const unit = document.getElementById("ctFoodUnit").value;
  const manualCals = parseInt(document.getElementById("ctManualCals").value);
  const name = document.getElementById("ctFoodSearch").value.trim();

  if (!name) { document.getElementById("ctFoodSearch").focus(); return; }
  if (!qty || qty <= 0) { document.getElementById("ctFoodQty").focus(); return; }

  let cals = 0;
  if (CS.selectedFood) {
    cals = calcCals(CS.selectedFood.calsper100g, qty, unit);
  } else if (manualCals > 0) {
    cals = manualCals;
  } else {
    document.getElementById("ctManualCalsWrap").style.display = "block";
    document.getElementById("ctManualCals").focus();
    return;
  }

  const logs = getCTLogs();
  const day = ensureDay(logs, CS.activeDate);
  day.meals[CS.activeMeal].push({ name, qty, unit, cals, ts: Date.now() });
  saveCTLogs(logs);

  ctCloseModal("ctAddFoodModal");
  renderCTDay();
  renderCTWeekList();
};

/* ══════════════════════════════════════════════
   GOAL CALCULATOR
   ══════════════════════════════════════════════ */
const calcRecommended = () => {
  const w  = parseFloat(document.getElementById("ctGoalWeight").value);
  const h  = parseFloat(document.getElementById("ctGoalHeight").value);
  const a  = parseFloat(document.getElementById("ctGoalAge").value);
  const act = parseFloat(document.getElementById("ctGoalActivity").value);
  const p = getCTProfile();
  const fitnessGoal = p.fitnessGoal || "maintain";

  if (!w || !h || !a) {
    document.getElementById("ctCalcResult").innerHTML = `<span style="color:var(--danger)">Enter weight, height, and age first.</span>`;
    return;
  }

  // Mifflin-St Jeor (male baseline — TODO: add gender)
  const bmr = 10*w + 6.25*h - 5*a + 5;
  let tdee = bmr * act;
  if (fitnessGoal === "lose") tdee -= 500;
  else if (fitnessGoal === "gain") tdee += 300;

  const rec = Math.round(tdee);
  document.getElementById("ctCalcResult").innerHTML =
    `<div class="ct-calc-box">Recommended: <strong>${rec.toLocaleString()} kcal/day</strong><br><button class="ct-use-rec-btn" id="ctUseRecBtn">Use This</button></div>`;
  document.getElementById("ctGoalInput").value = rec;
  document.getElementById("ctUseRecBtn")?.addEventListener("click", () => {
    document.getElementById("ctGoalInput").value = rec;
  });
};

const saveGoal = () => {
  const cals = parseInt(document.getElementById("ctGoalInput").value);
  if (!cals || cals < 500) { document.getElementById("ctGoalInput").focus(); return; }

  const p = getCTProfile();
  p.goalCals = cals;
  saveCTProfile(p);

  // Flash feedback
  const btn = document.getElementById("ctSaveGoalBtn");
  btn.textContent = "✓ Saved!";
  setTimeout(() => btn.textContent = "Save Goal", 1500);
  renderCTDay();
  renderCTWeekList();
};

/* ══════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {

  /* ── Food search ── */
  document.getElementById("ctFoodSearch")?.addEventListener("input", () => {
    clearTimeout(CS.searchDebounce);
    CS.searchDebounce = setTimeout(handleFoodSearch, 350);
  });

  document.getElementById("ctFoodQty")?.addEventListener("input", updateFoodPreview);
  document.getElementById("ctFoodUnit")?.addEventListener("change", updateFoodPreview);
  document.getElementById("ctAddFoodBtn")?.addEventListener("click", saveFood);
  document.getElementById("ctCloseAddFood")?.addEventListener("click", () => ctCloseModal("ctAddFoodModal"));

  /* ── Goal tab ── */
  document.getElementById("ctCalcBtn")?.addEventListener("click", calcRecommended);
  document.getElementById("ctSaveGoalBtn")?.addEventListener("click", saveGoal);

  document.querySelectorAll(".ct-goal-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".ct-goal-pill").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const p = getCTProfile();
      p.fitnessGoal = btn.dataset.goal;
      saveCTProfile(p);
    });
  });

  /* ── Day goal icon ── */
  document.getElementById("ctDayGoalBtn")?.addEventListener("click", () => {
    document.querySelectorAll("[data-ct-tab]").forEach(t => t.classList.remove("is-active"));
    document.querySelectorAll(".ct-tab-pane").forEach(p => p.classList.remove("is-active"));
    document.querySelector("[data-ct-tab='goal']")?.classList.add("is-active");
    document.getElementById("ctTabGoal")?.classList.add("is-active");
  });

  /* ── Calorie day tabs ── */
  document.querySelectorAll("[data-ct-tab]").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll("[data-ct-tab]").forEach(t => t.classList.remove("is-active"));
      document.querySelectorAll(".ct-tab-pane").forEach(p => p.classList.remove("is-active"));
      tab.classList.add("is-active");
      const paneId = { foods:"ctTabFoods", total:"ctTabTotal", goal:"ctTabGoal" }[tab.dataset.ctTab];
      if (paneId) document.getElementById(paneId)?.classList.add("is-active");
    });
  });

  /* ── Water + button ── */
  document.getElementById("ctWaterPlusBtn")?.addEventListener("click", () => {
    const logs = getCTLogs();
    const day = ensureDay(logs, todayCT());
    day.waterMl = (day.waterMl || 0) + 250;
    saveCTLogs(logs);
    const el = document.getElementById("ctWaterDisplay");
    if (el) el.textContent = day.waterMl + " ml";
  });

  /* NOTE: WORKOUT / CALORIES toggle is handled by the inline script
     at the bottom of workout-tracker.html — runs after all scripts load. */

});
