# MediSlot — Hostinger Node.js Deployment Guide

This guide provides step-by-step instructions for deploying **MediSlot** to a **Hostinger VPS or Hostinger Node.js Web Hosting** environment.

---

## 1. Project Overview

MediSlot uses a standard **Vite + React (Frontend)** with an **Express (Node.js)** server wrapper located in `server.ts` to serve the production build (`dist/`) and handle Single Page Application (SPA) client-side routing.

* **Frontend Build Output:** `dist/`
* **Node.js Production Server:** `server.ts` (or bundled `dist/server.cjs`)
* **Default Port:** `3000` (or `process.env.PORT`)
* **Database & Auth:** Supabase (or built-in local persistence in Demo Mode)

---

## 2. Setting Up Supabase

1. Create a project at [https://supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste the contents of `supabase/schema.sql` and click **Run**. This provisions:
   - `profiles` table with automatic user creation trigger
   - `doctors` table
   - `availability_slots` table
   - `appointments` table
   - Atomic PostgreSQL RPCs: `book_appointment_slot`, `cancel_appointment`, `admin_reschedule_appointment`, `admin_update_appointment_status`
   - Row-Level Security (RLS) policies
4. (Optional) Run `supabase/seed.sql` to populate sample doctors and timetable slots.
5. In Supabase **Project Settings > API**, copy:
   - **Project URL**
   - **anon public API Key**

---

## 3. Hostinger Deployment Options

### Option A: Hostinger Cloud / Node.js Web Hosting (hPanel)

1. **Upload Files**:
   - In Hostinger hPanel, go to **File Manager** or use **Git Deployment**.
   - Upload the project files (exclude `node_modules`).

2. **Configure Environment Variables**:
   In hPanel under **Node.js Configuration** or `.env`:
   ```env
   NODE_ENV=production
   PORT=3000
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Install Dependencies & Build**:
   Open the **SSH Terminal** or run npm script in hPanel:
   ```bash
   npm install
   npm run build
   ```

4. **Set Entry Point**:
   - Application root: `/`
   - Application startup file: `server.ts` (with `tsx`) or `dist/server.cjs`
   - Node.js version: **18.x or 20.x LTS**

---

### Option B: Hostinger VPS (Ubuntu / Debian)

If using a Hostinger VPS with Nginx and PM2:

1. **Connect via SSH**:
   ```bash
   ssh root@your-vps-ip
   ```

2. **Install Node.js 20 & Git**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs git nginx
   sudo npm install -g pm2
   ```

3. **Clone & Setup the Project**:
   ```bash
   cd /var/www
   git clone <your-repository-url> medislot
   cd medislot
   npm install
   ```

4. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

5. **Build Application**:
   ```bash
   npm run build
   ```

6. **Start with PM2**:
   ```bash
   pm2 start npm --name "medislot" -- run start
   pm2 save
   pm2 startup
   ```

7. **Configure Nginx Reverse Proxy** (`/etc/nginx/sites-available/medislot`):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   Enable the site and reload Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/medislot /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## 4. Testing Your Live App

1. Visit your domain: `https://yourdomain.com`
2. Test browsing doctors and viewing availability.
3. Test booking an appointment as a patient.
4. Test the admin dashboard (`/admin`) using your admin account.
5. In demo mode (without Supabase keys), you can click **"Demo Patient"** or **"Demo Admin"** on the login page for instant 1-click testing.
