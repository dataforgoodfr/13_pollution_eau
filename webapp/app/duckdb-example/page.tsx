import { fetchExample } from "../lib/data";

export default async function Page() {
  //using api route
  // try {

  //   const response = await fetch("http://localhost:3001/api/db-example", { cache: "no-store" })
  //   const results = response.json();
  // } catch (err) {
  //    console.error("Error fetching DB status:", err)
  // }

  // using directly the data layer
  const reader = await fetchExample();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-5xl overflow-x-auto bg-white shadow-lg rounded-2xl p-6">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="border border-gray-300 px-4 py-2">Row</th>
              {Array.from({ length: reader.columnCount }, (_, i) => (
                <th key={i} className="border border-gray-300 px-4 py-2">
                  {reader.columnName(i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(reader.getRows()).map(([key, value]) => (
              <tr key={key} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2 font-semibold">
                  {key}
                </td>
                {Array.from({ length: reader.columnCount }, (_, i) => (
                  <td key={i} className="border border-gray-300 px-4 py-2">
                    {/* Affichage par type - exemple avec des méthodes propre à certains types => pas d'erreur, le typage semble bon */}
                    {/* {value[i] != null &&
                      ((reader.columnType(i).typeId === DuckDBTypeId.VARCHAR &&
                        String(value[i]).slice(0, 3)) ||
                        (reader.columnType(i).typeId === DuckDBTypeId.BIGINT &&
                          (value[i] as bigint) * BigInt(100000)) ||
                        (reader.columnType(i).typeId === DuckDBTypeId.DOUBLE &&
                          (value[i] as number)?.toExponential()))} */}
                    {/* Affichage simple */}
                    {String(value[i])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
