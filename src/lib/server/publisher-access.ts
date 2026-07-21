import type { SupabaseClient, User } from "@supabase/supabase-js";

type PermissionRow = Record<string, unknown> | null | undefined;

const privilegedRoleNames = new Set([
  "admin",
  "administrator",
  "publisher",
  "editor",
  "newsroom",
  "super_admin",
  "superadmin",
]);

function normalized(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function truthy(value: unknown) {
  return value === true || value === 1 || normalized(value) === "true" || normalized(value) === "yes";
}

function roleValueAllows(value: unknown) {
  if (Array.isArray(value)) return value.some(roleValueAllows);
  return privilegedRoleNames.has(normalized(value));
}

function rowAllowsPublisherAccess(row: PermissionRow) {
  if (!row) return false;

  return Boolean(
    truthy(row.is_admin) ||
      truthy(row.can_access_publisher_tools) ||
      truthy(row.can_manage_content) ||
      truthy(row.can_publish) ||
      truthy(row.is_publisher) ||
      roleValueAllows(row.account_type) ||
      roleValueAllows(row.admin_role) ||
      roleValueAllows(row.role) ||
      roleValueAllows(row.roles)
  );
}

function metadataAllowsPublisherAccess(user: User) {
  const app = user.app_metadata || {};
  const meta = user.user_metadata || {};

  return Boolean(
    truthy(app.is_admin) ||
      truthy(app.is_publisher) ||
      truthy(meta.is_admin) ||
      truthy(meta.is_publisher) ||
      roleValueAllows(app.role) ||
      roleValueAllows(app.roles) ||
      roleValueAllows(meta.role) ||
      roleValueAllows(meta.roles) ||
      roleValueAllows(meta.account_type) ||
      roleValueAllows(meta.admin_role)
  );
}

async function fetchPermissionRows(
  supabase: SupabaseClient,
  table: "hgn_profiles" | "member_permissions",
  user: User
) {
  const rows: Record<string, unknown>[] = [];

  const byUser = await supabase.from(table).select("*").eq("user_id", user.id).limit(20);
  if (!byUser.error && byUser.data) rows.push(...byUser.data);

  const email = user.email?.trim();
  if (email) {
    const byEmail = await supabase.from(table).select("*").ilike("email", email).limit(20);
    if (!byEmail.error && byEmail.data) rows.push(...byEmail.data);
  }

  return rows;
}

export async function hasPublisherAccess(supabase: SupabaseClient, user: User) {
  if (metadataAllowsPublisherAccess(user)) return true;

  const [profiles, permissions] = await Promise.all([
    fetchPermissionRows(supabase, "hgn_profiles", user),
    fetchPermissionRows(supabase, "member_permissions", user),
  ]);

  return [...profiles, ...permissions].some(rowAllowsPublisherAccess);
}
