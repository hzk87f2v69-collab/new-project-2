document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const trackId = params.get("track");
  const isPreview = params.get("preview") === "true";

  const playerTitle  = document.getElementById("playerTitle");
  const moduleList   = document.getElementById("moduleList");
  const videoFrame   = document.getElementById("videoFrame");
  const videoWrap    = document.getElementById("videoWrap");
  const classTitle   = document.getElementById("classTitle");
  const classNotes   = document.getElementById("classNotes");
  const completeBtn  = document.getElementById("completeBtn");
  const playerStatus = document.getElementById("playerStatus");
  const fullscreenBtn = document.getElementById("fullscreenBtn");

  // ── Measure real navbar height and apply to shell ─────────────────────────
  const applyShellHeight = () => {
    const header = document.getElementById("siteHeader");
    const navH   = header ? header.offsetHeight : 64;
    document.documentElement.style.setProperty("--nav-h", navH + "px");
  };
  applyShellHeight();
  window.addEventListener("resize", applyShellHeight);

  // ── Fullscreen ──────────────────────────────────────────────────────────────
  fullscreenBtn.addEventListener("click", () => {
    const el = videoWrap;
    if (!document.fullscreenElement) {
      (el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen).call(el);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen).call(document);
    }
  });

  document.addEventListener("fullscreenchange", () => {
    fullscreenBtn.classList.toggle("is-fullscreen", Boolean(document.fullscreenElement));
  });

  // ── Empty / error state ─────────────────────────────────────────────────────
  const setEmptyState = (message) => {
    if (playerTitle) playerTitle.textContent = "Track unavailable";
    moduleList.innerHTML = `
      <article class="pv-module-card pv-msg-card">
        <p class="status-text error">${message}</p>
        <div class="stack-actions" style="margin-top:1rem;">
          <a class="btn" href="programs.html">Browse Programs</a>
        </div>
      </article>
    `;
    videoFrame.src = "";
    classTitle.textContent = "Track unavailable";
    classNotes.textContent = message;
    completeBtn.disabled = true;
  };

  if (!trackId) {
    setEmptyState("Choose a program before opening the player.");
    return;
  }

  if (playerTitle) playerTitle.textContent = "Loading track...";
  moduleList.innerHTML = `
    <article class="pv-module-card">
      <p class="muted">Loading modules…</p>
    </article>
  `;

  let completedClasses = [];
  let activeTrack = null;
  let activeClass = null;
  const lessonMap     = new Map();
  const lessonButtons = new Map();

  // ── Highlight active lesson in sidebar ──────────────────────────────────────
  const updateLessonButtons = () => {
    lessonButtons.forEach((btn, lessonId) => {
      const isActive   = activeClass?.classId === lessonId;
      const isComplete = completedClasses.includes(lessonId);
      btn.classList.toggle("pv-trigger-active",    isActive);
      btn.classList.toggle("pv-trigger-completed", isComplete);
      btn.querySelector("[data-lesson-cta]").textContent =
        isComplete ? "✓ Completed" : isActive ? "▶ Now playing" : "Play class";
    });
  };

  try {
    if (!isPreview && !ensureAuth()) return;

    if (!isPreview) {
      const dashboardData = await api("/user/enrollments", { headers: getHeaders(false) });
      const enrollment    = dashboardData.enrollments.find((e) => e.trackId === trackId);
      completedClasses    = enrollment?.completedClasses || [];
      if (!enrollment) { window.location.replace(window.location.protocol === "file:" ? "programs.html" : "/programs"); return; }
    }

    const data  = await api(`/tracks/${trackId}/classes`);
    activeTrack = data.track;

    if (!activeTrack?.weeks?.length) {
      setEmptyState("This track does not have playable lessons yet.");
      return;
    }

    if (playerTitle) playerTitle.textContent = activeTrack.name;

    const allClasses   = activeTrack.weeks.flatMap((w) => w.classes);
    const savedId      = localStorage.getItem(`ace_last_lesson_${trackId}`);
    activeClass        = allClasses.find((l) => l.classId === savedId) || allClasses[0];

    // ── Render a lesson ────────────────────────────────────────────────────────
    const renderLesson = (lesson) => {
      activeClass = lesson;
      localStorage.setItem(`ace_last_lesson_${trackId}`, lesson.classId);

      // On mobile: scroll up so player is visible
      if (window.innerWidth <= 768) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      videoFrame.src = "https://www.youtube.com/embed/t6_m-utp9_k?autoplay=1&rel=0&modestbranding=1&playsinline=1&controls=0";
      classTitle.textContent  = lesson.title;
      classNotes.textContent  = lesson.notes;
      completeBtn.dataset.classId = lesson.classId;
      completeBtn.disabled    = isPreview || completedClasses.includes(lesson.classId);
      completeBtn.textContent = isPreview
        ? "Preview Mode"
        : completedClasses.includes(lesson.classId) ? "Completed" : "Mark Complete";
      updateLessonButtons();
    };

    // ── Build sidebar HTML ─────────────────────────────────────────────────────
    moduleList.innerHTML = activeTrack.weeks.map((week) => `
      <div class="pv-week">
        <p class="pv-week-label">Week ${week.weekNumber}: ${week.title}</p>
        <div class="pv-week-lessons">
          ${week.classes.map((lesson) => `
            <button class="pv-trigger" type="button" data-lesson-id="${lesson.classId}">
              <span class="pv-trigger-left">
                <span class="pv-trigger-dot"></span>
                <span class="pv-trigger-info">
                  <strong>${lesson.title}</strong>
                  <span class="pv-trigger-dur">${lesson.duration}</span>
                </span>
              </span>
              <span class="pv-trigger-cta" data-lesson-cta>
                ${completedClasses.includes(lesson.classId) ? "✓ Completed" : "Play class"}
              </span>
            </button>
          `).join("")}
        </div>
      </div>
    `).join("");

    // Register buttons
    activeTrack.weeks.forEach((week) =>
      week.classes.forEach((lesson) => lessonMap.set(lesson.classId, lesson))
    );

    document.querySelectorAll("[data-lesson-id]").forEach((btn) => {
      lessonButtons.set(btn.dataset.lessonId, btn);
      btn.addEventListener("click", () => renderLesson(lessonMap.get(btn.dataset.lessonId)));
    });

    renderLesson(activeClass);

    // ── Mark complete ──────────────────────────────────────────────────────────
    completeBtn.addEventListener("click", async () => {
      try {
        const response = await api("/user/complete-class", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ trackId, classId: completeBtn.dataset.classId })
        });
        completedClasses = response.completedClasses;
        renderLesson(activeClass);
        setStatus(playerStatus, `Progress updated to ${response.progress}%.`, "success");
      } catch (error) {
        setStatus(playerStatus, error.message, "error");
      }
    });

  } catch (error) {
    setEmptyState(error.message);
  }
});
