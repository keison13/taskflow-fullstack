"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { logoutUser, type User } from "@/lib/api";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/tasks", label: "Tasks" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadUserFromStorage = () => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }
  };

  useEffect(() => {
    loadUserFromStorage();

    // Escuta alterações de storage e o evento customizado disparado no login/logout
    window.addEventListener("storage", loadUserFromStorage);
    window.addEventListener("auth-change", loadUserFromStorage);

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("storage", loadUserFromStorage);
      window.removeEventListener("auth-change", loadUserFromStorage);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleLogout() {
    logoutUser();
    setUser(null);
    setIsOpen(false);
    router.push("/login");
  }

  const userInitial = user?.name 
    ? user.name.charAt(0).toUpperCase() 
    : user?.email 
    ? user.email.charAt(0).toUpperCase() 
    : "U";

  return (
    <aside className="hidden min-h-screen w-64 flex-col border-r border-slate-200 bg-white p-6 md:flex justify-between">
      <div>
        <Link href="/" className="text-xl font-bold text-slate-900">
          TaskFlow
        </Link>

        <nav className="mt-8 space-y-2">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Rodapé da Sidebar: Perfil Dinâmico e Logout */}
      <div className="relative pt-4 border-t border-slate-100" ref={dropdownRef}>
        {isOpen && (
          <div className="absolute bottom-16 left-0 right-0 rounded-xl border border-slate-200 bg-white p-4 shadow-lg z-50">
            <p className="font-semibold text-slate-900 truncate">{user?.name || "Usuário"}</p>
            <p className="text-xs text-slate-500 truncate mb-3">{user?.email || "email@exemplo.com"}</p>
            <button
              onClick={handleLogout}
              className="w-full rounded-lg bg-red-50 py-2 text-center text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
            >
              Logout
            </button>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-900 truncate">{user?.name || "Minha Conta"}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || "Ver perfil"}</p>
          </div>
        </button>
      </div>
    </aside>
  );
}