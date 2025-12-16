import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number | Date | null | undefined; // For custom sorting logic
  sortable?: boolean; // Default: true if no render, false if render exists (overrideable)
  className?: string;
}

interface DataTableProps<T extends Record<string, any>> {
  data: T[];
  columns: TableColumn<T>[];
  emptyMessage?: React.ReactNode;
  getRowKey?: (row: T, index: number) => string | number;
  itemsPerPage?: number;
  defaultSortKey?: string;
  defaultSortOrder?: 'asc' | 'desc';
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  emptyMessage = 'No data found',
  getRowKey = (row, index) => row.id || index,
  itemsPerPage = 10,
  defaultSortKey,
  defaultSortOrder = 'asc',
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'asc' | 'desc';
  }>({
    key: defaultSortKey || null,
    direction: defaultSortOrder,
  });

  const handleSort = (key: string) => {
    setCurrentPage(1); // Reset to first page when sorting
    setSortConfig((current) => {
      if (current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key: null, direction: 'asc' }; // Remove sorting
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    const column = columns.find((col) => col.key === sortConfig.key);
    if (!column || column.sortable === false) return data;

    const getValue = (row: T) => {
      if (column.sortValue) return column.sortValue(row);
      return row[column.key];
    };

    return [...data].sort((a, b) => {
      const aValue = getValue(a);
      const bValue = getValue(b);

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;

      let result: number;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        result = aValue.localeCompare(bValue);
      } else if (aValue instanceof Date && bValue instanceof Date) {
        result = aValue.getTime() - bValue.getTime();
      } else {
        result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }

      return sortConfig.direction === 'asc' ? result : -result;
    });
  }, [data, sortConfig, columns]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="flex flex-col">
      <div className="rounded-[14px] border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FCFDFD]">
              {columns.map((column) => {
                const isSortable = column.sortable !== false && !column.render;
                const isSorted = sortConfig.key === column.key;
                const isAsc = isSorted && sortConfig.direction === 'asc';
                const isDesc = isSorted && sortConfig.direction === 'desc';

                return (
                  <TableHead
                    key={column.key}
                    className={`md:px-10 px-5 ${column.className || ''} ${
                      isSortable ? 'cursor-pointer select-none hover:bg-gray-50' : ''
                    }`}
                    onClick={() => isSortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.header}</span>
                      {isSortable && (
                        <div className="flex flex-col">
                          <ArrowUp
                            className={`w-3 h-3 transition-opacity ${
                              isAsc ? 'opacity-100' : 'opacity-30'
                            }`}
                          />
                          <ArrowDown
                            className={`w-3 h-3 -mt-1 transition-opacity ${
                              isDesc ? 'opacity-100' : 'opacity-30'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground py-8"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((row, index) => (
                <TableRow key={getRowKey(row, startIndex + index)}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={`py-5 md:px-10 px-5 ${column.className || ''}`}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {sortedData.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of{' '}
            {sortedData.length} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 rounded border ${
                    currentPage === page
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;