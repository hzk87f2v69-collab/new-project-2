(function () {
  const accountsKey = "acefitness_accounts";
  const tokenKey = "acefitness_token";
  const userKey = "acefitness_user";

  const $ = selector => document.querySelector(selector);
  const loginTab = $("#loginTab");
  const registerTab = $("#registerTab");
  const loginForm = $("#loginForm");
  const registerForm = $("#registerForm");
  const status = $("#authStatus");

  const storage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        try {
          return sessionStorage.getItem(key);
        } catch (sessionError) {
          return null;
        }
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        try {
          sessionStorage.setItem(key, value);
          return true;
        } catch (sessionError) {
          return false;
        }
      }
    }
  };

  const readAccounts = () => {
    try {
      return JSON.parse(storage.get(accountsKey) || "[]");
    } catch (error) {
      return [];
    }
  };

  const writeAccounts = accounts => {
    storage.set(accountsKey, JSON.stringify(accounts));
  };

  const showStatus = (message, type = "") => {
    if (!status) return;
    status.className = `status-text ${type}`.trim();
    status.textContent = message || "";
    status.hidden = !message;
  };

  const setBusy = (button, busy, busyText) => {
    if (!button) return;
    if (!button.dataset.defaultText) {
      button.dataset.defaultText = button.textContent;
    }

    button.disabled = busy;
    button.textContent = busy ? busyText : button.dataset.defaultText;
  };

  const normalizeEmail = email => String(email || "").trim().toLowerCase();

  const createToken = () => `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  const saveLogin = account => {
    const user = {
      id: account.id,
      name: account.name,
      email: account.email,
      purchasedTracks: []
    };

    storage.set(tokenKey, createToken());
    storage.set(userKey, JSON.stringify(user));
  };

  const homeUrl = () => (window.location.protocol === "file:" ? "index.html?v=5" : "/");

  const goHome = () => {
    window.location.href = homeUrl();
  };

  const finishAuth = message => {
    showStatus(message, "success");
    window.setTimeout(goHome, 100);
    window.setTimeout(goHome, 650);
  };

  const switchTab = mode => {
    const isLogin = mode === "login";
    loginTab?.classList.toggle("active", isLogin);
    registerTab?.classList.toggle("active", !isLogin);
    loginForm?.classList.toggle("active", isLogin);
    registerForm?.classList.toggle("active", !isLogin);
    showStatus("");
  };

  const register = async (form) => {
    const button = form.querySelector("button[type='submit']");
    const data = Object.fromEntries(new FormData(form).entries());
    const name = String(data.name || "").trim();
    const email = normalizeEmail(data.email);
    const password = String(data.password || "");

    if (!name || !email || !password) {
      showStatus("Fill name, email, and password.", "error");
      return;
    }

    if (password.length < 6) {
      showStatus("Password must be at least 6 characters.", "error");
      return;
    }

    setBusy(button, true, "Creating Account...");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed.");
      }

      // Success!
      if (typeof saveAuth === "function") {
        saveAuth(result.token, result.user);
      } else {
        storage.set(tokenKey, result.token);
        storage.set(userKey, JSON.stringify(result.user));
      }
      finishAuth("Account created successfully!");
    } catch (error) {
      console.error("Registration error:", error);
      
      // Fallback for local development if server is not reachable
      if (error.message.includes("failed to fetch") || error.message.includes("NetworkError")) {
          showStatus("Server unreachable. Saving locally for now...", "warning");
          
          const accounts = readAccounts();
          if (accounts.some(account => account.email === email)) {
              showStatus("This email is already registered locally.", "error");
              setBusy(button, false);
              return;
          }

          const account = {
              id: `user_${Date.now()}`,
              name,
              email,
              password,
              createdAt: new Date().toISOString()
          };
          
          accounts.push(account);
          writeAccounts(accounts);
          saveLogin(account);
          finishAuth("Local account created.");
      } else {
          showStatus(error.message, "error");
          setBusy(button, false);
      }
    }
  };

  const login = async (form) => {
    const button = form.querySelector("button[type='submit']");
    const data = Object.fromEntries(new FormData(form).entries());
    const email = normalizeEmail(data.email);
    const password = String(data.password || "");

    if (!email || !password) {
      showStatus("Enter email and password.", "error");
      return;
    }

    setBusy(button, true, "Signing in...");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed.");
      }

      // Success!
      if (typeof saveAuth === "function") {
        saveAuth(result.token, result.user);
      } else {
        storage.set(tokenKey, result.token);
        storage.set(userKey, JSON.stringify(result.user));
      }
      finishAuth("Welcome back!");
    } catch (error) {
      console.error("Login error:", error);

      // Fallback to local accounts
      const account = readAccounts().find(item => item.email === email && item.password === password);
      if (account) {
          saveLogin(account);
          finishAuth("Logged in locally.");
      } else {
          showStatus(error.message || "Invalid credentials.", "error");
          setBusy(button, false);
      }
    }
  };

  const init = () => {
    if (!loginTab || !registerTab || !loginForm || !registerForm) return;

    loginTab.addEventListener("click", () => switchTab("login"));
    registerTab.addEventListener("click", () => switchTab("register"));

    loginForm.addEventListener("submit", event => {
      event.preventDefault();
      login(loginForm);
    });

    registerForm.addEventListener("submit", event => {
      event.preventDefault();
      register(registerForm);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
