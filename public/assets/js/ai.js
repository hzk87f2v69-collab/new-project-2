/* ═══════════════════════════════════════════════
   AI Coach + Diet Generator – Ace Fitness
   ═══════════════════════════════════════════════ */

const qs = id => document.getElementById(id);

/* ── WORKOUT CONTEXT ────────────────────────────
   Read localStorage data and build a summary
   to send to the AI as context. */
const buildWorkoutContext = () => {
  let contextStr = window.dashboardContext ? `${window.dashboardContext}\n\n` : "";
  if (window.autoPilotData && window.autoPilotData.fitnessGoal) {
    contextStr += `Profile stats: Weight ${window.autoPilotData.weightKg || "?"}kg, Height ${window.autoPilotData.heightCm || "?"}cm, Goal: ${window.autoPilotData.fitnessGoal}\n\n`;
  }

  try {
    const logs = JSON.parse(localStorage.getItem("ace_wt_logs") || "[]");
    const lib  = JSON.parse(localStorage.getItem("ace_wt_library") || "{}");
    if (!logs.length) return contextStr + "No workout data logged yet.";

    const totalSessions = logs.length;
    const totalSets     = logs.reduce((s, l) => s + (l.sets?.length || 0), 0);

    // Exercise frequency
    const exCount = {};
    logs.forEach(l => { exCount[l.exerciseId] = (exCount[l.exerciseId] || 0) + l.sets.length; });

    // Recent 5 sessions
    const recent = logs
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
      .map(l => {
        const exName = lib[l.exerciseId]?.name || "Unknown";
        const sets   = l.sets.map(s => `${s.reps}r×${s.weight}kg`).join(", ");
        return `- ${l.date}: ${exName} [${sets}]`;
      }).join("\n");

    // Top exercises
    const top = Object.entries(exCount)
      .sort((a,b) => b[1]-a[1])
      .slice(0,5)
      .map(([id, count]) => `${lib[id]?.name || id} (${count} sets)`)
      .join(", ");

    return contextStr + `Sessions: ${totalSessions} | Total sets: ${totalSets}
Top exercises: ${top}
Recent logs:\n${recent}`;
  } catch {
    return contextStr + "Workout data unavailable.";
  }
};

/* ── TABS ───────────────────────────────────────── */
document.querySelectorAll(".ai-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".ai-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".ai-pane").forEach(p => p.classList.remove("active"));
    tab.classList.add("active");
    qs("pane" + tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1)).classList.add("active");
  });
});

/* ── CHAT ───────────────────────────────────────── */
const chatMessages = qs("chatMessages");

const appendMsg = (role, text, isTyping = false) => {
  const div = document.createElement("div");
  div.className = `ai-msg ${role}${isTyping ? " ai-typing" : ""}`;
  div.innerHTML = `
    <div class="ai-msg-avatar">${role === "ai" ? "🤖" : "👤"}</div>
    <div class="ai-msg-bubble">${isTyping ? "" : escapeHtml(text)}</div>`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
};

const escapeHtml = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br>");

const sendMessage = async () => {
  const input = qs("chatInput");
  const msg   = input.value.trim();
  if (!msg) return;
  input.value = "";

  appendMsg("user", msg);
  const typingEl = appendMsg("ai", "", true);
  qs("sendBtn").disabled = true;

  try {
    const res  = await fetch("/api/ai/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, workoutContext: buildWorkoutContext() })
    });
    const data = await res.json();

    typingEl.remove();
    if (data.error) {
      if (data.error.includes("GEMINI_API_KEY")) showNoBanner();
      appendMsg("ai", "⚠️ " + data.error);
    } else {
      appendMsg("ai", data.reply);
    }
  } catch (e) {
    typingEl.remove();
    appendMsg("ai", "⚠️ Network error. Is the server running?");
  } finally {
    qs("sendBtn").disabled = false;
    input.focus();
  }
};

qs("sendBtn").addEventListener("click", sendMessage);
qs("chatInput").addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } });

/* ── DIET GENERATOR ─────────────────────────────── */
const showNoBanner = () => { qs("noKeyBanner").style.display = "block"; };

const renderDietPlan = (plan) => {
  const res = qs("dietResult");
  res.innerHTML = `
    <div class="ai-macro-row">
      <div class="ai-macro-pill"><div class="ai-macro-val cal">${plan.calories}</div><div class="ai-macro-lbl">Calories</div></div>
      <div class="ai-macro-pill"><div class="ai-macro-val pro">${plan.protein}g</div><div class="ai-macro-lbl">Protein</div></div>
      <div class="ai-macro-pill"><div class="ai-macro-val carb">${plan.carbs}g</div><div class="ai-macro-lbl">Carbs</div></div>
      <div class="ai-macro-pill"><div class="ai-macro-val fat">${plan.fat}g</div><div class="ai-macro-lbl">Fat</div></div>
    </div>
    ${plan.days.map((day, i) => `
      <div class="ai-day-card${i === 0 ? " open" : ""}" data-day="${i}">
        <div class="ai-day-header">
          <div class="ai-day-name">${day.day}</div>
          <div style="display:flex;align-items:center;gap:0.75rem">
            <div class="ai-day-cals">${day.meals.reduce((s,m)=>s+(m.calories||0),0)} kcal</div>
            <span class="ai-day-chevron">▾</span>
          </div>
        </div>
        <div class="ai-day-meals">
          ${day.meals.map(meal => `
            <div class="ai-meal">
              <div class="ai-meal-name">${meal.name} · ${meal.calories || ""}${meal.calories?"kcal":""}</div>
              ${meal.items.map(item => `<div class="ai-meal-item">${item}</div>`).join("")}
            </div>`).join("")}
        </div>
      </div>`).join("")}`;

  res.classList.add("show");

  // Accordion
  res.querySelectorAll(".ai-day-header").forEach(hdr =>
    hdr.addEventListener("click", () => hdr.closest(".ai-day-card").classList.toggle("open"))
  );
};

