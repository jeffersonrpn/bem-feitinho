import { TypographyVariantsOptions } from "@mui/material/styles";

export const typography = (
  bonbonFontFamily: string,
  nunitoFontFamily: string,
): TypographyVariantsOptions => ({
  fontFamily: [
    nunitoFontFamily,
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    '"Segoe UI"',
    "sans-serif",
  ].join(","),

  // Custom brand typography.
  brand: {
    fontFamily: bonbonFontFamily,
    fontSize: "2.5rem",
    fontWeight: 400,
    lineHeight: 1,
  },
  h1: {
    fontSize: "2rem",
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: "-0.02em",
  },

  h2: {
    fontSize: "1.75rem",
    fontWeight: 800,
    lineHeight: 1.25,
    letterSpacing: "-0.02em",
  },

  h3: {
    fontSize: "1.5rem",
    fontWeight: 800,
    lineHeight: 1.3,
  },

  h4: {
    fontSize: "1.25rem",
    fontWeight: 700,
    lineHeight: 1.35,
  },

  h5: {
    fontSize: "1.125rem",
    fontWeight: 700,
    lineHeight: 1.4,
  },

  h6: {
    fontSize: "1rem",
    fontWeight: 700,
    lineHeight: 1.4,
  },

  body1: {
    fontSize: "1rem",
    lineHeight: 1.6,
  },

  body2: {
    fontSize: "0.875rem",
    lineHeight: 1.5,
  },

  button: {
    fontWeight: 700,
    textTransform: "none",
  },
});
