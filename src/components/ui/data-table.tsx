
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataTableColumn<T> {
  key: string;
  header: string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  hidden?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  searchPlaceholder?: string;
  noDataMessage?: string;
  pageSize?: number;
  filterOptions?: { 
    key: string; 
    label: string; 
    options: Array<{ value: string; label: string }>; 
  }[];
  renderRowActions?: (item: T) => React.ReactNode;
}

function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  searchPlaceholder = "Поиск...",
  noDataMessage = "Нет данных для отображения",
  pageSize = 10,
  filterOptions = [],
  renderRowActions,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Обработка строки поиска
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Сбрасываем на первую страницу при поиске
  };

  // Обработка сортировки
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === "asc" ? "desc" : "asc";
    }
    
    setSortConfig({ key, direction });
  };

  // Обработка фильтрации
  const handleFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Сбрасываем на первую страницу при фильтрации
  };

  // Применение фильтров и поиска
  const filteredData = React.useMemo(() => {
    let result = [...data];
    
    // Применяем поиск (по всем строковым полям)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(item => 
        Object.entries(item).some(([key, value]) => 
          typeof value === 'string' && value.toLowerCase().includes(lowerSearchTerm)
        )
      );
    }
    
    // Применяем фильтры
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "all") {
        result = result.filter(item => {
          // @ts-ignore - Динамический доступ к полям
          return String(item[key]) === value;
        });
      }
    });
    
    // Применяем сортировку
    if (sortConfig) {
      result.sort((a, b) => {
        // @ts-ignore - Динамический доступ к полям
        const aValue = a[sortConfig.key];
        // @ts-ignore - Динамический доступ к полям
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [data, searchTerm, sortConfig, filters]);

  // Пагинация
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Обработка изменения страницы
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Отображаемые столбцы (скрываем помеченные как hidden)
  const visibleColumns = columns.filter(column => !column.hidden);

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="pl-9 w-full md:w-auto min-w-[240px]"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {filterOptions.map(filter => (
            <div key={filter.key} className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden sm:inline-block">
                {filter.label}:
              </span>
              <Select 
                value={filters[filter.key] || "all"} 
                onValueChange={(value) => handleFilter(filter.key, value)}
              >
                <SelectTrigger className="h-9 w-[180px]">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  {filter.options.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map(column => (
                <TableHead 
                  key={column.key}
                  className={column.sortable ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" : ""}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && sortConfig?.key === column.key && (
                      <span className="ml-2">
                        {sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
              {renderRowActions && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + (renderRowActions ? 1 : 0)} className="h-24 text-center">
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedData.length > 0 ? (
              paginatedData.map(item => (
                <TableRow key={item.id}>
                  {visibleColumns.map(column => (
                    <TableCell key={`${item.id}-${column.key}`}>
                      {column.cell 
                        // @ts-ignore - Динамический доступ к полям
                        ? column.cell(item) 
                        // @ts-ignore - Динамический доступ к полям
                        : (String(item[column.key]) || "-")}
                    </TableCell>
                  ))}
                  {renderRowActions && (
                    <TableCell className="text-right">
                      {renderRowActions(item)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + (renderRowActions ? 1 : 0)} className="h-24 text-center">
                  {noDataMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Показаны {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredData.length)} из {filteredData.length} записей
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Логика отображения номеров страниц (1, 2, 3, ... N)
              let pageNumber;
              
              if (totalPages <= 5) {
                // Если всего страниц не больше 5, показываем все
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                // Если мы в начале списка
                if (i < 4) {
                  pageNumber = i + 1;
                } else {
                  pageNumber = totalPages;
                }
              } else if (currentPage >= totalPages - 2) {
                // Если мы в конце списка
                if (i === 0) {
                  pageNumber = 1;
                } else {
                  pageNumber = totalPages - (4 - i);
                }
              } else {
                // Если мы в середине списка
                if (i === 0) {
                  pageNumber = 1;
                } else if (i === 4) {
                  pageNumber = totalPages;
                } else {
                  pageNumber = currentPage + (i - 2);
                }
              }
              
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNumber)}
                  disabled={currentPage === pageNumber}
                >
                  {pageNumber}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { DataTable };
export type { DataTableColumn, DataTableProps };
