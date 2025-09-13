import { useState, useEffect, useCallback, useMemo } from "react";
import { DollarSign } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { DataTable } from "@/components/ui/data-table";
import { Heading1, Paragraph } from "@/components/ui/typography";
import { usePagination } from "@/hooks/use-pagination";
import { useFilters } from "@/hooks/use-filters";
import {
  createPrecosPersonalizadosColumns,
  createPrecosPersonalizadosActions,
} from "@/components/precos-personalizados/precos-personalizados-columns";
import type { clientesPrecosPersonalizados } from "@/models/precos_personalizados.entity";
import { toast } from "react-toastify";
import { precosPersonalizadosService } from "@/services/precos-personalizados.service";

const ITEMS_PER_PAGE = 10;

export function PrecosPersonalizados() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [clientes, setClientes] = useState<clientesPrecosPersonalizados[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pagination = usePagination({
    itemsPerPage: ITEMS_PER_PAGE,
    totalItems: 0,
  });

  const filters = useFilters({
    initialFilters: { status: "todos" },
  });

  const loadClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await precosPersonalizadosService.getClientesComPrecosPersonalizados();

      // Aplicar filtros locais
      let filteredData = response.clientesPrecosPersonalizados;

      const statusFilter = filters.getFilterValue("status");
      if (statusFilter === "ativo") {
        filteredData = response.clientesPrecosPersonalizados.filter(
          (cliente) => cliente.ativo === true
        );
      } else if (statusFilter === "inativo") {
        filteredData = response.clientesPrecosPersonalizados.filter(
          (cliente) => cliente.ativo === false
        );
      }

      setClientes(filteredData);
      pagination.updateTotalItems(response.total);
    } catch (err) {
      console.error(
        "Erro ao carregar clientes com preços personalizados:",
        err
      );
      setError("Erro ao carregar dados. Tente novamente.");
      toast.error("Erro ao carregar preços personalizados");
    } finally {
      setLoading(false);
    }
  }, [filters.filters, pagination.updateTotalItems]);

  const handleViewProducts = useCallback(
    (cliente: clientesPrecosPersonalizados) => {
      navigate("/precos-personalizados/cliente", { state: { cliente } });
    },
    [navigate]
  );

  // Memoizar colunas e ações
  const columns = useMemo(() => createPrecosPersonalizadosColumns(), []);
  const actions = useMemo(
    () => createPrecosPersonalizadosActions(handleViewProducts),
    [handleViewProducts]
  );

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  useEffect(() => {
    if (searchParams.get("updated") === "true") {
      toast.success("Preços personalizados atualizados com sucesso!");
    }
  }, [searchParams]);

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

  const clienteFilters = [
    {
      id: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "todos", label: "Todos" },
        { value: "ativo", label: "Ativos" },
        { value: "inativo", label: "Inativos" },
      ],
    },
  ];

  return (
    <DefaultLayout>
      <div className="w-full">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-6 w-6" />
            <Heading1>Preços Personalizados</Heading1>
          </div>
          <Paragraph className="text-muted-foreground">
            Gerencie os preços personalizados para cada cliente
          </Paragraph>
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
          onFilterChange={(filterId, value) => {
            filters.setFilter(filterId, value);
            pagination.reset();
          }}
          filterValues={filters.filters}
          search={{
            placeholder: "Pesquisar por nome do cliente...",
          }}
          actions={actions}
          emptyMessage="Nenhum cliente encontrado"
          emptyDescription="Não há clientes cadastrados ou com preços personalizados configurados."
        />
      </div>
    </DefaultLayout>
  );
}
