import { ArenaWatcher } from '@/components/ArenaWatcher';
import { Providers } from "./Providers";
import React from "react";
import "./globals.css";

export const metadata = {
  icons: { icon: "https://jdppxfokfhqjudwfwckd.supabase.co/storage/v1/object/public/haas-academy/assignments/Melhorar%20Logo%20(3).png" },
  title: "Academia Haas",
  description: "Portal de Ensino Síncrono Avançado",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased">
        <Providers>{children}
        <ArenaWatcher /></Providers>
      </body>
    </html>
  );
}