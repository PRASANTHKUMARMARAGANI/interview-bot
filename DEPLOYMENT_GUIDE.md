# InterviewX AI — Production Deployment Guide

This project is built on **Next.js 16 (App Router)** with **TypeScript**, **Tailwind CSS**, **Web Speech API**, **HTML5 Canvas MediaRecorder**, and **IndexedDB** client-side media storage.

It is 100% production-ready and builds cleanly (`npm run build`) with zero errors across all 20 routes.

---

## 🚀 Option 1: Deploy to Vercel (Recommended — 2 Minutes)

Vercel is the official hosting platform for Next.js and provides instant deployment with zero server maintenance.

### Method A: Deploy via GitHub
1. Initialize git and commit your files:
   ```bash
   git init
   git add .
   git commit -m "InterviewX AI initial release"
   ```
2. Push your repository to your GitHub account (`https://github.com/your-username/interview-bot`).
3. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
4. Import your GitHub repository.
5. In **Environment Variables**, add (optional if using live Gemini AI):
   - `GEMINI_API_KEY`: Your Google Gemini API Key
6. Click **Deploy**. Your app will be live on a secure HTTPS domain (e.g. `https://interviewx-ai.vercel.app`) with automatic SSL.

### Method B: Deploy via Vercel CLI
```bash
npm i -g vercel
vercel
```
Follow the interactive prompts to deploy directly from your local terminal.

---

## ⚡ Option 2: Deploy on Any Linux VPS / Cloud Server (Node.js & PM2)

If deploying to AWS EC2, DigitalOcean Droplet, Linode, or any VPS:

1. Clone or copy your project files to the server.
2. Install dependencies:
   ```bash
   npm install --production=false
   ```
3. Run the production build:
   ```bash
   npm run build
   ```
4. Start the server using PM2 for 24/7 background uptime:
   ```bash
   npm install -g pm2
   pm2 start npm --name "interviewx" -- start -- -p 3000
   pm2 save
   pm2 startup
   ```
5. Configure Nginx as a reverse proxy:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
6. Secure with free SSL certificate:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

---

## 🔑 Environment Variables Reference

| Variable | Required | Description | Default |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for live LLM scoring. If omitted, the engine automatically uses the calibrated Autonomous Demo Engine. | `""` (Demo Mode) |
| `PORT` | Optional | Port on which the Next.js server listens. | `3000` |

---

## 🛡️ HTTPS & Browser Permissions Requirement

> [!IMPORTANT]
> The browser requires a secure **HTTPS** connection (or `http://localhost`) to grant access to:
> - **Webcam (`getUserMedia`)**
> - **Microphone (`getUserMedia`)**
> - **Speech Recognition (`webkitSpeechRecognition`)**
> 
> Deploying to Vercel automatically equips your site with an SSL certificate (`https://`), ensuring seamless student camera and microphone access.
