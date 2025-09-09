import { useCallback, useMemo } from "react";
import { usePagination } from "@/hooks/use-pagination";
import { useFilters } from "@/hooks/use-filters";
import { useCrudOperations } from "@/hooks/use-crud-operations";
import type {
  UseDataTableProps,
  UseDataTableReturn,
} from "@/types/datatable.type";

export function useDataTable<T>({
  itemsPerPage = 10,
  initialFilters = {},
  onSuccess,
  onError,
}: UseDataTableProps = {}): UseDataTableReturn<T> {
  const pagination = usePagination({
    itemsPerPage,
    totalItems: 0,
  });

  const filters = useFilters({
    initialFilters,
  });

  const crud = useCrudOperations<T>({
    onSuccess,
    onError,
  });

  const handleFilterChange = useCallback(
    (filterId: string, value: string) => {
      filters.setFilter(filterId, value);
      pagination.reset(); // Reset para primeira página quando filtrar
    },
    [filters, pagination]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      pagination.setCurrentPage(page);
    },
    [pagination]
  );

  const handleRetry = useCallback(() => {
    // Esta função será implementada pela página específica
  }, []);

  const paginationProps = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      itemsPerPage: pagination.itemsPerPage,
      onPageChange: handlePageChange,
    }),
    [pagination, handlePageChange]
  );

  const searchProps = useMemo(
    () => ({
      placeholder: "Pesquisar...",
    }),
    []
  );

  return {
    pagination: paginationProps,
    filters: {
      values: filters.filters,
      onChange: handleFilterChange,
      hasActiveFilters: filters.hasActiveFilters,
      clearFilters: filters.clearFilters,
    },
    search: searchProps,
    crud: {
      loading: crud.loading,
      error: crud.error,
      create: crud.create,
      update: crud.update,
      remove: crud.remove,
      clearError: crud.clearError,
    },
    handleRetry,
    updateTotalItems: pagination.updateTotalItems,
  };
}
