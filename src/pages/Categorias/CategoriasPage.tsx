import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Heading1, Paragraph } from "@/components/ui/typography";
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
import { toast } from "react-toastify";
import { categoriaService } from "@/services/categoria.service";

const ITEMS_PER_PAGE = 10;

export function CategoriasPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [categorias, setCategorias] = useState<CategoriaEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Memoizar colunas e ações
  const columns = useMemo(() => createCategoriaColumns(), []);
  const actions = useMemo(
    () => createCategoriaActions(handleEdit, handleDelete),
    [handleEdit, handleDelete]
  );

  useEffect(() => {
    loadCategorias();
  }, [pagination.currentPage]);

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

  const loadCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await categoriaService.getCategoriasWithPagination({
        limit: ITEMS_PER_PAGE,
        offset: (pagination.currentPage - 1) * ITEMS_PER_PAGE,
      });

      setCategorias(data.categorias);
      pagination.updateTotalItems(data.total);
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);
      setError("Erro ao carregar categorias. Tente novamente.");
      toast.error("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.updateTotalItems]);

  const handleNewCategory = useCallback(() => {
    navigate("/categorias/novo");
  }, [navigate]);

  const handleRetry = useCallback(() => {
    loadCategorias();
  }, [loadCategorias]);

  return (
    <DefaultLayout>
      <div className="w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Heading1>Categorias</Heading1>
            <Paragraph className="text-muted-foreground mt-2">
              Gerencie as categorias dos seus produtos
            </Paragraph>
          </div>
          <Button
            onClick={handleNewCategory}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Categoria
          </Button>
        </div>

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
          search={{
            placeholder: "Pesquisar categorias...",
          }}
          actions={actions}
          emptyMessage="Nenhuma categoria encontrada"
          emptyDescription="Não há categorias cadastradas no momento."
        />
      </div>
    </DefaultLayout>
  );
}
