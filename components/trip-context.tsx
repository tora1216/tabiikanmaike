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
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    try {
      const stored = localStorage.getItem("trips");
      if (stored) {
        const parsed = JSON.parse(stored) as Trip[];
        // Normalize icon field: replace old text-based icons with a default emoji
        const normalized = parsed.map((trip) => ({
          ...trip,
          days: trip.days.map((d) => ({
            ...d,
            icon: d.icon && d.icon.length <= 4 ? d.icon : "📍",
          })),
        }));
        setTrips(normalized);
      }
    } catch {
      // ignore read errors
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever trips change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("trips", JSON.stringify(trips));
    } catch {
      // ignore write errors
    }
  }, [trips, hydrated]);

  const value = useMemo<TripContextValue>(
    () => ({
      trips,
      addTrip: (tripWithoutId) => {
        const date = (tripWithoutId.startDate ?? "").replace(/-/g, "") || Date.now().toString();
        const rand = Math.random().toString(36).slice(2, 6);
        const id = `trip-${date}-${rand}`;
        const newTrip: Trip = { ...tripWithoutId, id };
        setTrips((prev) => [...prev, newTrip]);
        return newTrip;
      },
      removeTrip: (id) => {
        setTrips((prev) => prev.filter((trip) => trip.id !== id));
      },
      updateTrip: (id, updater) => {
        setTrips((prev) =>
          prev.map((trip) => (trip.id === id ? { ...updater(trip), updatedAt: new Date().toISOString() } : trip))
        );
      },
    }),
    [trips]
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
