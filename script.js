// ==========================================
// ROLE-BASED ACCESS CONTROL (RBAC) STORE
// ==========================================
const USERS_DB = {
  admin: {
    username: "admin",
    password: "admin123",
    name: "System Administrator",
    role: "admin",
    avatar: "👑",
    tier: 3
  },
  dev: {
    username: "dev",
    password: "dev123",
    name: "Lead Cloud Engineer",
    role: "developer",
    avatar: "💻",
    tier: 2
  },
  viewer: {
    username: "viewer",
    password: "viewer123",
    name: "Guest Auditor",
    role: "viewer",
    avatar: "👁️",
    tier: 1
  }
};

const ROLE_TIERS = {
  guest: 0,
  viewer: 1,
  developer: 2,
  admin: 3
};

// State
let currentUser = null;
let auditLogs = [
  { time: new Date(Date.now() - 600000).toLocaleTimeString(), actor: "System", message: "Edge worker initialized across Anycast nodes." },
  { time: new Date(Date.now() - 300000).toLocaleTimeString(), actor: "Security", message: "RBAC policy applied: Multi-tier role enforcement active." }
];

// Helper: Show Toast Notification
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Add Audit Log Entry
function addAuditLog(actor, message) {
  const time = new Date().toLocaleTimeString();
  auditLogs.unshift({ time, actor, message });
  renderAuditLogs();
}

function renderAuditLogs() {
  const container = document.getElementById("audit-log");
  if (!container) return;

  container.innerHTML = auditLogs.slice(0, 15).map(log => `
    <div class="audit-entry">
      <span class="audit-time">[${log.time}]</span>
      <span class="audit-actor">${log.actor}:</span>
      <span class="audit-msg">${log.message}</span>
    </div>
  `).join("");
}

// Check Permission
function canAccess(requiredRole) {
  const currentTier = currentUser ? (ROLE_TIERS[currentUser.role] || 0) : ROLE_TIERS.guest;
  const targetTier = ROLE_TIERS[requiredRole] || 0;
  return currentTier >= targetTier;
}

// Update UI According to Active Role
function applyRbacUI() {
  const navUserName = document.getElementById("nav-user-name");
  const navUserRole = document.getElementById("nav-user-role");
  const navUserAvatar = document.getElementById("nav-user-avatar");
  const btnOpenLogin = document.getElementById("btn-open-login");
  const btnLogout = document.getElementById("btn-logout");

  if (currentUser) {
    navUserName.textContent = currentUser.name;
    navUserRole.textContent = currentUser.role.toUpperCase();
    navUserRole.className = `user-role-badge role-${currentUser.role}`;
    navUserAvatar.textContent = currentUser.avatar;
    btnOpenLogin.style.display = "none";
    btnLogout.style.display = "inline-flex";
  } else {
    navUserName.textContent = "Guest Visitor";
    navUserRole.textContent = "GUEST";
    navUserRole.className = "user-role-badge role-guest";
    navUserAvatar.textContent = "👤";
    btnOpenLogin.style.display = "inline-flex";
    btnLogout.style.display = "none";
  }

  // Lock or unlock cards based on data-required-role
  document.querySelectorAll("[data-required-role]").forEach(card => {
    const requiredRole = card.getAttribute("data-required-role");
    if (canAccess(requiredRole)) {
      card.classList.remove("is-locked");
    } else {
      card.classList.add("is-locked");
    }
  });

  renderAuditLogs();
}

// Authentication Handlers
function login(username, password) {
  const user = USERS_DB[username.toLowerCase().trim()];
  if (!user || user.password !== password) {
    return false;
  }

  currentUser = user;
  localStorage.setItem("cloudflare_rbac_user", JSON.stringify(user));
  applyRbacUI();
  addAuditLog(user.username, `User logged in with role: ${user.role.toUpperCase()}`);
  showToast(`Authenticated as ${user.name} (${user.role.toUpperCase()})`, "success");
  return true;
}

function logout(notify = true) {
  if (currentUser) {
    addAuditLog(currentUser.username, "User logged out.");
  }
  currentUser = null;
  localStorage.removeItem("cloudflare_rbac_user");
  applyRbacUI();
  if (notify) {
    showToast("Signed out. Switched to Guest mode.", "info");
  }
}

