import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Grade } from "../types";
import { SEED_USERS, SEED_GRADES, AVATAR_COLORS } from "../constants";

const USERS_KEY = "srp_users";
const GRADES_KEY = "srp_grades";
const CURRENT_KEY = "srp_current_user";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

interface AuthContextType {
  users: User[];
  grades: Grade[];
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  switchRole: (userId: string) => void;
  addUser: (u: Omit<User, "id" | "avatarColor"> & { avatarColor?: string }) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  deleteUser: (id: string) => void;
  saveGrade: (g: Omit<Grade, "id">) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => load(USERS_KEY, SEED_USERS));
  const [grades, setGrades] = useState<Grade[]>(() => load(GRADES_KEY, SEED_GRADES));
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    load<User | null>(CURRENT_KEY, null)
  );

  useEffect(() => localStorage.setItem(USERS_KEY, JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem(GRADES_KEY, JSON.stringify(grades)), [grades]);
  useEffect(() => localStorage.setItem(CURRENT_KEY, JSON.stringify(currentUser)), [currentUser]);

  // Persist initial seed on first ever run for demo access
  useEffect(() => {
    if (!localStorage.getItem("srp_seeded")) {
      localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
      localStorage.setItem(GRADES_KEY, JSON.stringify(SEED_GRADES));
      localStorage.setItem("srp_seeded", "true");
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) {
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  // Quick login switch (demo) - accepts a user id or an email
  const switchRole = (userKey: string) => {
    const found = users.find((u) => u.id === userKey || u.email === userKey);
    if (found) setCurrentUser(found);
  };

  const addUser = (u: Omit<User, "id" | "avatarColor"> & { avatarColor?: string }) => {
    const id = `u${Date.now()}`;
    setUsers((prev) => [
      ...prev,
      { ...u, id, avatarColor: u.avatarColor || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)] },
    ]);
  };

  const updateUser = (id: string, patch: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const saveGrade = (g: Omit<Grade, "id">) => {
    setGrades((prev) => {
      const existing = prev.find(
        (p) => p.studentId === g.studentId && p.subjectId === g.subjectId
      );
      if (existing) {
        return prev.map((p) =>
          p.id === existing.id ? { ...p, ...g } : p
        );
      }
      return [...prev, { ...g, id: `g${Date.now()}` }];
    });
  };

  return (
    <AuthContext.Provider
      value={{ users, grades, currentUser, login, logout, switchRole, addUser, updateUser, deleteUser, saveGrade }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}