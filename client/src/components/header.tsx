import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white px-6 py-5 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">TaskFlow workspace</p>
          <h1 className="text-xl font-semibold text-slate-900">
            Welcome back
          </h1>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
          TCC
        </div>
      </div>

      <nav className="mt-4 flex gap-4 border-t border-slate-100 pt-4 text-sm font-medium text-slate-600 md:hidden">
        <Link href="/">Dashboard</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/tasks">Tasks</Link>
      </nav>
    </header>
  );
}