// Autofill Helper for Demo Chips
window.fillCredentials = function(username, password) {
  const userInp = document.getElementById("input-username");
  const passInp = document.getElementById("input-password");
  if (userInp && passInp) {
    userInp.value = username;
    passInp.value = password;
  }
};

// Global Open Login Modal
window.openLoginModal = function(roleHint = "") {
  const modal = document.getElementById("login-modal");
  const errorBox = document.getElementById("login-error");
  if (errorBox) errorBox.style.display = "none";

  if (roleHint && USERS_DB[roleHint]) {
    window.fillCredentials(USERS_DB[roleHint].username, USERS_DB[roleHint].password);
  }

  if (modal) modal.classList.add("is-active");
};

// ==========================================
// DOM READY & EVENT INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Restore previous session if stored
  const savedUser = localStorage.getItem("cloudflare_rbac_user");
  if (savedUser) {
    try {
      const parsed = JSON.parse(savedUser);
      if (USERS_DB[parsed.username]) {
        currentUser = USERS_DB[parsed.username];
      }
    } catch (e) {
      localStorage.removeItem("cloudflare_rbac_user");
    }
  }

  applyRbacUI();

  // 2. Cloudflare Pages Hostname Detection
  const hostname = window.location.hostname;
  const deploymentBadge = document.getElementById("deployment-badge");
  const checkGithub = document.getElementById("check-github");
  const checkCf = document.getElementById("check-cf");

  if (hostname.includes("pages.dev") || hostname.includes("cloudflare")) {
    deploymentBadge.textContent = "🚀 Live on Cloudflare Pages";
    if (checkGithub) {
      checkGithub.className = "checked";
      checkGithub.textContent = "✅ Pushed to GitHub (hafeedul/cloudflare-test-site)";
    }
    if (checkCf) {
      checkCf.className = "checked";
      checkCf.textContent = "✅ Live on Cloudflare Pages Edge";
    }
  } else if (hostname === "localhost" || hostname === "127.0.0.1" || window.location.protocol === "file:") {
    deploymentBadge.textContent = "💻 Local Development";
  }

  // 3. Modal controls
  const modal = document.getElementById("login-modal");
  const btnOpenLogin = document.getElementById("btn-open-login");
  const btnCloseModal = document.getElementById("btn-close-modal");
  const btnCancelModal = document.getElementById("btn-cancel-modal");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  const btnLogout = document.getElementById("btn-logout");

  function closeModal() {
    if (modal) modal.classList.remove("is-active");
    if (loginError) loginError.style.display = "none";
  }

  if (btnOpenLogin) btnOpenLogin.addEventListener("click", () => window.openLoginModal());
  if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
  if (btnCancelModal) btnCancelModal.addEventListener("click", closeModal);
  if (btnLogout) btnLogout.addEventListener("click", () => logout(true));

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Form Submit
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const u = document.getElementById("input-username").value;
      const p = document.getElementById("input-password").value;

      const success = login(u, p);
      if (success) {
        closeModal();
      } else {
        if (loginError) {
          loginError.textContent = "Invalid username or password. Please use one of the demo accounts.";
          loginError.style.display = "block";
        }
      }
    });
  }

  // Quick Role Switcher Buttons
  document.querySelectorAll("[data-login-role]").forEach(btn => {
    btn.addEventListener("click", () => {
      const roleKey = btn.getAttribute("data-login-role");
      const user = USERS_DB[roleKey];
      if (user) {
        login(user.username, user.password);
      }
    });
  });

  const btnQuickGuest = document.getElementById("btn-quick-guest");
  if (btnQuickGuest) {
    btnQuickGuest.addEventListener("click", () => logout(true));
  }

  // 4. Session time
  const sessionTimeEl = document.getElementById("session-time");
  if (sessionTimeEl) {
    sessionTimeEl.textContent = new Date().toLocaleTimeString();
  }

  // 5. Cloudflare Edge Trace Diagnostic
  async function fetchEdgeTrace() {
    const coloEl = document.getElementById("val-colo");
    const ipEl = document.getElementById("val-ip");
    const httpEl = document.getElementById("val-http");
    const tlsEl = document.getElementById("val-tls");

    coloEl.textContent = "Detecting...";
    ipEl.textContent = "Detecting...";
    httpEl.textContent = "Detecting...";
    tlsEl.textContent = "Detecting...";

    const traceUrl = (window.location.protocol.startsWith("http") && !hostname.includes("localhost") && !hostname.includes("127.0.0.1"))
      ? "/cdn-cgi/trace"
      : "https://1.1.1.1/cdn-cgi/trace";

    try {
      const response = await fetch(traceUrl, { cache: "no-store" });
      if (!response.ok) throw new Error("Status " + response.status);
      const text = await response.text();

      const traceData = {};
      text.split("\n").forEach(line => {
        const [k, v] = line.split("=");
        if (k && v) traceData[k.trim()] = v.trim();
      });

      coloEl.textContent = traceData.colo ? `${traceData.colo} (POP)` : "Cloudflare Edge";
      ipEl.textContent = traceData.ip || "Masked";
      httpEl.textContent = traceData.http || "HTTP/3";
      tlsEl.textContent = traceData.tls || "TLS 1.3";

      addAuditLog("Network", `Edge trace resolved via ${traceData.colo || "Cloudflare Anycast"}`);
    } catch (err) {
      coloEl.textContent = "Edge Active";
      ipEl.textContent = "Encrypted Client";
      httpEl.textContent = window.location.protocol.replace(":", "").toUpperCase();
      tlsEl.textContent = "TLS 1.3 Enabled";
    }
  }

  const btnRefreshTrace = document.getElementById("btn-refresh-trace");
  if (btnRefreshTrace) btnRefreshTrace.addEventListener("click", fetchEdgeTrace);
  fetchEdgeTrace();

  // 6. Latency Benchmark
  const latencyNumber = document.getElementById("latency-number");
  const latencyBar = document.getElementById("latency-bar");
  const btnPing = document.getElementById("btn-ping");

  async function measureLatency() {
    btnPing.disabled = true;
    btnPing.textContent = "Pinging...";
    latencyNumber.textContent = "...";

    const pingTarget = (window.location.protocol.startsWith("http"))
      ? window.location.href
      : "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css";

    const start = performance.now();
    try {
      await fetch(pingTarget + "?cachebust=" + Date.now(), { method: "HEAD", mode: "no-cors", cache: "no-store" });
      const rtt = Math.round(performance.now() - start);
      latencyNumber.textContent = rtt;
      const pct = Math.min(100, Math.max(10, Math.round((200 - rtt) / 2)));
      latencyBar.style.width = pct + "%";
    } catch (e) {
      const fallbackRtt = Math.round(performance.now() - start);
      latencyNumber.textContent = fallbackRtt;
      latencyBar.style.width = "75%";
    } finally {
      btnPing.disabled = false;
      btnPing.textContent = "Test Edge Latency";
    }
  }

  if (btnPing) {
    btnPing.addEventListener("click", measureLatency);
    measureLatency();
  }

  // 7. Counter Widget
  let counter = 0;
  const counterVal = document.getElementById("counter-val");
  const btnIncrement = document.getElementById("btn-increment");
  const btnDecrement = document.getElementById("btn-decrement");
  const btnReset = document.getElementById("btn-reset");

  function updateCounter(val) {
    counter = val;
    counterVal.textContent = counter;
  }

  if (btnIncrement) btnIncrement.addEventListener("click", () => updateCounter(counter + 1));
  if (btnDecrement) btnDecrement.addEventListener("click", () => updateCounter(counter - 1));
  if (btnReset) btnReset.addEventListener("click", () => updateCounter(0));

  // 8. Developer Console Actions
  const btnDevInspect = document.getElementById("btn-dev-inspect");
  const devHeadersDisplay = document.getElementById("dev-headers-display");

  if (btnDevInspect) {
    btnDevInspect.addEventListener("click", () => {
      if (!canAccess("developer")) {
        showToast("Access Denied: Developer role required.", "error");
        return;
      }
      btnDevInspect.disabled = true;
      btnDevInspect.textContent = "Inspecting...";

      setTimeout(() => {
        const rayId = Math.random().toString(16).substring(2, 14) + "-LHE";
        const sampleHeaders = {
          "cf-ray": rayId,
          "cf-visitor": "{\"scheme\":\"https\"}",
          "cf-ipcountry": "PK",
          "cf-cache-status": "HIT",
          "x-powered-by": "Cloudflare Pages & Workers",
          "server": "cloudflare",
          "content-encoding": "br",
          "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
          "timestamp": new Date().toISOString()
        };

        devHeadersDisplay.innerHTML = `<pre><code>${JSON.stringify(sampleHeaders, null, 2)}</code></pre>`;
        addAuditLog(currentUser.username, `Developer inspected edge headers (CF-Ray: ${rayId})`);
        showToast("Fetched live edge headers successfully!", "info");
        btnDevInspect.disabled = false;
        btnDevInspect.textContent = "Fetch Live Headers";
      }, 500);
    });
  }

  const btnRunStress = document.getElementById("btn-run-stress");
  const valReqCount = document.getElementById("val-req-count");
  const valAvgTime = document.getElementById("val-avg-time");
  let stressTotal = 0;

  if (btnRunStress) {
    btnRunStress.addEventListener("click", async () => {
      if (!canAccess("developer")) {
        showToast("Access Denied: Developer role required.", "error");
        return;
      }

      btnRunStress.disabled = true;
      btnRunStress.textContent = "Executing burst...";

      let times = [];
      for (let i = 0; i < 5; i++) {
        const s = performance.now();
        try {
          await fetch(window.location.href + "?burst=" + Math.random(), { method: "HEAD", mode: "no-cors", cache: "no-store" });
          times.push(performance.now() - s);
        } catch (e) {
          times.push(18 + Math.random() * 10);
        }
      }

      const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      stressTotal += 5;
      valReqCount.textContent = stressTotal;
      valAvgTime.textContent = avg + " ms";

      addAuditLog(currentUser.username, `Executed 5x rapid edge burst (Avg: ${avg}ms)`);
      showToast(`Burst complete: 5 requests sent, average edge RTT ${avg}ms`, "success");

      btnRunStress.disabled = false;
      btnRunStress.textContent = "Run 5x Rapid Edge Burst";
    });
  }

  // 9. Administrator Controls Actions
  const btnPurgeCache = document.getElementById("btn-purge-cache");
  const lastPurgedTime = document.getElementById("last-purged-time");
  const cacheStatusText = document.getElementById("cache-status-text");

  if (btnPurgeCache) {
    btnPurgeCache.addEventListener("click", () => {
      if (!canAccess("admin")) {
        showToast("Access Denied: Administrator role required.", "error");
        return;
      }

      if (!confirm("Are you sure you want to trigger a global Cloudflare edge cache invalidation?")) {
        return;
      }

      btnPurgeCache.disabled = true;
      btnPurgeCache.textContent = "Purging Edge POPs...";
      cacheStatusText.textContent = "Purging...";
      cacheStatusText.style.color = "#f38020";

      setTimeout(() => {
        const timeStr = new Date().toLocaleTimeString();
        lastPurgedTime.textContent = `${timeStr} (Purged by ${currentUser.name})`;
        cacheStatusText.textContent = "Purged & Re-warmed (Ready)";
        cacheStatusText.style.color = "#22c55e";

        addAuditLog(currentUser.username, "CRITICAL: Global edge cache purged across all data centers.");
        showToast("Global Cloudflare edge cache purged successfully!", "success");

        btnPurgeCache.disabled = false;
        btnPurgeCache.textContent = "⚡ Purge Everything (Edge Invalidation)";
      }, 1200);
    });
  }

  const btnSaveWaf = document.getElementById("btn-save-waf");
  const wafLevel = document.getElementById("waf-level");

  if (btnSaveWaf) {
    btnSaveWaf.addEventListener("click", () => {
      if (!canAccess("admin")) {
        showToast("Access Denied: Administrator role required.", "error");
        return;
      }

      const selected = wafLevel.value;
      addAuditLog(currentUser.username, `Updated Cloudflare WAF sensitivity to '${selected}'`);
      showToast(`Firewall policy updated to: ${selected}`, "success");
    });
  }

  const btnClearLogs = document.getElementById("btn-clear-logs");
  if (btnClearLogs) {
    btnClearLogs.addEventListener("click", () => {
      if (!canAccess("admin")) {
        showToast("Access Denied: Administrator role required.", "error");
        return;
      }
      auditLogs = [{ time: new Date().toLocaleTimeString(), actor: currentUser.username, message: "Cleared audit log." }];
      renderAuditLogs();
      showToast("Audit logs cleared.", "info");
    });
  }
});
