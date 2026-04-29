document.addEventListener("DOMContentLoaded", () => {
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const authStatus = document.getElementById("authStatus");

  if (!loginTab || !registerTab || !loginForm || !registerForm || !authStatus) {
    return;
  }

  if (isLoggedIn()) {
    window.location.href = "/dashboard";
    return;
  }

  const switchTab = (tab) => {
    const isLogin = tab === "login";
    loginTab.classList.toggle("active", isLogin);
    registerTab.classList.toggle("active", !isLogin);
    loginForm.classList.toggle("active", isLogin);
    registerForm.classList.toggle("active", !isLogin);
    setStatus(authStatus, "");
  };

  loginTab.addEventListener("click", () => switchTab("login"));
  registerTab.addEventListener("click", () => switchTab("register"));

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = loginForm.querySelector("button[type='submit']");
    setStatus(authStatus, "Signing you in...");
    setButtonBusy(submitButton, true, "Signing in...");
    const payload = Object.fromEntries(new FormData(loginForm).entries());

    try {
      const data = await api("/auth/login", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      saveAuth(data.token, data.user);
      if (await resumePendingPurchase()) {
        return;
      }
      clearPurchaseSelection();
      window.location.href = "/dashboard";
    } catch (error) {
      setStatus(authStatus, error.message, "error");
    } finally {
      setButtonBusy(submitButton, false);
    }
  });

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = registerForm.querySelector("button[type='submit']");
    setStatus(authStatus, "Creating your account...");
    setButtonBusy(submitButton, true, "Creating...");
    const payload = Object.fromEntries(new FormData(registerForm).entries());

    try {
      const data = await api("/auth/register", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      saveAuth(data.token, data.user);
      if (await resumePendingPurchase()) {
        return;
      }
      clearPurchaseSelection();
      window.location.href = "/dashboard";
    } catch (error) {
      setStatus(authStatus, error.message, "error");
    } finally {
      setButtonBusy(submitButton, false);
    }
  });
});
