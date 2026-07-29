"use client";

import { useFormState, useFormStatus } from "react-dom";
import { changePasswordAction } from "@/app/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Enregistrement..." : "Changer le mot de passe"}
    </button>
  );
}

export default function ChangePasswordForm() {
  const [state, formAction] = useFormState(changePasswordAction, undefined);

  return (
    <form action={formAction} className="card flex flex-col gap-4 max-w-sm">
      <div>
        <label htmlFor="currentPassword">Mot de passe actuel</label>
        <input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" />
      </div>
      <div>
        <label htmlFor="newPassword">Nouveau mot de passe</label>
        <input id="newPassword" name="newPassword" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      <div>
        <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</label>
        <input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}
      {state?.success && <p className="text-emerald-400 text-sm">Mot de passe changé avec succès.</p>}
      <SubmitButton />
    </form>
  );
}
