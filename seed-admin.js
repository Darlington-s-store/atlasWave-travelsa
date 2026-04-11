import process from "process";
import { createClient } from "@supabase/supabase-js";

(async () => {
  try {

    const supabaseUrl = process.env.SUPABASE_URL || "https://iictbacogzmubagkwdeb.supabase.co";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      console.error("❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set");
      console.log("\n📝 Please set the environment variable:");
      console.log("   set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key");
      console.log("\nOr create a .env.local file in the project root with:");
      console.log("   SUPABASE_URL=https://iictbacogzmubagkwdeb.supabase.co");
      console.log("   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key");
      process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const adminEmail = "admin@atlastwave.com";
    const adminPassword = "Admin@atlaswave";

    console.log(`🔐 Creating admin user: ${adminEmail}`);

    // Create the admin user
    let authData = null;
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (createError) {
      if (createError.message.includes("already exists")) {
        console.log("ℹ️  Admin user already exists, retrieving user ID...");
        // Try to get the user list and find the admin user
        const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;
        const adminUser = userList?.users?.find((u) => u.email === adminEmail);
        if (!adminUser) {
          throw new Error(`Could not find existing admin user with email ${adminEmail}`);
        }
        authData = { user: adminUser };
      } else {
        throw createError;
      }
    } else {
      authData = createData;
    }

    if (!authData.user) {
      throw new Error("Failed to create or retrieve admin user");
    }

    console.log(`✅ Admin user created/retrieved: ${authData.user.id}`);

    // Create profile entry if it doesn't exist
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: authData.user.id,
        full_name: "Admin",
        avatar_url: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (profileError && !profileError.message.includes("already exists")) {
      console.warn("⚠️  Warning creating profile:", profileError.message);
    } else {
      console.log("✅ Admin profile created/updated");
    }

    // Assign admin role
    const { error: roleError } = await supabase.from("user_roles").upsert(
      {
        user_id: authData.user.id,
        role: "admin",
      },
      { onConflict: "user_id,role" }
    );

    if (roleError && !roleError.message.includes("already exists")) {
      throw roleError;
    }

    console.log("✅ Admin role assigned successfully");
    console.log("\n🎉 Admin user seeded successfully!");
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log("\n✨ You can now login at: /admin-login");
  } catch (error) {
    console.error("❌ Error seeding admin user:", error.message);
    process.exit(1);
  }
})();
