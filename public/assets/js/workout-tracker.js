/* ═══════════════════════════════════════════════════════════
   WORKOUT TRACKER SPA  –  Ace Fitness
   ═══════════════════════════════════════════════════════════ */

/* ── KEYS ───────────────────────────────────────────────── */
const K_PLAN = "ace_wt_plan";
const K_LIB = "ace_wt_library";
const K_LOGS = "ace_wt_logs";

/* ── DEFAULTS ───────────────────────────────────────────── */
const DEFAULT_DAYS = {
  monday: { muscles: "Chest · Shoulder", exercises: [], icon: "🏋️", color: "mon" },
  tuesday: { muscles: "Back · Biceps", exercises: [], icon: "💪", color: "tue" },
  wednesday: { muscles: "Legs", exercises: [], icon: "🦵", color: "wed" },
  thursday: { muscles: "Push", exercises: [], icon: "⬆️", color: "thu" },
  friday: { muscles: "Pull", exercises: [], icon: "⬇️", color: "fri" },
  saturday: { muscles: "Arms · Abs", exercises: [], icon: "🔥", color: "sat" },
};

const SEED_EXERCISES = [
  { name: "Bench Press", muscle: "Chest" },
  { name: "Incline Bench Press", muscle: "Chest" },
  { name: "Dumbbell Flyes", muscle: "Chest" },
  { name: "Push-Ups", muscle: "Chest" },
  { name: "Squat", muscle: "Legs" },
  { name: "Leg Press", muscle: "Legs" },
  { name: "Deadlift", muscle: "Back" },
  { name: "Pull-Ups", muscle: "Back" },
  { name: "Lat Pulldown", muscle: "Back" },
  { name: "Bent Over Row", muscle: "Back" },
  { name: "Shoulder Press", muscle: "Shoulder" },
  { name: "Lateral Raise", muscle: "Shoulder" },
  { name: "Bicep Curl", muscle: "Arms" },
  { name: "Tricep Extension", muscle: "Arms" },
  { name: "Plank", muscle: "Abs" },
  { name: "Crunches", muscle: "Abs" },
];

/* ── STATE ───────────────────────────────────────────────── */
const S = {
  activeView: "dashboard",   // "dashboard" | "day" | "exercise"
  selectedDay: null,
  selectedEx: null,
  activeTab: "sets",
  editingSetId: null,          // for edit flow
  editingLogId: null,
};

/* ── DATA ────────────────────────────────────────────────── */
const genId = () => crypto.randomUUID ? crypto.randomUUID()
  : Date.now().toString(36) + Math.random().toString(36).slice(2);

const getPlan = () => JSON.parse(localStorage.getItem(K_PLAN) || "null") || structuredClone(DEFAULT_DAYS);
const savePlan = v => localStorage.setItem(K_PLAN, JSON.stringify(v));

const getLib = () => JSON.parse(localStorage.getItem(K_LIB) || "null") || null;
const saveLib = v => localStorage.setItem(K_LIB, JSON.stringify(v));

const getLogs = () => JSON.parse(localStorage.getItem(K_LOGS) || "[]");
const saveLogs = v => localStorage.setItem(K_LOGS, JSON.stringify(v));

const initLibrary = () => {
  if (getLib()) return;
  const lib = {};
  SEED_EXERCISES.forEach(e => {
    const id = genId();
    lib[id] = { id, name: e.name, muscle: e.muscle };
  });
  saveLib(lib);
};

/* ── UTILS ───────────────────────────────────────────────── */
const relTime = dateStr => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
};

const fmtDate = dateStr => {
  const d = new Date(dateStr.replace(/-/g, "/"));
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
};

const fmtTime = ts => {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
};

const restStr = (sets, idx) => {
  if (idx === 0) return "";
  const diff = sets[idx].ts - sets[idx - 1].ts;
  if (diff <= 0) return "";
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return m > 0 ? `${m}:${String(rem).padStart(2, "0")}` : `${s}s`;
};

const epley1RM = (reps, weight) => {
  if (!reps || !weight) return 0;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
};

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const qs = id => document.getElementById(id);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

/* ── NAVIGATION ──────────────────────────────────────────── */
const VIEW_STACK = []; // navigation history stack

