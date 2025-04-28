import React from 'react';

export type AnotherTableColumn = {
    header: string;
    accessor: string;
};

export type AnotherTableProps = {
    columns: AnotherTableColumn[];
    data: { [key: string]: React.ReactNode }[];
};

const AnotherTable: React.FC<AnotherTableProps> = ({ columns, data }) => (
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

export default AnotherTable;
