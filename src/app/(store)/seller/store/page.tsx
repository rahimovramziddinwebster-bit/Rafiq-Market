import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StoreSettingsForm, StoreSettingsTitle } from "./store-settings-form";

export const metadata = { title: "Store Settings" };

export default async function StoreSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const userId = (session.user as { id: string }).id;
  const store = await prisma.store.findUnique({ where: { ownerId: userId } });
  if (!store) redirect("/auth/register");

  return (
    <div>
      <StoreSettingsTitle />
      <StoreSettingsForm store={store} />
    </div>
  );
}
