import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import type {
  UseCrudOperationsProps,
  UseCrudOperationsReturn,
} from "@/types/datatable.type";

export function useCrudOperations<T>({
  onSuccess,
  onError,
}: UseCrudOperationsProps = {}): UseCrudOperationsReturn<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeOperation = useCallback(
    async (
      operation: () => Promise<T>,
      successMessage: string,
      errorMessage: string
    ): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);

        const result = await operation();

        toast.success(successMessage);
        onSuccess?.(successMessage);

        return result;
      } catch (err) {
        const errorMsg = errorMessage || "Operação falhou";
        console.error("Erro na operação:", err);

        setError(errorMsg);
        toast.error(errorMsg);
        onError?.(errorMsg);

        return null;
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError]
  );

  const create = useCallback(
    async (
      operation: () => Promise<T>,
      successMessage = "Item criado com sucesso",
      errorMessage = "Erro ao criar item"
    ) => {
      return executeOperation(operation, successMessage, errorMessage);
    },
    [executeOperation]
  );

  const update = useCallback(
    async (
      operation: () => Promise<T>,
      successMessage = "Item atualizado com sucesso",
      errorMessage = "Erro ao atualizar item"
    ) => {
      return executeOperation(operation, successMessage, errorMessage);
    },
    [executeOperation]
  );

  const remove = useCallback(
    async (
      operation: () => Promise<T>,
      successMessage = "Item excluído com sucesso",
      errorMessage = "Erro ao excluir item"
    ) => {
      return executeOperation(operation, successMessage, errorMessage);
    },
    [executeOperation]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    create,
    update,
    remove,
    clearError,
  };
}
