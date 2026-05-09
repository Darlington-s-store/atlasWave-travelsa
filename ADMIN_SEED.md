# Seeding Admin User

To seed an admin user, follow these steps. **Never commit credentials to source control.**

## Step 1: Get Your Supabase Service Role Key

1. Go to your Supabase Dashboard
2. Navigate to **Settings → API**
3. Copy the **Service Role** key (⚠️ Keep this secret!)

## Step 2: Set Environment Variables

Create a `.env.local` file (already excluded by `.gitignore`) in the project root:

```env
SUPABASE_URL=<your_supabase_url>
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
ADMIN_EMAIL=<admin_email>
ADMIN_PASSWORD=<choose_a_strong_unique_password>
```

Use a strong password (16+ characters, mixed case, numbers, symbols).

## Step 3: Run the Seed Script

```bash
node seed-admin.js
```

## Step 4: Verify

Once the script completes, you can log in at the admin portal with the credentials you provided.

## Security Notes

- **Never** commit `.env.local`, credentials, or service role keys.
- Rotate any password that has been shared, logged, or exposed.
- The service role key bypasses RLS — treat it like a master key.
