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
  // Chest
  { name: "Barbell Bench Press", muscle: "Chest" },
  { name: "Dumbbell Bench Press", muscle: "Chest" },
  { name: "Incline Barbell Bench Press", muscle: "Chest" },
  { name: "Incline Dumbbell Bench Press", muscle: "Chest" },
  { name: "Decline Barbell Bench Press", muscle: "Chest" },
  { name: "Decline Dumbbell Bench Press", muscle: "Chest" },
  { name: "Dumbbell Flyes", muscle: "Chest" },
  { name: "Incline Dumbbell Flyes", muscle: "Chest" },
  { name: "Cable Crossover", muscle: "Chest" },
  { name: "Low Cable Crossover", muscle: "Chest" },
  { name: "High Cable Crossover", muscle: "Chest" },
  { name: "Pec Deck Machine", muscle: "Chest" },
  { name: "Push-Ups", muscle: "Chest" },
  { name: "Diamond Push-Ups", muscle: "Chest" },
  { name: "Wide Grip Push-Ups", muscle: "Chest" },
  { name: "Dips (Chest Focus)", muscle: "Chest" },
  { name: "Machine Chest Press", muscle: "Chest" },
  { name: "Svend Press", muscle: "Chest" },
  { name: "Dumbbell Pullover", muscle: "Chest" },

  // Back
  { name: "Deadlift", muscle: "Back" },
  { name: "Sumo Deadlift", muscle: "Back" },
  { name: "Romanian Deadlift", muscle: "Back" },
  { name: "Barbell Bent-Over Row", muscle: "Back" },
  { name: "Pendlay Row", muscle: "Back" },
  { name: "T-Bar Row", muscle: "Back" },
  { name: "Dumbbell Single-Arm Row", muscle: "Back" },
  { name: "Pull-Ups", muscle: "Back" },
  { name: "Chin-Ups", muscle: "Back" },
  { name: "Wide Grip Lat Pulldown", muscle: "Back" },
  { name: "Close Grip Lat Pulldown", muscle: "Back" },
  { name: "Reverse Grip Lat Pulldown", muscle: "Back" },
  { name: "Seated Cable Row", muscle: "Back" },
  { name: "Straight-Arm Pulldown", muscle: "Back" },
  { name: "Machine Row", muscle: "Back" },
  { name: "Rack Pulls", muscle: "Back" },
  { name: "Good Mornings", muscle: "Back" },
  { name: "Hyperextensions", muscle: "Back" },
  { name: "Face Pulls", muscle: "Back" },
  { name: "Renegade Row", muscle: "Back" },

  // Shoulders
  { name: "Overhead Press", muscle: "Shoulder" },
  { name: "Seated Dumbbell Press", muscle: "Shoulder" },
  { name: "Arnold Press", muscle: "Shoulder" },
  { name: "Machine Shoulder Press", muscle: "Shoulder" },
  { name: "Lateral Raise", muscle: "Shoulder" },
  { name: "Cable Lateral Raise", muscle: "Shoulder" },
  { name: "Machine Lateral Raise", muscle: "Shoulder" },
  { name: "Front Raise (Dumbbell)", muscle: "Shoulder" },
  { name: "Front Raise (Barbell)", muscle: "Shoulder" },
  { name: "Front Raise (Cable)", muscle: "Shoulder" },
  { name: "Upright Row", muscle: "Shoulder" },
  { name: "Cable Upright Row", muscle: "Shoulder" },
  { name: "Rear Delt Flyes", muscle: "Shoulder" },
  { name: "Rear Delt Machine", muscle: "Shoulder" },
  { name: "Cable Face Pulls", muscle: "Shoulder" },
  { name: "Barbell Shrugs", muscle: "Shoulder" },
  { name: "Dumbbell Shrugs", muscle: "Shoulder" },
  { name: "Push Press", muscle: "Shoulder" },

  // Legs
  { name: "Barbell Back Squat", muscle: "Legs" },
  { name: "Barbell Front Squat", muscle: "Legs" },
  { name: "Goblet Squat", muscle: "Legs" },
  { name: "Leg Press", muscle: "Legs" },
  { name: "Hack Squat", muscle: "Legs" },
  { name: "Dumbbell Lunges", muscle: "Legs" },
  { name: "Walking Lunges", muscle: "Legs" },
  { name: "Reverse Lunges", muscle: "Legs" },
  { name: "Bulgarian Split Squat", muscle: "Legs" },
  { name: "Leg Extensions", muscle: "Legs" },
  { name: "Lying Leg Curls", muscle: "Legs" },
  { name: "Seated Leg Curls", muscle: "Legs" },
  { name: "Romanian Deadlift (Hamstrings)", muscle: "Legs" },
  { name: "Stiff-Legged Deadlift", muscle: "Legs" },
  { name: "Glute Bridge", muscle: "Legs" },
  { name: "Barbell Hip Thrust", muscle: "Legs" },
  { name: "Cable Pull-Through", muscle: "Legs" },
  { name: "Standing Calf Raises", muscle: "Legs" },
  { name: "Seated Calf Raises", muscle: "Legs" },
  { name: "Leg Press Calf Raises", muscle: "Legs" },
  { name: "Step-Ups", muscle: "Legs" },
  { name: "Sissy Squat", muscle: "Legs" },
  { name: "Box Squat", muscle: "Legs" },
  { name: "Sumo Squat", muscle: "Legs" },

  // Arms
  { name: "Barbell Bicep Curl", muscle: "Arms" },
  { name: "Dumbbell Bicep Curl", muscle: "Arms" },
  { name: "Hammer Curl", muscle: "Arms" },
  { name: "Preacher Curl", muscle: "Arms" },
  { name: "EZ-Bar Curl", muscle: "Arms" },
  { name: "Incline Dumbbell Curl", muscle: "Arms" },
  { name: "Concentration Curl", muscle: "Arms" },
  { name: "Cable Bicep Curl", muscle: "Arms" },
  { name: "Reverse Bicep Curl", muscle: "Arms" },
  { name: "Close-Grip Bench Press", muscle: "Arms" },
  { name: "Tricep Dips", muscle: "Arms" },
  { name: "Skull Crushers", muscle: "Arms" },
  { name: "Overhead Tricep Extension", muscle: "Arms" },
  { name: "Tricep Pushdown", muscle: "Arms" },
  { name: "Tricep Rope Pushdown", muscle: "Arms" },
  { name: "Tricep Kickback", muscle: "Arms" },
  { name: "Machine Tricep Extension", muscle: "Arms" },
  { name: "Wrist Curls", muscle: "Arms" },
  { name: "Reverse Wrist Curls", muscle: "Arms" },
  { name: "Farmer's Walk", muscle: "Arms" },

  // Abs & Core
  { name: "Crunches", muscle: "Abs" },
  { name: "Reverse Crunches", muscle: "Abs" },
  { name: "Bicycle Crunches", muscle: "Abs" },
  { name: "Sit-Ups", muscle: "Abs" },
  { name: "Russian Twists", muscle: "Abs" },
  { name: "Plank", muscle: "Abs" },
  { name: "Side Plank", muscle: "Abs" },
  { name: "Hanging Leg Raises", muscle: "Abs" },
  { name: "Hanging Knee Raises", muscle: "Abs" },
  { name: "Lying Leg Raises", muscle: "Abs" },
  { name: "Ab Wheel Rollout", muscle: "Abs" },
  { name: "Cable Crunches", muscle: "Abs" },
  { name: "Woodchoppers", muscle: "Abs" },
  { name: "V-Ups", muscle: "Abs" },
  { name: "Flutter Kicks", muscle: "Abs" },
  { name: "Mountain Climbers", muscle: "Abs" },
  { name: "Dead Bug", muscle: "Abs" },
  { name: "Bird Dog", muscle: "Abs" },
  { name: "Heel Touches", muscle: "Abs" },

  // Full Body / Cardio
  { name: "Burpees", muscle: "Full Body" },
  { name: "Kettlebell Swings", muscle: "Full Body" },
  { name: "Power Clean", muscle: "Full Body" },
  { name: "Clean and Jerk", muscle: "Full Body" },
  { name: "Snatch", muscle: "Full Body" },
  { name: "Box Jumps", muscle: "Legs" },
  { name: "Thrusters", muscle: "Full Body" },
  { name: "Rowing", muscle: "Back" },
];

