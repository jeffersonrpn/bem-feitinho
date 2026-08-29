import type { PaletteOptions } from "@mui/material/styles";

export const palette: PaletteOptions = {
  mode: "light",

  primary: {
    main: "#D99AA6",
    light: "#E8B8C1",
    dark: "#B97886",
    contrastText: "#FFFFFF",
  },

  secondary: {
    main: "#A8C9B7",
    light: "#C8DED2",
    dark: "#7FAF96",
    contrastText: "#3F5147",
  },

  background: {
    default: "#FFF9F5",
    paper: "#FFFFFF",
  },

  text: {
    primary: "#4D4543",
    secondary: "#786F6C",
    disabled: "#AAA19E",
  },

  error: {
    main: "#D97878",
    light: "#ECA4A4",
    dark: "#B85C5C",
  },

  warning: {
    main: "#E8C47A",
    light: "#F1D99F",
    dark: "#C9A45A",
  },

  success: {
    main: "#8FB89F",
    light: "#B7D2BF",
    dark: "#668F75",
  },

  divider: "#EDE3DE",
};
