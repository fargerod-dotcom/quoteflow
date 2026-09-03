import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/auth-helpers";
import { readPhoto } from "@/lib/storage/blob";

export const dynamic = "force-dynamic";

/**
 * Serves private customer photos. The blob pathname is "<businessId>/<file>",
 * so a viewer may see it only if they own that business (or are an admin).
 */
export async function GET(_request: Request, { params }: { params: { path: string[] } }) {
  const [businessId, ...rest] = params.path;
  if (!businessId || rest.length === 0 || params.path.some((p) => p === "..")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isAdminEmail(session.user.email)) {
    const business = await prisma.business.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!business || business.id !== businessId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const pathname = params.path.join("/");
  let result: Awaited<ReturnType<typeof readPhoto>>;
  try {
    result = await readPhoto(pathname);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!result || result.statusCode !== 200) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "Content-Length": String(result.blob.size),
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
