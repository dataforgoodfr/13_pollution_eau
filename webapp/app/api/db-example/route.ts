import { fetchExample } from "@/app/lib/data";

// an api route fetching data
export async function GET() {
  try {
    const reader = await fetchExample();
    return Response.json({
      status: "OK",
      rows: reader.getRowObjectsJson(),
      columnNames: reader.columnNames(),
      columnTypes: reader.columnTypes(),
      count: reader.columnCount,
    });
  } catch (error) {
    console.error("Error while retrieving data:", error);
    return Response.json({ error }, { status: 500 });
  }
}
