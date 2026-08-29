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
  });
