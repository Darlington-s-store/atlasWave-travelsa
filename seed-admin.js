import process from "process";
import { createClient } from "@supabase/supabase-js";

(async () => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || "https://iictbacogzmubagkwdeb.supabase.co";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!supabaseServiceKey || !adminEmail || !adminPassword) {
      console.error("❌ Error: Required environment variables are not set");
      console.log("\n📝 Please set the following environment variables:");
      console.log("   SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>");
      console.log("   ADMIN_EMAIL=<admin_email>");
      console.log("   ADMIN_PASSWORD=<strong_password>");
      console.log("\nNever commit credentials to source control.");
      process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    console.log(`🔐 Creating admin user: ${adminEmail}`);

    let authData = null;
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (createError) {
      if (createError.message.includes("already exists")) {
        console.log("ℹ️  Admin user already exists, retrieving user ID...");
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

    const { error: roleError } = await supabase.from("user_roles").upsert(
      { user_id: authData.user.id, role: "admin" },
      { onConflict: "user_id,role" }
    );

    if (roleError && !roleError.message.includes("already exists")) {
      throw roleError;
    }

    console.log("✅ Admin role assigned successfully");
    console.log("\n🎉 Admin user seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding admin user:", error.message);
    process.exit(1);
  }
})();
