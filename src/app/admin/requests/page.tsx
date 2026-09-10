import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
// Operator-facing: not worth threading a country through.
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { REQUEST_STATUS_LABELS } from "@/lib/constants";

export default async function AdminRequestsPage() {
  const requests = await prisma.request.findMany({
    include: { business: true, quote: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Requests ({requests.length})</h1>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">Business</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">AI confidence</th>
              <th className="px-4 py-2">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2 font-medium text-slate-900">{r.business.name}</td>
                <td className="px-4 py-2 text-slate-600">{r.customerName}</td>
                <td className="px-4 py-2 text-slate-600">{REQUEST_STATUS_LABELS[r.status]}</td>
                <td className="px-4 py-2 text-slate-600">
                  {r.quote ? `${r.quote.confidence}${r.quote.aiFailedFallback ? " (fallback)" : ""}` : "—"}
                </td>
                <td className="px-4 py-2 text-slate-600">{formatDate(r.createdAt, DEFAULT_COUNTRY)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