const goTo = (viewId) => {
  const curEl = document.querySelector(".wt-view.is-active");
  const nextEl = qs(viewId);
  if (curEl === nextEl) return;

  // Push current view into stack (behind)
  if (curEl) {
    curEl.classList.remove("is-active");
    curEl.classList.add("slide-behind");
    VIEW_STACK.push(curEl.id);
  }

  nextEl.classList.add("is-active");
  nextEl.scrollTop = 0;
  S.activeView = viewId;
  qs("addSetFab").classList.toggle("visible", viewId === "viewExercise");
};

const goBack = () => {
  const cur = document.querySelector(".wt-view.is-active");
  if (!cur) return;
  cur.classList.remove("is-active");
  cur.style.transition = "transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)";
  cur.style.transform = "translateX(100%)";
  setTimeout(() => { cur.style.transform = ""; cur.style.transition = ""; }, 310);

  const prev = document.querySelector(".wt-view.slide-behind");
  if (prev) { prev.classList.remove("slide-behind"); prev.classList.add("is-active"); }
  qs("addSetFab").classList.remove("visible");

  if (S.activeView === "exercise") { S.activeView = "day"; }
  else { S.activeView = "dashboard"; }
};

/* ── RENDER: DASHBOARD ───────────────────────────────────── */
const renderDashboard = () => {
  const plan = getPlan();
  const lib = getLib() || {};
  const logs = getLogs();

  qs("totalExCount").textContent = Object.keys(lib).length;

  const container = qs("dayListContainer");
  container.innerHTML = Object.entries(plan).map(([key, day]) => {
    const exCount = (day.exercises || []).length;
    const dayLogs = logs.filter(l => l.day === key);
    const lastDate = dayLogs.length ? dayLogs.sort((a, b) => b.date.localeCompare(a.date))[0].date : null;
    return `
      <div class="wt-day-card" data-day="${key}">
        <div class="wt-day-icon wt-icon-${day.color}">${day.icon}</div>
        <div class="wt-day-info">
          <div class="wt-day-name">${key.toUpperCase()}</div>
          <div class="wt-day-muscles">${day.muscles}${lastDate ? " · " + relTime(lastDate) : ""}</div>
        </div>
        <div class="wt-day-right">
          <div class="wt-day-count">${exCount}</div>
          <div class="wt-day-count-label">exercise${exCount !== 1 ? "s" : ""}</div>
        </div>
        <span class="wt-day-chevron">›</span>
      </div>`;
  }).join("");

  container.querySelectorAll(".wt-day-card").forEach(card =>
    card.addEventListener("click", () => openDayView(card.dataset.day))
  );
};

/* ── RENDER: DAY VIEW ────────────────────────────────────── */
const openDayView = dayKey => {
  S.selectedDay = dayKey;
  const plan = getPlan();
  const day = plan[dayKey];
  const lib = getLib() || {};
  const logs = getLogs();

  qs("dayViewTitle").textContent = dayKey.toUpperCase();
  qs("dayViewMuscles").textContent = day.muscles;

  const list = qs("dayExerciseList");
  const exIds = day.exercises || [];

  if (!exIds.length) {
    list.innerHTML = `<div class="wt-empty-view">
      <div class="wt-empty-icon">🏋️</div>
      <div class="wt-empty-text">No exercises yet.<br>Tap <strong>+ Exercises</strong> to add some.</div>
    </div>`;
  } else {
    list.innerHTML = exIds.map(exId => {
      const ex = lib[exId];
      if (!ex) return "";
      const exLogs = logs.filter(l => l.exerciseId === exId);
      const lastDate = exLogs.length ? exLogs.sort((a, b) => b.date.localeCompare(a.date))[0].date : null;
      return `
        <div class="wt-ex-row" data-ex="${exId}">
          <div class="wt-ex-row-icon">💪</div>
          <div class="wt-ex-row-info">
            <div class="wt-ex-row-name">${ex.name}</div>
            <div class="wt-ex-row-last">${ex.muscle} · ${lastDate ? relTime(lastDate) : "No history"}</div>
          </div>
          <button class="wt-ex-del-btn" data-remove="${exId}" title="Remove from day">🗑</button>
          <span class="wt-day-chevron">›</span>
        </div>`;
    }).filter(Boolean).join("");

    list.querySelectorAll(".wt-ex-row").forEach(row => {
      row.addEventListener("click", e => {
        if (e.target.closest(".wt-ex-del-btn")) return;
        openExerciseView(row.dataset.ex);
      });
    });
    list.querySelectorAll(".wt-ex-del-btn").forEach(btn =>
      btn.addEventListener("click", e => {
        e.stopPropagation();
        if (!confirm("Remove from this day?")) return;
        const plan = getPlan();
        plan[dayKey].exercises = plan[dayKey].exercises.filter(id => id !== btn.dataset.remove);
        savePlan(plan);
        openDayView(dayKey);
        renderDashboard();
      })
    );
  }

  goTo("viewDay");
};

