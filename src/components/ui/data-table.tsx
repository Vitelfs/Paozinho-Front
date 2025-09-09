import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  type ColumnDef,
  flexRender,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { Search, MoreHorizontal, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import type { DataTableProps } from "@/types/datatable.type";

export function DataTable<T>({
  data,
  columns,
  loading = false,
  error = null,
  onRetry,
  pagination,
  filters = [],
  onFilterChange,
  filterValues = {},
  search,
  actions = [],
  bulkActions = [],
  enableSelection = false,
  emptyMessage = "Nenhum item encontrado",
  emptyDescription = "Não há dados para exibir no momento.",
  className = "",
  showHeader = true,
  showFooter = true,
  onRowClick,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState(search?.value || "");

  // Memoizar colunas com ações
  const columnsWithActions = useMemo(() => {
    if (actions.length === 0) return columns;

    const actionsColumn: ColumnDef<T> = {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const item = row.original;
        const visibleActions = actions.filter(
          (action) => !action.hidden?.(item)
        );

        if (visibleActions.length === 0) return null;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {visibleActions.map((action) => {
                const Icon = action.icon;
                return (
                  <DropdownMenuCheckboxItem
                    key={action.id}
                    onClick={() => action.onClick(item)}
                    disabled={action.disabled?.(item)}
                    className={
                      action.variant === "destructive" ? "text-destructive" : ""
                    }
                  >
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    {action.label}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    };

    return [...columns, actionsColumn];
  }, [columns, actions]);

  // Memoizar colunas com seleção
  const columnsWithSelection = useMemo(() => {
    if (!enableSelection) return columnsWithActions;

    const selectionColumn: ColumnDef<T> = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };

    return [selectionColumn, ...columnsWithActions];
  }, [columnsWithActions, enableSelection]);

  // Configurar tabela
  const table = useReactTable({
    data,
    columns: columnsWithSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: enableSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // Atualizar tabela quando props mudarem
  React.useEffect(() => {
    table.setSorting(sorting);
  }, [table, sorting]);

  React.useEffect(() => {
    table.setColumnVisibility(columnVisibility);
  }, [table, columnVisibility]);

  React.useEffect(() => {
    table.setRowSelection(rowSelection);
  }, [table, rowSelection]);

  React.useEffect(() => {
    if (search?.value !== undefined) {
      setGlobalFilter(search.value);
    }
  }, [search?.value]);

  // Renderizar filtros
  const renderFilters = () => {
    if (filters.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-4 mb-4">
        {filters.map((filter) => (
          <div key={filter.id} className="min-w-[200px]">
            {filter.type === "text" && (
              <Input
                placeholder={
                  filter.placeholder ||
                  `Filtrar por ${filter.label.toLowerCase()}...`
                }
                value={filterValues[filter.id] || ""}
                onChange={(e) => onFilterChange?.(filter.id, e.target.value)}
                className="w-full"
              />
            )}
            {filter.type === "select" && (
              <Select
                value={filterValues[filter.id] || filter.defaultValue || ""}
                onValueChange={(value) => onFilterChange?.(filter.id, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      filter.placeholder ||
                      `Selecionar ${filter.label.toLowerCase()}`
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filter.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Renderizar busca
  const renderSearch = () => {
    if (!search) return null;

    return (
      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={search.placeholder || "Pesquisar..."}
          value={globalFilter}
          onChange={(e) => {
            setGlobalFilter(e.target.value);
            search.onSearchChange?.(e.target.value);
          }}
          className="pl-8"
        />
      </div>
    );
  };

  // Renderizar ações em massa
  const renderBulkActions = () => {
    if (bulkActions.length === 0 || !enableSelection) return null;

    const selectedCount = table.getFilteredSelectedRowModel().rows.length;
    if (selectedCount === 0) return null;

    return (
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="secondary">
          {selectedCount} item(s) selecionado(s)
        </Badge>
        {bulkActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant={action.variant || "outline"}
              size="sm"
              onClick={() => {
                const selectedRows = table.getFilteredSelectedRowModel().rows;
                const selectedItems = selectedRows.map((row) => row.original);
                action.onClick(selectedItems);
              }}
              disabled={action.disabled}
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {action.label}
            </Button>
          );
        })}
      </div>
    );
  };

  // Renderizar controles de coluna
  const renderColumnControls = () => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto">
            Colunas <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Renderizar paginação
  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { currentPage, totalPages, onPageChange } = pagination;
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => onPageChange(i)}
            isActive={i === currentPage}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-muted-foreground">
          Mostrando {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
          a{" "}
          {Math.min(
            pagination.currentPage * pagination.itemsPerPage,
            pagination.totalItems
          )}{" "}
          de {pagination.totalItems} itens
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            {pages}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  onPageChange(Math.min(totalPages, currentPage + 1))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  // Renderizar skeleton de loading
  const renderSkeleton = () => (
    <TableSkeleton
      columns={columns.length + (actions.length > 0 ? 1 : 0)}
      rows={5}
      showFilters={filters.length > 0 || !!search}
      showPagination={!!pagination}
    />
  );

  // Renderizar estado de erro
  const renderError = () => (
    <div className="text-center py-12">
      <p className="text-destructive mb-4">{error}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Tentar Novamente
        </Button>
      )}
    </div>
  );

  // Renderizar estado vazio
  const renderEmpty = () => (
    <EmptyState title={emptyMessage} description={emptyDescription} />
  );

  if (loading) return renderSkeleton();
  if (error) return renderError();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header com controles */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {renderSearch()}
            {renderFilters()}
          </div>
          <div className="flex gap-2">{renderColumnControls()}</div>
        </div>
      )}

      {/* Ações em massa */}
      {renderBulkActions()}

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={onRowClick ? "cursor-pointer" : ""}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columnsWithSelection.length}
                  className="h-24 text-center"
                >
                  {renderEmpty()}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer com paginação */}
      {showFooter && renderPagination()}
    </div>
  );
}
