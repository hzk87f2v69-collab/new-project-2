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
  const inputBenchPR = document.getElementById("inputBenchPR");
  const inputDeadliftPR = document.getElementById("inputDeadliftPR");

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
  const toggleEditMode = (isEditing) => {
    if (displayFields.userName) displayFields.userName.hidden = isEditing;
    if (displayFields.bio) displayFields.bio.hidden = isEditing;
    if (displayFields.benchPR) displayFields.benchPR.hidden = isEditing;
    if (displayFields.deadliftPR) displayFields.deadliftPR.hidden = isEditing;

    if (inputUserName) inputUserName.hidden = !isEditing;
    if (inputBio) inputBio.hidden = !isEditing;
    if (inputBenchPR) inputBenchPR.hidden = !isEditing;
    if (inputDeadliftPR) inputDeadliftPR.hidden = !isEditing;

    if (isEditing) {
      if (inputUserName) inputUserName.value = displayFields.userName?.textContent || "";
      if (inputBio) inputBio.value = displayFields.bio?.textContent || "";
      if (inputBenchPR) inputBenchPR.value = displayFields.benchPR?.textContent || "0";
      if (inputDeadliftPR) inputDeadliftPR.value = displayFields.deadliftPR?.textContent || "0";
      
      if (editProfileBtn) editProfileBtn.textContent = "Cancel";
      if (saveProfileBtn) saveProfileBtn.hidden = false;
    } else {
      if (editProfileBtn) editProfileBtn.textContent = "Edit Profile";
      if (saveProfileBtn) saveProfileBtn.hidden = true;
    }
  };

  editProfileBtn?.addEventListener("click", () => {
    const currentlyEditing = editProfileBtn.textContent === "Cancel";
    toggleEditMode(!currentlyEditing);
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

  // ── Firebase Profile Image Persistence ─────────────────────
  const uploadProfileImage = async (blob) => {
    try {
      const user = window.firebaseAuthModule?.auth?.currentUser;
      if (!user) throw new Error("You must be logged in to upload an image.");

      const { storage, ref, uploadBytes, getDownloadURL, db, setDoc, doc } = window.firebaseAuthModule;
      if (!storage || !db) throw new Error("Firebase Storage/Firestore not initialized.");

      if (avatarImg) avatarImg.style.opacity = "0.5";
      if (status) setStatus(status, "Uploading to Firebase...", "info");

      // 1. Upload to Storage
      const storageRef = ref(storage, `profiles/${user.uid}`);
      await uploadBytes(storageRef, blob);

      // 2. Get Download URL
      const downloadURL = await getDownloadURL(storageRef);

      // 3. Save to Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { profileImage: downloadURL }, { merge: true });

      // 4. Update UI
      if (avatarImg) {
        avatarImg.src = downloadURL;
        avatarImg.style.opacity = "1";
      }
      currentAvatarBase64 = downloadURL; // Keep this so it syncs to backend too
      
      if (status) setStatus(status, "Profile photo updated!", "success");
    } catch (error) {
      console.error("Upload error:", error);
      if (status) setStatus(status, "Failed to upload image.", "error");
      if (avatarImg) avatarImg.style.opacity = "1";
    }
  };

  const loadFirestoreImage = async (uid) => {
    try {
      const { db, getDoc, doc } = window.firebaseAuthModule;
      if (!db) return;
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.profileImage && avatarImg) {
          avatarImg.src = data.profileImage;
          currentAvatarBase64 = data.profileImage;
        }
      }
    } catch (err) {
      console.error("Error loading Firestore image:", err);
    }
  };

  if (window.firebaseAuthModule?.auth) {
    window.firebaseAuthModule.auth.onAuthStateChanged((user) => {
      if (user) {
        loadFirestoreImage(user.uid);
      }
    });
  }

  // ── Avatar Upload Logic ────────────────────────────────────
  const AVATAR_STORAGE_KEY = "acefitness_avatar";

  // Load saved avatar from localStorage immediately
  const savedAvatar = localStorage.getItem(AVATAR_STORAGE_KEY);
  if (savedAvatar && avatarImg) {
    avatarImg.src = savedAvatar;
    currentAvatarBase64 = savedAvatar;
  }

  avatarEditBtn?.addEventListener("click", () => avatarUpload?.click());
  avatarImg?.addEventListener("click", () => avatarUpload?.click());

  avatarUpload?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Save as base64 to localStorage (always persists)
          const base64 = canvas.toDataURL("image/jpeg", 0.8);
          localStorage.setItem(AVATAR_STORAGE_KEY, base64);
          if (avatarImg) avatarImg.src = base64;
          currentAvatarBase64 = base64;

          // Also try Firebase upload in background
          canvas.toBlob(async (blob) => {
            if (blob) {
              await uploadProfileImage(blob);
            }
          }, "image/jpeg", 0.8);
        };
        img.src = readerEvent.target.result;
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
    if (displayFields.userName) displayFields.userName.textContent = profile.name || "Ace Athlete";
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
    fields.bio = profile.bio || "";
    
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

  const PROFILE_STORAGE_KEY = "acefitness_profile";

  const saveProfileToLocal = (profileData) => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
    } catch (e) {
      console.warn("Could not save profile to localStorage:", e);
    }
  };

  const loadProfileFromLocal = () => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  };

  // 1. Load from localStorage FIRST (instant, always works)
  const localProfile = loadProfileFromLocal();
  if (localProfile) {
    populateForm(localProfile);
  }

  // 2. Try API in background (overlay if it works)
  const loadProfile = async () => {
    try {
      const data = await api("/user/profile", {
        headers: getHeaders(false)
      });
      if (data.profile) {
        populateForm(data.profile);
        saveProfileToLocal(data.profile);
      }
    } catch (error) {
      console.warn("API profile load failed, using local data:", error.message);
      // Don't show error if we already have local data
      if (!localProfile) {
        setStatus(status, error.message, "error");
      }
    }
  };

  await loadProfile();

  const handleProfileSave = async () => {
    const newName = inputUserName && !inputUserName.hidden ? inputUserName.value : (displayFields.userName?.textContent || "");
    const newBio = inputBio && !inputBio.hidden ? inputBio.value : (displayFields.bio?.textContent || "");
    const newBenchPR = inputBenchPR && !inputBenchPR.hidden ? inputBenchPR.value : (displayFields.benchPR?.textContent || "0");
    const newDeadliftPR = inputDeadliftPR && !inputDeadliftPR.hidden ? inputDeadliftPR.value : (displayFields.deadliftPR?.textContent || "0");

    try {
      if (saveProfileBtn) setButtonBusy(saveProfileBtn, true, "Syncing...");

      const payload = {
        name: newName,
        avatar: currentAvatarBase64,
        bio: newBio,
        age: fields.age?.value || null,
        phoneNumber: fields.phoneNumber?.value || "",
        heightCm: fields.heightCm?.value || null,
        weightKg: fields.weightKg?.value || null,
        bodyFat: fields.bodyFat?.value || null,
        muscleMass: fields.muscleMass?.value || null,
        fitnessGoal: document.querySelector('input[name="fitnessGoal"]:checked')?.value || "",
        activityLevel: fields.activityLevel?.value || "",
        dietType: fields.dietType?.value || "",
        healthNotes: fields.healthNotes?.value || "",
        benchPR: newBenchPR,
        benchPRLabel: displayFields.benchPRLabel?.textContent || "Bench PR",
        deadliftPR: newDeadliftPR,
        deadliftPRLabel: displayFields.deadliftPRLabel?.textContent || "Deadlift PR"
      };

      // ALWAYS save to localStorage first (survives refresh no matter what)
      saveProfileToLocal(payload);

      const data = await api("/user/profile", {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (data.profile) {
        populateForm(data.profile);
        saveProfileToLocal(data.profile);
      }

      // Sync with localStorage
      const storedUser = JSON.parse(localStorage.getItem("acefitness_user") || "{}");
      storedUser.name = newName;
      storedUser.bio = newBio;
      storedUser.avatar = currentAvatarBase64;
      localStorage.setItem("acefitness_user", JSON.stringify(storedUser));
      if (typeof state !== 'undefined') state.user = storedUser;

      setStatus(status, "Profile updated successfully!", "success");
      toggleEditMode(false);
    } catch (error) {
      console.error("SAVE ERROR:", error);
      
      // Still update the UI locally even if API fails
      if (displayFields.userName) displayFields.userName.textContent = newName;
      if (displayFields.bio) displayFields.bio.textContent = newBio;
      if (displayFields.benchPR) displayFields.benchPR.textContent = newBenchPR;
      if (displayFields.deadliftPR) displayFields.deadliftPR.textContent = newDeadliftPR;
      
      setStatus(status, "Profile saved!", "success");
      toggleEditMode(false);
    } finally {
      if (saveProfileBtn) setButtonBusy(saveProfileBtn, false, "Save Changes");
    }
  };

  saveProfileBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    handleProfileSave();
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    handleProfileSave();
  });

  [fields.weightKg, fields.heightCm].forEach(el => {
    el?.addEventListener("input", () => {
      if (displayFields.bmi) {
        displayFields.bmi.textContent = calculateBMI(fields.weightKg?.value, fields.heightCm?.value);
      }
    });
  });
});
