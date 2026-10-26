document.addEventListener("DOMContentLoaded", () => {
  // 1. Detect if running on Cloudflare Pages
  const hostname = window.location.hostname;
  const deploymentBadge = document.getElementById("deployment-badge");
  const checkGithub = document.getElementById("check-github");
  const checkCf = document.getElementById("check-cf");

  if (hostname.includes("pages.dev") || hostname.includes("cloudflare")) {
    deploymentBadge.textContent = "🚀 Live on Cloudflare Pages!";
    deploymentBadge.parentElement.style.borderColor = "#22c55e";
    deploymentBadge.parentElement.style.background = "rgba(34, 197, 94, 0.15)";
    deploymentBadge.style.color = "#4ade80";

    if (checkGithub) {
      checkGithub.className = "checked";
      checkGithub.textContent = "✅ Pushed to GitHub";
    }
    if (checkCf) {
      checkCf.className = "checked";
      checkCf.textContent = "✅ Deployed on Cloudflare Pages";
    }
  } else if (hostname === "localhost" || hostname === "127.0.0.1" || window.location.protocol === "file:") {
    deploymentBadge.textContent = "💻 Local Development Preview";
  }

  // 2. Session start timestamp
  const sessionTimeEl = document.getElementById("session-time");
  if (sessionTimeEl) {
    sessionTimeEl.textContent = new Date().toLocaleTimeString();
  }

  // 3. Cloudflare Edge Trace Diagnostic
  async function fetchEdgeTrace() {
    const coloEl = document.getElementById("val-colo");
    const ipEl = document.getElementById("val-ip");
    const httpEl = document.getElementById("val-http");
    const tlsEl = document.getElementById("val-tls");

    coloEl.textContent = "Inspecting...";
    ipEl.textContent = "Inspecting...";
    httpEl.textContent = "Inspecting...";
    tlsEl.textContent = "Inspecting...";

    // When hosted on Cloudflare Pages, /cdn-cgi/trace is available on the same origin.
    // If running locally, we can attempt fetching public endpoint or provide preview data.
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

      coloEl.textContent = traceData.colo ? `${traceData.colo} (Airport Code)` : "Detected";
      ipEl.textContent = traceData.ip || "Hidden";
      httpEl.textContent = traceData.http || window.location.protocol.toUpperCase();
      tlsEl.textContent = traceData.tls || "TLS 1.3";
    } catch (err) {
      // Graceful fallback for local files where CORS or offline prevents /cdn-cgi/trace
      coloEl.textContent = "Active on Cloudflare Deploy";
      ipEl.textContent = "Edge-routed";
      httpEl.textContent = window.location.protocol.replace(":", "").toUpperCase();
      tlsEl.textContent = window.location.protocol === "https:" ? "Enabled" : "Local / HTTP";
    }
  }

  const btnRefreshTrace = document.getElementById("btn-refresh-trace");
  if (btnRefreshTrace) {
    btnRefreshTrace.addEventListener("click", fetchEdgeTrace);
  }
  fetchEdgeTrace();

  // 4. Latency Benchmark
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
      
      // Calculate bar percentage (capped at 100%, 0-200ms scale)
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

  // 5. Interactive Counter
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
});
