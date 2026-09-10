import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
// Operator-facing: not worth threading a country through.
import { DEFAULT_COUNTRY } from "@/lib/countries";

export default async function AdminErrorsPage() {
  const errors = await prisma.errorLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Errors ({errors.length})</h1>
      {errors.length === 0 ? (
        <p className="text-sm text-slate-500">No errors logged.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {errors.map((e) => (
            <div key={e.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-red-700">{e.source}</span>
                <span className="text-xs text-slate-400">{formatDate(e.createdAt, DEFAULT_COUNTRY)}</span>
              </div>
              <p className="mt-1 text-slate-800">{e.message}</p>
              {e.meta !== null && e.meta !== undefined && (
                <pre className="mt-1 overflow-x-auto rounded bg-slate-50 p-2 text-xs text-slate-600">
                  {JSON.stringify(e.meta, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
