document.addEventListener("DOMContentLoaded", async () => {
  if (!ensureAuth()) return;

  const params = new URLSearchParams(window.location.search);
  const unlockedTrackIds = [...new Set((params.get("tracks") || "").split(",").filter(Boolean))];
  const unlockedTrackSet = new Set(unlockedTrackIds);
  const source = params.get("source");

  const eyebrow = document.getElementById("myCoursesEyebrow");
  const title = document.getElementById("myCoursesTitle");
  const subtitle = document.getElementById("myCoursesSubtitle");
  const status = document.getElementById("myCoursesStatus");
  const coursesContainer = document.getElementById("ownedCoursesContainer");
  const logoutBtn = document.getElementById("logoutBtn");
  const metrics = {
    courses: document.getElementById("ownedCoursesCount"),
    progress: document.getElementById("ownedCoursesProgress"),
    classes: document.getElementById("ownedCoursesClasses"),
    unlocked: document.getElementById("ownedCoursesUnlocked")
  };

  if (!eyebrow || !title || !subtitle || !status || !coursesContainer) {
    return;
  }

  coursesContainer.innerHTML = `
    <article class="dashboard-card page-message-card">
      <h3>Loading your courses...</h3>
      <p class="muted">Your access, lessons, and progress are on the way.</p>
    </article>
  `;

  logoutBtn?.addEventListener("click", () => {
    clearAuth();
    window.location.href = window.location.protocol === "file:" ? "index.html" : "/";
  });

  try {
    const data = await api("/user/enrollments", {
      headers: getHeaders(false)
    });

    const enrollments = [...data.enrollments].sort((left, right) => {
      const leftPriority = unlockedTrackSet.has(left.trackId) ? 1 : 0;
      const rightPriority = unlockedTrackSet.has(right.trackId) ? 1 : 0;
      return rightPriority - leftPriority;
    });

    const totalCompletedClasses = enrollments.reduce((sum, item) => sum + item.completedClasses.length, 0);
    const averageProgress =
      enrollments.length > 0
        ? Math.round(enrollments.reduce((sum, item) => sum + item.progress, 0) / enrollments.length)
        : 0;

    metrics.courses.textContent = String(enrollments.length);
    metrics.progress.textContent = `${averageProgress}%`;
    metrics.classes.textContent = String(totalCompletedClasses);
    metrics.unlocked.textContent = String(unlockedTrackIds.length);

    if ((source === "payment" || source === "unlock") && unlockedTrackIds.length > 0) {
      eyebrow.textContent = "Access Granted";
      title.textContent =
        unlockedTrackIds.length === 1 ? "Your course is unlocked and ready." : "Your courses are unlocked and ready.";
      subtitle.textContent =
        unlockedTrackIds.length === 1
          ? "You now have access to your new program. Start the first class or continue from your library anytime."
          : "Your bundle is live. Start any newly unlocked course below and track each course separately.";
      status.textContent =
        unlockedTrackIds.length === 1
          ? "Your newly unlocked course is pinned first so you can jump in right away."
          : "Your newly unlocked courses are pinned first so you can jump in right away.";
    } else {
      eyebrow.textContent = "My Courses";
      title.textContent = enrollments.length > 0 ? "All your unlocked courses in one place." : "You do not own any courses yet.";
      subtitle.textContent =
        enrollments.length > 0
          ? "Start lessons, continue progress, and keep every course organized from one page."
          : "Once you unlock a course, your purchased courses will appear here automatically.";
      status.textContent =
        enrollments.length > 0
          ? "Use each course card to start lessons or continue where you left off."
          : "Explore the programs page to unlock your first course.";
    }

    coursesContainer.innerHTML =
      enrollments.length > 0
        ? enrollments
            .map((track) => {
              const isNewlyUnlocked = unlockedTrackSet.has(track.trackId);
              const actionLabel = track.progress > 0 ? "Continue Course" : "Start Course";
              const stateLabel =
                track.progress === 100 ? "Completed" : track.progress > 0 ? "In Progress" : "Ready to Start";

              return `
                <article class="dashboard-card owned-course-card ${isNewlyUnlocked ? "course-highlight" : ""}">
                  <div class="owned-course-top">
                    <div>
                      <h3>${track.name}</h3>
                      <p>${track.target}</p>
                    </div>
                    <span class="tag ${isNewlyUnlocked ? "success" : ""}">${isNewlyUnlocked ? "Newly unlocked" : stateLabel}</span>
                  </div>
                  <div class="course-meta">
                    <span>${track.durationWeeks} weeks</span>
                    <span>${track.completedClasses.length}/${track.totalClasses} classes done</span>
                    <span>${track.progress}% complete</span>
                  </div>
                  <div class="progress-bar"><span style="width:${track.progress}%"></span></div>
                  <div class="stack-actions">
                    <a class="btn" href="player.html?track=${track.trackId}">${actionLabel}</a>
                    <a class="btn-outline" href="dashboard.html">View Dashboard</a>
                  </div>
                </article>
              `;
            })
            .join("")
        : `
          <article class="dashboard-card page-message-card">
            <h3>No courses unlocked yet</h3>
            <p>You are one unlock away from structured coaching, premium programs, and measurable progress.</p>
            <div class="stack-actions">
              <a class="btn" href="programs.html">Explore Programs</a>
            </div>
          </article>
        `;
  } catch (error) {
    eyebrow.textContent = "Course Access";
    title.textContent = "We could not load your course library.";
    subtitle.textContent = "Please try again in a moment.";
    setStatus(status, error.message, "error");
    coursesContainer.innerHTML = `
      <article class="dashboard-card page-message-card">
        <h3>Your courses are unavailable right now</h3>
        <p class="status-text error">${error.message}</p>
        <div class="stack-actions">
          <a class="btn" href="dashboard.html">Open Dashboard</a>
          <a class="btn-outline" href="programs.html">Browse Programs</a>
        </div>
      </article>
    `;
  }
});
