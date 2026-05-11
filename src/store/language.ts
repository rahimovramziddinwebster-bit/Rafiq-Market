import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "uz" | "ru";

interface LanguageStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      locale: "uz",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "rafiq-language" }
  )
);
