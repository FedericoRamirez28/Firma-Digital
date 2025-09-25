// app/login/page.tsx
"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <section className="w-full max-w-sm rounded-2xl border p-6 grid gap-3">
        <h1 className="text-xl font-semibold">Iniciar sesión</h1>
        <input
          className="border rounded px-3 py-2"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="bg-indigo-600 text-white rounded px-4 py-2"
          onClick={() =>
            signIn("credentials", { email, password, callbackUrl: "/post-login" })
          }
        >
          Ingresar
        </button>
      </section>
    </main>
  );
}
