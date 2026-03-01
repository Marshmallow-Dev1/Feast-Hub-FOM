# FSC Community Management PWA — Setup Guide

## Overview

This is the complete community management system for **The Feast Sta. Lucia Cainta (FSC)**.

**What this does:**
- 4 public QR code forms: FTA Registration, Join LG, Serve, Give Offerings
- Auto-notifies ministry heads via email when forms are submitted
- Dashboard for ministry heads (Google login, role-based access)
- All data stored in Google Sheets — free, forever, scales infinitely
- Monthly cost: **PHP 0**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend / PWA | Next.js 15 (App Router, TypeScript, Tailwind CSS) |
| Database | Google Sheets |
| Backend API | Google Apps Script (deployed as Web App) |
| Email | Gmail via Apps Script (MailApp — free) |
| Auth | Google OAuth via NextAuth.js |
| Hosting | Vercel (free tier) |

---

## Setup Steps

### Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it: `FSC Community Data`
3. Create the following tabs (Apps Script will auto-create them with headers on first form submission, but you can create them now):
   - `FTAs`
   - `Members`
   - `LGRequests`
   - `ServantRegistrations`
   - `Tithes`
   - `EmailLog`
   - `Config`

4. In the **Config** tab, set up these columns (Row 1 = headers):
   ```
   Email | Role | Name | MinistryLabel | FamilyMinistry | ServiceMinistry
   ```

   Then add your ministry heads (Row 2 onwards):
   ```
   connecthead@gmail.com | connect_head | Juan dela Cruz | Connect Ministry | |
   youthhead@gmail.com   | family_ministry_head | Maria Santos | Youth Ministry | youth |
   worshiphead@gmail.com | service_ministry_head | Pedro Reyes | Worship Ministry | | worship
   finance@gmail.com     | finance | Ana Garcia | Finance Team | |
   ```

   **Available roles:**
   - `super_admin` — sees everything (set in `.env.local` as `SUPER_ADMIN_EMAIL`)
   - `connect_head` — sees all FTAs and LG requests
   - `family_ministry_head` — sees FTAs for their family ministry only
   - `service_ministry_head` — sees servant registrations for their service ministry only
   - `lg_head` — sees LG requests
   - `finance` — sees tithes and offerings only

### Step 2: Set Up Google Apps Script

1. Open your Google Sheet
2. Click **Extensions > Apps Script**
3. Delete the existing code and paste the entire contents of `apps-script/Code.gs`
4. **Important:** Find this line near the top and change the secret:
   ```javascript
   var SECRET_KEY = "fsc-secret-change-this-in-production";
   ```
   Change it to something unique like: `var SECRET_KEY = "fsc-2026-my-secret-xyz123";`

5. Also update the email constants:
   ```javascript
   var CONNECT_HEAD_EMAIL = "your-connect-ministry-email@gmail.com";
   var INTERCESSORY_HEAD_EMAIL = "your-intercessory-ministry-email@gmail.com";
   ```

   And for each ministry head's email, find the `getEmailConfig()` function and fill in the values.

6. Click **Deploy > New Deployment**
7. Select type: **Web App**
8. Settings:
   - Description: `FSC Community API v1`
   - Execute as: **Me** (your Google account)
   - Who has access: **Anyone**
9. Click **Deploy** and **authorize** when prompted
10. **Copy the Web App URL** — you'll need it for the next step

### Step 3: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Go to **APIs & Services > Credentials**
4. Click **+ Create Credentials > OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Name: `FSC Community`
7. Authorized JavaScript origins:
   - `http://localhost:3000`
   - `https://feast-slc.vercel.app` (your Vercel URL)
8. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://feast-slc.vercel.app/api/auth/callback/google`
9. Click **Create** and copy your **Client ID** and **Client Secret**

### Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in `.env.local`:
   ```bash
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   AUTH_SECRET=generate-with-openssl-rand-base64-32
   APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec
   APPS_SCRIPT_SECRET=fsc-2026-my-secret-xyz123  # same as in Code.gs
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   SUPER_ADMIN_EMAIL=your-email@gmail.com
   NEXT_PUBLIC_SHEETS_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
   ```

3. Generate `AUTH_SECRET`:
   ```bash
   # On Mac/Linux:
   openssl rand -base64 32

   # Or use any random 32+ character string
   ```