/* ── RENDER: EXERCISE VIEW ───────────────────────────────── */
const openExerciseView = exId => {
  S.selectedEx = exId;
  S.activeTab = "sets";
  const lib = getLib() || {};
  const ex = lib[exId];
  if (!ex) return;

  qs("exDetailTitle").textContent = ex.name;
  qs("addSetModalTitle").textContent = `Log Set – ${ex.name}`;

  // Activate first tab
  document.querySelectorAll(".wt-tab").forEach(t => t.classList.toggle("is-active", t.dataset.tab === "sets"));
  document.querySelectorAll(".wt-tab-pane").forEach(p => p.classList.remove("is-active"));
  qs("tabSets").classList.add("is-active");

  renderSetsTab(exId);
  render1RMTab(exId);
  renderAnalyzeTab(exId);
  goTo("viewExercise");
};

/* ── SETS TAB ────────────────────────────────────────────── */
const renderSetsTab = exId => {
  const logs = getLogs().filter(l => l.exerciseId === exId);
  const con = qs("setHistoryContainer");

  if (!logs.length) {
    con.innerHTML = `<div class="wt-no-history">
      <div style="font-size:2.5rem;margin-bottom:0.5rem">📊</div>
      <p>No history yet. Tap <strong>+</strong> to log your first set!</p></div>`;
    return;
  }

  // Group by date
  const byDate = {};
  logs.forEach(session => {
    if (!byDate[session.date]) byDate[session.date] = [];
    byDate[session.date].push(session);
  });

  const sorted = Object.keys(byDate).sort((a, b) => b.localeCompare(a));
  con.innerHTML = sorted.map(date => {
    const sessions = byDate[date];
    // collect all sets across sessions for this date
    const allSets = sessions.flatMap(s => s.sets.map(set => ({ ...set, logId: s.id })));
    const rows = allSets.map((set, idx) => `
      <div class="wt-set-row">
        <div class="wt-set-num">Set ${idx + 1}</div>
        <div class="wt-set-reps">${set.reps} reps</div>
        <div class="wt-set-weight">${set.weight > 0 ? set.weight + " kg" : "BW"}</div>
        <div class="wt-set-rest">${restStr(allSets, idx)}</div>
      </div>`).join("");
    return `
      <div class="wt-history-date">${fmtDate(date)}</div>
      <div class="wt-history-session">${rows}</div>`;
  }).join("");
};

/* ── ANALYZE TAB ─────────────────────────────────────────── */
const renderAnalyzeTab = exId => {
  const logs = getLogs().filter(l => l.exerciseId === exId);
  const con = qs("analyzeContainer");

  if (!logs.length) {
    con.innerHTML = `<div class="wt-no-history"><p>Log some sets to see analysis.</p></div>`;
    return;
  }

  const allSets = logs.flatMap(l => l.sets);
  const maxWeight = Math.max(...allSets.map(s => s.weight || 0));
  const maxReps = Math.max(...allSets.map(s => s.reps || 0));
  const totalSets = allSets.length;
  const totalVol = allSets.reduce((acc, s) => acc + (s.reps * (s.weight || 0)), 0);
  const best1RM = Math.max(...allSets.map(s => epley1RM(s.reps, s.weight)));

  con.innerHTML = `
    <div class="wt-analyze-wrap">
      <div class="wt-stat-cards">
        <div class="wt-stat-card">
          <div class="wt-stat-card-label">Best Weight</div>
          <div class="wt-stat-card-val orange">${maxWeight}<small style="font-size:0.9rem"> kg</small></div>
        </div>
        <div class="wt-stat-card">
          <div class="wt-stat-card-label">Best Reps</div>
          <div class="wt-stat-card-val green">${maxReps}</div>
        </div>
        <div class="wt-stat-card">
          <div class="wt-stat-card-label">Total Sets</div>
          <div class="wt-stat-card-val blue">${totalSets}</div>
        </div>
        <div class="wt-stat-card">
          <div class="wt-stat-card-label">Total Volume</div>
          <div class="wt-stat-card-val orange">${totalVol}<small style="font-size:0.9rem"> kg</small></div>
        </div>
      </div>
      <div class="wt-stat-card" style="margin-bottom:0.75rem">
        <div class="wt-stat-card-label">Estimated 1RM (Epley)</div>
        <div class="wt-stat-card-val orange" style="font-size:2rem">${best1RM} <small style="font-size:0.9rem">kg</small></div>
      </div>
    </div>`;
};

