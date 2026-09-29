export default function Table({ headers, rows, empty = 'Sem registos.' }) {
  return (
    <div className="card !p-0 overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-surface-container-low text-secondary uppercase">
            {headers.map((h, i) => (
              <th key={i} className={`py-2.5 px-4 whitespace-nowrap ${h.startsWith('>') ? 'text-right' : ''}`}>{h.replace('>', '')}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container">
          {rows.length === 0 && (
            <tr><td colSpan={headers.length} className="p-6 text-center text-secondary">{empty}</td></tr>
          )}
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-surface-container-low/40">
              {row.map((cell, j) => (
                <td key={j} className={`py-3 px-4 whitespace-nowrap ${headers[j].startsWith('>') ? 'text-right font-mono' : ''}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
