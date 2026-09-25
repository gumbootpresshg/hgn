import { redirect } from "next/navigation";

export default function AnalyticsCommandRedirect() {
  redirect("/admin/analytics");
}
