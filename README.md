# Cloudflare Edge Test Website ⚡

A modern, responsive static website designed to test and benchmark hosting on **Cloudflare Pages**.

## Features Included
- 🌐 **Cloudflare Edge Diagnostics**: Detects the nearest Cloudflare data center airport code (`colo`), protocol, and connection security.
- ⚡ **Real-time Latency Benchmark**: Interactive round-trip ping measurement to the edge CDN.
- 🛠️ **Interactive JavaScript Component**: State test counter and runtime validation.
- 📱 **Modern Responsive UI**: Dark glassmorphic design tailored with Cloudflare styling.
- 🚀 **Zero Build Step**: Native HTML/CSS/JS without npm dependencies or bundlers needed.

---

## Deploy to Cloudflare Pages (Quick Steps)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Cloudflare test site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Connect to Cloudflare**:
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to **Workers & Pages** > **Create application** > **Pages**
   - Click **Connect to Git** and select this repository
   - Build settings:
     - **Framework preset**: `None`
     - **Build command**: *(leave empty)*
     - **Build output directory**: `/` (or root)
   - Click **Save and Deploy**!
