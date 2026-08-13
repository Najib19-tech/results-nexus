import React, { useState } from "react";
import { GraduationCap, Lock, UserRound, ChevronRight, Sparkles } from "lucide-react";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import Navbar from "./components/Navbar";
import AdminDashboard from "./components/AdminDashboard";
import TeacherGradebook from "./components/TeacherGradebook";
import StudentParentView from "./components/StudentParentView";
import { APP_NAME } from "./constants";
import { Role, User } from "./types";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const ROLE_HINTS: Record<string, string> = {
  "admin@school.edu": "admin123",
  teacher: "teacher123",
  student: "student123",
  parent: "parent123",
};

function RoleIcon({ role }: { role: Role }) {
  const size = "size-4";
  if (role === "admin") return <Sparkles className={size} />;
  if (role === "student") return <GraduationCap className={size} />;
  return <UserRound className={size} />;
}

function LoginScreen() {
  const { login, users, switchRole } = useAuth();
  const [email, setEmail] = useState("admin@school.edu");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!login(email, password)) {
      setError("Invalid email or password. Try a demo role below.");
    }
  };

  const demoLogin = (key: string) => {
    switchRole(key);
  };

  const demoAccounts: { label: string; key: string; role: Role }[] = [
    { label: "Admin", key: "admin@school.edu", role: "admin" },
    { label: "Teacher", key: "david@school.edu", role: "teacher" },
    { label: "Student", key: "amara@school.edu", role: "student" },
    { label: "Parent", key: "afia@school.edu", role: "parent" },
  ];

  return (
    <div className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-600/20" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 size-72 rounded-full bg-teal-300/30 blur-3xl dark:bg-teal-600/20" />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <GraduationCap className="size-6" />
          </div>
          <div className="leading-tight">
            <h1 className="text-xl font-bold tracking-tight">{APP_NAME}</h1>
            <p className="text-sm text-muted-foreground">Grades, in one central place.</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-zinc-900"
        >
          <h2 className="text-lg font-semibold">Sign in</h2>
          <p className="mb-5 mt-1 text-sm text-muted-foreground">
            Teachers manage scores; students and parents view results.
          </p>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@school.edu"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Sign in
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Quick demo access
            </p>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {demoAccounts.map((d) => {
              const u = users.find((x) => x.id === d.key || x.email === d.key);
              return (
                <button
                  key={d.key}
                  onClick={() => demoLogin(d.key)}
                  className="group flex flex-col items-center gap-2 rounded-xl border bg-white p-3 text-center transition-colors hover:bg-accent dark:bg-zinc-900"
                >
                  <Avatar className="size-9">
                    <AvatarFallback
                      style={{ backgroundColor: u?.avatarColor || "#0f766e", color: "#fff" }}
                    >
                      {initials(u?.name || d.label)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{d.label}</span>
                  <span className="text-[10px] text-muted-foreground">1-click login</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Shell() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <>
        <LoginScreen />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  const role = currentUser.role;

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950">
      <Toaster position="top-right" richColors />
      <Navbar />
      <main>
        {role === "admin" && <AdminDashboard />}
        {role === "teacher" && <TeacherGradebook />}
        {(role === "student" || role === "parent") && <StudentParentView />}
      </main>
      <footer className="mt-10 border-t bg-white py-6 dark:bg-zinc-900">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p>{APP_NAME} - a simple tool for sharing results with families.</p>
          <p>Admin demo · Teacher demo · Student & Parent views</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}

export default App;