/* ── STATE ───────────────────────────────────────────────── */
const S = {
  activeView: "dashboard",   // "dashboard" | "day" | "exercise"
  selectedDay: null,
  selectedEx: null,
  activeTab: "sets",
  editingSetId: null,          // for edit flow
  editingLogId: null,
  historyLevel: 0,
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
  const existingLib = getLib() || {};
  let added = false;

  SEED_EXERCISES.forEach(e => {
    // Check if exercise already exists by name
    const exists = Object.values(existingLib).some(ex => ex.name.toLowerCase() === e.name.toLowerCase());
    if (!exists) {
      const id = genId();
      existingLib[id] = { id, name: e.name, muscle: e.muscle };
      added = true;
    }
  });

  if (added || Object.keys(existingLib).length === 0) {
    saveLib(existingLib);
  }
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

  const prevId = VIEW_STACK.pop();
  const prev = prevId ? document.getElementById(prevId) : null;
  
  if (prev) { 
    prev.classList.remove("slide-behind"); 
    prev.classList.add("is-active"); 
    S.activeView = prev.id === "viewExercise" ? "exercise" : prev.id === "viewDay" ? "day" : "dashboard";
  } else {
    // Fallback if stack is empty
    const oldPrev = document.querySelector(".wt-view.slide-behind");
    if (oldPrev) { oldPrev.classList.remove("slide-behind"); oldPrev.classList.add("is-active"); }
    S.activeView = "dashboard";
  }
  
  qs("addSetFab").classList.toggle("visible", S.activeView === "exercise");
};

