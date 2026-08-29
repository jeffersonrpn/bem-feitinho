import {
  Box,
  Container,
  Typography,
} from "@mui/material";

import {
  calculators,
} from "@/domain/calculators";

import {
  CalculatorFlow,
} from "@/components/CalculatorFlow";

export default function Home() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 2, textAlign: "center" }}>
        <Typography
          component="h1"
          variant="brand"
        >
          bem-feitinho
        </Typography>
        <Typography
          component="h2"
          variant="subtitle1"
        >
          Valorize o preço do seu feito à mão
        </Typography>
      </Box>
      <CalculatorFlow calculators={calculators} />
    </Container >
  );
}
