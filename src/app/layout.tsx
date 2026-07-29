import type { Metadata } from "next";
import "./globals.css";
import { getSession } from "@/lib/auth";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "FleetView",
  description: "Gestion de flotte de location de véhicules",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();

  return (
    <html lang="fr">
      <body>
        {user ? (
          <div className="min-h-screen flex flex-col md:flex-row">
            <Nav user={user} />
            <main className="flex-1 min-w-0 p-3 pb-24 md:p-6 md:pb-6">{children}</main>
          </div>
        ) : (
          <main>{children}</main>
        )}
      </body>
    </html>
  );
}
