# SETUP_AND_DEPLOY.md — Starfield Cosmic Chess (GoDaddy + Firebase + Cloud Run + Pi Browser)

This guide takes you from zero cloud setup to a live Pi Browser app at **`https://starfieldcosmicchess.com`**.

---

## Step 1: Create Your Firebase + Google Cloud Project (5 Minutes)
Firebase automatically creates the underlying Google Cloud project for you:
1. Open the **Firebase Console** (`console.firebase.google.com`) -> **Add Project** -> name it `starfield-cosmic-chess`.
2. In the left sidebar:
   - **Build -> Authentication -> Get Started** (no email/Google providers needed—we use Custom Tokens from Pi Auth!).
   - **Build -> Firestore Database -> Create Database** -> Production mode -> choose `us-central1` (or nearest region).
   - **Build -> Hosting -> Get Started**.
3. Go to **Project Settings -> Your Apps -> Web (`</>`)** -> register `starfield-web` -> copy the 6 `firebaseConfig` values into `frontend/.env` (copy from `frontend/.env.example`).
4. Upgrade the project to the **Blaze (Pay-as-you-go)** plan to enable Google Cloud Run (Cloud Run has a generous free tier; set a monthly budget alert of `$5–$10` in Google Cloud Billing for peace of mind).

---

## Step 2: Deploy the FastAPI Backend to Google Cloud Run
Install the Google Cloud CLI (`gcloud`), then run from the `backend/` folder:

```bash
gcloud auth login
gcloud config set project YOUR_FIREBASE_PROJECT_ID

gcloud run deploy starfield-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --min-instances 1 \
  --set-env-vars "ENV=production,CORS_ORIGINS=https://starfieldcosmicchess.com,https://www.starfieldcosmicchess.com,https://YOUR_FIREBASE_PROJECT_ID.web.app"
```

- Copy the deployed Service URL (e.g. `https://starfield-api-xxxxx-uc.a.run.app`).
- Verify it is live by visiting `https://starfield-api-xxxxx-uc.a.run.app/api/v1/health` -> should return `{"status":"ok","service":"starfield-cosmic-chess-api"}`.
- Paste that URL into `frontend/.env` as `VITE_API_BASE_URL`.

*(Note: Ensure the Cloud Run default service account has **Cloud Datastore User** and **Firebase Authentication Admin** roles in Google Cloud IAM so it can read/write Firestore and mint Custom Tokens.)*

---

## Step 3: Build & Deploy Frontend + Firestore Rules to Firebase Hosting
From the project root:

```bash
cd frontend
npm install
npm run build
cd ..

npm install -g firebase-tools
firebase login
firebase use --add YOUR_FIREBASE_PROJECT_ID
firebase deploy
```

---

## Step 4: Connect `starfieldcosmicchess.com` on GoDaddy to Firebase Hosting
1. In **Firebase Console -> Hosting -> Add custom domain**, enter `starfieldcosmicchess.com`.
2. Firebase will show a **TXT verification record** and one or two **A records** (IP addresses).
3. In **GoDaddy -> My Products -> Starfield Cosmic Chess -> Domain -> Manage DNS**:
   - **Remove** GoDaddy's default "Coming Soon / Website Builder" forwarding or parked A record for `@`.
   - **Add** the Firebase `TXT` record (Name: `@`, Value: Firebase verification token).
   - **Add** the Firebase `A` record(s) (Name: `@`, Value: Firebase IP(s)).
   - Repeat for `www.starfieldcosmicchess.com` if desired (redirecting `www` -> apex).
4. Firebase automatically provisions a free SSL certificate (`https://starfieldcosmicchess.com`) within ~15–60 minutes once DNS propagates.

---

## Step 5: Register in Pi Developer Portal & Test in Pi Browser
1. Open the **Pi Developer Portal** inside Pi Browser -> create/update **Starfield Cosmic Chess**.
2. Set your App URL to `https://starfieldcosmicchess.com`.
3. Complete the Developer Portal checklist (including **PiNet subdomain**, icon `/starfield-icon.svg`, and English listing copy from `ECOSYSTEM_LISTING.md`).
4. Set `VITE_PI_SANDBOX=false` in `frontend/.env` for Production/Mainnet (or keep `true` while testing in Pi Sandbox), rebuild, and run `firebase deploy --only hosting`.
5. Open `https://starfieldcosmicchess.com` inside **Pi Browser** on your phone and tap **"Enter the Starfield with Pi"** to verify the full end-to-end login, matchmaking, and real-time board sync!
