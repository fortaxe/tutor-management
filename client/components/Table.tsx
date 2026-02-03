
import React from 'react';

export interface Column<T> {
    key: string;
    header: React.ReactNode;
    render?: (item: T) => React.ReactNode;
    className?: string; // Class for the <td>
    headerClassName?: string; // Class for the <th>
    onClickHeader?: () => void;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string | number;
    className?: string;
    onRowClick?: (item: T) => void;
}

export function Table<T>({ data, columns, keyExtractor, className, onRowClick }: TableProps<T>) {
    return (
        <div className={`overflow-x-auto md:pt-5 no-scrollbar  ${className || ''}`}>
            <table className="min-w-full">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`dashboard-secondary-desc secondary-color uppercase pb-3 hidden md:table-cell ${col.headerClassName || ''}`}
                                onClick={col.onClickHeader}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="md:bg-white md:divide-y divide-slate-50">
                    {data.map((item) => (
                        <tr
                            key={keyExtractor(item)}
                            className="bg-white md:odd:bg-[#F4F7FB] md:even:bg-[#FFFFFF] transition-colors group"
                            onClick={() => onRowClick?.(item)}
                        >
                            {columns.map((col) => (
                                <td key={col.key} className={col.className}>
                                    {col.render ? col.render(item) : null}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
