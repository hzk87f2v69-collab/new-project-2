document.addEventListener("DOMContentLoaded", async () => {
  if (!ensureAuth()) return;

  const form = document.getElementById("profileForm");
  const status = document.getElementById("profileStatus");
  const logoutBtn = document.getElementById("logoutBtn") || document.getElementById("logoutBtnRef");
  
  const displayFields = {
    userName: document.getElementById("displayUserName"),
    streak: document.getElementById("displayStreak"),
    benchPR: document.getElementById("displayBenchPR"),
    deadliftPR: document.getElementById("displayDeadliftPR"),
    bmi: document.getElementById("displayBMI"),
    recovery: document.getElementById("displayRecovery")
  };

  const avatarImg = document.getElementById("profileAvatar");
  const avatarUpload = document.getElementById("avatarUpload");
  const avatarEditBtn = document.getElementById("avatarEditBtn");
  
  let currentAvatarBase64 = "";

  const fields = {
    name: document.getElementById("profileName"),
    age: document.getElementById("profileAge"),
    phoneNumber: document.getElementById("profilePhoneNumber"),
    heightCm: document.getElementById("profileHeightCm"),
    weightKg: document.getElementById("profileWeightKg"),
    bodyFat: document.getElementById("profileBodyFat"),
    muscleMass: document.getElementById("profileMuscleMass"),
    healthNotes: document.getElementById("profileHealthNotes"),
    activityLevel: document.getElementById("profileActivity"),
    dietType: document.getElementById("profileDietType"),
    benchPR: "0",
    deadliftPR: "0"
  };

  // ── PR Inline Editing ──────────────────────────────────────
  const setupPREditing = (type) => {
    const display = document.getElementById(`display${type}PR`);
    const input = document.getElementById(`input${type}PR`);
    const container = display?.parentElement;

    if (!display || !input) return;

    container.addEventListener("click", () => {
      display.hidden = true;
      input.hidden = false;
      input.value = display.textContent;
      input.focus();
    });

    input.addEventListener("blur", () => {
      display.hidden = false;
      input.hidden = true;
      if (input.value.trim()) {
        display.textContent = input.value.trim();
        fields[type === "Bench" ? "benchPR" : "deadliftPR"] = input.value.trim();
      }
    });

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") input.blur();
    });
  };

  setupPREditing("Bench");
  setupPREditing("Deadlift");

  const heatmapGrid = document.getElementById("consistencyHeatmap");

  if (!form || !status) return;

  // ── Avatar Upload Logic ────────────────────────────────────
  avatarEditBtn?.addEventListener("click", () => avatarUpload?.click());
  avatarImg?.addEventListener("click", () => avatarUpload?.click());

  avatarUpload?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const base64 = readerEvent.target.result;
        currentAvatarBase64 = base64;
        if (avatarImg) avatarImg.src = base64;
      };
      reader.readAsDataURL(file);
    }
  });

  logoutBtn?.addEventListener("click", () => {
    if (typeof clearAuth === "function") clearAuth();
    window.location.href = window.location.protocol === "file:" ? "index.html" : "/";
  });

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return "0.0";
    const heightM = height / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(1);
    return bmi;
  };

  const generateHeatmap = () => {
    if (!heatmapGrid) return;
    heatmapGrid.innerHTML = "";
    // Generate 105 cells (7x15) to match the reference look more closely
    for (let i = 0; i < 105; i++) {
      const cell = document.createElement("div");
      const level = Math.floor(Math.random() * 5);
      cell.className = `cell level-${level}`;
      heatmapGrid.appendChild(cell);
    }
  };

  const populateForm = (profile) => {
    if (fields.name) fields.name.value = profile.name || "";
    if (displayFields.userName) displayFields.userName.textContent = profile.name || "Athlete";
    
    if (profile.avatar && avatarImg) {
      avatarImg.src = profile.avatar;
      currentAvatarBase64 = profile.avatar;
    }

    if (displayFields.benchPR) displayFields.benchPR.textContent = profile.benchPR || "0";
    if (displayFields.deadliftPR) displayFields.deadliftPR.textContent = profile.deadliftPR || "0";
    fields.benchPR = profile.benchPR || "0";
    fields.deadliftPR = profile.deadliftPR || "0";
    
    if (fields.age) fields.age.value = profile.age ?? "";
    if (fields.phoneNumber) fields.phoneNumber.value = profile.phoneNumber || "";
    if (fields.heightCm) fields.heightCm.value = profile.heightCm ?? "";
    if (fields.weightKg) fields.weightKg.value = profile.weightKg ?? "";
    if (fields.bodyFat) fields.bodyFat.value = profile.bodyFat ?? "";
    if (fields.muscleMass) fields.muscleMass.value = profile.muscleMass ?? "";
    if (fields.healthNotes) fields.healthNotes.value = profile.healthNotes || "";
    if (fields.activityLevel) fields.activityLevel.value = profile.activityLevel || "Moderate";
    if (fields.dietType) fields.dietType.value = profile.dietType || "No restriction";

    // Set fitness goal radio
    if (profile.fitnessGoal) {
      const radio = document.querySelector(`input[name="fitnessGoal"][value="${profile.fitnessGoal}"]`);
      if (radio) radio.checked = true;
    }

    // Update display metrics
    if (displayFields.bmi) {
        displayFields.bmi.textContent = calculateBMI(profile.weightKg, profile.heightCm);
    }

    // Generate dummy heatmap
    generateHeatmap();

    // Cache for AI
    localStorage.setItem("ace_profile", JSON.stringify({
      name: profile.name,
      fitnessGoal: profile.fitnessGoal,
      age: profile.age,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      activityLevel: profile.activityLevel,
      dietType: profile.dietType,
      healthNotes: profile.healthNotes
    }));
  };

  const loadProfile = async () => {
    try {
      const data = await api("/user/profile", {
        headers: getHeaders(false)
      });
      populateForm(data.profile);
    } catch (error) {
      setStatus(status, error.message, "error");
    }
  };

  await loadProfile();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector("button[type='submit']");
    const selectedGoal = document.querySelector('input[name="fitnessGoal"]:checked')?.value || "";

    const payload = {
      name: state.user?.name || "Athlete", // Use current name if field is not visible
      avatar: currentAvatarBase64,
      age: fields.age?.value || null,
      phoneNumber: fields.phoneNumber?.value || "",
      heightCm: fields.heightCm?.value || null,
      weightKg: fields.weightKg?.value || null,
      bodyFat: fields.bodyFat?.value || null,
      muscleMass: fields.muscleMass?.value || null,
      fitnessGoal: selectedGoal,
      activityLevel: fields.activityLevel?.value || "",
      dietType: fields.dietType?.value || "",
      healthNotes: fields.healthNotes?.value || "",
      benchPR: fields.benchPR,
      deadliftPR: fields.deadliftPR
    };

    setButtonBusy(submitButton, true, "Syncing Performance...");
    setStatus(status, "Syncing with athlete servers...");

    try {
      const data = await api("/user/profile", {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      populateForm(data.profile);

      if (state.user) {
        state.user.name = data.profile.name;
        localStorage.setItem("acefitness_user", JSON.stringify(state.user));
      }

      setStatus(status, "Performance profile updated successfully.", "success");
      
      // Auto recalculate BMI on screen
      if (displayFields.bmi) {
        displayFields.bmi.textContent = calculateBMI(payload.weightKg, payload.heightCm);
      }
      
    } catch (error) {
      setStatus(status, error.message, "error");
    } finally {
      setButtonBusy(submitButton, false);
    }
  });

  // Real-time BMI calculation
  [fields.weightKg, fields.heightCm].forEach(el => {
    el?.addEventListener("input", () => {
      if (displayFields.bmi) {
        displayFields.bmi.textContent = calculateBMI(fields.weightKg.value, fields.heightCm.value);
      }
    });
  });
});
