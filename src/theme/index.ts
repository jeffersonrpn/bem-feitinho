import { createTheme } from "@mui/material/styles";

import { palette } from "./palette";
import { typography } from "./typography";

export const createAppTheme = (
  bonbonFontFamily: string,
) =>
  createTheme({
    palette,

    typography: typography(
      "var(--font-bonbon)",
      "var(--font-nunito)",
    ),

    shape: {
      borderRadius: 16,
    },

    spacing: 8,

    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },

        styleOverrides: {
          root: {
            minHeight: 48,
            borderRadius: 14,
            paddingInline: 20,
          },
        },
      },

      MuiCard: {
        defaultProps: {
          elevation: 0,
        },

        styleOverrides: {
          root: {
            borderRadius: 20,
            border: "1px solid #EDE3DE",
          },
        },
      },

      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },

        styleOverrides: {
          rounded: {
            borderRadius: 20,
          },
        },
      },

      MuiTextField: {
        defaultProps: {
          variant: "outlined",
          fullWidth: true,
        },

        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 14,
              backgroundColor: "#FFFFFF",
            },
          },
        },
      },

      MuiInputBase: {
        styleOverrides: {
          input: {
            fontSize: "1rem",
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            fontWeight: 700,
          },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: "#EDE3DE",
          },
        },
      },
    },
  });
