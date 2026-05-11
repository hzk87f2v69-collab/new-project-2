/* ═══════════════════════════════════════════════════════════
   CALORIE TRACKER V2  –  Ace Fitness
   Smart Indian Nutrition Logging System
   ═══════════════════════════════════════════════════════════ */

const K_CAL_LOGS = "ace_cal_logs";
const K_CAL_TARGETS = "ace_cal_targets";
const K_CAL_CUSTOM = "ace_cal_custom_foods";
const K_CAL_RECENT = "ace_cal_recent";

const DEFAULT_TARGETS = { calories: 2400, protein: 180, carbs: 250, fat: 70, goal: "maintain" };

const GOAL_PRESETS = {
  fatloss:  { calMult: 22, pPct: 0.40, cPct: 0.35, fPct: 0.25 },
  maintain: { calMult: 28, pPct: 0.30, cPct: 0.40, fPct: 0.30 },
  gain:     { calMult: 33, pPct: 0.30, cPct: 0.40, fPct: 0.30 },
};

const COMMON_QUICK = ["roti","egg_boiled","rice","dal_toor","chicken_breast","banana","chai","whey","oats","paneer_raw"];

/* ── STATE ── */
let selectedFood = null;
let selectedQty = null;

/* ── DATA LAYER (preserved) ── */
const todayKey = () => new Date().toISOString().split("T")[0];

const getCalLogs = () => {
  try { const a = JSON.parse(localStorage.getItem(K_CAL_LOGS) || "{}"); return a[todayKey()] || []; }
  catch { return []; }
};

const saveCalLog = (item) => {
  const key = todayKey();
  const all = JSON.parse(localStorage.getItem(K_CAL_LOGS) || "{}");
  if (!all[key]) all[key] = [];
  all[key].push({ id: Date.now(), ts: new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}), ...item });
  localStorage.setItem(K_CAL_LOGS, JSON.stringify(all));
  addToRecent(item);
  render(true);
};

const deleteCalLog = (id) => {
  const key = todayKey();
  const all = JSON.parse(localStorage.getItem(K_CAL_LOGS) || "{}");
  if (all[key]) { all[key] = all[key].filter(i => i.id !== id); localStorage.setItem(K_CAL_LOGS, JSON.stringify(all)); render(); }
};

const duplicateCalLog = (id) => {
  const logs = getCalLogs();
  const item = logs.find(i => i.id === id);
  if (item) { const {id:_,ts:__,...rest} = item; saveCalLog(rest); }
};

const getTargets = () => {
  try { return JSON.parse(localStorage.getItem(K_CAL_TARGETS)) || DEFAULT_TARGETS; }
  catch { return DEFAULT_TARGETS; }
};

const saveTargets = (t) => { localStorage.setItem(K_CAL_TARGETS, JSON.stringify(t)); render(); };

/* ── CUSTOM FOODS ── */
const getCustomFoods = () => { try { return JSON.parse(localStorage.getItem(K_CAL_CUSTOM)) || []; } catch { return []; } };
const saveCustomFood = (f) => { const arr = getCustomFoods(); arr.push(f); localStorage.setItem(K_CAL_CUSTOM, JSON.stringify(arr)); };

/* ── RECENT FOODS ── */
const getRecent = () => { try { return JSON.parse(localStorage.getItem(K_CAL_RECENT)) || []; } catch { return []; } };
const addToRecent = (item) => {
  let arr = getRecent();
  arr = arr.filter(r => r.foodId !== item.foodId);
  arr.unshift({ foodId: item.foodId, name: item.name, portion: item.portion, cals: item.cals, p: item.p, c: item.c, f: item.f });
  if (arr.length > 10) arr = arr.slice(0, 10);
  localStorage.setItem(K_CAL_RECENT, JSON.stringify(arr));
};

