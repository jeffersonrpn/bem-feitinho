"use client";

import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteCalculation } from "@/app/actions/history";

type DeleteCalculationButtonProps = {
  calculationId: string;
  projectName: string;
};

export function DeleteCalculationButton({
  calculationId,
  projectName,
}: DeleteCalculationButtonProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(undefined);
    startTransition(async () => {
      try {
        await deleteCalculation(calculationId);
        setIsDialogOpen(false);
        router.refresh();
      } catch {
        setError("Não foi possível remover o projeto. Tente novamente.");
      }
    });
  }

  return (
    <>
      <Tooltip title={`Remover ${projectName} do histórico`}>
        <IconButton
          aria-label={`Remover ${projectName} do histórico`}
          color="error"
          size="small"
          disabled={isPending}
          onClick={() => {
            setError(undefined);
            setIsDialogOpen(true);
          }}
        >
          <DeleteOutlineRoundedIcon />
        </IconButton>
      </Tooltip>

      <Dialog
        open={isDialogOpen}
        onClose={() => {
          if (!isPending) setIsDialogOpen(false);
        }}
        aria-labelledby="delete-calculation-title"
        aria-describedby="delete-calculation-description"
      >
        <DialogTitle id="delete-calculation-title">
          Remover projeto?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-calculation-description">
            “{projectName}” será removido permanentemente do seu histórico.
          </DialogContentText>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDialogOpen(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            color="error"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Removendo..." : "Remover"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
