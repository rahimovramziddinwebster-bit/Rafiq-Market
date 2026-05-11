import { useLanguageStore } from "@/store/language";
import uz from "./uz.json";
import ru from "./ru.json";

const translations = { uz, ru };

export function useT() {
  const locale = useLanguageStore((s) => s.locale);
  return translations[locale];
}

export type Translations = typeof uz;
