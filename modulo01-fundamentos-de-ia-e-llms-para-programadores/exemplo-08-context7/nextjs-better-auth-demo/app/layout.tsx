import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Demo — Better Auth + GitHub",
  description: "Demo Next.js com Better Auth e GitHub OAuth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