/* ── WEEKLY PROGRESS HELPERS ────────────────────────────── */
const getWeeklyStats = (logs, offsetDays = 0) => {
  const now   = new Date().setHours(23, 59, 59, 999);
  const start = now - (offsetDays + 7) * 86400000;
  const end   = now - offsetDays * 86400000;

  let volume = 0, sets = 0;
  const days = new Set();
  let best1RM = 0;

  logs.forEach(l => {
    const ts = new Date(l.date.replace(/-/g, "/")).getTime();
    if (ts < start || ts > end) return;
    days.add(l.date);
    l.sets.forEach(s => {
      sets++;
      volume += (s.reps || 0) * (s.weight || 0);
      const orm = epley1RM(s.reps, s.weight);
      if (orm > best1RM) best1RM = orm;
    });
  });

  return { volume: Math.round(volume), sets, days: days.size, best1RM: Math.round(best1RM * 10) / 10 };
};

const growthBadge = (cur, prev) => {
  if (prev === 0 && cur === 0) return `<span class="wt-badge-neutral">—</span>`;
  if (prev === 0) return `<span class="wt-badge-up">▲ NEW</span>`;
  const pct = ((cur - prev) / prev * 100).toFixed(1);
  const up = cur >= prev;
  return `<span class="wt-badge-${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${Math.abs(pct)}%</span>`;
};

let sparkInstance = null;

