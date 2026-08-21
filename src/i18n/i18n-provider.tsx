"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { en, id, type MessageKey } from "./messages";

export type Locale = "en" | "id";
type Variables = Record<string, string | number>;
type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, variables?: Variables) => string;
  translate: (text: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(message: string, variables?: Variables) {
  if (!variables) return message;
  return message.replace(/\{(\w+)\}/g, (match, key: string) => (key in variables ? String(variables[key]) : match));
}

export function translateMessage(locale: Locale, key: MessageKey, variables?: Variables) {
  return interpolate((locale === "id" ? id : en)[key], variables);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("sot-locale");
    const browserLocale = navigator.language.toLowerCase().startsWith("id") ? "id" : "en";
    const initialLocale = stored === "id" || stored === "en" ? stored : browserLocale;
    queueMicrotask(() => setLocaleState(initialLocale));
  }, []);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem("sot-locale", nextLocale);
    document.cookie = `sot-locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, variables) => translateMessage(locale, key, variables),
      translate: (text) => (text in en ? (locale === "id" ? id : en)[text as MessageKey] : text),
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}
