import { Suspense } from "react";
import TripDetail from "./trip-detail";

export default function TripsPage() {
  return (
    <Suspense fallback={null}>
      <TripDetail />
    </Suspense>
  );
}
