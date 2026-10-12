import { createTheme } from "@mui/material/styles";

import { palette } from "./palette";
import { typography } from "./typography";

export const createAppTheme = () =>
  createTheme({
    palette,
    shape: { borderRadius: 18 },
    typography: typography(
      "var(--font-bonbon)",
      "var(--font-nunito)",
    ),
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          "::selection": {
            backgroundColor: "#F4D778",
            color: "#493B31",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            color: "#FFFDF5",
            backgroundColor: "#138B70",
            borderBottom: "3px solid #08664F",
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            minHeight: 68,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
          rounded: {
            borderRadius: 22,
          },
          elevation1: {
            border: "2px solid #E7DCC4",
            boxShadow: "0 4px 0 #E7DCC4",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            overflow: "hidden",
            border: "2px solid #E7DCC4",
            borderRadius: 24,
            backgroundColor: "#FFFCF2",
            boxShadow: "0 5px 0 #E7DCC4",
            transition: "transform 140ms ease, box-shadow 140ms ease",
          },
        },
      },
      MuiCardActionArea: {
        styleOverrides: {
          root: {
            "&:hover": { backgroundColor: "rgba(19, 139, 112, 0.045)" },
            "&:active": { transform: "translateY(2px)" },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            minHeight: 46,
            paddingInline: 20,
            borderRadius: 16,
            borderWidth: 2,
            fontWeight: 800,
            transition: "transform 120ms ease, box-shadow 120ms ease",
            "&:active": { transform: "translateY(2px)" },
          },
          contained: {
            boxShadow: "0 3px 0 rgba(8, 102, 79, 0.22)",
            "&:hover": { boxShadow: "0 4px 0 rgba(8, 102, 79, 0.22)" },
            "&:active": { boxShadow: "none" },
          },
          outlined: {
            boxShadow: "none",
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 15,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: "#FFFEF9",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#DCCFB5",
              borderWidth: 2,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#52B69A",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#138B70",
              borderWidth: 2,
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: { fontWeight: 700 },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            border: "2px solid currentColor",
            borderRadius: 16,
            fontWeight: 700,
          },
          standardSuccess: {
            backgroundColor: "#E6F1DC",
            color: "#397644",
          },
          standardInfo: {
            backgroundColor: "#EEE9F8",
            color: "#665395",
          },
        },
      },
      MuiMobileStepper: {
        styleOverrides: {
          root: {
            backgroundColor: "transparent",
            paddingTop: 16,
            paddingBottom: 16,
          },
          dot: {
            width: 10,
            height: 10,
            backgroundColor: "#DCCFB5",
          },
          dotActive: {
            width: 26,
            borderRadius: 8,
            backgroundColor: "#138B70",
          },
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            height: 64,
            backgroundColor: "#FFFCF2",
            border: "2px solid #E7DCC4",
            borderRadius: 22,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            border: "2px solid #E7DCC4",
            borderRadius: 18,
            boxShadow: "0 5px 0 #E7DCC4",
          },
        },
      },
    },
  });
