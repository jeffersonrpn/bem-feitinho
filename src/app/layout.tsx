import type { Metadata } from "next";
import { Bonbon, Nunito } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

import { AppHeader } from "@/components/AppHeader/AppHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { AppThemeProvider } from "./theme-provider";
import "./globals.css";

const bonbon = Bonbon({
  variable: "--font-bonbon",
  weight: "400",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "bem feitinho",
  description: "Valorize o preço do seu feito à mão",
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log(user);
  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  const displayName =
    typeof metadata?.name === "string"
      ? metadata.name
      : undefined;
  const avatarUrl =
    typeof metadata?.avatar_url === "string"
      ? metadata.avatar_url
      : undefined;

  return (
    <html lang="pt-BR"
      className={`${bonbon.variable} ${nunito.variable}`}>
      <body suppressHydrationWarning>
        <AppRouterCacheProvider>
          <AppThemeProvider>
            <AppHeader
              displayName={displayName}
              avatarUrl={avatarUrl}
              isAuthenticated={Boolean(user)}
            />
            {children}
          </AppThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
