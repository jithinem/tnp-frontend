import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  keyExtractor: (item: T, index: number) => string | number;
}

export function Table<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  keyExtractor,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="table-loading" style={{ textAlign: 'center', padding: '20px' }}>
        <div className="muted">Loading...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <table className="table">
        <tbody>
          <tr>
            <td colSpan={columns.length} className="muted" style={{ textAlign: 'center' }}>
              {emptyMessage}
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} className={column.className}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={keyExtractor(item, index)}>
            {columns.map((column) => (
              <td key={column.key} className={column.className}>
                {column.render ? column.render(item, index) : (item as any)[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
