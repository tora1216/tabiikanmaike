"use client";
import { useSearchParams } from "next/navigation";
import { TripDetailClient } from "./[id]/client";

export default function TripDetail() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  return <TripDetailClient tripId={id} />;
}
