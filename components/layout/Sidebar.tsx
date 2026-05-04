"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const navItems = [
  {
    href: "/patients",
    label: "Patients",
    icon: (
      <svg fill="currentColor" className="w-4 h-4" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0m8 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-4.07 11q.07-.49.07-1a6.97 6.97 0 0 0-1.5-4.33A5 5 0 0 1 19 16v1zM6 11a5 5 0 0 1 5 5v1H1v-1a5 5 0 0 1 5-5" />
      </svg>
    ),
  },
  {
    href: "/drugs",
    label: "Drug checker",
    icon: (
      <svg fill="currentColor" className="w-4 h-4" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M17.707 9.293a1 1 0 0 1 0 1.414l-7 7a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 10V5a3 3 0 0 1 3-3h5c.256 0 .512.098.707.293zM5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  console.log("🚀 ~ Sidebar ~ user:", user);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-teal-600 rounded-md flex items-center justify-center">
            <svg fill="none" className="w-3.5 h-3.5" viewBox="0 0 18 18">
              <path
                stroke="#fff"
                strokeLinecap="round"
                strokeWidth="2.5"
                d="M9 2v14M2 9h14"
              />
              <circle cx="9" cy="9" r="3.5" stroke="#fff" strokeWidth="1.5" />
            </svg>
          </div>
          <span className="text-gray-100 font-medium tracking-tight">
            MediDash
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-xs text-gray-600 uppercase tracking-widest px-2 mb-2">
          Clinical
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-teal-950 text-teal-300"
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
              }`}
            >
              <span className={isActive ? "text-teal-400" : "text-gray-600"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="px-2 py-2 mb-1">
          <p className="text-lg font-medium text-gray-300 truncate">
            {user?.full_name}
          </p>
          <p className="text-xs font-medium text-gray-300 truncate">
            {user?.email}
          </p>
          <p className="text-xs text-gray-600 capitalize mt-0.5">
            {user?.role}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-300 hover:bg-gray-800 transition-colors"
        >
          <svg fill="currentColor" className="w-4 h-4" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm10.293 9.293a1 1 0 0 0 1.414 1.414l3-3a1 1 0 0 0 0-1.414l-3-3a1 1 0 1 0-1.414 1.414L14.586 9H7a1 1 0 1 0 0 2h7.586z"
              clipRule="evenodd"
            />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}
