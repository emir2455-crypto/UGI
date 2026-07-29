import LoginForm from "./LoginForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-bg">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <span className="text-4xl mb-2">🚗</span>
          <h1 className="text-2xl font-bold text-amber tracking-tight">FleetView</h1>
          <p className="text-zinc-500 text-sm mt-1">Gestion de flotte de location</p>
        </div>
        <LoginForm next={searchParams.next} />
      </div>
    </div>
  );
}
