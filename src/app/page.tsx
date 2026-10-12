import {
  Box,
  Container,
  Typography,
} from "@mui/material";

import { calculators } from "@/domain/calculators";
import { CalculatorFlow } from "@/components/CalculatorFlow";

export default function Home() {
  return (
    <Container maxWidth="sm">
      <Box className="home-intro" sx={{ textAlign: "center" }}>
        <span className="home-kicker">feito com carinho</span>
        <Typography component="h1" variant="brand">
          bem-feitinho
        </Typography>
        <Typography component="p" variant="subtitle1" sx={{ mt: 0.75 }}>
          Valorize o preço do seu feito à mão.
        </Typography>
      </Box>
      <CalculatorFlow calculators={calculators} />
    </Container>
  );
}