/* ── SEARCH ENGINE ── */
const getAllFoods = () => {
  const custom = getCustomFoods().map(f => ({
    id: "custom_" + f.name.toLowerCase().replace(/\s+/g,"_"),
    name: f.name, aliases: [], cat: "custom", unit: "serving",
    per: { cal: f.cal, p: f.p, c: f.c, f: f.f },
    portions: [{l:"1 serving",q:1},{l:"2 servings",q:2}], isCustom: true
  }));
  return [...(typeof INDIAN_FOOD_DB !== "undefined" ? INDIAN_FOOD_DB : []), ...custom];
};

const searchFoods = (query) => {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase().trim();
  const db = getAllFoods();
  const scored = db.map(f => {
    const nameL = f.name.toLowerCase();
    const aliasMatch = (f.aliases || []).some(a => a.toLowerCase().startsWith(q));
    let score = 0;
    if (nameL === q) score = 100;
    else if (nameL.startsWith(q)) score = 80;
    else if (aliasMatch) score = 70;
    else if (nameL.includes(q)) score = 50;
    else if ((f.aliases || []).some(a => a.toLowerCase().includes(q))) score = 30;
    return { ...f, score };
  }).filter(f => f.score > 0).sort((a, b) => b.score - a.score);
  return scored.slice(0, 12);
};

/* ── NUTRITION CALCULATOR ── */
const calcNutrition = (food, qty) => ({
  cal: Math.round(food.per.cal * qty),
  p: Math.round(food.per.p * qty),
  c: Math.round(food.per.c * qty),
  f: Math.round(food.per.f * qty),
});

/* ── RENDER ── */
const render = (pulse) => {
  const logs = getCalLogs();
  const targets = getTargets();
  const totals = logs.reduce((a, c) => ({ cals: a.cals+(c.cals||0), p: a.p+(c.p||0), c: a.c+(c.c||0), f: a.f+(c.f||0) }), {cals:0,p:0,c:0,f:0});

  // Ring
  const rem = Math.max(0, targets.calories - totals.cals);
  document.getElementById("remCals").textContent = rem.toLocaleString();
  const eaten = document.getElementById("eatenRow");
  if (eaten) eaten.textContent = totals.cals > 0 ? `${totals.cals.toLocaleString()} eaten of ${targets.calories.toLocaleString()}` : "";

  const ring = document.getElementById("calRing");
  const pct = Math.min(100, (totals.cals / targets.calories) * 100);
  ring.style.strokeDashoffset = String(628 - (628 * pct / 100));

  // Ring color shift
  if (pct < 50) ring.style.stroke = "var(--cal-blue)";
  else if (pct < 75) ring.style.stroke = "var(--cal-green)";
  else if (pct < 95) ring.style.stroke = "var(--cal-orange)";
  else ring.style.stroke = "var(--cal-red)";

  if (pulse) { ring.classList.remove("pulse"); void ring.offsetWidth; ring.classList.add("pulse"); }

  // Macros
  const updateM = (pre, cur, tgt, glowCls) => {
    const el = document.getElementById("val"+pre);
    const bar = document.getElementById("bar"+pre);
    const tgtEl = document.getElementById("tgt"+pre);
    const card = document.getElementById("card"+pre);
    if (el) el.textContent = cur + "g";
    if (tgtEl) tgtEl.textContent = `/ ${tgt}g`;
    if (bar) bar.style.width = Math.min(100, (cur/tgt)*100) + "%";
    if (card && pulse) { card.classList.add(glowCls); setTimeout(() => card.classList.remove(glowCls), 800); }
  };
  updateM("P", totals.p, targets.protein, "glow-p");
  updateM("C", totals.c, targets.carbs, "glow-c");
  updateM("F", totals.f, targets.fat, "glow-f");

  // Log List
  const list = document.getElementById("logList");
  if (logs.length === 0) {
    list.innerHTML = '<p class="muted" style="text-align:center;padding:2rem;">No food logged today. Search above to start!</p>';
  } else {
    list.innerHTML = `<div class="cal-log-header"><span class="cal-log-title">Today's Food</span><span class="cal-log-count">${logs.length} items · ${totals.cals} kcal</span></div>` +
      logs.slice().reverse().map(item => `
        <div class="cal-log-item">
          <div class="cal-log-info">
            <h4>${esc(item.name)}${item.portion ? " — "+esc(item.portion) : ""}</h4>
            <p>${item.p}P · ${item.c}C · ${item.f}F${item.ts ? " · "+item.ts : ""}</p>
          </div>
          <div class="cal-log-right">
            <span class="cal-log-val">${item.cals} kcal</span>
            <div class="cal-log-actions">
              <button class="cal-log-btn" onclick="duplicateCalLog(${item.id})" title="Duplicate">＋</button>
              <button class="cal-log-btn" onclick="deleteCalLog(${item.id})" title="Delete">✕</button>
            </div>
          </div>
        </div>`).join("");
  }

  renderQuickChips();
  renderNutritionHistory();
};

