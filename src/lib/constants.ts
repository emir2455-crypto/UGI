export const ROLES = ["ADMIN", "HELPER"] as const;
export type Role = (typeof ROLES)[number];

export const VEHICLE_TYPES = ["CITADINE", "UTILITAIRE"] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];
export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  CITADINE: "Citadine",
  UTILITAIRE: "Utilitaire",
};

export const VEHICLE_STATUSES = [
  "DISPONIBLE",
  "EN_LOCATION",
  "EN_PANNE",
  "EN_ENTRETIEN",
  "EN_ROUTE",
] as const;
export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];
export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  DISPONIBLE: "Disponible",
  EN_LOCATION: "En location",
  EN_PANNE: "En panne",
  EN_ENTRETIEN: "En entretien",
  EN_ROUTE: "En route vers un client",
};
export const VEHICLE_STATUS_COLORS: Record<VehicleStatus, string> = {
  DISPONIBLE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  EN_LOCATION: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  EN_PANNE: "bg-red-500/20 text-red-400 border-red-500/40",
  EN_ENTRETIEN: "bg-sky-500/20 text-sky-400 border-sky-500/40",
  EN_ROUTE: "bg-violet-500/20 text-violet-400 border-violet-500/40",
};

export const CHANNELS = ["GETAROUND", "TURO", "LEBONCOIN", "FACEBOOK", "DIRECT"] as const;
export type Channel = (typeof CHANNELS)[number];
export const CHANNEL_LABELS: Record<Channel, string> = {
  GETAROUND: "Getaround",
  TURO: "Turo",
  LEBONCOIN: "Leboncoin",
  FACEBOOK: "Facebook",
  DIRECT: "Direct",
};
export const CHANNEL_COLORS: Record<Channel, string> = {
  GETAROUND: "#22c55e",
  TURO: "#38bdf8",
  LEBONCOIN: "#f97316",
  FACEBOOK: "#6366f1",
  DIRECT: "#f59e0b",
};

export const DEPOSIT_METHODS = ["PRE_AUTH", "ESPECES", "VIREMENT"] as const;
export type DepositMethod = (typeof DEPOSIT_METHODS)[number];
export const DEPOSIT_METHOD_LABELS: Record<DepositMethod, string> = {
  PRE_AUTH: "Pré-autorisation carte",
  ESPECES: "Espèces",
  VIREMENT: "Virement",
};

export const RESERVATION_STATES = ["ACTIVE", "ANNULEE"] as const;
export type ReservationState = (typeof RESERVATION_STATES)[number];

export type ComputedReservationStatus = "A_VENIR" | "EN_COURS" | "TERMINEE" | "ANNULEE";
export const RESERVATION_STATUS_LABELS: Record<ComputedReservationStatus, string> = {
  A_VENIR: "À venir",
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
  ANNULEE: "Annulée",
};
export const RESERVATION_STATUS_COLORS: Record<ComputedReservationStatus, string> = {
  A_VENIR: "bg-sky-500/20 text-sky-400 border-sky-500/40",
  EN_COURS: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  TERMINEE: "bg-zinc-500/20 text-zinc-400 border-zinc-500/40",
  ANNULEE: "bg-red-500/20 text-red-400 border-red-500/40",
};

export const EXPENSE_CATEGORIES = ["ASSURANCE", "ENTRETIEN", "CARBURANT", "DIVERS"] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  ASSURANCE: "Assurance",
  ENTRETIEN: "Entretien",
  CARBURANT: "Carburant",
  DIVERS: "Divers",
};

export const ALERT_WINDOW_DAYS = 30;
