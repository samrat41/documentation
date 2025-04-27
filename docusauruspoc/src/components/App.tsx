import React from 'react';
import Table from './Table';

const App: React.FC = () => {
    const columns = [
        { header: 'Name', accessor: 'name', options: { sortable: true, align: 'left' } },
        { header: 'Age', accessor: 'age', options: { sortable: false, align: 'center' } },
        { header: 'Country', accessor: 'country', options: { sortable: true, align: 'right' } },
    ];

    const data = [
        { name: 'Alice', age: 25, country: 'USA' },
        { name: 'Bob', age: 30, country: 'Canada' },
        { name: 'Charlie', age: 35, country: 'UK' },
    ];

    return (
        <div>
            <h1>Table Example</h1>
            <Table columns={columns} data={data} />
        </div>
    );
};

export default App;
