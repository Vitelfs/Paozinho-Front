import type {
  ColumnDef,
  SortingState,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table";

// Tipos base para o sistema DataTable
export type DataTableColumn<T> = ColumnDef<T> & {
  id: string;
  header: string | ((props: any) => React.ReactNode);
  accessorKey?: keyof T;
  cell?: (props: { row: { original: T } }) => React.ReactNode;
  enableSorting?: boolean;
  enableHiding?: boolean;
  enableResizing?: boolean;
  enableColumnFilter?: boolean;
  enableGlobalFilter?: boolean;
  size?: number;
  minSize?: number;
  maxSize?: number;
  meta?: any;
};

export type DataTableFilter = {
  id: string;
  label: string;
  type: "text" | "select" | "date" | "number";
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  defaultValue?: string;
};

export type DataTableAction<T> = {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  onClick: (item: T) => void;
  disabled?: (item: T) => boolean;
  hidden?: (item: T) => boolean;
};

export type DataTableBulkAction<T> = {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  onClick: (selectedItems: T[]) => void;
  disabled?: boolean;
};

export type DataTablePagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
};

export type DataTableSearch = {
  placeholder?: string;
  value?: string;
  onSearchChange?: (value: string) => void;
};

export type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;

  // Paginação
  pagination?: DataTablePagination;

  // Filtros
  filters?: DataTableFilter[];
  onFilterChange?: (filterId: string, value: string) => void;
  filterValues?: Record<string, string>;

  // Busca
  search?: DataTableSearch;

  // Ações
  actions?: DataTableAction<T>[];
  bulkActions?: DataTableBulkAction<T>[];

  // Seleção
  enableSelection?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;

  // Estados vazios
  emptyMessage?: string;
  emptyDescription?: string;

  // Customizações
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;

  // Callbacks
  onRowClick?: (item: T) => void;
  onSortChange?: (sorting: SortingState) => void;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
};

export type DataTableState = {
  sorting: SortingState;
  columnVisibility: VisibilityState;
  rowSelection: RowSelectionState;
  globalFilter: string;
  columnFilters: Record<string, string>;
};

// Tipos para hooks específicos
export type UseDataTableProps = {
  itemsPerPage?: number;
  initialFilters?: Record<string, string>;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
};

export type UseDataTableReturn<T> = {
  pagination: DataTablePagination;
  filters: {
    values: Record<string, string>;
    onChange: (filterId: string, value: string) => void;
    hasActiveFilters: boolean;
    clearFilters: () => void;
  };
  search: DataTableSearch;
  crud: {
    loading: boolean;
    error: string | null;
    create: (
      operation: () => Promise<T>,
      successMessage?: string,
      errorMessage?: string
    ) => Promise<T | null>;
    update: (
      operation: () => Promise<T>,
      successMessage?: string,
      errorMessage?: string
    ) => Promise<T | null>;
    remove: (
      operation: () => Promise<T>,
      successMessage?: string,
      errorMessage?: string
    ) => Promise<T | null>;
    clearError: () => void;
  };
  handleRetry: () => void;
  updateTotalItems: (totalItems: number) => void;
};

export type UsePaginationProps = {
  initialPage?: number;
  itemsPerPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
};

export type UsePaginationReturn = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  setCurrentPage: (page: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  reset: () => void;
  updateTotalItems: (newTotalItems: number) => void;
};

export type UseFiltersProps = {
  initialFilters?: Record<string, string>;
  onFilterChange?: (filters: Record<string, string>) => void;
};

export type UseFiltersReturn = {
  filters: Record<string, string>;
  setFilter: (key: string, value: string) => void;
  removeFilter: (key: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  getActiveFiltersCount: number;
  getFilterValue: (key: string) => string;
  hasFilter: (key: string) => boolean;
};

export type UseCrudOperationsProps = {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
};

export type UseCrudOperationsReturn<T> = {
  loading: boolean;
  error: string | null;
  create: (
    operation: () => Promise<T>,
    successMessage?: string,
    errorMessage?: string
  ) => Promise<T | null>;
  update: (
    operation: () => Promise<T>,
    successMessage?: string,
    errorMessage?: string
  ) => Promise<T | null>;
  remove: (
    operation: () => Promise<T>,
    successMessage?: string,
    errorMessage?: string
  ) => Promise<T | null>;
  clearError: () => void;
};

// Tipos para componentes específicos
export type ConfirmDeleteDialogProps<T> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: T | null;
  itemName: string;
  onConfirm: (item: T) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

export type TableSkeletonProps = {
  columns?: number;
  rows?: number;
  showFilters?: boolean;
  showPagination?: boolean;
};

export type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
};
