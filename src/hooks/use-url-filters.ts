import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export interface UseUrlFiltersProps {
  initialFilters?: Record<string, string>;
  debounceMs?: number;
  onFiltersChange?: (filters: Record<string, string>) => void;
}

export interface UseUrlFiltersReturn {
  filters: Record<string, string>;
  debouncedFilters: Record<string, string>;
  setFilter: (key: string, value: string) => void;
  removeFilter: (key: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  getActiveFiltersCount: number;
  getFilterValue: (key: string) => string;
  hasFilter: (key: string) => boolean;
  isLoading: boolean;
}

export function useUrlFilters({
  initialFilters = {},
  debounceMs = 500,
  onFiltersChange,
}: UseUrlFiltersProps = {}): UseUrlFiltersReturn {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Inicializar filtros a partir da URL ou valores iniciais
  const initializeFilters = useCallback(() => {
    const urlFilters: Record<string, string> = {};

    // Ler filtros da URL
    searchParams.forEach((value, key) => {
      if (value && value.trim() !== "") {
        urlFilters[key] = value;
      }
    });

    // Combinar com filtros iniciais (URL tem prioridade)
    return { ...initialFilters, ...urlFilters };
  }, [searchParams, initialFilters]);

  const [filters, setFilters] =
    useState<Record<string, string>>(initializeFilters);
  const [debouncedFilters, setDebouncedFilters] =
    useState<Record<string, string>>(filters);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Atualizar URL quando filtros mudarem
  const updateUrl = useCallback(
    (newFilters: Record<string, string>) => {
      const params = new URLSearchParams();

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value.trim() !== "") {
          params.set(key, value);
        }
      });

      const newUrl = params.toString() ? `?${params.toString()}` : "";
      navigate(newUrl, { replace: true });
    },
    [navigate]
  );

  // Debounce dos filtros
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setIsLoading(true);

    debounceTimeoutRef.current = setTimeout(
      () => {
        setDebouncedFilters(filters);
        setIsLoading(false);

        // Atualiza a URL e chama callback após o debounce
        // Para a primeira montagem, não atualiza URL mas chama o callback
        if (!isInitialMount.current) {
          updateUrl(filters);
        }
        onFiltersChange?.(filters);
        isInitialMount.current = false;
      },
      isInitialMount.current ? 0 : debounceMs
    );

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [filters, debounceMs, updateUrl, onFiltersChange]);

  // Sincronizar com mudanças na URL (botão voltar/avançar)
  useEffect(() => {
    const newFilters = initializeFilters();
    const filtersChanged =
      JSON.stringify(newFilters) !== JSON.stringify(filters);

    if (filtersChanged) {
      setFilters(newFilters);
    }
  }, [searchParams, initializeFilters]);

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };

      if (value && value.trim() !== "") {
        newFilters[key] = value.trim();
      } else {
        delete newFilters[key];
      }

      return newFilters;
    });
  }, []);

  const removeFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && value !== undefined
  );

  const getActiveFiltersCount = Object.values(filters).filter(
    (value) => value !== "" && value !== undefined
  ).length;

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
    debouncedFilters,
    setFilter,
    removeFilter,
    clearFilters,
    hasActiveFilters,
    getActiveFiltersCount,
    getFilterValue,
    hasFilter,
    isLoading,
  };
}
