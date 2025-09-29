import { useState, useCallback } from "react";
import {
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";

export interface UseDataTableStateProps<T> {
  initialSorting?: SortingState;
  initialColumnVisibility?: VisibilityState;
  initialRowSelection?: RowSelectionState;
  onSortChange?: (sorting: SortingState) => void;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
  onRowSelectionChange?: (selectedItems: T[]) => void;
}

export function useDataTableState<T>({
  initialSorting = [],
  initialColumnVisibility = {},
  initialRowSelection = {},
  onSortChange,
  onColumnVisibilityChange,
  onRowSelectionChange,
}: UseDataTableStateProps<T> = {}) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility
  );
  const [rowSelection, setRowSelection] =
    useState<RowSelectionState>(initialRowSelection);

  const handleSortChange = useCallback(
    (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
      const newSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue;
      setSorting(newSorting);
      onSortChange?.(newSorting);
    },
    [sorting, onSortChange]
  );

  const handleColumnVisibilityChange = useCallback(
    (
      updaterOrValue:
        | VisibilityState
        | ((old: VisibilityState) => VisibilityState)
    ) => {
      const newVisibility =
        typeof updaterOrValue === "function"
          ? updaterOrValue(columnVisibility)
          : updaterOrValue;
      setColumnVisibility(newVisibility);
      onColumnVisibilityChange?.(newVisibility);
    },
    [columnVisibility, onColumnVisibilityChange]
  );

  const handleRowSelectionChange = useCallback(
    (
      updaterOrValue:
        | RowSelectionState
        | ((old: RowSelectionState) => RowSelectionState)
    ) => {
      const newSelection =
        typeof updaterOrValue === "function"
          ? updaterOrValue(rowSelection)
          : updaterOrValue;
      setRowSelection(newSelection);

      if (onRowSelectionChange) {
        // Esta função será chamada pela tabela com os itens selecionados
        // A implementação real será feita no componente DataTable
      }
    },
    [rowSelection, onRowSelectionChange]
  );

  const resetSelection = useCallback(() => {
    setRowSelection({});
  }, []);

  const resetSorting = useCallback(() => {
    setSorting([]);
  }, []);

  const resetColumnVisibility = useCallback(() => {
    setColumnVisibility({});
  }, []);

  const resetAll = useCallback(() => {
    setSorting([]);
    setColumnVisibility({});
    setRowSelection({});
  }, []);

  return {
    sorting,
    columnVisibility,
    rowSelection,
    setSorting: handleSortChange,
    setColumnVisibility: handleColumnVisibilityChange,
    setRowSelection: handleRowSelectionChange,
    resetSelection,
    resetSorting,
    resetColumnVisibility,
    resetAll,
  };
}