const esc = (s) => String(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");

/* ── NUTRITION HISTORY ── */
const formatDateLabel = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((today - target) / 86400000);

  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
};

const renderNutritionHistory = () => {
  const section = document.getElementById("nhSection");
  if (!section) return;

  const allLogs = (() => { try { return JSON.parse(localStorage.getItem(K_CAL_LOGS) || "{}"); } catch { return {}; } })();
  const targets = getTargets();
  const today = todayKey();

  // Get all past days (exclude today), sorted latest first
  const pastDays = Object.keys(allLogs)
    .filter(k => k !== today && allLogs[k] && allLogs[k].length > 0)
    .sort((a, b) => b.localeCompare(a));

  if (pastDays.length === 0) {
    section.innerHTML = `
      <div class="nh-header">
        <span class="nh-title">Nutrition History</span>
      </div>
      <div class="nh-empty">
        <div class="nh-empty-icon">📋</div>
        <div>No nutrition history yet</div>
      </div>`;
    return;
  }

  let html = `
    <div class="nh-header">
      <span class="nh-title">Nutrition History</span>
      <span class="nh-count">${pastDays.length} day${pastDays.length > 1 ? "s" : ""}</span>
    </div>
    <div class="nh-list">`;

  pastDays.forEach(dateKey => {
    const items = allLogs[dateKey];
    const totals = items.reduce((a, c) => ({
      cals: a.cals + (c.cals || 0),
      p: a.p + (c.p || 0),
      c: a.c + (c.c || 0),
      f: a.f + (c.f || 0)
    }), { cals: 0, p: 0, c: 0, f: 0 });

    const pctComplete = Math.min(100, Math.round((totals.cals / targets.calories) * 100));
    const dateLabel = formatDateLabel(dateKey);

    // Card header (collapsed view)
    html += `
      <div class="nh-card" data-nh-date="${dateKey}">
        <div class="nh-card-head">
          <div class="nh-card-left">
            <div class="nh-card-cals">${totals.cals.toLocaleString()} <span>kcal</span></div>
            <div class="nh-card-macros">
              <span><span class="nh-macro-dot nh-dot-p"></span>${totals.p}g Protein</span>
              <span><span class="nh-macro-dot nh-dot-c"></span>${totals.c}g Carbs</span>
              <span><span class="nh-macro-dot nh-dot-f"></span>${totals.f}g Fat</span>
            </div>
          </div>
          <span class="nh-date-pill">${dateLabel}</span>
          <span class="nh-chevron">›</span>
        </div>

        <div class="nh-card-body">
          <div class="nh-detail">
            <div class="nh-detail-macros">
              <div class="nh-detail-macro">
                <div class="nh-detail-macro-val pv-p">${totals.p}g</div>
                <div class="nh-detail-macro-lbl">Protein</div>
                <div class="nh-mini-bar"><div class="nh-mini-bar-fill" style="width:${Math.min(100, (totals.p / targets.protein) * 100)}%;background:var(--cal-orange)"></div></div>
              </div>
              <div class="nh-detail-macro">
                <div class="nh-detail-macro-val pv-c">${totals.c}g</div>
                <div class="nh-detail-macro-lbl">Carbs</div>
                <div class="nh-mini-bar"><div class="nh-mini-bar-fill" style="width:${Math.min(100, (totals.c / targets.carbs) * 100)}%;background:var(--cal-blue)"></div></div>
              </div>
              <div class="nh-detail-macro">
                <div class="nh-detail-macro-val pv-f">${totals.f}g</div>
                <div class="nh-detail-macro-lbl">Fat</div>
                <div class="nh-mini-bar"><div class="nh-mini-bar-fill" style="width:${Math.min(100, (totals.f / targets.fat) * 100)}%;background:var(--cal-red)"></div></div>
              </div>
            </div>

            <div class="nh-food-list">
              ${items.map(item => `
                <div class="nh-food-row">
                  <div>
                    <div class="nh-food-name">${esc(item.name)}${item.portion ? " — " + esc(item.portion) : ""}</div>
                    <div class="nh-food-portion">${item.p || 0}P · ${item.c || 0}C · ${item.f || 0}F</div>
                  </div>
                  <div style="text-align:right">
                    <div class="nh-food-kcal">${item.cals || 0} kcal</div>
                    ${item.ts ? `<div class="nh-food-time">${item.ts}</div>` : ""}
                  </div>
                </div>`).join("")}
            </div>

            <div class="nh-summary">
              <span>${items.length} meal${items.length > 1 ? "s" : ""} logged</span>
              <span class="nh-summary-stat">${pctComplete}% of ${targets.calories} kcal goal</span>
            </div>
          </div>
        </div>
      </div>`;
  });

  html += `</div>`;
  section.innerHTML = html;

  // Accordion toggle
  section.querySelectorAll(".nh-card").forEach(card => {
    card.querySelector(".nh-card-head").addEventListener("click", () => {
      const wasOpen = card.classList.contains("open");
      // Close all others
      section.querySelectorAll(".nh-card.open").forEach(c => c.classList.remove("open"));
      if (!wasOpen) card.classList.add("open");
    });
  });
};

