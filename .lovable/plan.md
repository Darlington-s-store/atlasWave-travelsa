
This is a large multi-feature batch. I'll split it across turns and check in between. Below is the full plan; I'll start with **Turn 1** right after approval.

---

## Turn 1 — Critical fixes + email redirect + admin password reset (highest impact)

1. **Email confirmation redirect to Vercel**
   - Already set `emailRedirectTo: PRODUCTION_URL` in `Signup.tsx`. The reason it still lands on the Lovable URL is the Supabase **Site URL** / **Redirect URLs** config, not the code. I will:
     - Keep code using `PRODUCTION_URL`.
     - Tell you the one-time setting to flip in Cloud → Users → URL Configuration (Site URL = `https://atlaswavetravel.vercel.app`, add it to Redirect URLs).
   - Also wire `ResetPassword` and OAuth `redirectTo` to `PRODUCTION_URL`.

2. **Admin → reset user password (with email + SMS)**
   - New edge function `admin-reset-user-password` (service-role, admin-gated):
     - Generates a strong temporary password.
     - Calls `auth.admin.updateUserById` to set it.
     - Sends email via Resend (already configured) with a plain branded text message (no AI tone).
     - Sends SMS via Arkesel (already configured) to the user's phone in `profiles`.
     - Inserts notifications: user ("Your password was reset by an admin") + admin ("Reset password for X").
   - Add a "Reset password" action in `AdminUsers.tsx` user row.

3. **User self-reset with token (OTP flow)**
   - `ForgotPassword.tsx` → use `supabase.auth.signInWithOtp({ email, shouldCreateUser:false })` style: actually use `resetPasswordForEmail` which already sends a recovery link; in addition we'll add an OTP-token path: `verifyOtp({ type:'recovery', token, email })`. UI gets a "I have a token" link that opens a token + new-password form.
   - On successful reset, create notification for admin: "User X reset their password".

4. **Notification 500 fix + Dialog a11y**
   - Already fixed Dialog a11y last turn.
   - Fix `send-notification` 500: harden input parsing, return JSON errors with CORS, never throw.

---

## Turn 2 — Settings pages seeded + profile editing

1. **`app_settings` seed** for admin profile info (company name, email, phone, address, support hours, social links, maintenance toggle, biometric toggle). Reads in `AdminSettings.tsx` already exist; I'll ensure all keys exist with sensible defaults via `supabase--insert` upsert.
2. **User settings table** — there isn't a `user_settings` table. I'll add one (`user_settings` keyed by `user_id`) with notification prefs, language, timezone, biometric_enabled. Wire `Profile.tsx` / Dashboard settings tab to load+save it. Profile editing already works; I'll verify save path and add success/error toasts.

---

## Turn 3 — Biometrics actually working when admin toggles on

- `useWebAuthn` hook exists. I'll:
  - Read the `app_settings.biometrics_enabled` flag globally.
  - On Login page, show a "Sign in with biometrics" button only if (a) admin enabled it AND (b) the user has previously enrolled on this device.
  - In user Settings → "Biometrics", add Enable/Disable that calls WebAuthn registration and stores the credential id in `user_settings`.
  - Persist credential id in DB so it works across reloads.
  - Note: WebAuthn requires HTTPS — works on the Vercel URL and lovable preview, not localhost without flags.

---

## Turn 4 — Finish prior batch

1. Multi-step Visa / Passport / Work Permit application forms with the standard global doc set (passport bio, Ghana card, photo, proof of funds, employment letter, invitation letter, CV, certs) using the existing `applications` + `application_documents` tables and `application-documents` private bucket.
2. Admin document viewer in `AdminApplications.tsx`: list uploaded docs per application, signed-URL preview, mark verified / add admin note, status update.
3. Apply remaining service hero images (Logistics, Work Permits, Credentials).
4. Clear placeholders in Login/Signup/Consultation forms.

---

## Technical notes

- All DB changes go through one migration per turn.
- All edge functions deploy automatically; admin-only ones validate `has_role(_, 'admin')` server-side using the user JWT before doing privileged work.
- Temporary passwords: 14 chars, mixed case + digits + symbol, sent via email and SMS, user prompted to change on next login (we'll set a `must_change_password` flag in `user_settings`).
- SMS uses Arkesel (already a secret); email uses Resend with a plain text-style branded template (not AI-sounding).

---

## What I need from you

Approve this plan and I'll start with **Turn 1**. After Turn 1 lands I'll continue straight into Turn 2 unless you say otherwise.

One config step only you can do (I'll remind you after Turn 1):
- Open Cloud → Users → URL Configuration → set **Site URL** to `https://atlaswavetravel.vercel.app` and add it under **Redirect URLs**. Without this, Supabase will keep redirecting confirmation emails to the Lovable URL no matter what the code says.
