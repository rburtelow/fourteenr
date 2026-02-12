import { getAllPeaksWithRouteCounts } from "@/lib/peaks";
import PeaksClient from "./PeaksClient";

export const revalidate = 3600; // Revalidate every hour

export default async function PeaksPage() {
  const peaks = await getAllPeaksWithRouteCounts();

  return <PeaksClient peaks={peaks} />;
}
