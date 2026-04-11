import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://iictbacogzmubagkwdeb.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error("Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seedAdminUser() {
  try {
    const adminEmail = "admin@atlastwave.com";
    const adminPassword = "Admin@atlaswave";

    console.log(`Creating admin user: ${adminEmail}`);

    // Create the admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes("already exists")) {
        console.log("Admin user already exists");
        // Try to get the user ID
        const { data: existingUser, error: getUserError } = await supabase.auth.admin.getUserById(
          authData?.user?.id || ""
        );
        if (getUserError || !existingUser.user) {
          // Get user by email instead
          const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
          const adminUser = userList?.users?.find((u) => u.email === adminEmail);
          if (!adminUser) {
            throw new Error(`Could not find existing admin user with email ${adminEmail}`);
          }
          authData.user = adminUser;
        } else {
          authData.user = existingUser.user;
        }
      } else {
        throw authError;
      }
    }

    if (!authData.user) {
      throw new Error("Failed to create or retrieve admin user");
    }

    console.log(`Admin user created/retrieved: ${authData.user.id}`);

    // Create profile entry
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
      throw profileError;
    }

    console.log("Admin profile created/updated");

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

    console.log("Admin role assigned successfully");
    console.log("\n✅ Admin user seeded successfully!");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
}

seedAdminUser();
