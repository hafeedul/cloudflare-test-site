# Cloudflare Edge RBAC Portal ⚡

A modern, responsive static web application with **Role-Based Access Control (RBAC)** designed for testing on **Cloudflare Pages**.

---

## 👥 Roles & Access Overview

The portal implements 3 distinct permission tiers. Passwords are kept secret and authenticated using cryptographic **SHA-256** verification (passwords are never stored in plaintext or exposed on the site):

| Role | Username | Password Status | Access & Permissions |
| :--- | :--- | :--- | :--- |
| 👑 **Administrator** | `admin` | Secret (Cryptographically Hashed) | **Full Access**: Cloudflare Edge Cache Purge, WAF firewall policy simulator, live RBAC security audit logs, developer tools, and public diagnostics. |
| 💻 **Developer** | `dev` | Secret (Cryptographically Hashed) | **Technical Access**: Raw CF Request Headers inspector, 5x Rapid Edge Burst test, latency benchmark, and public metrics. Restricted from Admin operations. |
| 👁️ **Viewer** | `viewer` | Secret (Cryptographically Hashed) | **Read-Only Access**: Public Edge network trace (nearest colo/POP detection), latency benchmark, and DOM counter. Developer and Admin tools are locked. |
| 🔓 **Guest** | *(Logged out)* | *N/A* | Default unauthenticated state. Restricted to public overview with login callouts. |

---

## 🚀 Key Features

1. **Role-Based UI Gating**:
   - Unauthorized panels are automatically blurred and locked with a permission-specific padlock badge and direct elevation CTA.
2. **Cryptographic Authentication**:
   - Client-side SHA-256 hashing verifies input passwords against pre-hashed digests without ever storing or revealing plaintext passwords on the webpage or in the repository.
3. **Cloudflare Edge Diagnostics**:
   - Native query to `/cdn-cgi/trace` to detect edge airport POP codes (e.g., `LHE`, `ISB`, `DXB`, `FRA`), protocol (`HTTP/3`), and `TLS 1.3`.
4. **Security Audit Log**:
   - Real-time audit trail capturing user sign-ins, logouts, WAF policy updates, and cache purge actions with exact timestamps.
5. **Zero Build Step**:
   - Pure HTML5, CSS3, and modern ES6 JavaScript. No npm bundlers or node modules required.

---

## 📦 Push Changes to GitHub

To publish the latest commits to your GitHub repository:
```powershell
cd "C:\Users\Hafeed\.gemini\antigravity\scratch\cloudflare-test-site"
git push
```

Cloudflare Pages will automatically detect the new commit and redeploy your live site!
