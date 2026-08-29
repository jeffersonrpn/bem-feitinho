"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";

import { createAppTheme } from "@/theme";

type ThemeProviderProps = {
  children: React.ReactNode;
  bonbonFontFamily: string;
};

export function AppThemeProvider({
  children,
  bonbonFontFamily,
}: ThemeProviderProps) {
  return (
    <ThemeProvider theme={createAppTheme(bonbonFontFamily)}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