/* ── 1RM TAB ─────────────────────────────────────────────── */
const render1RMTab = exId => {
  const con = qs("oneRmContainer");
  con.innerHTML = `
    <div class="wt-1rm-wrap">
      <div class="wt-1rm-title">1RM Calculator</div>
      <p style="font-size:0.8rem;color:rgba(255,255,255,0.45);margin-bottom:1rem">Epley formula: weight × (1 + reps ÷ 30)</p>
      <div class="wt-1rm-inputs">
        <div class="wt-1rm-field">
          <label>Weight (kg)</label>
          <input id="rmWeight" type="number" min="0" step="0.5" placeholder="60" inputmode="decimal" />
        </div>
        <div class="wt-1rm-field">
          <label>Reps</label>
          <input id="rmReps" type="number" min="1" placeholder="10" inputmode="numeric" />
        </div>
      </div>
      <div class="wt-1rm-result">
        <div class="wt-1rm-result-label">Estimated 1RM</div>
        <div class="wt-1rm-result-val" id="rmResult">—</div>
        <div class="wt-1rm-result-unit">kilograms</div>
      </div>
      <div class="wt-1rm-best" style="margin-top:1.25rem">
        <div class="wt-1rm-best-label">Training percentages</div>
        <div class="wt-1rm-percentages" id="rmPercents"></div>
      </div>
    </div>`;

  const calc = () => {
    const w = parseFloat(qs("rmWeight").value);
    const r = parseInt(qs("rmReps").value);
    if (!w || !r) { qs("rmResult").textContent = "—"; qs("rmPercents").innerHTML = ""; return; }
    const orm = epley1RM(r, w);
    qs("rmResult").textContent = orm;
    qs("rmPercents").innerHTML = [90, 80, 70, 60, 50, 40].map(pct => {
      const val = Math.round(orm * pct / 10) / 10;
      return `<div class="wt-1rm-pct-card">
        <div class="wt-1rm-pct-val">${val}</div>
        <div class="wt-1rm-pct-label">${pct}%</div>
      </div>`;
    }).join("");
  };

  qs("rmWeight").addEventListener("input", calc);
  qs("rmReps").addEventListener("input", calc);

  // Pre-fill with best set
  const logs = getLogs().filter(l => l.exerciseId === exId);
  if (logs.length) {
    const allSets = logs.flatMap(l => l.sets);
    const best = allSets.reduce((b, s) => epley1RM(s.reps, s.weight) > epley1RM(b.reps, b.weight) ? s : b, allSets[0]);
    qs("rmWeight").value = best.weight;
    qs("rmReps").value = best.reps;
    calc();
  }
};

/* ── MODALS ──────────────────────────────────────────────── */
const openModal = id => qs(id).classList.remove("hide");
const closeModal = id => qs(id).classList.add("hide");

/* Add Set */
const openAddSetModal = () => {
  qs("setReps").value = "";
  qs("setWeight").value = "";
  qs("setNotes").value = "";
  S.editingSetId = null; S.editingLogId = null;

  // pre-fill with last used weight for this exercise
  const logs = getLogs().filter(l => l.exerciseId === S.selectedEx);
  if (logs.length) {
    const lastSession = logs.sort((a, b) => b.date.localeCompare(a.date))[0];
    const lastSet = lastSession.sets[lastSession.sets.length - 1];
    if (lastSet) { qs("setWeight").value = lastSet.weight; qs("setReps").value = lastSet.reps; }
  }

  openModal("addSetModal");
  setTimeout(() => qs("setReps").focus(), 80);
};

const saveSet = () => {
  const reps = parseInt(qs("setReps").value);
  const weight = parseFloat(qs("setWeight").value) || 0;
  if (!reps || reps < 1) { qs("setReps").focus(); return; }

  const logs = getLogs();
  const today = todayStr();
  const now = Date.now();
  let session = logs.find(l => l.exerciseId === S.selectedEx && l.day === S.selectedDay && l.date === today);

  if (!session) {
    session = { id: genId(), exerciseId: S.selectedEx, day: S.selectedDay, date: today, sets: [] };
    logs.push(session);
  }

  session.sets.push({ id: genId(), reps, weight, ts: now, notes: qs("setNotes").value.trim() });
  saveLogs(logs);
  closeModal("addSetModal");
  renderSetsTab(S.selectedEx);
  renderAnalyzeTab(S.selectedEx);
  render1RMTab(S.selectedEx);
  renderDashboard();
};

