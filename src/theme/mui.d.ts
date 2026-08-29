import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface TypographyVariants {
    brand: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    brand?: React.CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    brand: true;
  }
}
