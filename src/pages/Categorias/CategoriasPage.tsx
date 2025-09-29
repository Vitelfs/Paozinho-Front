import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { DataTable } from "@/components/ui/data-table";
import { usePagination } from "@/hooks/use-pagination";
import {
  createCategoriaColumns,
  createCategoriaActions,
} from "@/components/categorias/categoria-columns";
import type {
  CategoriaEntity,
  UpdateCategoriaEntity,
  DeleteCategoriaEntity,
} from "@/models/categoria.entity";
import { CategoriasPageHeader } from "@/components/categorias/CategoriasPageHeader";
import { toast } from "react-toastify";
import { categoriaService } from "@/services/categoria.service";

interface CategoriasFilters {
  nome: string;
}

const ITEMS_PER_PAGE = 10;

export function CategoriasPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categorias, setCategorias] = useState<CategoriaEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado dos filtros
  const [filters, setFilters] = useState<CategoriasFilters>({
    nome: searchParams.get("nome") || "",
  });

  const pagination = usePagination({
    itemsPerPage: ITEMS_PER_PAGE,
    totalItems: 0,
  });

  const handleEdit = useCallback(
    (categoria: UpdateCategoriaEntity) => {
      navigate("/categorias/editar", { state: { categoria } });
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (categoria: DeleteCategoriaEntity) => {
      try {
        await categoriaService.deleteCategoria(categoria.id);

        setCategorias((prevCategorias) =>
          prevCategorias.filter((c) => c.id !== categoria.id)
        );

        pagination.updateTotalItems(pagination.totalItems - 1);
        toast.success("Categoria excluída com sucesso");
        // Não precisa chamar loadCategorias() aqui pois já atualizamos o estado local
      } catch (err) {
        console.error("Erro ao excluir categoria:", err);
        toast.error("Erro ao excluir categoria");
      }
    },
    [pagination]
  );

  const loadCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Preparar parâmetros de filtro
      const filterParams: any = {
        limit: ITEMS_PER_PAGE,
        offset: (pagination.currentPage - 1) * ITEMS_PER_PAGE,
      };

      // Adicionar busca por nome
      if (filters.nome.trim()) {
        filterParams.nome = filters.nome.trim();
      }

      console.log("Enviando filtros:", filterParams);
      const data = await categoriaService.getCategoriasWithPagination(
        filterParams
      );

      setCategorias(data.categorias);
      pagination.updateTotalItems(data.total);
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);
      setError("Erro ao carregar categorias. Tente novamente.");
      toast.error("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, filters, pagination.updateTotalItems]);

  // Função para atualizar filtros
  const handleFiltersChange = useCallback(
    (newFilters: CategoriasFilters) => {
      setFilters(newFilters);

      // Atualizar URL com os novos filtros
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value !== "") {
          params.set(key, value);
        }
      });
      setSearchParams(params);

      // Reset da paginação quando filtros mudarem
      if (pagination.currentPage > 1) {
        pagination.setCurrentPage(1);
      }
    },
    [setSearchParams, pagination]
  );

  // Memoizar colunas e ações
  const columns = useMemo(() => createCategoriaColumns(), []);
  const actions = useMemo(
    () => createCategoriaActions(handleEdit, handleDelete),
    [handleEdit, handleDelete]
  );

  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  useEffect(() => {
    if (searchParams.get("created") === "true") {
      toast.success("Categoria criada com sucesso!");
      navigate("/categorias", { replace: true });
    }

    if (searchParams.get("edited") === "true") {
      toast.success("Categoria editada com sucesso!");
      navigate("/categorias", { replace: true });
    }
  }, [searchParams, navigate]);

  const handleNewCategory = useCallback(() => {
    navigate("/categorias/novo");
  }, [navigate]);

  const handleRetry = useCallback(() => {
    loadCategorias();
  }, [loadCategorias]);

  return (
    <DefaultLayout>
      <div className="w-full">
        <CategoriasPageHeader
          onNewCategory={handleNewCategory}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        <DataTable
          data={categorias}
          columns={columns}
          loading={loading}
          error={error}
          onRetry={handleRetry}
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalItems: pagination.totalItems,
            itemsPerPage: pagination.itemsPerPage,
            onPageChange: pagination.setCurrentPage,
          }}
          actions={actions}
          emptyMessage="Nenhuma categoria encontrada"
          emptyDescription="Não há categorias cadastradas no momento."
        />
      </div>
    </DefaultLayout>
  );
}
