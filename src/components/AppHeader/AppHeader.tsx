"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";

import { logoutAction } from "@/app/actions/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AppHeaderProps = {
  displayName?: string;
  avatarUrl?: string;
  isAuthenticated: boolean;
};

export function AppHeader({
  displayName,
  avatarUrl,
  isAuthenticated,
}: AppHeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const label = displayName || "Usuário";

  async function handleLogin() {
    setAnchorEl(null);

    const supabase = createSupabaseBrowserClient();
    const callbackUrl = new URL(
      "/auth/callback",
      window.location.origin,
    );
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString() },
    });
  }

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="brand" component="span">
          b
        </Typography>

        <Box>
          <IconButton
            aria-label={`Abrir menu de ${label}`}
            aria-controls={menuOpen ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? "true" : undefined}
            onClick={(event) => setAnchorEl(event.currentTarget)}
          >
            {isAuthenticated ? (
              <Avatar alt={displayName} src={avatarUrl} />
            ) : (
              <Avatar />
            )}
          </IconButton>
          <Menu
            id="account-menu"
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {isAuthenticated ? (
              <>
                <MenuItem disabled sx={{ opacity: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {label}
                  </Typography>
                </MenuItem>
                <MenuItem
                  component={Link}
                  href="/history"
                  onClick={() => setAnchorEl(null)}
                >
                  Histórico de projetos
                </MenuItem>
                <Box component="form" action={logoutAction}>
                  <MenuItem
                    component="button"
                    type="submit"
                    onClick={() => setAnchorEl(null)}
                    sx={{ width: "100%" }}
                  >
                    Sair
                  </MenuItem>
                </Box>
              </>
            ) : (
              <MenuItem
                component="button"
                type="button"
                onClick={() => void handleLogin()}
                sx={{ width: "100%" }}
              >
                Entrar com Google
              </MenuItem>
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export function GuestAccountIcon() {
  return <AccountCircleRoundedIcon color="disabled" />;
}
