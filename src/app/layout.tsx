import type { Metadata } from "next";
import { Bonbon, Nunito } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

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

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR"
      className={`${bonbon.variable} ${nunito.variable}`}>
      <body>
        <AppRouterCacheProvider>
          <AppThemeProvider
            bonbonFontFamily="var(--font-bonbon)"
          >
            {children}
          </AppThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
