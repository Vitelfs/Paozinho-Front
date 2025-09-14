import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { DataTable } from "@/components/ui/data-table";
import { usePagination } from "@/hooks/use-pagination";
import {
  createClienteColumns,
  createClienteActions,
} from "@/components/clientes/cliente-columns";
import type {
  ChangeStatusClienteEntity,
  ClienteEntity,
  DeleteClienteEntity,
  UpdateClienteEntity,
} from "@/models/cliente.entity";
import { ClientesPageHeader } from "@/components/clientes/ClientesPageHeader";
import { clienteService } from "@/services/cliente.service";
import { toast } from "react-toastify";

interface ClientesFilters {
  status: string;
  nome: string;
}

const ITEMS_PER_PAGE = 10;

export function ClientesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [clientes, setClientes] = useState<ClienteEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado dos filtros
  const [filters, setFilters] = useState<ClientesFilters>({
    status: searchParams.get("status") || "todos",
    nome: searchParams.get("nome") || "",
  });

  const pagination = usePagination({
    itemsPerPage: ITEMS_PER_PAGE,
    totalItems: 0,
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

  const loadClientes = useCallback(async () => {
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
      const data = await clienteService.getClientes(filterParams);
      console.log(data);

      // Aplicar filtro de status localmente após receber dados do servidor
      let filteredClientes = data.clientes;

      if (filters.status === "ativo") {
        filteredClientes = data.clientes.filter(
          (cliente) => cliente.ativo === true
        );
      } else if (filters.status === "inativo") {
        filteredClientes = data.clientes.filter(
          (cliente) => cliente.ativo === false
        );
      }

      setClientes(filteredClientes);
      pagination.updateTotalItems(filteredClientes.length);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
      setError("Erro ao carregar clientes. Tente novamente.");
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, filters, pagination.updateTotalItems]);

  // Função para atualizar filtros
  const handleFiltersChange = useCallback(
    (newFilters: ClientesFilters) => {
      setFilters(newFilters);

      // Atualizar URL com os novos filtros
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value !== "todos" && value !== "") {
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
  const columns = useMemo(() => createClienteColumns(), []);
  const actions = useMemo(
    () => createClienteActions(handleEdit, handleDelete, handleChangeStatus),
    [handleEdit, handleDelete, handleChangeStatus]
  );

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

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

  const handleNewClient = useCallback(() => {
    navigate("/clientes/novo");
  }, [navigate]);

  const handleRetry = useCallback(() => {
    loadClientes();
  }, [loadClientes]);

  return (
    <DefaultLayout>
      <div className="w-full">
        <ClientesPageHeader
          onNewClient={handleNewClient}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        <DataTable
          data={clientes}
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
          emptyMessage="Nenhum cliente encontrado"
          emptyDescription="Não há clientes cadastrados no momento."
        />
      </div>
    </DefaultLayout>
  );
}
