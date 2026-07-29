import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS } from "@/lib/constants";
import { formatDate, formatEUR } from "@/lib/format";
import { reservationTotal } from "@/lib/reservations";
import { createExpense, deleteExpense } from "@/app/actions/expenses";

export const dynamic = "force-dynamic";

export default async function FinancesPage() {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") redirect("/");

  const [vehicles, reservations, expenses] = await Promise.all([
    prisma.vehicle.findMany({ orderBy: { plate: "asc" } }),
    prisma.reservation.findMany({ where: { state: "ACTIVE" } }),
    prisma.expense.findMany({ include: { vehicle: true }, orderBy: { date: "desc" } }),
  ]);

  const marginByVehicle = vehicles.map((v) => {
    const revenue = reservations
      .filter((r) => r.vehicleId === v.id)
      .reduce((sum, r) => sum + reservationTotal(r.startDate, r.endDate, r.dailyRate), 0);
    const spent = expenses.filter((e) => e.vehicleId === v.id).reduce((sum, e) => sum + e.amount, 0);
    return { vehicle: v, revenue, spent, margin: revenue - spent };
  });

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold">Finances</h1>
        <div className="flex gap-2">
          <a href="/api/export/reservations" className="btn btn-secondary">
            ⬇ Export réservations CSV
          </a>
          <a href="/api/export/expenses" className="btn btn-secondary">
            ⬇ Export dépenses CSV
          </a>
        </div>
      </div>

      <section className="card">
        <p className="font-semibold mb-3">Marge nette par véhicule</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Véhicule</th>
                <th>Revenus</th>
                <th>Dépenses</th>
                <th>Marge nette</th>
              </tr>
            </thead>
            <tbody>
              {marginByVehicle.map(({ vehicle, revenue, spent, margin }) => (
                <tr key={vehicle.id}>
                  <td className="font-mono">{vehicle.plate}</td>
                  <td>{formatEUR(revenue)}</td>
                  <td>{formatEUR(spent)}</td>
                  <td className={margin >= 0 ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                    {formatEUR(margin)}
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-zinc-500">
                    Aucun véhicule.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card flex flex-col gap-3">
        <p className="font-semibold">Ajouter une dépense</p>
        <form action={createExpense} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="vehicleId">Véhicule</label>
            <select id="vehicleId" name="vehicleId" required>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate} — {v.brand} {v.model}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="category">Catégorie</label>
            <select id="category" name="category" required>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {EXPENSE_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date">Date</label>
            <input id="date" name="date" type="date" required />
          </div>
          <div>
            <label htmlFor="amount">Montant (€)</label>
            <input id="amount" name="amount" type="number" step="0.01" min="0" required />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description">Description (optionnel)</label>
            <input id="description" name="description" />
          </div>
          <button type="submit" className="btn btn-primary sm:col-span-2">
            + Ajouter la dépense
          </button>
        </form>
      </section>

      <section className="card">
        <p className="font-semibold mb-3">Dépenses enregistrées</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Véhicule</th>
                <th>Catégorie</th>
                <th>Montant</th>
                <th>Description</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => {
                const del = deleteExpense.bind(null, e.id);
                return (
                  <tr key={e.id}>
                    <td>{formatDate(e.date)}</td>
                    <td className="font-mono">{e.vehicle.plate}</td>
                    <td>{EXPENSE_CATEGORY_LABELS[e.category as keyof typeof EXPENSE_CATEGORY_LABELS]}</td>
                    <td>{formatEUR(e.amount)}</td>
                    <td className="whitespace-normal">{e.description || "—"}</td>
                    <td>
                      <form action={del}>
                        <button className="text-xs text-red-400" type="submit">
                          Suppr.
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-zinc-500">
                    Aucune dépense enregistrée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
