import { useState, useCallback, useMemo } from "react";
import type { UseFiltersProps, UseFiltersReturn } from "@/types/datatable.type";

export function useFilters({
  initialFilters = {},
  onFilterChange,
}: UseFiltersProps = {}): UseFiltersReturn {
  const [filters, setFilters] =
    useState<Record<string, string>>(initialFilters);

  const setFilter = useCallback(
    (key: string, value: string) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      onFilterChange?.(newFilters);
    },
    [filters, onFilterChange]
  );

  const removeFilter = useCallback(
    (key: string) => {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
      onFilterChange?.(newFilters);
    },
    [filters, onFilterChange]
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    onFilterChange?.({});
  }, [onFilterChange]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== "" && value !== undefined
    );
  }, [filters]);

  const getActiveFiltersCount = useMemo(() => {
    return Object.values(filters).filter(
      (value) => value !== "" && value !== undefined
    ).length;
  }, [filters]);

  const getFilterValue = useCallback(
    (key: string) => {
      return filters[key] || "";
    },
    [filters]
  );

  const hasFilter = useCallback(
    (key: string) => {
      return (
        key in filters && filters[key] !== "" && filters[key] !== undefined
      );
    },
    [filters]
  );

  return {
    filters,
    setFilter,
    removeFilter,
    clearFilters,
    hasActiveFilters,
    getActiveFiltersCount,
    getFilterValue,
    hasFilter,
  };
}