/* ── QUICK ADD CHIPS ── */
const renderQuickChips = () => {
  const container = document.getElementById("quickChips");
  const label = document.getElementById("quickLabel");
  if (!container) return;

  const recent = getRecent();
  const db = getAllFoods();
  let chips = [];

  if (recent.length > 0) {
    label.textContent = "Recent Foods";
    chips = recent.slice(0, 6).map(r => ({ label: `+ ${r.portion || r.name}`, foodId: r.foodId, data: r }));
  } else {
    label.textContent = "Common Foods";
    chips = COMMON_QUICK.slice(0, 8).map(id => {
      const f = db.find(x => x.id === id);
      if (!f) return null;
      const p = f.portions[0];
      const n = calcNutrition(f, p.q);
      return { label: `+ ${p.l}`, foodId: f.id, data: { foodId: f.id, name: f.name, portion: p.l, cals: n.cal, p: n.p, c: n.c, f: n.f } };
    }).filter(Boolean);
  }

  container.innerHTML = chips.map((ch, i) =>
    `<button class="cal-chip" data-chip="${i}">${esc(ch.label)}</button>`
  ).join("");

  container.querySelectorAll(".cal-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      const ch = chips[parseInt(btn.dataset.chip)];
      if (ch && ch.data) saveCalLog(ch.data);
    });
  });
};

/* ── SEARCH UI ── */
let searchTimeout = null;

const initSearch = () => {
  const input = document.getElementById("foodSearch");
  const dd = document.getElementById("searchDropdown");

  input.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const q = input.value.trim();
      if (q.length < 1) { dd.classList.remove("show"); return; }
      const results = searchFoods(q);
      renderDropdown(results, q);
    }, 120);
  });

  input.addEventListener("focus", () => {
    if (input.value.trim().length >= 1) {
      const results = searchFoods(input.value.trim());
      renderDropdown(results, input.value.trim());
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".cal-search-wrap")) dd.classList.remove("show");
  });
};