/* Add Exercise Picker */
const renderExPicker = (filter = "") => {
  const lib = getLib() || {};
  const plan = getPlan();
  const used = new Set(plan[S.selectedDay]?.exercises || []);
  const list = qs("exPickerList");

  const matches = Object.values(lib).filter(ex =>
    !used.has(ex.id) &&
    ex.name.toLowerCase().includes(filter.toLowerCase())
  );

  list.innerHTML = matches.length
    ? matches.map(ex => `
        <div class="wt-ex-pick-row">
          <div>
            <div class="wt-ex-pick-name">${ex.name}</div>
            <div class="wt-ex-pick-muscle">${ex.muscle}</div>
          </div>
          <button class="wt-ex-pick-add" data-ex="${ex.id}">Add</button>
        </div>`).join("")
    : `<p style="color:rgba(255,255,255,0.4);font-size:0.85rem;padding:0.5rem 0">No exercises match. Create one below.</p>`;

  list.querySelectorAll(".wt-ex-pick-add").forEach(btn =>
    btn.addEventListener("click", () => {
      addExerciseToDay(btn.dataset.ex);
    })
  );
};

const addExerciseToDay = exId => {
  const plan = getPlan();
  if (!plan[S.selectedDay].exercises.includes(exId)) {
    plan[S.selectedDay].exercises.push(exId);
    savePlan(plan);
  }
  closeModal("addExModal");
  openDayView(S.selectedDay);
  renderDashboard();
};

/* My Library */
const renderMyExList = (filter = "") => {
  const lib = getLib() || {};
  const list = qs("myExList");
  const matches = Object.values(lib).filter(ex =>
    ex.name.toLowerCase().includes(filter.toLowerCase())
  );
  list.innerHTML = matches.map(ex => `
    <div class="wt-ex-pick-row">
      <div>
        <div class="wt-ex-pick-name">${ex.name}</div>
        <div class="wt-ex-pick-muscle">${ex.muscle}</div>
      </div>
      <button class="wt-ex-del-btn" data-del="${ex.id}" title="Delete">🗑</button>
    </div>`).join("");
  list.querySelectorAll("[data-del]").forEach(btn =>
    btn.addEventListener("click", () => {
      if (!confirm("Delete this exercise from library?")) return;
      const lib = getLib(); delete lib[btn.dataset.del]; saveLib(lib);
      // also remove from all days
      const plan = getPlan();
      Object.keys(plan).forEach(d => { plan[d].exercises = plan[d].exercises.filter(id => id !== btn.dataset.del); });
      savePlan(plan);
      renderMyExList(qs("myExSearch").value);
      renderDashboard();
    })
  );
};