qs("genDietBtn").addEventListener("click", async () => {
  const btn = qs("genDietBtn");
  const spinner = qs("dietSpinner");
  const result  = qs("dietResult");

  btn.disabled = true;
  spinner.classList.add("show");
  result.classList.remove("show");
  result.innerHTML = "";

  try {
    const res = await fetch("/api/ai/diet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goal:      qs("dietGoal").value,
        weight:    qs("dietWeight").value,
        height:    qs("dietHeight").value,
        age:       qs("dietAge").value,
        activity:  qs("dietActivity").value,
        diet:      qs("dietType").value,
        allergies: qs("dietAllergies").value
      })
    });
    const data = await res.json();
    spinner.classList.remove("show");

    if (data.error) {
      if (data.error.includes("GEMINI_API_KEY")) showNoBanner();
      result.innerHTML = `<div style="color:#ff453a;padding:1rem;font-size:0.9rem">⚠️ ${data.error}</div>`;
      result.classList.add("show");
    } else {
      renderDietPlan(data);
    }
  } catch (e) {
    spinner.classList.remove("show");
    result.innerHTML = `<div style="color:#ff453a;padding:1rem;font-size:0.9rem">⚠️ Network error. Is the server running?</div>`;
    result.classList.add("show");
  } finally {
    btn.disabled = false;
  }
});

/* ── PROFILE AUTO-FILL & AUTO-PILOT ──────────────────────────── */
window.autoPilotData = null;

window.addEventListener("DOMContentLoaded", async () => {
  // 1. Accordion UI logic
  const manToggle = qs("manualFormToggle");
  const manContent = qs("manualFormContent");
  const manChevron = qs("manualFormChevron");
  if (manToggle && manContent) {
    manToggle.addEventListener("click", () => {
      const isHidden = manContent.style.display === "none";
      manContent.style.display = isHidden ? "block" : "none";
      manChevron.style.transform = isHidden ? "rotate(180deg)" : "rotate(0deg)";
    });
  }

  // 2. Fetch Data
  try {
    const headers = typeof getHeaders === "function" ? getHeaders() : {};
    const [profileRes, enrollmentsRes] = await Promise.allSettled([
      api("/user/profile", { headers }),
      api("/user/enrollments", { headers })
    ]);

    const pData = profileRes.status === "fulfilled" ? profileRes.value.profile : null;
    const eData = enrollmentsRes.status === "fulfilled" ? enrollmentsRes.value : null;

    // Cache enrollments for AI Coach
    if (eData) {
      const streak = localStorage.getItem('ace_streak') || 0;
      window.dashboardContext = `Dashboard stats:\n- Total Courses Enrolled: ${eData.enrollments?.length || 0}\n- Active Streak: ${streak} days\n- Recent payments: ${eData.paymentHistory?.length || 0}`;
    }

    // Process Profile Data
    if (pData) {
      window.autoPilotData = pData;
      
      if (pData.fitnessGoal)   { const el = qs("dietGoal");     if (el) el.value = pData.fitnessGoal; }
      if (pData.weightKg)      { const el = qs("dietWeight");   if (el) el.value = pData.weightKg; }
      if (pData.heightCm)      { const el = qs("dietHeight");   if (el) el.value = pData.heightCm; }
      if (pData.age)           { const el = qs("dietAge");      if (el) el.value = pData.age; }
      if (pData.activityLevel) { const el = qs("dietActivity"); if (el) el.value = pData.activityLevel; }
      if (pData.dietType)      { const el = qs("dietType");     if (el) el.value = pData.dietType; }
      if (pData.allergies)     { const el = qs("dietAllergies");if (el) el.value = pData.allergies; }

      if (pData.weightKg && pData.fitnessGoal) {
        const autoCard = qs("autoPilotCard");
        if (autoCard) autoCard.style.display = "block";
        
        if (manContent) manContent.style.display = "none";
        if (manChevron) manChevron.style.transform = "rotate(0deg)";
      }
    }
  } catch (e) {
    console.warn("Auto-Pilot initialization failed:", e);
  }

  // Bind Auto-Generate Button
  const autoGenBtn = qs("autoGenDietBtn");
  if (autoGenBtn) {
    autoGenBtn.addEventListener("click", () => qs("genDietBtn").click());
  }

  // Check if API key is set
  try {
    const res  = await fetch("/api/ai/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "ping", workoutContext: "" })
    });
    const data = await res.json();
    if (data.error?.includes("GEMINI_API_KEY")) showNoBanner();
  } catch {}
});

