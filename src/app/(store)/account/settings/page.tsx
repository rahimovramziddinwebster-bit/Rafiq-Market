"use client";

import { useLanguageStore, type Locale } from "@/store/language";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const languages: { locale: Locale; flag: string; native: string }[] = [
  { locale: "uz", flag: "🇺🇿", native: "O'zbek" },
  { locale: "ru", flag: "🇷🇺", native: "Русский" },
];

export default function SettingsPage() {
  const { locale, setLocale } = useLanguageStore();
  const t = useT();

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
    toast.success(t.settings.saved);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{t.settings.title}</h1>

      <div className="border rounded-xl p-6">
        <div className="flex items-start gap-3 mb-5">
          <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div>
            <h2 className="font-semibold">{t.settings.language}</h2>
            <p className="text-sm text-muted-foreground">{t.settings.languageDescription}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {languages.map(({ locale: loc, flag, native }) => {
            const label = loc === "uz" ? t.settings.uzbek : t.settings.russian;
            const isActive = locale === loc;
            return (
              <button
                key={loc}
                onClick={() => handleLanguageChange(loc)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer text-left",
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-accent"
                )}
              >
                <span className="text-3xl">{flag}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs text-muted-foreground">{native}</div>
                </div>
                {isActive && <Check className="w-4 h-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
