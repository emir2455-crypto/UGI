"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "@/app/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {pending ? "Connexion..." : "Se connecter"}
    </button>
  );
}

export default function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useFormState(loginAction, undefined);

  return (
    <form action={formAction} className="card flex flex-col gap-4">
      <input type="hidden" name="next" value={next || "/"} />
      <div>
        <label htmlFor="email">Adresse e-mail</label>
        <input id="email" name="email" type="email" required autoComplete="username" />
      </div>
      <div>
        <label htmlFor="password">Mot de passe</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
