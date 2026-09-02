import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AdminBusinessesPage() {
  const businesses = await prisma.business.findMany({
    include: { user: true, _count: { select: { requests: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Businesses ({businesses.length})</h1>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Owner</th>
              <th className="px-4 py-2">Trade</th>
              <th className="px-4 py-2">Requests</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Trial ends</th>
              <th className="px-4 py-2">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {businesses.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-2 font-medium text-slate-900">{b.name}</td>
                <td className="px-4 py-2 text-slate-600">{b.user.email}</td>
                <td className="px-4 py-2 text-slate-600">{b.trade}</td>
                <td className="px-4 py-2 text-slate-600">{b._count.requests}</td>
                <td className="px-4 py-2 text-slate-600">{b.subscriptionStatus}</td>
                <td className="px-4 py-2 text-slate-600">{formatDate(b.trialEndsAt)}</td>
                <td className="px-4 py-2 text-slate-600">{formatDate(b.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
