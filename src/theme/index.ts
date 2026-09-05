import { createTheme } from "@mui/material/styles";

import { palette } from "./palette";
import { typography } from "./typography";

export const createAppTheme = () =>
  createTheme({
    palette,
    typography: typography(
      "var(--font-bonbon)",
      "var(--font-nunito)",
    ),
  });
