import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  ShoppingCart,
  Eye,
  Edit,
  XCircle,
  Trash2,
  DollarSign,
  Package,
  Truck,
  FileSpreadsheet,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Heading1, Paragraph } from "@/components/ui/typography";
import { usePagination } from "@/hooks/use-pagination";
import { useFilters } from "@/hooks/use-filters";
import {
  createVendasColumns,
  vendasFilters,
} from "@/components/vendas/vendas-columns";
import type { VendasEntity, VendasResponse } from "@/models/vendas.entity";
import { StatusVenda } from "@/models/vendas.entity";
import { vendasService } from "@/services/vendas.service";
import { VendaDetailsModal } from "@/components/vendas/VendaDetailsModal";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ITEMS_PER_PAGE = 10;

export function VendasPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [vendas, setVendas] = useState<VendasEntity[]>([]);
  const [estatisticasAPI, setEstatisticasAPI] = useState({
    totalPagas: 0,
    totalPendentes: 0,
    totalCanceladas: 0,
    totalProduzidas: 0,
    totalEntregues: 0,
    totalFaturamento: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVenda, setSelectedVenda] = useState<VendasEntity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
    actionLabel: string;
    variant?: "default" | "destructive";
  }>({
    isOpen: false,
    title: "",
    description: "",
    action: () => {},
    actionLabel: "",
    variant: "default",
  });

  const pagination = usePagination({
    itemsPerPage: ITEMS_PER_PAGE,
    totalItems: 0,
  });

  const filters = useFilters({
    initialFilters: {
      status: "todos",
      cliente_nome: "",
      data_inicio: "",
      data_fim: "",
    },
  });

  const handleView = useCallback((venda: VendasEntity) => {
    setSelectedVenda(venda);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback(
    (venda: VendasEntity) => {
      navigate(`/vendas/editar/${venda.id}`);
    },
    [navigate]
  );

  const loadVendas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const offset = (pagination.currentPage - 1) * ITEMS_PER_PAGE;

      // Preparar parâmetros de filtro
      const filterParams: any = {
        limit: ITEMS_PER_PAGE,
        offset: offset,
      };

      // Adicionar filtros apenas se não forem valores padrão
      const statusFilter = filters.getFilterValue("status");
      if (statusFilter && statusFilter !== "todos") {
        filterParams.status = statusFilter;
      }

      const clienteNome = filters.getFilterValue("cliente_nome");
      if (clienteNome) {
        filterParams.cliente_nome = clienteNome;
      }

      const dataInicio = filters.getFilterValue("data_inicio");
      if (dataInicio) {
        filterParams.data_inicio = new Date(dataInicio);
      }

      const dataFim = filters.getFilterValue("data_fim");
      if (dataFim) {
        filterParams.data_fim = new Date(dataFim);
      }

      const data: VendasResponse = await vendasService.getVendas(filterParams);
      console.log(data);
      setVendas(data.vendas || []);
      pagination.updateTotalItems(data.total || 0);

      // Atualizar estatísticas da API
      setEstatisticasAPI({
        totalPagas: data.totalPagas || 0,
        totalPendentes: data.totalPendentes || 0,
        totalCanceladas: data.totalCanceladas || 0,
        totalEntregues: data.totalEntregues || 0,
        totalProduzidas: data.totalProduzidas || 0,
        totalFaturamento: data.totalFaturamento || 0,
      });
    } catch (err) {
      console.error("Erro ao carregar vendas:", err);
      setError("Erro ao carregar vendas. Tente novamente.");
      toast.error("Erro ao carregar vendas");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, filters.filters, pagination.updateTotalItems]);

  const handleUpdateStatus = useCallback(
    async (vendaId: string, novoStatus: StatusVenda) => {
      try {
        await vendasService.updateStatusVenda(vendaId, novoStatus);

        const statusLabels: Record<StatusVenda, string> = {
          [StatusVenda.PENDENTE]: "Pendente",
          [StatusVenda.PAGO]: "Pago",
          [StatusVenda.CANCELADO]: "Cancelado",
          [StatusVenda.ENTREGUE]: "Entregue",
          [StatusVenda.PRODUZIDO]: "Produzido",
        };

        toast.success(`Status atualizado para: ${statusLabels[novoStatus]}`);

        // Recarregar a lista de vendas
        loadVendas();
      } catch (error) {
        console.error("Erro ao atualizar status:", error);
        toast.error("Erro ao atualizar status da venda");
      }
    },
    [loadVendas]
  );

  const handlePagamento = useCallback(
    (venda: VendasEntity) => {
      navigate(`/vendas/processar-pagamento/${venda.id}`);
    },
    [navigate]
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedVenda(null);
  }, []);

  const openConfirmDialog = useCallback(
    (
      title: string,
      description: string,
      action: () => void,
      actionLabel: string,
      variant: "default" | "destructive" = "default"
    ) => {
      setConfirmAction({
        isOpen: true,
        title,
        description,
        action,
        actionLabel,
        variant,
      });
    },
    []
  );

  const closeConfirmDialog = useCallback(() => {
    setConfirmAction((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const executeAction = useCallback(() => {
    confirmAction.action();
    closeConfirmDialog();
  }, [confirmAction.action, closeConfirmDialog]);

  const handleDelete = useCallback(
    (venda: VendasEntity) => {
      openConfirmDialog(
        "Excluir Venda",
        `Tem certeza que deseja excluir a venda de ${venda.cliente.nome}? Esta ação não pode ser desfeita.`,
        async () => {
          try {
            await vendasService.deleteVenda(venda.id);
            setVendas((prevVendas) =>
              prevVendas.filter((v) => v.id !== venda.id)
            );
            pagination.updateTotalItems(pagination.totalItems - 1);
            toast.success("Venda excluída com sucesso");
          } catch (err) {
            console.error("Erro ao excluir venda:", err);
            toast.error("Erro ao excluir venda");
          }
        },
        "Excluir",
        "destructive"
      );
    },
    [openConfirmDialog, pagination]
  );

  // Memoizar colunas e ações
  const columns = useMemo(() => createVendasColumns(), []);
  const actions = useMemo(
    () => [
      {
        id: "view",
        label: "Visualizar",
        icon: Eye,
        onClick: handleView,
        variant: "ghost" as const,
      },
      {
        id: "edit",
        label: "Editar",
        icon: Edit,
        onClick: handleEdit,
        variant: "ghost" as const,
        hidden: (venda: VendasEntity) => venda.status !== StatusVenda.PENDENTE,
      },
      {
        id: "produzido",
        label: "Produzido",
        icon: Package,
        onClick: (venda: VendasEntity) => {
          openConfirmDialog(
            "Marcar como Produzido",
            `Confirma que a venda de ${venda.cliente.nome} foi produzida?`,
            () => handleUpdateStatus(venda.id, StatusVenda.PRODUZIDO),
            "Confirmar"
          );
        },
        variant: "ghost" as const,
        hidden: (venda: VendasEntity) => venda.status !== StatusVenda.PENDENTE,
      },
      {
        id: "entregue",
        label: "Entregue",
        icon: Truck,
        onClick: (venda: VendasEntity) => {
          openConfirmDialog(
            "Marcar como Entregue",
            `Confirma que a venda de ${venda.cliente.nome} foi entregue?`,
            () => handleUpdateStatus(venda.id, StatusVenda.ENTREGUE),
            "Confirmar"
          );
        },
        variant: "ghost" as const,
        hidden: (venda: VendasEntity) => venda.status !== StatusVenda.PRODUZIDO,
      },
      {
        id: "pago",
        label: "Pago",
        icon: DollarSign,
        onClick: (venda: VendasEntity) => {
          openConfirmDialog(
            "Marcar como Pago",
            `Confirma que a venda de ${venda.cliente.nome} foi paga?`,
            () => handlePagamento(venda),
            "Confirmar"
          );
        },
        variant: "ghost" as const,
        hidden: (venda: VendasEntity) => venda.status !== StatusVenda.ENTREGUE,
      },
      {
        id: "cancel",
        label: "Cancelar",
        icon: XCircle,
        onClick: (venda: VendasEntity) => {
          openConfirmDialog(
            "Cancelar Venda",
            `Tem certeza que deseja cancelar a venda de ${venda.cliente.nome}?`,
            () => handleUpdateStatus(venda.id, StatusVenda.CANCELADO),
            "Cancelar",
            "destructive"
          );
        },
        variant: "ghost" as const,
        hidden: (venda: VendasEntity) => venda.status !== StatusVenda.PENDENTE,
      },
      {
        id: "delete",
        label: "Excluir",
        icon: Trash2,
        onClick: handleDelete,
        variant: "ghost" as const,
        hidden: (venda: VendasEntity) => venda.status !== StatusVenda.PENDENTE,
      },
    ],
    [
      handleView,
      handleEdit,
      handleDelete,
      handleUpdateStatus,
      handlePagamento,
      openConfirmDialog,
    ]
  );

  useEffect(() => {
    loadVendas();
  }, [pagination.currentPage, filters.filters]);

  useEffect(() => {
    if (searchParams.get("created") === "true") {
      toast.success("Venda criada com sucesso!");
      navigate("/vendas", { replace: true });
    }

    if (searchParams.get("processed") === "true") {
      toast.success("Pagamento processado com sucesso!");
      navigate("/vendas", { replace: true });
    }
  }, [searchParams, navigate]);

  const handleNewVenda = useCallback(() => {
    navigate("/vendas/nova");
  }, [navigate]);

  const handleRelatorio = useCallback(() => {
    navigate("/vendas/relatorio");
  }, [navigate]);

  const handleRetry = useCallback(() => {
    loadVendas();
  }, [loadVendas]);

  // Filtrar vendas localmente baseado nos filtros ativos
  const filteredVendas = useMemo(() => {
    return vendas.filter((venda) => {
      const statusFilter = filters.getFilterValue("status");
      const clienteNome = filters.getFilterValue("cliente_nome");

      // Filtro por status
      if (statusFilter && statusFilter !== "todos") {
        if (venda.status !== statusFilter) {
          return false;
        }
      }

      // Filtro por nome do cliente
      if (clienteNome) {
        if (
          !venda.cliente.nome.toLowerCase().includes(clienteNome.toLowerCase())
        ) {
          return false;
        }
      }

      return true;
    });
  }, [vendas, filters]);

  // Calcular estatísticas usando dados da API
  const estatisticas = useMemo(() => {
    const totalVendas = vendas.length;
    const vendasProduzidas = vendas.filter(
      (v) => v.status === StatusVenda.PRODUZIDO
    ).length;

    return {
      totalVendas,
      vendasPagas: estatisticasAPI.totalPagas,
      vendasPendentes: estatisticasAPI.totalPendentes,
      vendasProduzidas,
      vendasCanceladas: estatisticasAPI.totalCanceladas,
      vendasEntregues: estatisticasAPI.totalEntregues,
      totalFaturamento: estatisticasAPI.totalFaturamento,
    };
  }, [vendas.length, estatisticasAPI, vendas]);

  return (
    <DefaultLayout>
      <div className="w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Heading1 className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Vendas
            </Heading1>
            <Paragraph className="text-muted-foreground mt-2">
              Gerencie todas as vendas realizadas
            </Paragraph>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRelatorio}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Relatórios
            </Button>
            <Button
              onClick={handleNewVenda}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Venda
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">
              {estatisticas.totalVendas}
            </div>
            <div className="text-sm text-muted-foreground">Total de Vendas</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-yellow-600">
              {estatisticas.vendasPendentes}
            </div>
            <div className="text-sm text-muted-foreground">
              Vendas Pendentes
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-orange-600">
              {estatisticas.vendasProduzidas}
            </div>
            <div className="text-sm text-muted-foreground">
              Vendas Produzidas
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-purple-600">
              {estatisticas.vendasEntregues}
            </div>
            <div className="text-sm text-muted-foreground">
              Vendas Entregues
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">
              {estatisticas.vendasPagas}
            </div>
            <div className="text-sm text-muted-foreground">Vendas Pagas</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-red-600">
              {estatisticas.vendasCanceladas}
            </div>
            <div className="text-sm text-muted-foreground">
              Vendas Canceladas
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="text-2xl font-bold text-indigo-600">
              R${" "}
              {Number(estatisticas.totalFaturamento)
                .toFixed(2)
                .replace(".", ",")}
            </div>
            <div className="text-sm text-muted-foreground">
              Faturamento Total
            </div>
          </div>
        </div>

        <DataTable
          data={filteredVendas}
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
          filters={vendasFilters}
          onFilterChange={(filterId, value) => {
            filters.setFilter(filterId, value);
            pagination.reset();
          }}
          filterValues={filters.filters}
          search={{
            placeholder: "Pesquisar por nome do cliente...",
          }}
          actions={actions}
          emptyMessage="Nenhuma venda encontrada"
          emptyDescription="Não há vendas cadastradas no momento."
        />
      </div>

      {/* Modal de Detalhes da Venda */}
      <VendaDetailsModal
        venda={selectedVenda}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Dialog de Confirmação */}
      <AlertDialog
        open={confirmAction.isOpen}
        onOpenChange={closeConfirmDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeAction}
              className={
                confirmAction.variant === "destructive"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }
            >
              {confirmAction.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DefaultLayout>
  );
}
