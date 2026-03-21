"use client";

import type { UserProfile, ChatMessage, Theme, Locale } from "@/types";

const PROFILE_KEY = "verdant_profile";
const MESSAGES_KEY = "verdant_messages";

export function saveProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveMessages(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

export function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(MESSAGES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}

export function clearAll(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(MESSAGES_KEY);
}

export function getDemoProfile(): UserProfile {
  return {
    id: "demo-001",
    name: "Maya",
    language: "en",
    theme: "dark",
    literacyLevel: "intermediate",
    sustainabilityPriority: "medium",
    income: { monthlyNet: 4200, type: "salary" },
    expenses: [
      { id: "e1", name: "Rent", monthlyEstimate: 1400, isFixed: true },
      { id: "e2", name: "Groceries", monthlyEstimate: 380, isFixed: false },
      { id: "e3", name: "Dining & Takeout", monthlyEstimate: 260, isFixed: false },
      { id: "e4", name: "Transport", monthlyEstimate: 150, isFixed: true },
      { id: "e5", name: "Subscriptions", monthlyEstimate: 85, isFixed: true },
      { id: "e6", name: "Clothing", monthlyEstimate: 120, isFixed: false },
      { id: "e7", name: "Entertainment", monthlyEstimate: 90, isFixed: false },
    ],
    goals: [
      {
        id: "g1",
        name: "Down Payment",
        targetAmount: 10000,
        currentAmount: 2800,
        targetDate: "2026-12-01",
        priority: "high",
      },
      {
        id: "g2",
        name: "Emergency Fund",
        targetAmount: 5000,
        currentAmount: 1200,
        targetDate: "2026-09-01",
        priority: "high",
      },
    ],
    createdAt: new Date().toISOString(),
  };
}
