document.addEventListener("DOMContentLoaded", async () => {
  if (!ensureAuth()) return;

  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const joinedDate = document.getElementById("joinedDate");
  const coursesContainer = document.getElementById("coursesContainer");
  const paymentsContainer = document.getElementById("paymentsContainer");
  const metrics = {
    tracks: document.getElementById("metricTracks"),
    progress: document.getElementById("metricProgress"),
    classes: document.getElementById("metricClasses"),
    payments: document.getElementById("metricPayments")
  };
  const logoutBtn = document.getElementById("logoutBtn");

  if (!profileName || !profileEmail || !joinedDate || !coursesContainer || !paymentsContainer) {
    return;
  }

  coursesContainer.innerHTML = `
    <article class="dashboard-card page-message-card">
      <h3>Loading your courses...</h3>
      <p class="muted">We’re pulling in your purchased programs and progress.</p>
    </article>
  `;
  paymentsContainer.innerHTML = "<li class='muted'>Loading payment history...</li>";

  logoutBtn?.addEventListener("click", () => {
    clearAuth();
    window.location.href = "/";
  });

  try {
    const data = await api("/user/enrollments", {
      headers: getHeaders(false)
    });

    await fetchTracks().catch(() => null);

    profileName.textContent = data.profile.name;
    profileEmail.textContent = data.profile.email;
    joinedDate.textContent = new Date(data.profile.joinedAt).toLocaleDateString("en-IN");
    metrics.tracks.textContent = data.enrollments.length;
    metrics.classes.textContent = data.completedClasses.length;
    metrics.payments.textContent = data.paymentHistory.length;

    const averageProgress =
      data.enrollments.length > 0
        ? Math.round(data.enrollments.reduce((sum, item) => sum + item.progress, 0) / data.enrollments.length)
        : 0;
    metrics.progress.textContent = `${averageProgress}%`;

    const trackNameMap = new Map(
      data.enrollments.map((track) => [track.trackId, track.name || state.tracks.find((item) => item.trackId === track.trackId)?.name || track.trackId])
    );

    coursesContainer.innerHTML =
      data.enrollments.length > 0
        ? data.enrollments
            .map(
              (track) => `
                <article class="dashboard-card">
                  <h3>${track.name}</h3>
                  <p>${track.target}</p>
                  <div class="course-meta">
                    <span>${track.durationWeeks} weeks</span>
                    <span>${track.completedClasses}/${track.totalClasses} classes done</span>
                  </div>
                  <div class="progress-bar"><span style="width:${track.progress}%"></span></div>
                  <p class="muted">${track.progress}% complete</p>
                  <div class="stack-actions">
                    <a class="btn" href="/player?track=${track.trackId}">Continue Learning</a>
                  </div>
                </article>
              `
            )
            .join("")
        : `
          <article class="dashboard-card page-message-card">
            <h3>No courses unlocked yet</h3>
            <p>You are one payment away from structured coaching, premium programs, and visible progress.</p>
            <div class="stack-actions">
              <a class="btn" href="/programs">Explore Programs</a>
            </div>
          </article>
        `;

    paymentsContainer.innerHTML =
      data.paymentHistory.length > 0
        ? data.paymentHistory
            .map(
              (payment) => `
                <li class="payment-history-item">
                  <div class="payment-history-row">
                    <strong>${currency(payment.amount)}</strong>
                    <span class="tag ${payment.status === "paid" ? "success" : ""}">${payment.status}</span>
                  </div>
                  <span class="muted">${new Date(payment.createdAt).toLocaleDateString("en-IN")}</span>
                  <span>${payment.trackIds.map((trackId) => trackNameMap.get(trackId) || trackId).join(", ")}</span>
                </li>
              `
            )
            .join("")
        : "<li class='muted'>No successful payments yet.</li>";
  } catch (error) {
    coursesContainer.innerHTML = `
      <article class="dashboard-card page-message-card">
        <h3>We could not load your dashboard</h3>
        <p class="status-text error">${error.message}</p>
        <div class="stack-actions">
          <a class="btn" href="/programs">Browse Programs</a>
        </div>
      </article>
    `;
    paymentsContainer.innerHTML = "<li class='status-text error'>Payment history is unavailable right now.</li>";
  }
});
