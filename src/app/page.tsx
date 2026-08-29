import Image from "next/image";
import styles from "./page.module.css";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function Home() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="brand"
              color="primary.dark"
            >
              bem-feitinho ✨
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Valorize o preço do seu feito à mão
            </Typography>
          </Box>

          <Card>
            <CardContent>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="h5">
                    Calculadora de tatuagem
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Vamos descobrir um preço
                    justo para o seu trabalho.
                  </Typography>
                </Box>

                <TextField
                  label="Tamanho"
                  placeholder="Ex.: 12"
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      step: 0.5,
                    },
                  }}
                  helperText="Tamanho estimado em centímetros"
                />

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                >
                  Calcular preço
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
