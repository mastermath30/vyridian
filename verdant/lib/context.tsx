"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { UserProfile, ChatMessage, Theme } from "@/types";
import { saveProfile, loadProfile, saveMessages, loadMessages, clearAll } from "./store";

interface AppContextValue {
  profile: UserProfile | null;
  setProfile: (p: UserProfile) => void;
  clearProfile: () => void;
  messages: ChatMessage[];
  addMessage: (m: ChatMessage) => void;
  clearMessages: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  isOnboarded: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const saved = loadProfile();
    if (saved) {
      setProfileState(saved);
      setThemeState(saved.theme);
    }
    setMessages(loadMessages());
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p);
    saveProfile(p);
    setThemeState(p.theme);
    document.documentElement.setAttribute("data-theme", p.theme);
  }, []);

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t);
      document.documentElement.setAttribute("data-theme", t);
      if (profile) {
        const updated = { ...profile, theme: t };
        setProfileState(updated);
        saveProfile(updated);
      }
    },
    [profile]
  );

  const addMessage = useCallback((m: ChatMessage) => {
    setMessages((prev) => {
      const next = [...prev, m];
      saveMessages(next);
      return next;
    });
  }, []);

  const clearProfile = useCallback(() => {
    setProfileState(null);
    clearAll();
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    saveMessages([]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        clearProfile,
        messages,
        addMessage,
        clearMessages,
        theme,
        setTheme,
        // isOnboarded requires real user data: income > 0, at least one expense, at least one goal
        isOnboarded: profile !== null &&
          profile.income.monthlyNet > 0 &&
          profile.expenses.length > 0 &&
          profile.goals.length > 0,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
