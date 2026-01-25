"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { loginWithPassword } from "@/lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const user = await loginWithPassword(username, password);
      login(user);
      router.push("/home");
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-[420px] max-w-[90vw] aspect-square rounded-3xl bg-gray-100 focus:bg-gray-100 backdrop-blur-xl border border-white/70 ring-1 ring-black/5 shadow-[0_24px_80px_rgba(16,24,40,0.18)] px-8 pb-8 pt-[62px] space-y-6 page-enter">
        <div className="text-center space-y-2">
          <h1 className="text-2xl uppercase tracking-[0.35em] text-black">
            Friendly Closet
          </h1>
          <p className="text-sm text-[color:var(--muted)]">
            Curate your taste, share your finds.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 flex flex-col items-center mt-10"
          style={{ marginTop: "50px" }}
        >
          <div className="space-y-4 w-full flex flex-col items-center mb-6">
            <div>
              <label className="block text-center text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)] mb-2">
                Username
              </label>

              <input
                type="text"
                required
                className="w-full max-w-md mx-auto px-4 py-3 rounded-2xl
                          bg-gray-100 text-black
                          border border-black/10
                          outline-none
                          focus:bg-gray-100 focus:ring-2 focus:ring-[var(--accent)]
                          transition"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-center text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)] mb-2">
                Password
              </label>

              <input
                type="password"
                required
                className="w-full max-w-md mx-auto px-4 py-3 rounded-2xl
                          bg-gray-100 text-black
                          border border-black/10
                          outline-none
                          focus:bg-gray-100 focus:ring-2 focus:ring-[var(--accent)]
                          transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-center text-sm">{error}</p>}

          <button
            type="submit"
            className="mt-6 w-[60px] bg-[#f6c7d2] text-white py-3 rounded-2xl font-semibold hover:brightness-95 transition"
            style={{ marginTop: "18px", marginBottom: "18px" }}
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
