import { permanentRedirect } from "next/navigation";

export default async function LegacyProjectDetailPage({
  params,
}: {
  params: Promise<{ calculationId: string }>;
}) {
  const { calculationId } = await params;
  permanentRedirect(`/historico/${calculationId}`);
}
