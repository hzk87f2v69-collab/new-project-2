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

  logoutBtn?.addEventListener("click", () => { clearAuth(); window.location.href = "/"; });

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
    const ctx = document.getElementById("radarChart").getContext("2d");
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
            backgroundColor: "rgba(32,199,255,0.15)",
            borderColor:     "rgba(32,199,255,0.9)",
            pointBackgroundColor: "rgba(32,199,255,1)",
            pointBorderColor:    "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor:     "rgba(32,199,255,1)",
            borderWidth: 2.5,
            pointRadius: 5,
          },
          {
            label: "Last Week",
            data:  lastWeek,
            backgroundColor: "rgba(168,85,247,0.1)",
            borderColor:     "rgba(168,85,247,0.6)",
            pointBackgroundColor: "rgba(168,85,247,0.8)",
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
              color: "rgba(159,178,203,0.55)",
              font: { size: 10 },
              backdropColor: "transparent",
            },
            grid: {
              color: "rgba(32,199,255,0.1)",
              circular: false,
            },
            angleLines: { color: "rgba(32,199,255,0.12)" },
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
            backgroundColor: "rgba(7,12,23,0.94)",
            borderColor: "rgba(32,199,255,0.25)",
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

    // Basic metrics
    const totalCompleted = data.enrollments.reduce((s, e) => s + e.completedClasses.length, 0);
    const totalClasses   = data.enrollments.reduce((s, e) => s + (e.totalClasses || 8), 0);
    const avgProgress    = data.enrollments.length > 0
      ? Math.round(data.enrollments.reduce((s, e) => s + e.progress, 0) / data.enrollments.length)
      : 0;
    const estHours       = Math.round(totalCompleted * 0.4); // ~24min avg per class

    countUp(metrics.tracks,   data.enrollments.length);
    countUp(metrics.classes,  totalCompleted);
    countUp(metrics.payments, data.paymentHistory.length);
    countUp(metrics.progress, avgProgress, "%");
    countUp(metricHours,      estHours);
    setRing(avgProgress);

    // ── Radar axis calculations ──────────────────────────────────────────────
    const courseCompletion = totalClasses > 0 ? Math.min(100, Math.round((totalCompleted / totalClasses) * 100)) : 0;
    const consistency      = Math.min(100, Math.round((Math.min(streakDays, 7) / 7) * 100));
    const workoutIntensity = Math.min(100, Math.round((totalCompleted / Math.max(totalClasses * 0.5, 1)) * 100));
    const discipline       = Math.min(100, Math.round((courseCompletion * 0.5 + consistency * 0.3 + workoutIntensity * 0.2)));
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
              <a class="btn" href="/player?track=${track.trackId}">Continue →</a>
            </div>
          </article>
        `).join("")
      : `<article class="dashboard-card page-message-card">
           <h3>No courses unlocked yet</h3>
           <p>One unlock away from structured coaching and visible results.</p>
           <div class="stack-actions"><a class="btn" href="/programs">Explore Programs</a></div>
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

  } catch (err) {
    coursesContainer.innerHTML = `
      <article class="dashboard-card page-message-card">
        <h3>Could not load dashboard</h3>
        <p class="status-text error">${err.message}</p>
        <div class="stack-actions"><a class="btn" href="/programs">Browse Programs</a></div>
      </article>`;
    paymentsContainer.innerHTML = "<li class='status-text error'>Payment history unavailable.</li>";

    // Still render an empty radar so the page doesn't break
    buildRadar([0,0,0,0,0,0], [0,0,0,0,0,0]);
  }
});
