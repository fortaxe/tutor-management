import React from 'react';

export interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
    sortable?: boolean;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string | number;
}

function Table<T>({ data, columns, keyExtractor }: TableProps<T>) {
    return (
        <div className="overflow-x-auto pt-5 px-5">
            <table className="min-w-full divide-y divide-slate-100">
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                className={`dashboard-secondary-desc secondary-color uppercase pb-3 ${col.className || ''}`}
                            >
                                <div className="flex items-center gap-[1px]">
                                    {col.header}
                                    {col.sortable && (
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M10.5 11.75V4.25M10.5 4.25L13 6.82812M10.5 4.25L8 6.82812"
                                                stroke="#9CA3AF"
                                                strokeWidth="1.3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M5.5 4.25V11.75M5.5 11.75L8 9.17188M5.5 11.75L3 9.17188"
                                                stroke="#0081DD"
                                                strokeWidth="1.3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-50">
                    {data.map((item) => (
                        <tr key={keyExtractor(item)} className="group hover:bg-slate-50 transition-colors">
                            {columns.map((col, index) => (
                                <td key={index} className={`whitespace-nowrap px-6 py-4 ${col.className || ''}`}>
                                    {typeof col.accessor === 'function'
                                        ? col.accessor(item)
                                        : (item[col.accessor] as React.ReactNode)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Table;
