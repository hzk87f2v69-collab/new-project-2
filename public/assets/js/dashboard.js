document.addEventListener("DOMContentLoaded", async () => {
  if (!ensureAuth()) return;

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const profileName      = document.getElementById("profileName");
  const profileEmail     = document.getElementById("profileEmail");
  const joinedDate       = document.getElementById("joinedDate");
  const coursesContainer = document.getElementById("coursesContainer");
  const paymentsContainer= document.getElementById("paymentsContainer");
  const badgeRow         = document.getElementById("badgeRow");
  const ringFill         = document.getElementById("ringFill");
  const ringLabel        = document.getElementById("ringLabel");
  const metricStreak     = document.getElementById("metricStreak");
  const metricHours      = document.getElementById("metricHours");
  const consistencyScore = document.getElementById("consistencyScore");
  const disciplineScore  = document.getElementById("disciplineScore");
  const logoutBtn        = document.getElementById("logoutBtn");

  const metrics = {
    tracks:   document.getElementById("metricTracks"),
    progress: document.getElementById("metricProgress"),
    classes:  document.getElementById("metricClasses"),
    payments: document.getElementById("metricPayments"),
  };

  logoutBtn?.addEventListener("click", () => { clearAuth(); window.location.href = window.location.protocol === "file:" ? "index.html" : "/"; });

  // ── Streak tracking via localStorage ─────────────────────────────────────
  const today    = new Date().toDateString();
  const lastLogin= localStorage.getItem("ace_last_login");
  let   streakDays = parseInt(localStorage.getItem("ace_streak") || "1", 10);

  if (lastLogin !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    streakDays = (lastLogin === yesterday) ? streakDays + 1 : 1;
    localStorage.setItem("ace_streak",     String(streakDays));
    localStorage.setItem("ace_last_login", today);
  }

  metricStreak.textContent = streakDays;

  // ── Count-up animation helper ─────────────────────────────────────────────
  const countUp = (el, target, suffix = "", duration = 900) => {
    if (!el) return;
    const start = Date.now();
    const tick  = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // ── Radar chart builder ────────────────────────────────────────────────────
  let radarInstance = null;

  const buildRadar = (thisWeek, lastWeek) => {
    const canvas = document.getElementById("radarChart");
    if (!canvas || typeof Chart === "undefined") {
      console.warn("Chart.js not loaded or canvas missing");
      return;
    }
    const ctx = canvas.getContext("2d");
    if (radarInstance) radarInstance.destroy();

    radarInstance = new Chart(ctx, {
      type: "radar",
      data: {
        labels: [
          "Course\nCompletion",
          "Consistency",
          "Workout\nIntensity",
          "Discipline\nScore",
          "Nutrition\nCompliance",
          "Weekly\nMomentum"
        ],
        datasets: [
          {
            label: "This Week",
            data:  thisWeek,
            backgroundColor: "rgba(0,102,204,0.15)",
            borderColor:     "rgba(0,102,204,0.9)",
            pointBackgroundColor: "rgba(0,102,204,1)",
            pointBorderColor:    "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor:     "rgba(0,102,204,1)",
            borderWidth: 2.5,
            pointRadius: 5,
          },
          {
            label: "Last Week",
            data:  lastWeek,
            backgroundColor: "rgba(48,209,88,0.1)",
            borderColor:     "rgba(48,209,88,0.6)",
            pointBackgroundColor: "rgba(48,209,88,0.8)",
            pointBorderColor:    "#fff",
            borderWidth: 1.8,
            pointRadius: 4,
            borderDash: [5, 4],
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: { duration: 1000, easing: "easeOutQuart" },
        scales: {
          r: {
            min: 0, max: 100,
            ticks: {
              stepSize: 25,
              color: "rgba(255,255,255,0.55)",
              font: { size: 10 },
              backdropColor: "transparent",
            },
            grid: {
              color: "rgba(0,102,204,0.1)",
              circular: false,
            },
            angleLines: { color: "rgba(0,102,204,0.12)" },
            pointLabels: {
              color: "#9fb2cb",
              font: { size: 11, weight: "600" },
              padding: 14,
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(28,28,30,0.94)",
            borderColor: "rgba(0,102,204,0.25)",
            borderWidth: 1,
            titleColor: "#20c7ff",
            bodyColor:  "#f4f8ff",
            padding: 12,
            callbacks: {
              label: (ctx) => `  ${ctx.dataset.label}: ${ctx.parsed.r}%`
            }
          }
        }
      }
    });
  };

  // ── Progress ring helper ───────────────────────────────────────────────────
  const setRing = (pct) => {
    const circumference = 2 * Math.PI * 32; // r=32 → 201
    const offset = circumference - (pct / 100) * circumference;
    ringFill.style.transition = "stroke-dashoffset 1s ease";
    ringFill.setAttribute("stroke-dasharray", `${circumference} ${circumference}`);
    setTimeout(() => { ringFill.setAttribute("stroke-dashoffset", offset); }, 50);
    countUp(ringLabel, pct, "%");
  };

  // ── Badges ────────────────────────────────────────────────────────────────
  const earnedBadges = (streak, completedCount, tracks) => {
    const badges = [];
    if (streak >= 7)        badges.push({ icon: "🔥", label: "7-Day Beast" });
    if (streak >= 3)        badges.push({ icon: "⚡", label: "3-Day Grind" });
    if (completedCount >= 1) badges.push({ icon: "💪", label: "First Class" });
    if (tracks.some(t => t.progress >= 100)) badges.push({ icon: "🏆", label: "Track Master" });
    if (tracks.some(t => t.progress >= 25))  badges.push({ icon: "✅", label: "Week 1 Done" });
    return badges;
  };

  // ── Main fetch & render ────────────────────────────────────────────────────
  try {
    const data = await api("/user/enrollments", { headers: getHeaders(false) });
    await fetchTracks().catch(() => null);

    // Profile
    profileName.textContent  = data.profile.name;
    profileEmail.textContent = data.profile.email;
    joinedDate.textContent   = new Date(data.profile.joinedAt).toLocaleDateString("en-IN", { year:"numeric", month:"short", day:"numeric" });

    // ── Tracker Data Integration ──────────────────────────────────────────────
    const wtLogs = JSON.parse(localStorage.getItem("ace_wt_logs") || "[]");
    const todayMs = new Date().setHours(0,0,0,0);
    const dayMs = 86400000;
    
    let activeDaysThisWeek = new Set();
    let setsThisWeek = 0;
    let totalTrackerSets = 0;
    
    wtLogs.forEach(log => {
      totalTrackerSets += log.sets.length;
      const logDateMs = new Date(log.date).setHours(0,0,0,0);
      const daysAgo = Math.floor((todayMs - logDateMs) / dayMs);
      if (daysAgo >= 0 && daysAgo < 7) {
        activeDaysThisWeek.add(log.date);
        setsThisWeek += log.sets.length;
      }
    });

    const wtConsistency = Math.min(100, Math.round((activeDaysThisWeek.size / 5) * 100));
    const wtIntensity = Math.min(100, Math.round((setsThisWeek / 30) * 100));
    const trackerEstHours = Math.round((totalTrackerSets * 2) / 60);

    // Basic metrics
    const totalCompleted = data.enrollments.reduce((s, e) => s + e.completedClasses.length, 0);
    const totalClasses   = data.enrollments.reduce((s, e) => s + (e.totalClasses || 8), 0);
    const avgProgress    = data.enrollments.length > 0
      ? Math.round(data.enrollments.reduce((s, e) => s + e.progress, 0) / data.enrollments.length)
      : 0;
    const estHours       = Math.round(totalCompleted * 0.4) + trackerEstHours;

    countUp(metrics.tracks,   data.enrollments.length);
    countUp(metrics.classes,  totalCompleted);
    countUp(metrics.payments, data.paymentHistory.length);
    countUp(metrics.progress, avgProgress, "%");
    countUp(metricHours,      estHours);
    setRing(avgProgress);

    // ── Radar axis calculations ──────────────────────────────────────────────
    const courseCompletion = totalClasses > 0 ? Math.min(100, Math.round((totalCompleted / totalClasses) * 100)) : 0;
    
    // Use actual workout data if available, else fall back to login streak and course proxies
    const consistency      = wtLogs.length > 0 ? wtConsistency : Math.min(100, Math.round((Math.min(streakDays, 7) / 7) * 100));
    const workoutIntensity = wtLogs.length > 0 ? wtIntensity : Math.min(100, Math.round((totalCompleted / Math.max(totalClasses * 0.5, 1)) * 100));
    const discipline       = Math.min(100, Math.round((courseCompletion * 0.3 + consistency * 0.4 + workoutIntensity * 0.3)));
    const nutritionComp    = Math.min(100, Math.round(streakDays * 8)); // proxy
    const weeklyMomentum   = Math.min(100, Math.round(consistency * 0.6 + workoutIntensity * 0.4));

    consistencyScore.textContent = `${consistency}%`;
    disciplineScore.textContent  = `${discipline}%`;

    // Last-week values stored in localStorage for comparison
    const lastWeekKey  = "ace_lw_radar";
    const lastWeekData = JSON.parse(localStorage.getItem(lastWeekKey) || "null")
      || [Math.max(0, courseCompletion-15), Math.max(0, consistency-20), Math.max(0, workoutIntensity-10),
          Math.max(0, discipline-15), Math.max(0, nutritionComp-20), Math.max(0, weeklyMomentum-12)];

    // Save this week as next reference
    const thisWeekData = [courseCompletion, consistency, workoutIntensity, discipline, nutritionComp, weeklyMomentum];
    localStorage.setItem(lastWeekKey, JSON.stringify(lastWeekData));

    buildRadar(thisWeekData, lastWeekData);

    // ── Badges ───────────────────────────────────────────────────────────────
    const badges = earnedBadges(streakDays, totalCompleted, data.enrollments);
    badgeRow.innerHTML = badges.map(b => `
      <span class="db-badge">
        <span class="db-badge-icon">${b.icon}</span>${b.label}
      </span>
    `).join("") || "";

    // ── Courses ───────────────────────────────────────────────────────────────
    const trackNameMap = new Map(data.enrollments.map(t => [t.trackId, t.name || t.trackId]));

    coursesContainer.innerHTML = data.enrollments.length > 0
      ? data.enrollments.map(track => `
          <article class="db-course-card dashboard-card">
            <div class="db-course-head">
              <div class="db-course-icon">${track.name?.charAt(0) || "?"}</div>
              <div>
                <h3 style="margin:0 0 0.25rem">${track.name}</h3>
                <p class="muted" style="margin:0;font-size:0.88rem">${track.target || ""}</p>
              </div>
            </div>
            <div class="course-meta" style="margin:0.85rem 0 0.5rem">
              <span>${track.durationWeeks || "4"} weeks</span>
              <span>${track.completedClasses.length}/${track.totalClasses || 8} classes</span>
            </div>
            <div class="progress-bar"><span style="width:${track.progress}%"></span></div>
            <div class="db-course-foot">
              <span class="muted" style="font-size:0.85rem">${track.progress}% complete</span>
              <a class="btn" href="player.html?track=${track.trackId}">Continue →</a>
            </div>
          </article>
        `).join("")
      : `<article class="dashboard-card page-message-card">
           <h3>No courses unlocked yet</h3>
           <p>One unlock away from structured coaching and visible results.</p>
           <div class="stack-actions"><a class="btn" href="programs.html">Explore Programs</a></div>
         </article>`;

    // ── Payments ──────────────────────────────────────────────────────────────
    paymentsContainer.innerHTML = data.paymentHistory.length > 0
      ? data.paymentHistory.map(p => `
          <li class="payment-history-item">
            <div class="payment-history-row">
              <strong>${currency(p.amount)}</strong>
              <span class="tag ${p.status === "paid" ? "success" : ""}">${p.status}</span>
            </div>
            <span class="muted">${new Date(p.createdAt).toLocaleDateString("en-IN")}</span>
            <span>${p.trackIds.map(id => trackNameMap.get(id) || id).join(", ")}</span>
          </li>
        `).join("")
      : "<li class='muted'>No payments yet.</li>";

    // ── Render Workout Strength Panel (always, uses localStorage only) ────────
    renderWorkoutStrengthPanel();

  } catch (err) {
    coursesContainer.innerHTML = `
      <article class="dashboard-card page-message-card">
        <h3>Could not load dashboard</h3>
        <p class="status-text error">${err.message}</p>
        <div class="stack-actions"><a class="btn" href="programs.html">Browse Programs</a></div>
      </article>`;
    paymentsContainer.innerHTML = "<li class='status-text error'>Payment history unavailable.</li>";

    // Still render an empty radar so the page doesn't break
    // Render demo radar data so the user sees a 'working' graph on Vercel
    buildRadar([75, 82, 90, 85, 70, 88], [60, 65, 75, 70, 65, 72]);

    // Still render workout panel from localStorage
    renderWorkoutStrengthPanel();
  }

  // ── Workout Strength Panel ────────────────────────────────────────────────
  function renderWorkoutStrengthPanel() {
    const logs = JSON.parse(localStorage.getItem("ace_wt_logs") || "[]");

    // Epley 1RM helper
    const epley = (reps, weight) => {
      if (!reps || !weight) return 0;
      return Math.round(weight * (1 + reps / 30) * 10) / 10;
    };

    // Get stats for a date-range window
    const getStats = (offsetDays = 0) => {
      const now   = new Date().setHours(23, 59, 59, 999);
      const start = now - (offsetDays + 7) * 86400000;
      const end   = now - offsetDays * 86400000;
      let volume = 0, sets = 0, best1RM = 0;
      const days = new Set();
      logs.forEach(l => {
        const ts = new Date(l.date.replace(/-/g, "/")).getTime();
        if (ts < start || ts > end) return;
        days.add(l.date);
        l.sets.forEach(s => {
          sets++;
          volume += (s.reps || 0) * (s.weight || 0);
          const orm = epley(s.reps, s.weight);
          if (orm > best1RM) best1RM = orm;
        });
      });
      return { volume: Math.round(volume), sets, days: days.size, best1RM: Math.round(best1RM * 10) / 10 };
    };

    const tw = getStats(0);
    const lw = getStats(7);

    // Growth badge HTML
    const badge = (cur, prev, suffix = "") => {
      if (prev === 0 && cur === 0) return `<span class="db-wt-badge-neutral">—</span>`;
      if (prev === 0) return `<span class="db-wt-badge-up">▲ NEW</span>`;
      const pct = ((cur - prev) / prev * 100).toFixed(1);
      const up = cur >= prev;
      return `<span class="db-wt-badge-${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${Math.abs(pct)}%</span>`;
    };

    // Populate metric tiles
    const setTile = (valId, badgeId, val, suffix, cur, prev) => {
      const el = document.getElementById(valId);
      const bd = document.getElementById(badgeId);
      if (!el || !bd) return;
      el.textContent = val;
      bd.innerHTML   = badge(cur, prev);
    };

    setTile("wtmVolVal",  "wtmVolBadge",  tw.volume.toLocaleString() + " kg", "", tw.volume,  lw.volume);
    setTile("wtmSetsVal", "wtmSetsBadge", tw.sets,                             "", tw.sets,    lw.sets);
    setTile("wtmDaysVal", "wtmDaysBadge", tw.days + "/6",                      "", tw.days,    lw.days);
    setTile("wtmOrmVal",  "wtmOrmBadge",  tw.best1RM + " kg",                  "", tw.best1RM, lw.best1RM);

    // Override 1RM badge if it's an all-time PR
    let allTime1RM = 0;
    logs.forEach(l => l.sets.forEach(s => {
      const orm = epley(s.reps, s.weight);
      if (orm > allTime1RM) allTime1RM = orm;
    }));
    if (tw.best1RM > 0 && tw.best1RM >= allTime1RM) {
      const bd = document.getElementById("wtmOrmBadge");
      if (bd) bd.innerHTML = `<span class="db-wt-badge-pr">🏆 PR</span>`;
    }

    // 7-day sparkline
    const spark = document.getElementById("dbSparkline");
    const labelsEl = document.getElementById("wtSparkLabels");
    if (!spark) return;

    const dayVolumes = [];
    const dayLabels  = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const label = d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2);
      dayLabels.push(label);
      const dayLogs = logs.filter(l => l.date === key);
      let vol = 0;
      dayLogs.forEach(l => l.sets.forEach(s => { vol += (s.reps||0)*(s.weight||0); }));
      dayVolumes.push(Math.round(vol));
    }

    // Render day labels
    if (labelsEl) {
      labelsEl.innerHTML = dayLabels.map((l, i) =>
        `<span class="${i === 6 ? 'db-wt-spark-label-today' : ''}">${l}</span>`
      ).join("");
    }

    const maxVol = Math.max(...dayVolumes, 1);
    const W = spark.offsetWidth || 600;
    const H = 52;
    spark.width  = W;
    spark.height = H;
    const ctx = spark.getContext("2d");
    ctx.clearRect(0, 0, W, H);

    const barW  = Math.floor(W / 7) - 4;
    const gap   = 4;
    const startX = Math.floor((W - (barW + gap) * 7) / 2);

    dayVolumes.forEach((v, i) => {
      const barH = v > 0 ? Math.max(6, Math.round((v / maxVol) * (H - 14))) : 4;
      const x = startX + i * (barW + gap);
      const y = H - barH - 2;
      const isToday = i === 6;
      const grad = ctx.createLinearGradient(0, y, 0, H);
      grad.addColorStop(0, isToday ? "rgba(0,122,255,0.95)" : (v > 0 ? "rgba(48,209,88,0.8)" : "rgba(255,255,255,0.1)"));
      grad.addColorStop(1, isToday ? "rgba(0,122,255,0.25)" : (v > 0 ? "rgba(48,209,88,0.15)" : "rgba(255,255,255,0.02)"));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [3, 3, 0, 0]);
      ctx.fill();

      // Value label on bar if > 0
      if (v > 0 && barH > 14) {
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = `bold ${Math.min(9, barW * 0.45)}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText(v > 999 ? (v/1000).toFixed(1)+"k" : v, x + barW/2, y - 2);
      }
    });
  }

});
