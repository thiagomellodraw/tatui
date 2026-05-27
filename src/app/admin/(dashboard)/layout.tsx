import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Se não estiver logado, redireciona para a página de login
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* Sidebar Component */}
      <AdminSidebar username={session.username} role={session.role} />

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