const renderWeeklyProgress = () => {
  const logs  = getLogs();
  const body  = document.querySelector("#wtWeeklyProgress .wt-weekly-body");
  const spark = qs("wtSparkline");
  if (!body || !spark) return;

  const tw = getWeeklyStats(logs, 0);
  const lw = getWeeklyStats(logs, 7);

  // Check all-time 1RM vs this week
  const allTimeLogs = logs;
  let allTime1RM = 0;
  allTimeLogs.forEach(l => l.sets.forEach(s => {
    const orm = epley1RM(s.reps, s.weight);
    if (orm > allTime1RM) allTime1RM = orm;
  }));
  const newPR = tw.best1RM > 0 && tw.best1RM >= allTime1RM;

  if (tw.sets === 0 && lw.sets === 0) {
    body.innerHTML = `
      <div class="wt-weekly-empty">
        <span style="font-size:2rem">📅</span>
        <p>Stay consistent and see real results.</p>
        <span class="wt-weekly-cta">KEEP GOING!</span>
      </div>`;
    spark.style.display = 'none';
    return;
  }

  spark.style.display = '';

  body.innerHTML = `
    <div class="wt-weekly-metrics">
      <div class="wt-weekly-metric">
        <div class="wt-weekly-metric-val">${tw.volume.toLocaleString()}<small>kg</small></div>
        <div class="wt-weekly-metric-label">Volume ${growthBadge(tw.volume, lw.volume)}</div>
      </div>
      <div class="wt-weekly-metric">
        <div class="wt-weekly-metric-val">${tw.sets}</div>
        <div class="wt-weekly-metric-label">Sets ${growthBadge(tw.sets, lw.sets)}</div>
      </div>
      <div class="wt-weekly-metric">
        <div class="wt-weekly-metric-val">${tw.days}<small>/6</small></div>
        <div class="wt-weekly-metric-label">Days ${growthBadge(tw.days, lw.days)}</div>
      </div>
      <div class="wt-weekly-metric">
        <div class="wt-weekly-metric-val">${tw.best1RM}<small>kg</small></div>
        <div class="wt-weekly-metric-label">Best 1RM ${newPR ? '<span class="wt-badge-pr">🏆 PR</span>' : growthBadge(tw.best1RM, lw.best1RM)}</div>
      </div>
    </div>`;

  // ── 7-day sparkline ─────────────────────────────────────────
  const dayVolumes = [];
  const dayLabels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    dayLabels.push(key.slice(5)); // MM-DD
    const dayLogs = logs.filter(l => l.date === key);
    let vol = 0;
    dayLogs.forEach(l => l.sets.forEach(s => { vol += (s.reps||0)*(s.weight||0); }));
    dayVolumes.push(Math.round(vol));
  }

  const maxVol = Math.max(...dayVolumes, 1);
  const W = spark.offsetWidth || 300;
  const H = 48;
  spark.width  = W;
  spark.height = H;
  const ctx = spark.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  const barW  = Math.floor(W / 7) - 3;
  const gap   = 3;
  const start = Math.floor((W - (barW + gap) * 7) / 2);

  dayVolumes.forEach((v, i) => {
    const barH = v > 0 ? Math.max(4, Math.round((v / maxVol) * (H - 12))) : 3;
    const x = start + i * (barW + gap);
    const y = H - barH - 2;
    const isToday = i === 6;
    const grad = ctx.createLinearGradient(0, y, 0, H);
    grad.addColorStop(0, isToday ? 'rgba(0,122,255,0.9)' : (v > 0 ? 'rgba(48,209,88,0.75)' : 'rgba(255,255,255,0.12)'));
    grad.addColorStop(1, isToday ? 'rgba(0,122,255,0.3)' : (v > 0 ? 'rgba(48,209,88,0.2)'  : 'rgba(255,255,255,0.04)'));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, [2, 2, 0, 0]);
    ctx.fill();
  });
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
          <div class="wt-day-muscles-view" style="display:flex;align-items:center;gap:0.4rem;margin-top:2px;">
            ${day.muscles ? `<div class="wt-day-muscles" style="font-size:0.8rem;color:rgba(255,255,255,0.5);">${day.muscles}</div>` : `<div class="wt-day-muscles" style="font-size:0.8rem;color:rgba(255,255,255,0.3);font-style:italic;">Add subheading...</div>`}
            <button class="wt-day-edit-btn" data-edit-day="${key}" title="Edit subheading" style="background:none;border:none;color:rgba(255,255,255,0.4);cursor:pointer;padding:2px;display:flex;align-items:center;transition:color 0.2s;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
          </div>
          <input type="text" class="wt-day-muscles-input hide" data-day="${key}" value="${day.muscles || ''}" placeholder="Add subheading..." style="font-size:0.8rem; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:4px; padding:2px 4px; width:100%; outline:none; margin-top:2px;" />
        </div>
        <div class="wt-day-right">
          <div class="wt-day-count">${exCount}</div>
          <div class="wt-day-count-label">exercise${exCount !== 1 ? "s" : ""}</div>
        </div>
        <span class="wt-day-chevron">›</span>
      </div>`;
  }).join("");

  // Render weekly progress card removed (now on dashboard only)

  container.querySelectorAll(".wt-day-card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest('.wt-day-muscles-input')) {
        e.stopPropagation();
        return;
      }
      if (e.target.closest('.wt-day-edit-btn')) {
        e.stopPropagation();
        const btn = e.target.closest('.wt-day-edit-btn');
        const card = btn.closest('.wt-day-card');
        const viewDiv = card.querySelector('.wt-day-muscles-view');
        const inputEl = card.querySelector('.wt-day-muscles-input');
        
        viewDiv.style.display = 'none';
        inputEl.classList.remove('hide');
        inputEl.focus();
        // Move cursor to end
        inputEl.selectionStart = inputEl.selectionEnd = inputEl.value.length;
        
        const saveEdit = () => {
          const plan = getPlan();
          plan[card.dataset.day].muscles = inputEl.value.trim();
          savePlan(plan);
          renderDashboard();
        };
        
        inputEl.addEventListener('blur', saveEdit, { once: true });
        inputEl.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter') {
            ev.preventDefault();
            inputEl.blur();
          }
          if (ev.key === 'Escape') {
            ev.preventDefault();
            renderDashboard(); // Cancel
          }
        });
        return;
      }
      openDayView(card.dataset.day);
    });
  });
};

/* ── RENDER: DAY VIEW ────────────────────────────────────── */
const openDayView = (dayKey, pushState = true) => {
  S.selectedDay = dayKey;
  const plan = getPlan();
  const day = plan[dayKey];
  const lib = getLib() || {};
  const logs = getLogs();

  qs("dayViewTitle").textContent = dayKey.toUpperCase();

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
  if (pushState) {
    S.historyLevel = 1;
    history.pushState({ level: 1, view: 'viewDay', day: dayKey }, '');
  }
};

/* ── RENDER: EXERCISE VIEW ───────────────────────────────── */
const openExerciseView = (exId, pushState = true) => {
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
  if (pushState) {
    S.historyLevel = 2;
    history.pushState({ level: 2, view: 'viewExercise', ex: exId, day: S.selectedDay }, '');
  }
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

  /* History API Integration */
  history.replaceState({ level: 0, view: 'dashboard' }, '');

  window.addEventListener('popstate', (e) => {
    const state = e.state;
    if (!state) return;
    
    if (state.level < S.historyLevel) {
      // Navigating back
      const steps = S.historyLevel - state.level;
      for (let i = 0; i < steps; i++) {
        goBack();
      }
      S.historyLevel = state.level;
      
      if (state.view === 'dashboard') {
        renderDashboard();
      } else if (state.view === 'viewDay') {
        S.selectedDay = state.day;
      }
    } else if (state.level > S.historyLevel) {
      // Navigating forward
      S.historyLevel = state.level;
      if (state.view === 'viewDay') {
        openDayView(state.day, false);
      } else if (state.view === 'viewExercise') {
        openExerciseView(state.ex, false);
      }
    }
  });

  /* Dashboard actions */
  qs("newWorkoutBtn").addEventListener("click", () => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const todayKey = days[new Date().getDay()];
    const plan = getPlan();
    const targetDay = plan[todayKey] ? todayKey : "monday";
    openDayView(targetDay);
  });

  const newPlanBtn = qs("newPlanBtn");
  if (newPlanBtn) {
    newPlanBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear your current plan and start fresh? All days will be reset.")) {
        savePlan(structuredClone(DEFAULT_DAYS));
        renderDashboard();
      }
    });
  }

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
  // Dashboard settings
  const settingsBtn = qs("settingsBtn");
  if (settingsBtn) {
    settingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showCtxMenu(settingsBtn, [
        {
          icon: "⬇️", label: "Export Data",
          action: () => {
            const data = { plan: getPlan(), lib: getLib(), logs: getLogs() };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ace-fitness-backup-${todayStr()}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }
        },
        {
          icon: "⬆️", label: "Import Data",
          action: () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json";
            input.onchange = ev => {
              const file = ev.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = r => {
                try {
                  const data = JSON.parse(r.target.result);
                  if (data.plan && data.lib && data.logs) {
                    savePlan(data.plan); saveLib(data.lib); saveLogs(data.logs);
                    alert("Data imported successfully!");
                    location.reload();
                  } else {
                    alert("Invalid backup format.");
                  }
                } catch(err) {
                  alert("Failed to parse file.");
                }
              };
              reader.readAsText(file);
            };
            input.click();
          }
        },
        {
          icon: "🗑", label: "Factory Reset", danger: true,
          action: () => {
            if (confirm("WARNING: This will permanently delete all your custom exercises, workout logs, and custom plans. Are you absolutely sure?")) {
              localStorage.removeItem(K_PLAN);
              localStorage.removeItem(K_LIB);
              localStorage.removeItem(K_LOGS);
              location.reload();
            }
          }
        }
      ]);
    });
  }

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
