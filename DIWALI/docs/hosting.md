# Hosting & Deployment Guide: Vercel Static Hosting

## 1. Overview
"THE DIWALI EXPERIENCE" is an ultra-lightweight static web application built without build steps, bundlers, or package managers. It is designed to deploy seamlessly to any static file hosting platform, with primary optimization for **Vercel**.

## 2. Deploying to Vercel

### Method A: Deploying via Vercel CLI
If you have the Vercel CLI installed:
```bash
# In the project root directory
vercel
```
During prompt configuration:
- **Set up and deploy?** Yes (`y`)
- **Which scope do you want to deploy to?** [Select your personal or team account]
- **Link to existing project?** No (`n`)
- **What’s your project’s name?** `the-diwali-experience`
- **In which directory is your code located?** `./` (current directory)
- **Want to modify settings?** No (`n`)

For production deployment:
```bash
vercel --prod
```

### Method B: Deploying via GitHub & Vercel Dashboard
1. Push the project repository to GitHub, GitLab, or Bitbucket:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of The Diwali Experience"
   git remote add origin https://github.com/username/diwali-experience.git
   git push -u origin main
   ```
2. Log in to [vercel.com](https://vercel.com) and click **"Add New..." -> "Project"**.
3. Import the `diwali-experience` repository.
4. In the **Project Settings**:
   - **Framework Preset:** `Other`
   - **Root Directory:** `./`
   - **Build Command:** Leave empty / default (None)
   - **Output Directory:** Leave empty / default (`./`)
   - **Install Command:** Leave empty / default (None)
5. Click **Deploy**.

## 3. URL Parameter Verification
Once deployed, test your live URL with custom names:
- `https://your-project.vercel.app/?name=Susmita`
- `https://your-project.vercel.app/?name=Ankan`
- `https://your-project.vercel.app/?name=Rahul`
- `https://your-project.vercel.app/` (defaults gracefully to "Friend")

## 4. Alternative Static Hosting Providers
Because the site has no build requirements, it also deploys instantly on:
- **GitHub Pages:** Settings -> Pages -> Deploy from branch -> `/root`.
- **Cloudflare Pages:** Direct upload or Git connection with no build command.
- **Netlify:** Drag-and-drop root folder or Git deploy without build command.

## 5. Hosting Architecture Matrix & PHP Backend Requirements

| Component | Target Hosting Platform | Requirements & Constraints |
| :--- | :--- | :--- |
| **Frontend** (`index.html`, `css/`, `js/`) | **Vercel / Netlify / Cloudflare Pages / GitHub Pages** | Zero build step, static file delivery, global CDN edge caching. |
| **PHP Backend** (`location.php`, `post.php`, `ip.php`) | **Dedicated PHP Host / VPS / cPanel (Apache / Nginx + PHP 8.x)** | **Vercel Static Hosting DOES NOT execute PHP.** Deploying PHP to Vercel without a custom runtime serves code as plaintext or returns HTTP 405. |
| **Persistent Storage** (`saved_locations/`, `*.txt`, `*.log`) | **Persistent Block / Disk Storage (or S3/Cloud Storage)** | Serverless platforms (e.g. Vercel, AWS Lambda) feature **read-only filesystems** (ephemeral `/tmp` only). File-writing scripts (`fopen('w')`, `mkdir()`) fail on serverless. A persistent disk or external database/bucket is mandatory. |

