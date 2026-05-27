"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAdmin } from "@/app/actions/auth";
import {
  LayoutDashboard,
  Home,
  Sparkles,
  MessageSquare,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  User,
  Megaphone,
  HelpCircle,
  Users,
} from "lucide-react";

interface AdminSidebarProps {
  username: string;
  role?: string;
}

export default function AdminSidebar({ username, role = "TENANT_ADMIN" }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    // Super Admin menu items
    { label: "Clientes", href: "/admin/clientes", icon: Users, role: "SUPER_ADMIN" },
    
    // Tenant Admin menu items
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard, role: "TENANT_ADMIN" },
    { label: "Imóveis", href: "/admin/imoveis", icon: Home, role: "TENANT_ADMIN" },
    { label: "Comodidades", href: "/admin/comodidades", icon: Sparkles, role: "TENANT_ADMIN" },
    { label: "Banners Promocionais", href: "/admin/banners", icon: Megaphone, role: "TENANT_ADMIN" },
    { label: "Perguntas Frequentes", href: "/admin/faqs", icon: HelpCircle, role: "TENANT_ADMIN" },
    { label: "Leads / Contatos", href: "/admin/leads", icon: MessageSquare, role: "TENANT_ADMIN" },
    { label: "Configurações", href: "/admin/configuracoes", icon: Settings, role: "TENANT_ADMIN" },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.role === "SUPER_ADMIN") return role === "SUPER_ADMIN";
    if (item.role === "TENANT_ADMIN") return role !== "SUPER_ADMIN";
    return true;
  });

  const handleLogout = async () => {
    if (confirm("Deseja realmente sair do painel administrativo?")) {
      await logoutAdmin();
      router.push("/admin/login");
      router.refresh();
    }
  };

  const navContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-display font-extrabold text-xl tracking-wide text-white">
            Tatuí
          </span>
          <span className="text-[9px] bg-luxury-gold/20 text-luxury-gold px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            {role === "SUPER_ADMIN" ? "SuperAdmin" : "Admin"}
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden text-slate-400 hover:text-white cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-luxury-bronze/30 flex items-center justify-center text-luxury-gold border border-luxury-gold/30">
          <User size={16} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Conectado como
          </span>
          <span className="text-sm text-slate-200 font-bold truncate">
            {username}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          
          // Tratamento especial para rota ativa
          let isActive = false;
          if (item.href === "/admin") {
            isActive = pathname === "/admin";
          } else {
            isActive = pathname === item.href || pathname?.startsWith(item.href);
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-luxury-gold text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Actions */}
      <div className="p-4 border-t border-slate-800 space-y-1">
        {role !== "SUPER_ADMIN" && (
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition-colors hover:bg-slate-800/50"
          >
            <ExternalLink size={16} />
            Visualizar Site
          </a>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          Sair do Painel
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 z-30 border-r border-slate-800 bg-slate-900">
        {navContent}
      </aside>

      {/* Header Mobile */}
      <header className="md:hidden fixed top-0 left-0 w-full z-30 h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between text-white">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-display font-extrabold text-lg tracking-wide text-white">
            Tatuí
          </span>
          <span className="text-[9px] bg-luxury-gold/20 text-luxury-gold px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            {role === "SUPER_ADMIN" ? "SuperAdmin" : "Admin"}
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-slate-400 hover:text-white focus:outline-none cursor-pointer"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Drawer */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 focus:outline-none">
            {navContent}
          </div>
        </div>
      )}

      {/* Spacer para Layout Mobile */}
      <div className="md:hidden h-16" />
    </>
  );
}
