"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initialTrips, type Trip } from "@/lib/trips";

type TripContextValue = {
  trips: Trip[];
  addTrip: (trip: Omit<Trip, "id">) => Trip;
  removeTrip: (id: string) => void;
  updateTrip: (id: string, updater: (trip: Trip) => Trip) => void;
};

const TripContext = createContext<TripContextValue | undefined>(undefined);

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(() => {
    return initialTrips;
  });

  // useEffect(() => {
  //   try {
  //     window.localStorage.setItem("trips", JSON.stringify(trips));
  //   } catch {
  //     // ignore write errors
  //   }
  // }, [trips]);

  const value = useMemo<TripContextValue>(
    () => ({
      trips,
      addTrip: (tripWithoutId) => {
        const id = `trip-${Date.now()}`;
        const newTrip: Trip = { ...tripWithoutId, id };
        setTrips((prev) => [...prev, newTrip]);
        return newTrip;
      },
      removeTrip: (id) => {
        setTrips((prev) => prev.filter((trip) => trip.id !== id));
      },
      updateTrip: (id, updater) => {
        setTrips((prev) =>
          prev.map((trip) => (trip.id === id ? updater(trip) : trip)),
        );
      },
    }),
    [trips],
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrips() {
  const ctx = useContext(TripContext);
  if (!ctx) {
    throw new Error("useTrips must be used within TripProvider");
  }
  return ctx;
}

