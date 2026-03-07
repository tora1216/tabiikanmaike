import { initialTrips } from "@/lib/trips";
import { TripDetailClient } from "./client";

export function generateStaticParams() {
  return initialTrips.map((trip) => ({
    id: trip.id,
  }));
}

type TripPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TripDetailPage({ params }: TripPageProps) {
  const { id } = await params;
  return <TripDetailClient tripId={id} />;
}

