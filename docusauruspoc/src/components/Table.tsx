import React from 'react';

export type TableColumn = {
    header: string;
    accessor: string;
};

export type TableProps = {
    columns: TableColumn[];
    data: { [key: string]: React.ReactNode }[];
};

const Table: React.FC<TableProps> = ({ columns, data }) => (
    <table>
        <thead>
            <tr>
                {columns.map((column) => (
                    <th key={column.accessor}>{column.header}</th>
                ))}
            </tr>
        </thead>
        <tbody>
            {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                    {columns.map((column) => (
                        <td key={column.accessor}>{row[column.accessor]}</td>
                    ))}
                </tr>
            ))}
        </tbody>
    </table>
);

export default Table;
