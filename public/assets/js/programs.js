document.addEventListener("DOMContentLoaded", async () => {
  const programGrid = document.getElementById("programGrid");
  const bundleGrid = document.getElementById("bundleGrid");
  let selectedDuoTracks = [];

  const renderLoadingState = () => {
    if (programGrid) {
      programGrid.innerHTML = Array.from({ length: 4 }, () => `
        <article class="course-card pricing-card-loading">
          <div class="eyebrow">Loading</div>
          <h3>Loading track...</h3>
          <p class="muted">Please wait while we fetch the full program details.</p>
        </article>
      `).join("");
    }

    if (bundleGrid) {
      bundleGrid.innerHTML = `
        <article class="pricing-card pricing-card-loading">
          <div class="eyebrow">Loading</div>
          <h3>Loading bundles...</h3>
          <p class="muted">Bundle options will appear here in a moment.</p>
        </article>
      `;
    }
  };

  const renderBundles = (bundles, tracks) => {
    bundleGrid.innerHTML = bundles
      .map((bundle) => {
        const trackOptions = tracks
          .map(
            (track) => `
              <label class="bundle-option" data-duo-option="${track.trackId}">
                <input type="checkbox" value="${track.trackId}" data-duo-track="${bundle.bundleId === "duo"}" />
                ${track.name}
              </label>
            `
          )
          .join("");

        return `
          <article class="pricing-card" id="bundle-${bundle.bundleId}">
            <div class="eyebrow">Bundle</div>
            <h3>${bundle.name}</h3>
            <p>${bundle.description}</p>
            <div class="price">${currency(bundle.price)}</div>
            <p class="muted">Save ${currency(bundle.savings)} and accelerate your transformation.</p>
            ${bundle.bundleId === "duo" ? `<div class="pill-list">${trackOptions}</div>` : ""}
            <p class="status-text" data-bundle-status="${bundle.bundleId}"></p>
            <div class="stack-actions">
              <button class="btn" data-bundle-id="${bundle.bundleId}">Choose Payment</button>
            </div>
          </article>
        `;
      })
      .join("");

    document.querySelectorAll("[data-duo-track='true']").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        selectedDuoTracks = Array.from(document.querySelectorAll("[data-duo-track='true']:checked")).map(
          (item) => item.value
        );

        document.querySelectorAll("[data-duo-option]").forEach((label) => {
          const input = label.querySelector("input");
          label.classList.toggle("selected", input.checked);
        });

        const duoStatus = document.querySelector("[data-bundle-status='duo']");
        if (duoStatus) {
          const remaining = 2 - selectedDuoTracks.length;
          if (remaining > 0) {
            setStatus(duoStatus, `Choose ${remaining} more track${remaining === 1 ? "" : "s"} for the duo bundle.`);
          } else if (selectedDuoTracks.length === 2) {
            setStatus(duoStatus, "Perfect. Your duo bundle is ready for checkout.", "success");
          } else {
            setStatus(duoStatus, "Choose exactly 2 tracks for the duo bundle.", "error");
          }
        }
      });
    });

    document.querySelectorAll("[data-bundle-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const bundleId = button.dataset.bundleId;
        const statusNode = document.querySelector(`[data-bundle-status='${bundleId}']`);

        try {
          const selection = buildBundlePurchaseSelection(bundleId, selectedDuoTracks);
          setStatus(statusNode, "");
          beginCheckout(selection);
        } catch (error) {
          setStatus(statusNode, error.message, "error");
        }
      });
    });
  };

  try {
    renderLoadingState();
    const { tracks, bundles } = await fetchTracks();

    programGrid.innerHTML = tracks
      .map(
        (track) => `
          <article class="course-card">
            <div class="eyebrow">${track.icon} Track</div>
            <h3>${track.name}</h3>
            <p>${track.description}</p>
            <div class="course-meta">
              <span>${track.durationWeeks} weeks</span>
              <span>${track.classesCount} classes</span>
              <span>${currency(track.price)}</span>
            </div>
            <ul class="benefits-list">
              ${track.benefits.map((benefit) => `<li>${benefit}</li>`).join("")}
            </ul>
            <div class="stack-actions">
              <button class="btn" data-track-buy="${track.trackId}">Choose Payment</button>
              <button class="btn-outline" data-track-preview="${track.trackId}">Preview Modules</button>
            </div>
          </article>
        `
      )
      .join("");

    renderBundles(bundles, tracks);

    document.querySelectorAll("[data-track-buy]").forEach((button) => {
      button.addEventListener("click", () => {
        try {
          beginCheckout(buildTrackPurchaseSelection(button.dataset.trackBuy));
        } catch (error) {
          showGlobalNotice(error.message, "error");
        }
      });
    });

    document.querySelectorAll("[data-track-preview]").forEach((button) => {
      button.addEventListener("click", () => {
        const trackId = button.dataset.trackPreview;
        window.location.href = `/player?track=${trackId}&preview=true`;
      });
    });
  } catch (error) {
    programGrid.innerHTML = `
      <article class="course-card page-message-card">
        <h3>Programs could not load</h3>
        <p class="status-text error">${error.message}</p>
      </article>
    `;
    bundleGrid.innerHTML = "";
  }
});
