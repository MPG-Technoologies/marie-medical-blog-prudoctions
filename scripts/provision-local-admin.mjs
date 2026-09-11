#!/usr/bin/env node

/**
 * scripts/provision-local-admin.mjs
 *
 * Local-only provisioning script to ensure a verified synthetic admin exists
 * in the local Supabase environment for developer review.
 *
 * SECURITY INVARIANTS:
 * 1. REFUSES to run against any non-local URL (must be 127.0.0.1 or localhost).
 * 2. Obtains service-role credentials dynamically from `npx supabase status -o json`.
 *    Never hardcodes or commits any service-role secrets.
 * 3. Never touches hosted or production Supabase.
 * 4. Verifies actual GoTrue authentication and public.is_admin() RPC.
 */

import { execSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const SYNTHETIC_ADMIN_EMAIL = "synthetic-admin@example.invalid";
const SYNTHETIC_ADMIN_PASSWORD = "password";
const SYNTHETIC_ADMIN_ID = "00000000-0000-0000-0000-000000000001";

async function main() {
  console.log(
    "==> [Local Auth Provisioning] Inspecting local Supabase environment...",
  );

  // 1. Retrieve local connection facts dynamically
  let statusOutput;
  try {
    statusOutput = execSync("npx supabase status -o json", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    console.error(
      "ERROR: Unable to get local Supabase status. Make sure Docker is running and run `npx supabase start`.",
    );
    process.exit(1);
  }

  // Parse JSON output from status
  let status;
  try {
    const jsonStart = statusOutput.indexOf("{");
    const jsonEnd = statusOutput.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("No JSON object found in supabase status output");
    }
    status = JSON.parse(statusOutput.slice(jsonStart, jsonEnd + 1));
  } catch (err) {
    console.error(
      "ERROR: Failed to parse `supabase status` output:",
      err.message,
    );
    process.exit(1);
  }

  const apiUrl = status.API_URL || "http://127.0.0.1:54321";
  const anonKey = status.ANON_KEY;
  const serviceRoleKey = status.SERVICE_ROLE_KEY;

  // 2. Strict local-only guard
  try {
    const parsed = new URL(apiUrl);
    const isLocal =
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "localhost" ||
      parsed.hostname === "0.0.0.0";
    if (!isLocal) {
      console.error(
        `CRITICAL SECURITY VIOLATION: Refusing to run against non-local host: ${parsed.hostname}`,
      );
      process.exit(1);
    }
  } catch {
    console.error(`Invalid API URL: ${apiUrl}`);
    process.exit(1);
  }

  if (!serviceRoleKey || !anonKey) {
    console.error("ERROR: Missing local keys from supabase status.");
    process.exit(1);
  }

  console.log(`==> Local API URL verified: ${apiUrl}`);

  // 3. Admin Client Provisioning
  const adminClient = createClient(apiUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userList, error: listError } =
    await adminClient.auth.admin.listUsers();
  if (listError) {
    console.error("ERROR listing users:", listError.message);
    process.exit(1);
  }

  const existingAdmin = userList.users.find(
    (u) => u.email === SYNTHETIC_ADMIN_EMAIL,
  );

  let adminUserId = SYNTHETIC_ADMIN_ID;

  if (existingAdmin) {
    adminUserId = existingAdmin.id;
    console.log(
      `==> Found existing synthetic admin (${adminUserId}). Updating password & confirmation...`,
    );
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      adminUserId,
      {
        password: SYNTHETIC_ADMIN_PASSWORD,
        email_confirm: true,
      },
    );
    if (updateError) {
      console.error("ERROR updating synthetic admin:", updateError.message);
      process.exit(1);
    }
  } else {
    console.log(`==> Creating synthetic admin (${SYNTHETIC_ADMIN_ID})...`);
    const { data: newUser, error: createError } =
      await adminClient.auth.admin.createUser({
        id: SYNTHETIC_ADMIN_ID,
        email: SYNTHETIC_ADMIN_EMAIL,
        password: SYNTHETIC_ADMIN_PASSWORD,
        email_confirm: true,
      });
    if (createError) {
      console.error("ERROR creating synthetic admin:", createError.message);
      process.exit(1);
    }
    adminUserId = newUser.user.id;
  }

  // 4. Ensure allowlist membership in private.admin_users
  console.log("==> Ensuring private.admin_users allowlist entry...");
  try {
    execSync(
      `docker exec supabase_db_marie-medical-blog psql -U postgres -d postgres -c "INSERT INTO private.admin_users (user_id) VALUES ('${adminUserId}') ON CONFLICT (user_id) DO NOTHING;"`,
      { stdio: "ignore" },
    );
  } catch (err) {
    console.warn("Notice: Direct docker psql insert warning:", err.message);
  }

  // 5. Ensure profile exists in public.profiles
  console.log("==> Ensuring public.profiles entry...");
  try {
    execSync(
      `docker exec supabase_db_marie-medical-blog psql -U postgres -d postgres -c "INSERT INTO public.profiles (id, display_name) VALUES ('${adminUserId}', 'Synthetic Stage 6 Author') ON CONFLICT (id) DO NOTHING;"`,
      { stdio: "ignore" },
    );
  } catch (err) {
    console.warn("Notice: Direct docker psql insert warning:", err.message);
  }

  // 6. Test actual client authentication flow
  console.log("==> Testing client signInWithPassword authentication...");
  const publicClient = createClient(apiUrl, anonKey);
  const { data: sessionData, error: signInError } =
    await publicClient.auth.signInWithPassword({
      email: SYNTHETIC_ADMIN_EMAIL,
      password: SYNTHETIC_ADMIN_PASSWORD,
    });

  if (signInError || !sessionData.session) {
    console.error("ERROR: signInWithPassword failed:", signInError?.message);
    process.exit(1);
  }

  console.log("==> signInWithPassword succeeded.");

  // 7. Verify claims and RPC public.is_admin()
  const { data: claimsData, error: claimsError } =
    await publicClient.auth.getClaims();
  if (claimsError || !claimsData?.claims?.sub) {
    console.error(
      "ERROR: Failed to retrieve token claims or missing subject:",
      claimsError?.message,
    );
    process.exit(1);
  }

  const { data: isAdmin, error: rpcError } = await publicClient.rpc("is_admin");
  if (rpcError || isAdmin !== true) {
    console.error(
      "ERROR: public.is_admin() did not return true:",
      rpcError?.message || isAdmin,
    );
    process.exit(1);
  }

  console.log("==> public.is_admin() returned true.");
  console.log(
    "\n[SUCCESS] Local synthetic admin is provisioned and fully verified!",
  );
  console.log(`Email:    ${SYNTHETIC_ADMIN_EMAIL}`);
  console.log(`Password: ${SYNTHETIC_ADMIN_PASSWORD}`);
  console.log(`Target:   ${apiUrl}/admin\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
