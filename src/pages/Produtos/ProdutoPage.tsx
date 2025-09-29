import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { DataTable } from "@/components/ui/data-table";
import { usePagination } from "@/hooks/use-pagination";
import {
  createProdutoColumns,
  createProdutoActions,
} from "@/components/produtos/produto-columns";
import type {
  ProdutoEntity,
  UpdateProdutoEntity,
  DeleteProdutoEntity,
} from "@/models/produto.entity";
import type { CategoriaEntity } from "@/models/categoria.entity";
import { ProdutoPageHeader } from "@/components/produtos/ProdutoPageHeader";
import { toast } from "react-toastify";
import { produtoService } from "@/services/produto.service";
import { categoriaService } from "@/services/categoria.service";

interface ProdutoFilters {
  categoria: string;
  nome: string;
}

const ITEMS_PER_PAGE = 10;

export function ProdutoPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [produtos, setProdutos] = useState<ProdutoEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<CategoriaEntity[]>([]);

  // Estado dos filtros
  const [filters, setFilters] = useState<ProdutoFilters>({
    categoria: searchParams.get("categoria") || "all",
    nome: searchParams.get("nome") || "",
  });

  const pagination = usePagination({
    itemsPerPage: ITEMS_PER_PAGE,
    totalItems: 0,
  });

  const loadProdutos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Preparar parâmetros de filtro
      const filterParams: any = {
        limit: ITEMS_PER_PAGE,
        offset: (pagination.currentPage - 1) * ITEMS_PER_PAGE,
      };

      // Adicionar filtro de categoria
      if (filters.categoria && filters.categoria !== "all") {
        filterParams.categoria_id = filters.categoria;
      }

      // Adicionar busca por nome
      if (filters.nome.trim()) {
        filterParams.nome = filters.nome.trim();
      }

      console.log("Enviando filtros:", filterParams);
      const data = await produtoService.getProdutosWithCategorias(filterParams);
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
  }, [pagination.currentPage, filters, pagination.updateTotalItems]);

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

  // Função para atualizar filtros
  const handleFiltersChange = useCallback(
    (newFilters: ProdutoFilters) => {
      setFilters(newFilters);

      // Atualizar URL com os novos filtros
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value !== "all" && value !== "") {
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
  const columns = useMemo(() => createProdutoColumns(), []);
  const actions = useMemo(
    () => createProdutoActions(handleEdit, handleDelete),
    [handleEdit, handleDelete]
  );

  useEffect(() => {
    loadProdutos();
  }, [loadProdutos]);

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
        <ProdutoPageHeader
          onNewProduct={handleNewProduct}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          categorias={categorias}
        />

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
          actions={actions}
          emptyMessage="Nenhum produto encontrado"
          emptyDescription="Não há produtos cadastrados no momento."
        />
      </div>
    </DefaultLayout>
  );
}
