import { redirect } from "next/navigation";

export default function MockDraftRedirectPage() {
  redirect("/draft-room/mock-draft");
}