### Step 5: Add PWA Icons

Create icons for the PWA in `public/icons/`. Minimum required sizes:
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-192x192.png`
- `icon-512x512.png`
- `apple-touch-icon.png` (180x180)
- `icon-32x32.png`
- `icon-16x16.png`

Use The Feast logo with a red (#ff474f) background. You can use [Favicon.io](https://favicon.io/) to generate all sizes from one image.

### Step 6: Add GCash & Bank QR Codes

In [give/page.tsx](src/app/(public)/give/page.tsx), replace the placeholder divs with your actual QR code images:

```tsx
// Replace this:
<div className="w-28 h-28 bg-gray-100 rounded-xl flex items-center justify-center my-2 mx-auto border-2 border-dashed border-gray-200">

// With this:
<Image
  src="/images/gcash-qr.png"
  alt="GCash QR Code"
  width={112}
  height={112}
  className="rounded-xl my-2"
/>
```

Save your GCash QR code as `public/images/gcash-qr.png` and bank QR as `public/images/bank-qr.png`.

Also update the GCash number and bank account details in the same file.

### Step 7: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Test each form:
- [http://localhost:3000/fta](http://localhost:3000/fta) — FTA Registration
- [http://localhost:3000/lg](http://localhost:3000/lg) — Light Group Interest
- [http://localhost:3000/serve](http://localhost:3000/serve) — Servant Registration
- [http://localhost:3000/give](http://localhost:3000/give) — Tithes & Offerings
- [http://localhost:3000/login](http://localhost:3000/login) — Ministry Dashboard Login

### Step 8: Deploy to Vercel

1. Push your code to GitHub (without `.env.local`!)
2. Go to [vercel.com](https://vercel.com) and import your GitHub repo
3. Add all environment variables from `.env.local` to Vercel's environment variables settings
4. Update `NEXT_PUBLIC_BASE_URL` to your Vercel URL
5. Deploy!
6. Update your Google OAuth authorized redirect URIs with your Vercel URL
7. Redeploy Apps Script with the updated `NEXT_PUBLIC_BASE_URL` in email links

---

## QR Code Printing Guide

After deploying, go to **Dashboard > QR Codes** to generate and download all 4 QR codes.

**Where to display them:**
| QR Code | Placement |
|---|---|
| FTA Registration | Main entrance tarpaulin (3x4 ft minimum), seat cards |
| Join Light Group | LG section display, Sunday bulletin |
| Serve | Servant recruitment table, bulletin |
| Give Offerings | Near exit area, alongside GCash number display |

---

## Adding New Ministry Heads

1. Open your Google Sheet
2. Go to the **Config** tab
3. Add a new row with their email, role, name, and ministry
4. They can immediately sign in at `/login` with their Google account

No code changes needed.

---

## Email Configuration

All email routing is managed in `apps-script/Code.gs` in the `getEmailConfig()` function and at the top of the file (the constants).

Update these values after initial setup:
```javascript
var CONNECT_HEAD_EMAIL = "connect@feast-slc.com";
var INTERCESSORY_HEAD_EMAIL = "intercessory@feast-slc.com";

// Inside getEmailConfig():
worshipEmail: "worship@feast-slc.com",
musicalDirectorEmail: "musicaldirector@feast-slc.com",
// etc.
```

After changing `Code.gs`, redeploy the Web App (Deploy > Manage Deployments > Edit).

---

## Troubleshooting

**Forms submit but no data appears in Sheets:**
- Check that `APPS_SCRIPT_URL` and `APPS_SCRIPT_SECRET` match exactly between `.env.local` and `Code.gs`
- Open the Apps Script > Executions tab to see error logs

**Google login doesn't work:**
- Verify OAuth redirect URIs include your current domain
- Make sure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `AUTH_SECRET` are set

**Ministry head can't log in:**
- Make sure their Google email is in the Config sheet of your Google Sheet
- Check the role is spelled exactly: `super_admin`, `connect_head`, `family_ministry_head`, `service_ministry_head`, `lg_head`, `finance`

**Emails not being sent:**
- Apps Script has a daily email limit of 100 emails (free Gmail) or 1,500 emails (Google Workspace)
- Check the EmailLog tab in your Google Sheet for sent emails
- Check the Apps Script Executions tab for errors
