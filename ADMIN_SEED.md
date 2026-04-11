# Seeding Admin User

To seed the admin user with credentials `admin@atlastwave.com` / `Admin@atlaswave`, follow these steps:

## Step 1: Get Your Supabase Service Role Key

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `iictbacogzmubagkwdeb`
3. Navigate to **Settings → API**
4. Copy the **Service Role** key (⚠️ Keep this secret!)

## Step 2: Set Environment Variable

Create a `.env.local` file in the root of your project with:

```env
SUPABASE_URL=https://iictbacogzmubagkwdeb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Replace `your_service_role_key_here` with the key you copied above.

## Step 3: Run the Seed Script

Using Node.js (recommended):
```bash
# Set environment variable (Windows PowerShell)
$env:SUPABASE_SERVICE_ROLE_KEY = "your_service_role_key_here"
node seed-admin.js

# Or (Command Prompt)
set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
node seed-admin.js
```

Or using npm/package.json (add this to scripts):
```bash
npm run seed-admin
```

Using Bun (if available):
```bash
bun run supabase/seed.ts
```

## Step 4: Verify

Once the script completes successfully, you'll see:
```
✅ Admin user seeded successfully!
Email: admin@atlastwave.com
Password: Admin@atlaswave
```

You can now use these credentials to login at the admin portal.

## Troubleshooting

- **"User already exists"**: The admin user may already exist. The script will still assign the admin role if needed.
- **"SUPABASE_SERVICE_ROLE_KEY not set"**: Ensure your `.env.local` file is in the project root and has the correct key.
- **Still getting errors**: Check that your service role key is valid and hasn't expired.
