import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import SignOutButton from "./components/SignOutButton";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-950">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white">Hello World</h1>
        {session ? (
          <p className="mt-3 text-lg text-gray-300">
            Logado como{" "}
            <span className="font-semibold text-white">
              {session.user.email || session.user.name}
            </span>
          </p>
        ) : (
          <p className="mt-3 text-lg text-gray-400">Você não está logado.</p>
        )}
      </div>

      {session ? (
        <SignOutButton />
      ) : (
        <Link
          href="/login"
          className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow transition hover:bg-gray-100"
        >
          Fazer login
        </Link>
      )}
    </main>
  );
}
