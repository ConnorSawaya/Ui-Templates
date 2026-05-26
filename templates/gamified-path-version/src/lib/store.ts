import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Scan, UserPreferences, FoodAnalysis } from "./types";
import { generateId } from "./utils";

interface AppState {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;

  user: { id: string; name: string; email: string } | null;
  setUser: (user: { id: string; name: string; email: string } | null) => void;

  scans: Scan[];
  addScan: (analysis: FoodAnalysis, imageUrl?: string) => void;
  removeScan: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getScan: (id: string) => Scan | undefined;

  preferences: UserPreferences;
  setPreferences: (prefs: Partial<UserPreferences>) => void;

  isLoading: boolean;
  setIsLoading: (val: boolean) => void;

  recentScans: string[];
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),

      user: null,
      setUser: (user) => set({ user }),

      scans: [],
      addScan: (analysis, imageUrl) => {
        const scan: Scan = {
          id: analysis.id,
          imageUrl,
          dishName: analysis.dishName,
          analysis,
          createdAt: analysis.createdAt,
          isFavorite: false,
        };
        set((s) => ({
          scans: [scan, ...s.scans],
          recentScans: [analysis.id, ...s.recentScans.filter((id) => id !== analysis.id)].slice(
            0,
            10
          ),
        }));
      },
      removeScan: (id) =>
        set((s) => ({ scans: s.scans.filter((sc) => sc.id !== id) })),
      toggleFavorite: (id) =>
        set((s) => ({
          scans: s.scans.map((sc) =>
            sc.id === id ? { ...sc, isFavorite: !sc.isFavorite } : sc
          ),
        })),
      getScan: (id) => get().scans.find((s) => s.id === id),

      preferences: {
        allergies: [],
        foodsToAvoid: [],
        dietType: "none",
        calorieGoal: 2000,
        proteinGoal: 50,
      },
      setPreferences: (prefs) =>
        set((s) => ({ preferences: { ...s.preferences, ...prefs } })),

      isLoading: false,
      setIsLoading: (val) => set({ isLoading: val }),

      recentScans: [],
    }),
    {
      name: "platevision-store",
      partialize: (state) => ({
        theme: state.theme,
        user: state.user,
        scans: state.scans,
        preferences: state.preferences,
        recentScans: state.recentScans,
      }),
    }
  )
);