const renderDropdown = (results, query) => {
  const dd = document.getElementById("searchDropdown");
  if (results.length === 0 && query.length > 0) {
    dd.innerHTML = `<div style="padding:1rem;text-align:center;color:rgba(255,255,255,0.4);font-size:0.85rem;">No matches for "${esc(query)}"</div>
      <div class="cal-dd-custom" id="ddCreateCustom">+ Create Custom Food</div>`;
    dd.classList.add("show");
    document.getElementById("ddCreateCustom")?.addEventListener("click", () => { dd.classList.remove("show"); showCustomForm(query); });
    return;
  }
  dd.innerHTML = results.map((f, i) => `
    <div class="cal-dd-item" data-idx="${i}">
      <div>
        <div class="cal-dd-name">${esc(f.name)}</div>
        <div class="cal-dd-meta">${f.portions[0].l} · ${f.cat}</div>
      </div>
      <div class="cal-dd-cal">${Math.round(f.per.cal * f.portions[0].q)} kcal</div>
    </div>`).join("") + `<div class="cal-dd-custom" id="ddCreateCustom">+ Create Custom Food</div>`;
  dd.classList.add("show");

  dd.querySelectorAll(".cal-dd-item").forEach(item => {
    item.addEventListener("click", () => {
      const f = results[parseInt(item.dataset.idx)];
      selectFood(f);
      dd.classList.remove("show");
      document.getElementById("foodSearch").value = "";
    });
  });
  document.getElementById("ddCreateCustom")?.addEventListener("click", () => { dd.classList.remove("show"); showCustomForm(""); });
};

/* ── SELECT FOOD + QUANTITY ── */
const selectFood = (food) => {
  selectedFood = food;
  selectedQty = null;
  const area = document.getElementById("selectedArea");
  const search = document.querySelector(".cal-search-wrap");

  document.getElementById("selName").textContent = food.name;
  area.classList.add("show");

  // Render quantity buttons
  const qtyRow = document.getElementById("qtyRow");
  qtyRow.innerHTML = food.portions.map((p, i) =>
    `<button class="cal-qty-btn" data-qi="${i}">${esc(p.l)}</button>`
  ).join("");

  qtyRow.querySelectorAll(".cal-qty-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      qtyRow.querySelectorAll(".cal-qty-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const pi = parseInt(btn.dataset.qi);
      selectedQty = food.portions[pi];
      updatePreview();
    });
  });

  // Auto-select first portion
  const firstBtn = qtyRow.querySelector(".cal-qty-btn");
  if (firstBtn) firstBtn.click();

  document.getElementById("addFoodBtn").disabled = false;
};

const updatePreview = () => {
  if (!selectedFood || !selectedQty) return;
  const n = calcNutrition(selectedFood, selectedQty.q);
  document.getElementById("pvCal").textContent = n.cal;
  document.getElementById("pvP").textContent = n.p;
  document.getElementById("pvC").textContent = n.c;
  document.getElementById("pvF").textContent = n.f;
};

const clearSelection = () => {
  selectedFood = null;
  selectedQty = null;
  document.getElementById("selectedArea").classList.remove("show");
  document.getElementById("addFoodBtn").disabled = true;
  document.getElementById("foodSearch").value = "";
};

/* ── CUSTOM FOOD ── */
const showCustomForm = (prefill) => {
  document.getElementById("customForm").classList.add("show");
  document.getElementById("selectedArea").classList.remove("show");
  if (prefill) document.getElementById("cfName").value = prefill;
  document.getElementById("cfName").focus();
};

const hideCustomForm = () => {
  document.getElementById("customForm").classList.remove("show");
  ["cfName","cfCal","cfP","cfC","cfF"].forEach(id => document.getElementById(id).value = "");
};

