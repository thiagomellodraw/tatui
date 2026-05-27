import { db } from "@/lib/db";
import BannerForm from "@/components/admin/BannerForm";
import { notFound } from "next/navigation";

interface EditBannerPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export const dynamic = "force-dynamic";

export default async function AdminEditBannerPage({ params }: EditBannerPageProps) {
  const resolvedParams = await params;
  const banner = await db.promoBanner.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!banner) {
    notFound();
  }

  return (
    <div className="py-6">
      <BannerForm initialBanner={banner} />
    </div>
  );
}
