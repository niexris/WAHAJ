"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setLoading(false);
      setError(
        error.status === 429
          ? "محاولات كثيرة. انتظر قليلًا ثم أعد المحاولة."
          : "البريد أو كلمة المرور غير صحيحة."
      );
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-navy-100 bg-white px-4 py-3 text-navy-800 outline-none focus:border-gold";
  const buttonClass =
    "mt-5 w-full rounded-lg bg-navy-800 py-3 font-bold text-white transition hover:bg-navy-700 disabled:opacity-50";

  return (
    <form onSubmit={signIn} className="mt-5">
      <label htmlFor="email" className="text-sm font-medium text-navy-600">
        البريد الإلكتروني المعتمد
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        dir="ltr"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputClass}
      />
      <label htmlFor="password" className="mt-4 block text-sm font-medium text-navy-600">
        كلمة المرور
      </label>
      <input
        id="password"
        type="password"
        required
        autoComplete="current-password"
        dir="ltr"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={inputClass}
      />
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={loading || !email || !password} className={buttonClass}>
        {loading ? "جارٍ الدخول..." : "تسجيل الدخول"}
      </button>
    </form>
  );
}