import { prisma } from "@/lib/prisma";
import { IntakeForm } from "@/components/intake/IntakeForm";
import { TRADES } from "@/lib/constants";

export default async function IntakePage({ params }: { params: { slug: string } }) {
  const business = await prisma.business.findUnique({ where: { slug: params.slug } });

  if (!business) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Link not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          This booking link doesn&rsquo;t match a business. Double-check the link you were given.
        </p>
      </div>
    );
  }

  const tradeLabel = TRADES.find((t) => t.value === business.trade)?.label ?? business.trade;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Request a quote from {business.name}</h1>
      <p className="mt-1 text-sm text-slate-600">
        {tradeLabel}
        {business.serviceArea ? ` · ${business.serviceArea}` : ""}
      </p>
      <div className="mt-6">
        <IntakeForm slug={business.slug} />
      </div>
    </div>
  );
}
