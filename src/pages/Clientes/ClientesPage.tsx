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
  createClienteColumns,
  createClienteActions,
  clienteFilters,
} from "@/components/clientes/cliente-columns";
import type {
  ChangeStatusClienteEntity,
  ClienteEntity,
  DeleteClienteEntity,
  UpdateClienteEntity,
} from "@/models/cliente.entity";
import { clienteService } from "@/services/cliente.service";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 10;

export function ClientesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [clientes, setClientes] = useState<ClienteEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pagination = usePagination({
    itemsPerPage: ITEMS_PER_PAGE,
    totalItems: 0,
  });

  const filters = useFilters({
    initialFilters: { status: "todos" },
  });

  const handleEdit = useCallback(
    (cliente: UpdateClienteEntity) => {
      navigate("/clientes/editar", { state: { cliente } });
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (cliente: DeleteClienteEntity) => {
      try {
        await clienteService.deleteCliente(cliente.id);

        setClientes((prevClientes) =>
          prevClientes.filter((c) => c.id !== cliente.id)
        );

        pagination.updateTotalItems(pagination.totalItems - 1);
        toast.success("Cliente excluído com sucesso");
        // Não precisa chamar loadClientes() aqui pois já atualizamos o estado local
      } catch (err) {
        console.error("Erro ao excluir cliente:", err);
        toast.error("Erro ao excluir cliente");
      }
    },
    [pagination]
  );

  const handleChangeStatus = useCallback(
    async (cliente: ChangeStatusClienteEntity) => {
      try {
        console.log(cliente);
        await clienteService.changeStatusCliente(cliente);

        setClientes((prevClientes) =>
          prevClientes.map((c) =>
            c.id === cliente.id ? { ...c, ativo: cliente.ativo } : c
          )
        );

        toast.success("Status do cliente alterado com sucesso");
      } catch (err) {
        console.error("Erro ao alterar status do cliente:", err);
        toast.error("Erro ao alterar status do cliente");
      }
    },
    []
  );

  // Memoizar colunas e ações
  const columns = useMemo(() => createClienteColumns(), []);
  const actions = useMemo(
    () => createClienteActions(handleEdit, handleDelete, handleChangeStatus),
    [handleEdit, handleDelete, handleChangeStatus]
  );

  useEffect(() => {
    loadClientes();
  }, [pagination.currentPage, filters.filters]);

  useEffect(() => {
    if (searchParams.get("created") === "true") {
      toast.success("Cliente criado com sucesso!");
      navigate("/clientes", { replace: true });
    }

    if (searchParams.get("edited") === "true") {
      toast.success("Cliente editado com sucesso!");
      navigate("/clientes", { replace: true });
    }
  }, [searchParams, navigate]);

  const loadClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const offset = (pagination.currentPage - 1) * ITEMS_PER_PAGE;
      const data = await clienteService.getClientes({
        limit: ITEMS_PER_PAGE,
        offset: offset,
      });
      console.log(data);
      setClientes(data.clientes);
      pagination.updateTotalItems(data.total);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
      setError("Erro ao carregar clientes. Tente novamente.");
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.updateTotalItems]);

  const handleNewClient = useCallback(() => {
    navigate("/clientes/novo");
  }, [navigate]);

  const handleRetry = useCallback(() => {
    loadClientes();
  }, [loadClientes]);

  // Filtrar clientes localmente baseado nos filtros ativos
  const filteredClientes = useMemo(() => {
    return clientes.filter((cliente) => {
      const statusFilter = filters.getFilterValue("status");

      if (statusFilter === "ativo") {
        return cliente.ativo === true;
      }
      if (statusFilter === "inativo") {
        return cliente.ativo === false;
      }

      return true; // "todos"
    });
  }, [clientes, filters]);

  return (
    <DefaultLayout>
      <div className="w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Heading1>Clientes</Heading1>
            <Paragraph className="text-muted-foreground mt-2">
              Gerencie seus clientes e informações de contato
            </Paragraph>
          </div>
          <Button onClick={handleNewClient} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        <DataTable
          data={filteredClientes}
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
          filters={clienteFilters}
          onFilterChange={(filterId, value) =>
            filters.setFilter(filterId, value)
          }
          filterValues={filters.filters}
          search={{
            placeholder: "Pesquisar por nome...",
          }}
          actions={actions}
          emptyMessage="Nenhum cliente encontrado"
          emptyDescription="Não há clientes cadastrados no momento."
        />
      </div>
    </DefaultLayout>
  );
}
