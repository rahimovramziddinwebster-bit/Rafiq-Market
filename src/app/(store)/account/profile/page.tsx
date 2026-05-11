import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileForm, ProfileTitle } from "./profile-form";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  return (
    <div>
      <ProfileTitle />
      <ProfileForm user={session.user as { name?: string | null; email?: string | null; image?: string | null; id?: string }} />
    </div>
  );
}
