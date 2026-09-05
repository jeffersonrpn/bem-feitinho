"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";

import { createAppTheme } from "@/theme";

export function AppThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={createAppTheme()}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
