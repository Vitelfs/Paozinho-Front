import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Heading1, Paragraph } from "@/components/ui/typography";
import { usePagination } from "@/hooks/use-pagination";
import { useFilters } from "@/hooks/use-filters";
import {
  createProdutoColumns,
  createProdutoActions,
  createProdutoFilters,
} from "@/components/produtos/produto-columns";
import type {
  ProdutoEntity,
  UpdateProdutoEntity,
  DeleteProdutoEntity,
} from "@/models/produto.entity";
import type { CategoriaEntity } from "@/models/categoria.entity";
import { toast } from "react-toastify";
import { produtoService } from "@/services/produto.service";
import { categoriaService } from "@/services/categoria.service";

const ITEMS_PER_PAGE = 10;

export function ProdutoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [produtos, setProdutos] = useState<ProdutoEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<CategoriaEntity[]>([]);

  const pagination = usePagination({
    itemsPerPage: ITEMS_PER_PAGE,
    totalItems: 0,
  });

  const filters = useFilters({
    initialFilters: { categoria: "all" },
  });

  const loadProdutos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const categoriaFilter = filters.getFilterValue("categoria");
      const data = await produtoService.getProdutosWithCategorias({
        limit: ITEMS_PER_PAGE,
        offset: (pagination.currentPage - 1) * ITEMS_PER_PAGE,
        categoria_id: categoriaFilter === "all" ? undefined : categoriaFilter,
      });

      console.log("Data", data);

      setProdutos(data.produtos);
      pagination.updateTotalItems(data.total);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
      setError("Erro ao carregar produtos. Tente novamente.");
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, filters.filters, pagination.updateTotalItems]);

  const handleEdit = useCallback(
    (produto: UpdateProdutoEntity) => {
      navigate("/produtos/editar", { state: { produto } });
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (produto: DeleteProdutoEntity) => {
      try {
        await produtoService.deleteProduto(produto.id);
        setProdutos((prevProdutos) =>
          prevProdutos.filter((p) => p.id !== produto.id)
        );
        pagination.updateTotalItems(pagination.totalItems - 1);
        toast.success("Produto excluído com sucesso");
        // Não precisa chamar loadProdutos() aqui pois já atualizamos o estado local
      } catch (err) {
        console.error("Erro ao excluir produto:", err);
        toast.error("Erro ao excluir produto. Tente novamente.");
      }
    },
    [pagination]
  );

  // Memoizar colunas e ações
  const columns = useMemo(() => createProdutoColumns(), []);
  const actions = useMemo(
    () => createProdutoActions(handleEdit, handleDelete),
    [handleEdit, handleDelete]
  );
  const produtoFilters = useMemo(
    () => createProdutoFilters(categorias),
    [categorias]
  );

  useEffect(() => {
    loadProdutos();
  }, [pagination.currentPage, filters.filters]);

  useEffect(() => {
    loadCategorias();
  }, []);

  useEffect(() => {
    if (searchParams.get("created") === "true") {
      toast.success("Produto criado com sucesso!");
      navigate("/produtos", { replace: true });
    }

    if (searchParams.get("edited") === "true") {
      toast.success("Produto editado com sucesso!");
      navigate("/produtos", { replace: true });
    }
  }, [searchParams, navigate]);

  const loadCategorias = useCallback(async () => {
    try {
      const data = await categoriaService.getCategorias();
      setCategorias(data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      toast.error("Erro ao carregar categorias");
    }
  }, []);

  const handleNewProduct = useCallback(() => {
    navigate("/produtos/novo");
  }, [navigate]);

  const handleRetry = useCallback(() => {
    loadProdutos();
  }, [loadProdutos]);

  return (
    <DefaultLayout>
      <div className="w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Heading1>Produtos</Heading1>
            <Paragraph className="text-muted-foreground mt-2">
              Gerencie seus produtos e informações de preços
            </Paragraph>
          </div>
          <Button
            onClick={handleNewProduct}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>

        <DataTable
          data={produtos}
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
          filters={produtoFilters}
          onFilterChange={(filterId, value) => {
            filters.setFilter(filterId, value);
            pagination.reset();
          }}
          filterValues={filters.filters}
          search={{
            placeholder: "Pesquisar produtos...",
          }}
          actions={actions}
          emptyMessage="Nenhum produto encontrado"
          emptyDescription="Não há produtos cadastrados no momento."
        />
      </div>
    </DefaultLayout>
  );
}
