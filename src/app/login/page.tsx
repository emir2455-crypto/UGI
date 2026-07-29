import Image from "next/image";
import LoginForm from "./LoginForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <div className="min-h-screen flex bg-base-bg">
      <div className="hidden md:block md:w-1/2 lg:w-2/5 relative">
        <Image src="/character.jpg" alt="UGI RENT" fill className="object-cover" priority />
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <Image src="/logo.jpg" alt="UGI RENT" width={96} height={96} className="rounded-full mb-3" priority />
            <h1 className="text-2xl font-bold text-amber tracking-tight">UGI RENT</h1>
            <p className="text-zinc-500 text-sm mt-1">Gestion de flotte de location</p>
          </div>
          <LoginForm next={searchParams.next} />
        </div>
      </div>
    </div>
  );
}
