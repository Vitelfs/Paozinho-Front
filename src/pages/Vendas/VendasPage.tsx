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

// Alteração 1: Tipos de data agora são Date | undefined
interface VendasFilters {
  status: string;
  data_inicio: Date | undefined;
  data_fim: Date | undefined;
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

  // Alteração 2: Estado dos filtros inicializado convertendo string da URL para Date
  const [filters, setFilters] = useState<VendasFilters>(() => {
    const dataInicioParam = searchParams.get("data_inicio");
    const dataFimParam = searchParams.get("data_fim");
    return {
      status: searchParams.get("status") || "todos",
      data_inicio: dataInicioParam ? new Date(dataInicioParam) : undefined,
      data_fim: dataFimParam ? new Date(dataFimParam) : undefined,
      cliente_nome: searchParams.get("cliente_nome") || "",
    };
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

      const filterParams: any = {
        limit: ITEMS_PER_PAGE,
        offset: offset,
      };

      if (filters.status && filters.status !== "todos") {
        filterParams.status = filters.status;
      }

      if (filters.cliente_nome.trim()) {
        filterParams.cliente_nome = filters.cliente_nome.trim();
      }

      // Converter Date para ISO string com horários específicos
      if (filters.data_inicio) {
        const dataInicio = new Date(filters.data_inicio);
        dataInicio.setHours(0, 0, 0, 0); // 00:00:00.000Z
        filterParams.data_inicio = dataInicio.toISOString();
      }

      if (filters.data_fim) {
        const dataFim = new Date(filters.data_fim);
        dataFim.setHours(23, 59, 59, 999); // 23:59:59.999Z
        filterParams.data_fim = dataFim.toISOString();
      }

      const data: VendasResponse = await vendasService.getVendas(filterParams);
      setVendas(data.vendas || []);
      pagination.updateTotalItems(data.total || 0);

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
        await vendasService.updateStatusVenda([vendaId], novoStatus);

        const statusLabels: Record<StatusVenda, string> = {
          [StatusVenda.PENDENTE]: "Pendente",
          [StatusVenda.PAGO]: "Pago",
          [StatusVenda.CANCELADO]: "Cancelado",
          [StatusVenda.ENTREGUE]: "Entregue",
          [StatusVenda.PRODUZIDO]: "Produzido",
        };

        toast.success(`Status atualizado para: ${statusLabels[novoStatus]}`);
        loadVendas();
      } catch (error) {
        console.error("Erro ao atualizar status:", error);
        toast.error("Erro ao atualizar status da venda");
      }
    },
    [loadVendas]
  );

  const handleBulkUpdateStatus = useCallback(
    async (vendas: VendasEntity[], novoStatus: StatusVenda) => {
      try {
        const vendaIds = vendas.map((v) => v.id);
        await vendasService.updateStatusVenda(vendaIds, novoStatus);

        const statusLabels: Record<StatusVenda, string> = {
          [StatusVenda.PENDENTE]: "Pendente",
          [StatusVenda.PAGO]: "Pago",
          [StatusVenda.CANCELADO]: "Cancelado",
          [StatusVenda.ENTREGUE]: "Entregue",
          [StatusVenda.PRODUZIDO]: "Produzido",
        };

        toast.success(
          `${vendas.length} venda(s) atualizada(s) para: ${statusLabels[novoStatus]}`
        );
        loadVendas();
      } catch (error) {
        console.error("Erro ao atualizar status em massa:", error);
        toast.error("Erro ao atualizar status das vendas");
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

  // Ações em massa
  const bulkActions = useMemo(
    () => [
      {
        id: "produzido",
        label: "Marcar como Produzido",
        icon: Package,
        variant: "outline" as const,
        onClick: (selectedVendas: VendasEntity[]) => {
          const validVendas = selectedVendas.filter(
            (v) => v.status === StatusVenda.PENDENTE
          );
          if (validVendas.length === 0) {
            toast.error(
              "Apenas vendas pendentes podem ser marcadas como produzidas"
            );
            return;
          }
          openConfirmDialog(
            "Marcar como Produzido",
            `Confirma que ${validVendas.length} venda(s) foram produzidas?`,
            () => handleBulkUpdateStatus(validVendas, StatusVenda.PRODUZIDO),
            "Confirmar"
          );
        },
      },
      {
        id: "entregue",
        label: "Marcar como Entregue",
        icon: Truck,
        variant: "outline" as const,
        onClick: (selectedVendas: VendasEntity[]) => {
          const validVendas = selectedVendas.filter(
            (v) => v.status === StatusVenda.PRODUZIDO
          );
          if (validVendas.length === 0) {
            toast.error(
              "Apenas vendas produzidas podem ser marcadas como entregues"
            );
            return;
          }
          openConfirmDialog(
            "Marcar como Entregue",
            `Confirma que ${validVendas.length} venda(s) foram entregues?`,
            () => handleBulkUpdateStatus(validVendas, StatusVenda.ENTREGUE),
            "Confirmar"
          );
        },
      },
      {
        id: "cancelar",
        label: "Cancelar Vendas",
        icon: XCircle,
        variant: "destructive" as const,
        onClick: (selectedVendas: VendasEntity[]) => {
          const validVendas = selectedVendas.filter(
            (v) => v.status === StatusVenda.PENDENTE
          );
          if (validVendas.length === 0) {
            toast.error("Apenas vendas pendentes podem ser canceladas");
            return;
          }
          openConfirmDialog(
            "Cancelar Vendas",
            `Tem certeza que deseja cancelar ${validVendas.length} venda(s)?`,
            () => handleBulkUpdateStatus(validVendas, StatusVenda.CANCELADO),
            "Cancelar",
            "destructive"
          );
        },
      },
    ],
    [handleBulkUpdateStatus, openConfirmDialog]
  );
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

  // Alteração 4: Converter Date para string ao atualizar a URL
  const handleFiltersChange = useCallback(
    (newFilters: VendasFilters) => {
      setFilters(newFilters);

      const params = new URLSearchParams();
      if (newFilters.status && newFilters.status !== "todos") {
        params.set("status", newFilters.status);
      }
      if (newFilters.cliente_nome) {
        params.set("cliente_nome", newFilters.cliente_nome);
      }
      if (newFilters.data_inicio) {
        params.set(
          "data_inicio",
          newFilters.data_inicio.toISOString().split("T")[0]
        );
      }
      if (newFilters.data_fim) {
        params.set("data_fim", newFilters.data_fim.toISOString().split("T")[0]);
      }
      setSearchParams(params);

      if (pagination.currentPage > 1) {
        pagination.setCurrentPage(1);
      }
    },
    [setSearchParams, pagination]
  );

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
          bulkActions={bulkActions}
          enableSelection={true}
          emptyMessage="Nenhuma venda encontrada"
          emptyDescription="Não há vendas cadastradas no momento."
        />
      </div>

      <VendaDetailsModal
        venda={selectedVenda}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

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
