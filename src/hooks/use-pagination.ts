import { useState, useCallback, useMemo, useEffect } from "react";
import type {
  UsePaginationProps,
  UsePaginationReturn,
} from "@/types/datatable.type";

export function usePagination({
  initialPage = 1,
  itemsPerPage = 10,
  totalItems = 0,
  onPageChange,
}: UsePaginationProps = {}): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [internalTotalItems, setInternalTotalItems] = useState(totalItems);

  // Sincronizar internalTotalItems com totalItems externo
  useEffect(() => {
    setInternalTotalItems(totalItems);
  }, [totalItems]);

  const totalPages = useMemo(() => {
    return Math.ceil(internalTotalItems / itemsPerPage);
  }, [internalTotalItems, itemsPerPage]);

  const handlePageChange = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
      onPageChange?.(validPage);
    },
    [totalPages, onPageChange]
  );

  const goToFirstPage = useCallback(() => {
    handlePageChange(1);
  }, [handlePageChange]);

  const goToLastPage = useCallback(() => {
    handlePageChange(totalPages);
  }, [handlePageChange, totalPages]);

  const goToNextPage = useCallback(() => {
    handlePageChange(currentPage + 1);
  }, [handlePageChange, currentPage]);

  const goToPreviousPage = useCallback(() => {
    handlePageChange(currentPage - 1);
  }, [handlePageChange, currentPage]);

  const canGoNext = useMemo(
    () => currentPage < totalPages,
    [currentPage, totalPages]
  );
  const canGoPrevious = useMemo(() => currentPage > 1, [currentPage]);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  const updateTotalItems = useCallback(
    (newTotalItems: number) => {
      setInternalTotalItems(newTotalItems);
      // Se a página atual ficar maior que o total de páginas, ajustar para a última página
      const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    },
    [currentPage, itemsPerPage]
  );

  return {
    currentPage,
    totalPages,
    totalItems: internalTotalItems,
    itemsPerPage,
    setCurrentPage: handlePageChange,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    canGoNext,
    canGoPrevious,
    reset,
    updateTotalItems,
  };
}
