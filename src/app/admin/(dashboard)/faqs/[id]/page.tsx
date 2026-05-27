import { db } from "@/lib/db";
import FaqForm from "@/components/admin/FaqForm";
import { notFound } from "next/navigation";

interface EditFaqPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export const dynamic = "force-dynamic";

export default async function AdminEditFaqPage({ params }: EditFaqPageProps) {
  const resolvedParams = await params;
  const faq = await db.fAQ.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!faq) {
    notFound();
  }

  return (
    <div className="py-6">
      <FaqForm initialFaq={faq} />
    </div>
  );
}
