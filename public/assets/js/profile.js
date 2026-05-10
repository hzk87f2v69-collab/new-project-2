document.addEventListener("DOMContentLoaded", async () => {
  if (!ensureAuth()) return;

  const form = document.getElementById("profileForm");
  const status = document.getElementById("profileStatus");
  const logoutBtn = document.getElementById("logoutBtn") || document.getElementById("logoutBtnRef");
  
  const displayFields = {
    userName: document.getElementById("displayUserName"),
    streak: document.getElementById("displayStreak"),
    benchPR: document.getElementById("displayBenchPR"),
    benchPRLabel: document.getElementById("displayBenchPRLabel"),
    deadliftPR: document.getElementById("displayDeadliftPR"),
    deadliftPRLabel: document.getElementById("displayDeadliftPRLabel"),
    bmi: document.getElementById("displayBMI"),
    recovery: document.getElementById("displayRecovery"),
    bio: document.getElementById("displayBio")
  };

  const editProfileBtn = document.getElementById("editProfileBtn");
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const inputUserName = document.getElementById("inputUserName");
  const inputBio = document.getElementById("inputBio");

  const avatarImg = document.getElementById("profileAvatar");
  const avatarUpload = document.getElementById("avatarUpload");
  const avatarEditBtn = document.getElementById("avatarEditBtn");
  
  let currentAvatarBase64 = "";

  const fields = {
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
    benchPRLabel: "Bench PR",
    deadliftPR: "0",
    deadliftPRLabel: "Deadlift PR",
    bio: ""
  };

  // ── Edit Profile Toggle ────────────────────────────────────
  editProfileBtn?.addEventListener("click", () => {
    const isEditing = editProfileBtn.textContent === "Cancel";
    
    if (!isEditing) {
      displayFields.userName.hidden = true;
      displayFields.bio.hidden = true;
      inputUserName.hidden = false;
      inputBio.hidden = false;
      
      inputUserName.value = displayFields.userName.textContent;
      inputBio.value = displayFields.bio.textContent;
      
      editProfileBtn.textContent = "Cancel";
      saveProfileBtn.hidden = false;
    } else {
      displayFields.userName.hidden = false;
      displayFields.bio.hidden = false;
      inputUserName.hidden = true;
      inputBio.hidden = true;
      
      editProfileBtn.textContent = "Edit Profile";
      saveProfileBtn.hidden = true;
    }
  });

  // ── PR Inline Editing ──────────────────────────────────────
  const setupPREditing = (type) => {
    const display = document.getElementById(`display${type}PRLabel`);
    const input = document.getElementById(`input${type}PRLabel`);
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
        fields[type === "Bench" ? "benchPRLabel" : "deadliftPRLabel"] = input.value.trim();
      }
    });

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") input.blur();
    });
  };

  setupPREditing("Bench");
  setupPREditing("Deadlift");

  const heatmapGrid = document.getElementById("consistencyHeatmap");

  if (!form) {
    console.error("Profile form not found!");
    return;
  }

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
    for (let i = 0; i < 105; i++) {
      const cell = document.createElement("div");
      const level = Math.floor(Math.random() * 5);
      cell.className = `cell level-${level}`;
      heatmapGrid.appendChild(cell);
    }
  };

  const populateForm = (profile) => {
    if (displayFields.userName) displayFields.userName.textContent = profile.name || "Athlete";
    if (displayFields.bio) displayFields.bio.textContent = profile.bio || "Athlete | Pro Trainer | Gym Enthusiast";
    
    if (profile.avatar && avatarImg) {
      avatarImg.src = profile.avatar;
      currentAvatarBase64 = profile.avatar;
    }

    if (displayFields.benchPR) displayFields.benchPR.textContent = profile.benchPR || "0";
    if (displayFields.benchPRLabel) displayFields.benchPRLabel.textContent = profile.benchPRLabel || "Bench PR";
    if (displayFields.deadliftPR) displayFields.deadliftPR.textContent = profile.deadliftPR || "0";
    if (displayFields.deadliftPRLabel) displayFields.deadliftPRLabel.textContent = profile.deadliftPRLabel || "Deadlift PR";
    
    fields.benchPR = profile.benchPR || "0";
    fields.benchPRLabel = profile.benchPRLabel || "Bench PR";
    fields.deadliftPR = profile.deadliftPR || "0";
    fields.deadliftPRLabel = profile.deadliftPRLabel || "Deadlift PR";
    fields.bio = profile.bio || "Athlete | Pro Trainer | Gym Enthusiast";
    
    if (fields.age) fields.age.value = profile.age ?? "";
    if (fields.phoneNumber) fields.phoneNumber.value = profile.phoneNumber || "";
    if (fields.heightCm) fields.heightCm.value = profile.heightCm ?? "";
    if (fields.weightKg) fields.weightKg.value = profile.weightKg ?? "";
    if (fields.bodyFat) fields.bodyFat.value = profile.bodyFat ?? "";
    if (fields.muscleMass) fields.muscleMass.value = profile.muscleMass ?? "";
    if (fields.healthNotes) fields.healthNotes.value = profile.healthNotes || "";
    if (fields.activityLevel) fields.activityLevel.value = profile.activityLevel || "Moderate";
    if (fields.dietType) fields.dietType.value = profile.dietType || "No restriction";

    if (profile.fitnessGoal) {
      const radio = document.querySelector(`input[name="fitnessGoal"][value="${profile.fitnessGoal}"]`);
      if (radio) radio.checked = true;
    }

    if (displayFields.bmi) {
        displayFields.bmi.textContent = calculateBMI(profile.weightKg, profile.heightCm);
    }

    generateHeatmap();
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

  const handleProfileSave = async () => {
    try {
      const selectedGoal = document.querySelector('input[name="fitnessGoal"]:checked')?.value || "";

      const payload = {
        name: !inputUserName.hidden ? inputUserName.value : displayFields.userName.textContent,
        avatar: currentAvatarBase64,
        bio: !inputBio.hidden ? inputBio.value : displayFields.bio.textContent,
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
        benchPRLabel: fields.benchPRLabel,
        deadliftPR: fields.deadliftPR,
        deadliftPRLabel: fields.deadliftPRLabel
      };

      if (saveProfileBtn) setButtonBusy(saveProfileBtn, true, "Syncing...");

      const data = await api("/user/profile", {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      setStatus(status, "Profile updated successfully!", "success");
      
      if (data.profile) {
        populateForm(data.profile);
        
        const storedUser = JSON.parse(localStorage.getItem("acefitness_user") || "{}");
        storedUser.name = data.profile.name;
        storedUser.avatar = data.profile.avatar;
        localStorage.setItem("acefitness_user", JSON.stringify(storedUser));
        state.user = storedUser;
      }
      
      displayFields.userName.hidden = false;
      displayFields.bio.hidden = false;
      inputUserName.hidden = true;
      inputBio.hidden = true;
      
      editProfileBtn.textContent = "Edit Profile";
      saveProfileBtn.hidden = true;
    } catch (error) {
      console.error("SAVE ERROR:", error);
      setStatus(status, error.message, "error");
    } finally {
      if (saveProfileBtn) setButtonBusy(saveProfileBtn, false, "Save Changes");
    }
  };

  saveProfileBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    handleProfileSave();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    handleProfileSave();
  });

  [fields.weightKg, fields.heightCm].forEach(el => {
    el?.addEventListener("input", () => {
      if (displayFields.bmi) {
        displayFields.bmi.textContent = calculateBMI(fields.weightKg.value, fields.heightCm.value);
      }
    });
  });
});