/* ── INIT ────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initLibrary();
  if (!localStorage.getItem(K_PLAN)) savePlan(structuredClone(DEFAULT_DAYS));
  renderDashboard();

  /* Back buttons */
  qs("backFromDay").addEventListener("click", () => { goBack(); renderDashboard(); });
  qs("backFromExercise").addEventListener("click", () => { goBack(); });

  /* Dashboard actions */
  qs("newWorkoutBtn").addEventListener("click", () => {
    // Open today's day
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const todayKey = days[new Date().getDay()];
    S.selectedDay = todayKey;
    openDayView(todayKey);
  });

  qs("myExercisesBtn").addEventListener("click", () => {
    renderMyExList();
    openModal("myExModal");
  });

  /* Day view buttons */
  qs("addExBtn").addEventListener("click", () => {
    qs("exPickerSearch").value = "";
    qs("newExName").value = "";
    qs("newExMuscle").value = "";
    renderExPicker();
    openModal("addExModal");
  });

  qs("exPickerSearch").addEventListener("input", e => renderExPicker(e.target.value));
  qs("myExSearch").addEventListener("input", e => renderMyExList(e.target.value));

  /* Create new exercise */
  qs("createExBtn").addEventListener("click", () => {
    const name = qs("newExName").value.trim();
    const muscle = qs("newExMuscle").value.trim() || "General";
    if (!name) { qs("newExName").focus(); return; }
    const lib = getLib() || {};
    const id = genId();
    lib[id] = { id, name, muscle };
    saveLib(lib);
    addExerciseToDay(id);
  });

  /* FAB (add set) */
  qs("addSetFab").addEventListener("click", openAddSetModal);
  qs("saveSetBtn").addEventListener("click", saveSet);
  qs("closeSetModal").addEventListener("click", () => closeModal("addSetModal"));
  qs("closeExModal").addEventListener("click", () => closeModal("addExModal"));
  qs("closeMyExModal").addEventListener("click", () => closeModal("myExModal"));

  /* Close modals on backdrop click */
  ["addSetModal", "addExModal", "myExModal"].forEach(id => {
    qs(id).addEventListener("click", e => { if (e.target === qs(id)) closeModal(id); });
  });

  /* ── 3-dot context menus ───────────────────────────────── */
  const showCtxMenu = (anchorEl, items) => {
    // Remove any existing menu
    document.querySelector(".wt-ctx-menu")?.remove();
    document.querySelector(".wt-ctx-overlay")?.remove();

    const overlay = document.createElement("div");
    overlay.className = "wt-ctx-overlay";

    const menu = document.createElement("div");
    menu.className = "wt-ctx-menu";

    items.forEach(item => {
      const btn = document.createElement("button");
      btn.className = "wt-ctx-item" + (item.danger ? " danger" : "");
      btn.innerHTML = `<span>${item.icon}</span> ${item.label}`;
      btn.addEventListener("click", () => {
        menu.remove(); overlay.remove();
        item.action();
      });
      menu.appendChild(btn);
    });

    // Position near anchor
    const rect = anchorEl.getBoundingClientRect();
    menu.style.top = (rect.bottom + 6) + "px";
    menu.style.right = (window.innerWidth - rect.right) + "px";

    overlay.addEventListener("click", () => { menu.remove(); overlay.remove(); });

    document.body.appendChild(overlay);
    document.body.appendChild(menu);
  };

  // Day view 3-dot
  qs("editDayBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    showCtxMenu(qs("editDayBtn"), [
      {
        icon: "✏️", label: "Edit Muscle Groups",
        action: () => {
          const plan = getPlan();
          const current = plan[S.selectedDay]?.muscles || "";
          const val = prompt("Edit muscle groups (e.g. Chest · Shoulder):", current);
          if (val === null) return;
          plan[S.selectedDay].muscles = val.trim() || current;
          savePlan(plan);
          qs("dayViewMuscles").textContent = plan[S.selectedDay].muscles;
          renderDashboard();
        }
      },
      {
        icon: "🗑", label: "Clear All Exercises", danger: true,
        action: () => {
          if (!confirm(`Remove all exercises from ${S.selectedDay}?`)) return;
          const plan = getPlan();
          plan[S.selectedDay].exercises = [];
          savePlan(plan);
          openDayView(S.selectedDay);
          renderDashboard();
        }
      }
    ]);
  });

  // Exercise detail 3-dot
  qs("exOptionsBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    showCtxMenu(qs("exOptionsBtn"), [
      {
        icon: "🗑", label: "Remove from Day", danger: true,
        action: () => {
          if (!confirm("Remove this exercise from the day?")) return;
          const plan = getPlan();
          plan[S.selectedDay].exercises = plan[S.selectedDay].exercises.filter(id => id !== S.selectedEx);
          savePlan(plan);
          goBack();
          renderDashboard();
        }
      },
      {
        icon: "🗑", label: "Delete from Library", danger: true,
        action: () => {
          const lib = getLib() || {};
          const name = lib[S.selectedEx]?.name || "this exercise";
          if (!confirm(`Permanently delete "${name}" from your library?`)) return;
          delete lib[S.selectedEx];
          saveLib(lib);
          // Remove from all days
          const plan = getPlan();
          Object.keys(plan).forEach(d => {
            plan[d].exercises = plan[d].exercises.filter(id => id !== S.selectedEx);
          });
          savePlan(plan);
          goBack();
          renderDashboard();
        }
      }
    ]);
  });


  document.querySelectorAll(".wt-tab").forEach(tab =>
    tab.addEventListener("click", () => {
      document.querySelectorAll(".wt-tab").forEach(t => t.classList.remove("is-active"));
      document.querySelectorAll(".wt-tab-pane").forEach(p => p.classList.remove("is-active"));
      tab.classList.add("is-active");
      const pane = { sets: "tabSets", analyze: "tabAnalyze", "1rm": "tab1rm" }[tab.dataset.tab];
      if (pane) qs(pane).classList.add("is-active");
      S.activeTab = tab.dataset.tab;
    })
  );


});
