import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  DollarSign,
} from "lucide-react";
import type {
  DataTableColumn,
  DataTableAction,
  DataTableFilter,
} from "@/types/datatable.type";
import type { VendasEntity } from "@/models/vendas.entity";
import { StatusVenda } from "@/models/vendas.entity";

export const createVendasColumns = (): DataTableColumn<VendasEntity>[] => [
  {
    id: "cliente",
    header: "Cliente",
    accessorKey: "cliente_id",
    enableSorting: true,
    cell: ({ row }: { row: { original: VendasEntity } }) => {
      const cliente = row.original.cliente;
      return (
        <div>
          <div className="font-medium">{cliente.nome}</div>
          <div className="text-sm text-muted-foreground">{cliente.contato}</div>
        </div>
      );
    },
  },
  {
    id: "data_venda",
    header: "Data da Venda",
    accessorKey: "data_venda",
    enableSorting: true,
    cell: ({ row }: { row: { original: VendasEntity } }) => {
      const data = new Date(row.original.data_venda);
      return <div className="text-sm">{data.toLocaleDateString("pt-BR")}</div>;
    },
  },
  {
    id: "total",
    header: "Total",
    accessorKey: "total",
    enableSorting: true,
    cell: ({ row }: { row: { original: VendasEntity } }) => {
      const total = row.original.total;
      return (
        <div className="font-medium text-green-600">
          R$ {Number(total).toFixed(2).replace(".", ",")}
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    enableSorting: true,
    cell: ({ row }: { row: { original: VendasEntity } }) => {
      const status = row.original.status;
      const statusConfig = {
        [StatusVenda.PENDENTE]: {
          label: "Pendente",
          variant: "secondary" as const,
        },
        [StatusVenda.PRODUZIDO]: {
          label: "Produzido",
          variant: "default" as const,
        },
        [StatusVenda.ENTREGUE]: {
          label: "Entregue",
          variant: "outline" as const,
        },
        [StatusVenda.PAGO]: { label: "Pago", variant: "default" as const },
        [StatusVenda.CANCELADO]: {
          label: "Cancelado",
          variant: "destructive" as const,
        },
      };

      const config = statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        variant: "secondary" as const,
      };

      return (
        <Badge variant={config.variant} className="text-xs">
          {config.label}
        </Badge>
      );
    },
  },
  {
    id: "produtos",
    header: "Produtos",
    accessorKey: "item_venda",
    enableSorting: false,
    cell: ({ row }: { row: { original: VendasEntity } }) => {
      const itens = row.original.item_venda;
      if (!itens || itens.length === 0) {
        return (
          <div className="text-sm text-muted-foreground">Sem produtos</div>
        );
      }

      return (
        <div className="max-w-[200px]">
          <div className="text-sm font-medium">{itens.length} produto(s)</div>
          <div className="text-xs text-muted-foreground truncate">
            {itens.map((item) => item.produto.nome).join(", ")}
          </div>
        </div>
      );
    },
  },
  {
    id: "observacoes",
    header: "Observações",
    accessorKey: "observacoes",
    enableSorting: false,
    cell: ({ row }: { row: { original: VendasEntity } }) => {
      const observacoes = row.original.observacoes;
      return (
        <div className="max-w-[200px] truncate text-sm text-muted-foreground">
          {observacoes || "Sem observações"}
        </div>
      );
    },
  },
  {
    id: "createdAt",
    header: "Criado em",
    accessorKey: "createdAt",
    enableSorting: true,
    cell: ({ row }: { row: { original: VendasEntity } }) => {
      const data = new Date(row.original.createdAt);
      return (
        <div className="text-sm text-muted-foreground">
          {data.toLocaleDateString("pt-BR")}
        </div>
      );
    },
  },
];

export const createVendasActions = (
  onView: (venda: VendasEntity) => void,
  onEdit: (venda: VendasEntity) => void,
  onDelete: (venda: VendasEntity) => void,
  onUpdateStatus: (vendaId: string, status: StatusVenda) => void,
  onPagamento: (venda: VendasEntity) => void
) => {
  return (venda: VendasEntity): DataTableAction<VendasEntity>[] => {
    const baseActions: DataTableAction<VendasEntity>[] = [
      {
        id: "view",
        label: "Visualizar",
        icon: Eye,
        onClick: () => onView(venda),
        variant: "ghost" as const,
      },
    ];

    // Ações específicas por status
    const statusActions: DataTableAction<VendasEntity>[] = [];

    switch (venda.status) {
      case StatusVenda.PENDENTE:
        statusActions.push(
          {
            id: "edit",
            label: "Editar",
            icon: Edit,
            onClick: () => onEdit(venda),
            variant: "ghost" as const,
          },
          {
            id: "produzido",
            label: "Produzido",
            icon: CheckCircle,
            onClick: () => onUpdateStatus(venda.id, StatusVenda.PRODUZIDO),
            variant: "ghost" as const,
          },
          {
            id: "cancelado",
            label: "Cancelar",
            icon: XCircle,
            onClick: () => onUpdateStatus(venda.id, StatusVenda.CANCELADO),
            variant: "ghost" as const,
          },
          {
            id: "delete",
            label: "Excluir",
            icon: Trash2,
            onClick: () => onDelete(venda),
            variant: "ghost" as const,
          }
        );
        break;

      case StatusVenda.PRODUZIDO:
        statusActions.push({
          id: "entregue",
          label: "Entregue",
          icon: CheckCircle,
          onClick: () => onUpdateStatus(venda.id, StatusVenda.ENTREGUE),
          variant: "ghost" as const,
        });
        break;

      case StatusVenda.ENTREGUE:
        statusActions.push({
          id: "pago",
          label: "Pago",
          icon: DollarSign,
          onClick: () => onPagamento(venda),
          variant: "ghost" as const,
        });
        break;

      default:
        // Para status PAGO e CANCELADO, apenas visualizar
        break;
    }

    return [...baseActions, ...statusActions];
  };
};

export const vendasFilters: DataTableFilter[] = [
  {
    id: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { value: "todos", label: "Todos" },
      { value: StatusVenda.PENDENTE, label: "Pendente" },
      { value: StatusVenda.PRODUZIDO, label: "Produzido" },
      { value: StatusVenda.ENTREGUE, label: "Entregue" },
      { value: StatusVenda.PAGO, label: "Pago" },
      { value: StatusVenda.CANCELADO, label: "Cancelado" },
    ],
  },
  {
    id: "data_inicio",
    label: "Data Início",
    type: "date" as const,
  },
  {
    id: "data_fim",
    label: "Data Fim",
    type: "date" as const,
  },
];
