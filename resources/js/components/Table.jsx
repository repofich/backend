export default function Table({ columns, data, onRowClick }) {
    if (!data || data.length === 0) {
        return (
            <p className="text-text-muted text-center text-[15px] font-card-meta py-10">
                No hay registros disponibles.
            </p>
        );
    }

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse font-card-meta">
                <thead>
                    <tr className="bg-primary text-text-on-primary">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className="text-left px-4 py-3 text-[13px] sm:text-[14px] font-[600] whitespace-nowrap"
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr
                            key={row.id ?? i}
                            onClick={() => onRowClick?.(row)}
                            className={`
                                border-b border-gray-200 dark:border-[#3a3a3a]
                                ${onRowClick ? 'cursor-pointer' : ''}
                                hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors
                            `}
                        >
                            {columns.map((col) => (
                                <td
                                    key={col.key}
                                    className="px-4 py-3 text-[13px] sm:text-[14px] text-card-value"
                                >
                                    {col.render
                                        ? col.render(row[col.key], row)
                                        : row[col.key] ?? '—'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
