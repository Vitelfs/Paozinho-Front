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
          className:
            "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
        },
        [StatusVenda.PRODUZIDO]: {
          label: "Produzido",
          className:
            "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
        },
        [StatusVenda.ENTREGUE]: {
          label: "Entregue",
          className:
            "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
        },
        [StatusVenda.PAGO]: {
          label: "Pago",
          className:
            "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
        },
        [StatusVenda.CANCELADO]: {
          label: "Cancelado",
          className:
            "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
        },
      };

      const config = statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        className:
          "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800",
      };

      return (
        <Badge className={`text-xs border ${config.className}`}>
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
    id: "quantidade_vendida",
    header: "Quantidade vendida",
    enableSorting: false,
    cell: ({ row }: { row: { original: VendasEntity } }) => {
      const quantidadeVendida = row.original.item_venda.reduce((acc, item) => acc + item.quantidade, 0);
      return (
        <div className="max-w-[200px] truncate text-sm text-muted-foreground">
          {`${quantidadeVendida} bolo(s)` || "Sem quantidade vendida"}
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
    const actions: DataTableAction<VendasEntity>[] = [
      {
        id: "view",
        label: "Visualizar",
        icon: Eye,
        onClick: () => onView(venda),
        variant: "ghost" as const,
      },
    ];

    // Ações específicas por status
    switch (venda.status) {
      case StatusVenda.PENDENTE:
        actions.push(
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
          }
        );
        break;

      case StatusVenda.PRODUZIDO:
        actions.push({
          id: "entregue",
          label: "Entregue",
          icon: CheckCircle,
          onClick: () => onUpdateStatus(venda.id, StatusVenda.ENTREGUE),
          variant: "ghost" as const,
        });
        break;

      case StatusVenda.ENTREGUE:
        actions.push({
          id: "pago",
          label: "Pago",
          icon: DollarSign,
          onClick: () => onPagamento(venda),
          variant: "ghost" as const,
        });
        break;

      case StatusVenda.PAGO:
      case StatusVenda.CANCELADO:
      default:
        // Para status PAGO e CANCELADO, não há ações específicas além de visualizar e excluir
        break;
    }

    // Adiciona a ação de excluir para todos os status
    actions.push({
      id: "delete",
      label: "Excluir",
      icon: Trash2,
      onClick: () => onDelete(venda),
      variant: "ghost" as const,
    });

    return actions;
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
