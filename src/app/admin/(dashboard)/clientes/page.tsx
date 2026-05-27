import { getTenants } from "@/app/actions/tenant";
import { getBillingOverview, getInvoices } from "@/app/actions/billing";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import TenantsManagerClient from "@/components/admin/TenantsManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminTenantsPage() {
  const session = await getSession();
  
  // Apenas Super Admins podem acessar essa página
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const [tenants, billingOverview, invoices] = await Promise.all([
    getTenants(),
    getBillingOverview(),
    getInvoices(),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display font-extrabold text-3xl text-slate-900">
          Clientes & Assinaturas (White-Label)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gerencie os hotéis e pousadas cadastrados na plataforma, configure mensalidades, faturamento e controle o status de acesso.
        </p>
      </div>

      <TenantsManagerClient 
        initialTenants={tenants} 
        billingOverview={billingOverview}
        initialInvoices={invoices}
      />
    </div>
  );
}
