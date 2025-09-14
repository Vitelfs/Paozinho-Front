import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Eye,
  Edit,
  XCircle,
  Trash2,
  DollarSign,
  Package,
  Truck,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { DataTable } from "@/components/ui/data-table";
import { usePagination } from "@/hooks/use-pagination";
import { createVendasColumns } from "@/components/vendas/vendas-columns";
import type { VendasEntity, VendasResponse } from "@/models/vendas.entity";
import { StatusVenda } from "@/models/vendas.entity";
import { vendasService } from "@/services/vendas.service";
import { VendaDetailsModal } from "@/components/vendas/VendaDetailsModal";
import { VendasPageHeader } from "@/components/vendas/VendasPageHeader";
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

interface VendasFilters {
  status: string;
  data_inicio: string;
  data_fim: string;
  cliente_nome: string;
}

const ITEMS_PER_PAGE = 10;

export function VendasPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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

  // Estado dos filtros
  const [filters, setFilters] = useState<VendasFilters>({
    status: searchParams.get("status") || "todos",
    data_inicio: searchParams.get("data_inicio") || "",
    data_fim: searchParams.get("data_fim") || "",
    cliente_nome: searchParams.get("cliente_nome") || "",
  });

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
      if (filters.status && filters.status !== "todos") {
        filterParams.status = filters.status;
      }

      // Adicionar busca por nome do cliente se houver
      if (filters.cliente_nome.trim()) {
        filterParams.cliente_nome = filters.cliente_nome.trim();
      }

      if (filters.data_inicio) {
        filterParams.data_inicio = new Date(filters.data_inicio);
      }

      if (filters.data_fim) {
        filterParams.data_fim = new Date(filters.data_fim);
      }

      console.log("Enviando filtros:", filterParams);
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
  }, [pagination.currentPage, filters, pagination.updateTotalItems]);

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
  }, [loadVendas]);

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

  // Função para atualizar filtros
  const handleFiltersChange = useCallback(
    (newFilters: VendasFilters) => {
      setFilters(newFilters);

      // Atualizar URL com os novos filtros
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value !== "todos") {
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

  // Os dados já vêm filtrados do servidor, não precisa filtrar localmente

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
        <VendasPageHeader
          onNewVenda={handleNewVenda}
          onRelatorio={handleRelatorio}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          estatisticas={estatisticas}
        />
        <DataTable
          data={vendas}
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
