document.addEventListener("DOMContentLoaded", async () => {
  if (!ensureAuth()) return;

  const form = document.getElementById("profileForm");
  const status = document.getElementById("profileStatus");
  const logoutBtn = document.getElementById("logoutBtn");
  const fields = {
    name: document.getElementById("profileName"),
    email: document.getElementById("profileEmail"),
    phoneNumber: document.getElementById("profilePhoneNumber"),
    fitnessGoal: document.getElementById("profileFitnessGoal"),
    age: document.getElementById("profileAge"),
    heightCm: document.getElementById("profileHeightCm"),
    weightKg: document.getElementById("profileWeightKg"),
    healthNotes: document.getElementById("profileHealthNotes"),
    activityLevel: document.getElementById("profileActivity"),
    dietType: document.getElementById("profileDietType"),
    allergies: document.getElementById("profileAllergies"),
    joinedAt: document.getElementById("profileJoinedAt")
  };

  if (!form || !status || Object.values(fields).some((field) => !field)) {
    return;
  }

  logoutBtn?.addEventListener("click", () => {
    clearAuth();
    window.location.href = "/";
  });

  const populateForm = (profile) => {
    fields.name.value = profile.name || "";
    fields.email.value = profile.email || "";
    fields.phoneNumber.value = profile.phoneNumber || "";
    fields.fitnessGoal.value = profile.fitnessGoal || "";
    fields.age.value = profile.age ?? "";
    fields.heightCm.value = profile.heightCm ?? "";
    fields.weightKg.value = profile.weightKg ?? "";
    fields.healthNotes.value = profile.healthNotes || "";
    if (fields.activityLevel) fields.activityLevel.value = profile.activityLevel || "";
    if (fields.dietType)      fields.dietType.value      = profile.dietType      || "";
    if (fields.allergies)     fields.allergies.value     = profile.allergies     || "";
    fields.joinedAt.value = profile.joinedAt ? new Date(profile.joinedAt).toLocaleDateString("en-IN") : "";
    // Cache to localStorage so AI diet generator can read it
    localStorage.setItem("ace_profile", JSON.stringify({
      name: profile.name, fitnessGoal: profile.fitnessGoal,
      age: profile.age, heightCm: profile.heightCm, weightKg: profile.weightKg,
      activityLevel: profile.activityLevel, dietType: profile.dietType,
      allergies: profile.allergies, healthNotes: profile.healthNotes
    }));
  };

  const loadProfile = async () => {
    const data = await api("/user/profile", {
      headers: getHeaders(false)
    });

    populateForm(data.profile);
  };

  try {
    await loadProfile();
  } catch (error) {
    setStatus(status, error.message, "error");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector("button[type='submit']");
    const payload = {
      name: fields.name.value.trim(),
      phoneNumber: fields.phoneNumber.value.trim(),
      fitnessGoal: fields.fitnessGoal.value,
      age: fields.age.value,
      heightCm: fields.heightCm.value,
      weightKg: fields.weightKg.value,
      healthNotes: fields.healthNotes.value.trim(),
      activityLevel: fields.activityLevel?.value || "",
      dietType:      fields.dietType?.value      || "",
      allergies:     fields.allergies?.value.trim() || ""
    };

    setButtonBusy(submitButton, true, "Saving...");
    setStatus(status, "Saving your profile...");

    try {
      const data = await api("/user/profile", {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      populateForm(data.profile);

      if (state.user) {
        state.user.name = data.profile.name;
        state.user.email = data.profile.email;
        localStorage.setItem("acefitness_user", JSON.stringify(state.user));
      }

      setStatus(status, data.message || "Profile updated successfully.", "success");
    } catch (error) {
      setStatus(status, error.message, "error");
    } finally {
      setButtonBusy(submitButton, false);
    }
  });
});
