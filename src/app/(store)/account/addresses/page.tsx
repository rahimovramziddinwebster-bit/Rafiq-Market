import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AddressManager, AddressesTitle } from "./address-manager";

export const metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const userId = (session.user as { id: string }).id;
  const addresses = await prisma.address.findMany({ where: { userId } });

  return (
    <div>
      <AddressesTitle />
      <AddressManager addresses={addresses} />
    </div>
  );
}
