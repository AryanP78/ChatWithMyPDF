import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  BrainCircuit,
  LayoutDashboard,
  FileText,
  BookOpen,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../Context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/flashcards", label: "Flashcards", icon: BookOpen },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-200 ${
    isActive
      ? "bg-emerald-50 text-emerald-600"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
  }`;

const Header = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-200">
            <BrainCircuit size={22} className="text-white" strokeWidth={2} />
          </div>
          <span className="text-lg font-semibold tracking-tight text-gray-900">
            AskMyPDF
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Desktop user + logout */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-gray-50"
            title="Profile"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-semibold text-white">
              {initial}
            </div>
            <span className="max-w-[120px] truncate text-sm font-medium text-gray-700">
              {user?.name}
            </span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={linkClass}
                onClick={() => setMenuOpen(false)}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
            <button
              onClick={logout}
              className="mt-2 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
