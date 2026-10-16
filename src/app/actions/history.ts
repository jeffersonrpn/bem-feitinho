"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function deleteCalculation(calculationId: string) {
  if (!calculationId.trim()) {
    throw new Error("Projeto inválido.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Faça login para remover um projeto.");
  }

  const { data, error } = await supabase
    .from("calculations")
    .delete()
    .eq("id", calculationId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível remover o projeto.");
  }

  if (!data) {
    throw new Error("Projeto não encontrado.");
  }

  revalidatePath("/historico");
  revalidatePath(`/historico/${calculationId}`);
}