/* ── GOAL PRESETS ── */
const applyGoal = (goal) => {
  const profile = (() => { try { return JSON.parse(localStorage.getItem("acefitness_profile")) || {}; } catch { return {}; } })();
  const weight = parseFloat(profile.weight) || 70;
  const preset = GOAL_PRESETS[goal];
  const cals = Math.round(weight * preset.calMult);
  const protein = Math.round((cals * preset.pPct) / 4);
  const carbs = Math.round((cals * preset.cPct) / 4);
  const fat = Math.round((cals * preset.fPct) / 9);

  document.getElementById("targetCals").value = cals;
  document.getElementById("targetP").value = protein;
  document.getElementById("targetC").value = carbs;
  document.getElementById("targetF").value = fat;

  document.querySelectorAll(".cal-goal-btn").forEach(b => b.classList.toggle("active", b.dataset.goal === goal));
};

/* ── INIT ── */
document.addEventListener("DOMContentLoaded", () => {
  render();
  initSearch();

  // Tabs
  const tabQuick = document.getElementById("tabQuick");
  const tabSettings = document.getElementById("tabSettings");
  tabQuick.onclick = () => { tabQuick.classList.add("active"); tabSettings.classList.remove("active"); document.getElementById("viewQuick").classList.remove("hide"); document.getElementById("viewSettings").classList.add("hide"); };
  tabSettings.onclick = () => {
    tabSettings.classList.add("active"); tabQuick.classList.remove("active");
    document.getElementById("viewSettings").classList.remove("hide"); document.getElementById("viewQuick").classList.add("hide");
    const t = getTargets();
    document.getElementById("targetCals").value = t.calories;
    document.getElementById("targetP").value = t.protein;
    document.getElementById("targetC").value = t.carbs;
    document.getElementById("targetF").value = t.fat;
    document.querySelectorAll(".cal-goal-btn").forEach(b => b.classList.toggle("active", b.dataset.goal === (t.goal || "maintain")));
  };

  // Add Food
  document.getElementById("addFoodBtn").addEventListener("click", () => {
    if (!selectedFood || !selectedQty) return;
    const n = calcNutrition(selectedFood, selectedQty.q);
    saveCalLog({ foodId: selectedFood.id, name: selectedFood.name, portion: selectedQty.l, cals: n.cal, p: n.p, c: n.c, f: n.f });
    clearSelection();
  });

  // Clear Selection
  document.getElementById("clearSel").addEventListener("click", clearSelection);

  // Save Targets
  document.getElementById("saveTargetsBtn").addEventListener("click", () => {
    const activeGoal = document.querySelector(".cal-goal-btn.active");
    saveTargets({
      calories: parseInt(document.getElementById("targetCals").value) || 2400,
      protein: parseInt(document.getElementById("targetP").value) || 180,
      carbs: parseInt(document.getElementById("targetC").value) || 250,
      fat: parseInt(document.getElementById("targetF").value) || 70,
      goal: activeGoal ? activeGoal.dataset.goal : "maintain"
    });
    tabQuick.click();
  });

  // Goal Buttons
  document.querySelectorAll(".cal-goal-btn").forEach(btn => {
    btn.addEventListener("click", () => applyGoal(btn.dataset.goal));
  });

  // Save Custom Food
  document.getElementById("saveCustomBtn").addEventListener("click", () => {
    const name = document.getElementById("cfName").value.trim();
    const cal = parseInt(document.getElementById("cfCal").value) || 0;
    const p = parseInt(document.getElementById("cfP").value) || 0;
    const c = parseInt(document.getElementById("cfC").value) || 0;
    const f = parseInt(document.getElementById("cfF").value) || 0;
    if (!name || !cal) { document.getElementById("cfName").focus(); return; }
    saveCustomFood({ name, cal, p, c, f });
    hideCustomForm();
    // Auto-log
    saveCalLog({ foodId: "custom_"+name.toLowerCase().replace(/\s+/g,"_"), name, portion: "1 serving", cals: cal, p, c, f });
  });

  document.getElementById("cancelCustomBtn").addEventListener("click", hideCustomForm);
});
