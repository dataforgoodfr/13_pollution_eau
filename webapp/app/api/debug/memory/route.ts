import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/duckdb";

export const dynamic = "force-dynamic";

const toMb = (bytes: number) => Math.round((bytes / 1024 / 1024) * 10) / 10;

/**
 * Consommation mémoire du serveur, pour savoir si elle vient de Node (heap JS)
 * ou de DuckDB (mémoire native, comptée dans rss mais pas dans heapTotal).
 * Si la variable DEBUG_TOKEN est définie, la route exige ?token=<DEBUG_TOKEN>.
 */
export async function GET(request: NextRequest) {
  const debugToken = process.env.DEBUG_TOKEN;
  const token = new URL(request.url).searchParams.get("token");
  if (debugToken && token !== debugToken) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const node = process.memoryUsage();

  const connection = await db.connect();
  try {
    const settingsResult = await connection.runAndReadAll(
      `SELECT current_setting('memory_limit') AS memory_limit,
              current_setting('threads') AS threads`,
    );
    const settings = settingsResult.getRowObjects()[0];

    const memoryResult = await connection.runAndReadAll(
      `SELECT tag, memory_usage_bytes, temporary_storage_bytes
       FROM duckdb_memory()
       WHERE memory_usage_bytes > 0 OR temporary_storage_bytes > 0
       ORDER BY memory_usage_bytes DESC`,
    );
    const duckdbTags = memoryResult.getRowObjects().map((row) => ({
      tag: String(row.tag),
      memory_mb: toMb(Number(row.memory_usage_bytes)),
      temporary_storage_mb: toMb(Number(row.temporary_storage_bytes)),
    }));
    const duckdbTotalMb = duckdbTags.reduce((sum, t) => sum + t.memory_mb, 0);

    return NextResponse.json(
      {
        node_mb: {
          rss: toMb(node.rss),
          heap_total: toMb(node.heapTotal),
          heap_used: toMb(node.heapUsed),
          external: toMb(node.external),
          array_buffers: toMb(node.arrayBuffers),
          // Approximation de la mémoire native hors heap JS (DuckDB surtout)
          rss_minus_heap: toMb(node.rss - node.heapTotal),
        },
        duckdb: {
          memory_limit: String(settings.memory_limit),
          threads: String(settings.threads),
          total_mb: Math.round(duckdbTotalMb * 10) / 10,
          by_tag: duckdbTags,
        },
        uptime_s: Math.round(process.uptime()),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la lecture de la mémoire" },
      { status: 500 },
    );
  } finally {
    await connection.close();
  }
}
