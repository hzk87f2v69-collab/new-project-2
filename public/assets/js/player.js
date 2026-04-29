document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const trackId = params.get("track");
  const isPreview = params.get("preview") === "true";
  const title = document.getElementById("playerTitle");
  const subtitle = document.getElementById("playerSubtitle");
  const moduleList = document.getElementById("moduleList");
  const videoFrame = document.getElementById("videoFrame");
  const classTitle = document.getElementById("classTitle");
  const classNotes = document.getElementById("classNotes");
  const completeBtn = document.getElementById("completeBtn");
  const playerStatus = document.getElementById("playerStatus");
  const setEmptyState = (message) => {
    title.textContent = "Track unavailable";
    subtitle.textContent = message;
    moduleList.innerHTML = `
      <article class="module-card page-message-card">
        <p class="status-text error">${message}</p>
        <div class="stack-actions">
          <a class="btn" href="/programs">Browse Programs</a>
        </div>
      </article>
    `;
    videoFrame.src = "";
    classTitle.textContent = "Choose a class";
    classNotes.textContent = "Lesson notes will appear here.";
    completeBtn.disabled = true;
  };

  if (!trackId) {
    setEmptyState("Choose a program before opening the player.");
    return;
  }

  title.textContent = "Loading track...";
  subtitle.textContent = "Your weekly modules are loading.";
  moduleList.innerHTML = `
    <article class="module-card pricing-card-loading">
      <h3>Loading modules...</h3>
      <p class="muted">Please wait while we prepare your training weeks.</p>
    </article>
  `;

  let completedClasses = [];
  let activeTrack = null;
  let activeClass = null;
  const lessonMap = new Map();
  const lessonButtons = new Map();

  const updateLessonButtons = () => {
    lessonButtons.forEach((button, lessonId) => {
      const isActive = activeClass?.classId === lessonId;
      const isComplete = completedClasses.includes(lessonId);
      button.classList.toggle("active", isActive);
      button.classList.toggle("completed", isComplete);
      button.querySelector("[data-lesson-cta]").textContent = isComplete ? "Completed" : isActive ? "Now playing" : "Play class";
    });
  };

  try {
    if (!isPreview && !ensureAuth()) return;

    if (!isPreview) {
      const dashboardData = await api("/user/enrollments", {
        headers: getHeaders(false)
      });

      const allowed = dashboardData.purchasedTracks.includes(trackId);
      completedClasses = dashboardData.completedClasses || [];

      if (!allowed) {
        window.location.href = "/programs";
        return;
      }
    }

    const data = await api(`/tracks/${trackId}/classes`);
    activeTrack = data.track;

    if (!activeTrack?.weeks?.length) {
      setEmptyState("This track does not have playable lessons yet.");
      return;
    }

    title.textContent = activeTrack.name;
    subtitle.textContent = activeTrack.target;

    const allClasses = activeTrack.weeks.flatMap((week) => week.classes);
    activeClass = allClasses[0];

    const renderLesson = (lesson) => {
      activeClass = lesson;
      videoFrame.src = lesson.videoUrl;
      classTitle.textContent = lesson.title;
      classNotes.textContent = lesson.notes;
      completeBtn.dataset.classId = lesson.classId;
      completeBtn.disabled = isPreview || completedClasses.includes(lesson.classId);
      completeBtn.textContent = isPreview
        ? "Preview Mode"
        : completedClasses.includes(lesson.classId)
          ? "Completed"
          : "Mark Complete";
      updateLessonButtons();
    };

    moduleList.innerHTML = activeTrack.weeks
      .map(
        (week) => `
          <article class="module-card">
            <h3>Week ${week.weekNumber}: ${week.title}</h3>
            <ul>
              ${week.classes
                .map(
                  (lesson) => `
                    <li>
                      <button class="module-trigger" type="button" data-lesson-id="${lesson.classId}">
                        <span class="module-trigger-head">
                          <strong>${lesson.title}</strong>
                          <span class="helper">${lesson.duration}</span>
                        </span>
                        <span class="module-trigger-meta">
                          <span data-lesson-cta>${completedClasses.includes(lesson.classId) ? "Completed" : "Play class"}</span>
                        </span>
                      </button>
                    </li>
                  `
                )
                .join("")}
            </ul>
          </article>
        `
      )
      .join("");

    activeTrack.weeks.forEach((week) => {
      week.classes.forEach((lesson) => {
        lessonMap.set(lesson.classId, lesson);
      });
    });

    document.querySelectorAll("[data-lesson-id]").forEach((button) => {
      lessonButtons.set(button.dataset.lessonId, button);
      button.addEventListener("click", () => {
        renderLesson(lessonMap.get(button.dataset.lessonId));
      });
    });

    renderLesson(activeClass);

    completeBtn.addEventListener("click", async () => {
      try {
        const response = await api("/user/complete-class", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            trackId,
            classId: completeBtn.dataset.classId
          })
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
