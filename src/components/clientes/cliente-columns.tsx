import { Edit, Trash2, ToggleLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type {
  DataTableColumn,
  DataTableAction,
  DataTableFilter,
} from "@/types/datatable.type";
import type { ClienteEntity } from "@/models/cliente.entity";

export const createClienteColumns = (): DataTableColumn<ClienteEntity>[] => [
  {
    id: "nome",
    header: "Nome",
    accessorKey: "nome",
    enableSorting: true,
    cell: ({ row }: { row: { original: ClienteEntity } }) => (
      <div className="font-medium">{row.original.nome}</div>
    ),
  },
  {
    id: "endereco",
    header: "Endereço",
    accessorKey: "endereco",
    enableSorting: true,
    cell: ({ row }: { row: { original: ClienteEntity } }) => (
      <div className="max-w-[200px] truncate">{row.original.endereco}</div>
    ),
  },
  {
    id: "contato",
    header: "Contato",
    accessorKey: "contato",
    enableSorting: true,
    cell: ({ row }: { row: { original: ClienteEntity } }) => (
      <div>{row.original.contato}</div>
    ),
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "ativo",
    enableSorting: true,
    cell: ({ row }: { row: { original: ClienteEntity } }) => {
      const isActive = row.original.ativo;
      return (
        <Badge
          variant={isActive ? "default" : "secondary"}
          className={
            isActive
              ? "bg-green-100 text-green-800 hover:bg-green-100"
              : "bg-red-100 text-red-800 hover:bg-red-100"
          }
        >
          {isActive ? "Ativo" : "Inativo"}
        </Badge>
      );
    },
  },
];

export const createClienteActions = (
  onEdit?: (cliente: ClienteEntity) => void,
  onDelete?: (cliente: { id: string }) => void,
  onChangeStatus?: (cliente: { id: string; ativo: boolean }) => void
): DataTableAction<ClienteEntity>[] => [
  {
    id: "edit",
    label: "Editar",
    icon: Edit,
    onClick: (cliente) => onEdit?.(cliente),
  },
  {
    id: "change-status",
    label: "Alterar status",
    icon: ToggleLeft,
    onClick: (cliente) =>
      onChangeStatus?.({ id: cliente.id, ativo: !cliente.ativo }),
  },
  {
    id: "delete",
    label: "Excluir",
    icon: Trash2,
    variant: "destructive",
    onClick: (cliente) => onDelete?.({ id: cliente.id }),
  },
];

export const clienteFilters: DataTableFilter[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    placeholder: "Filtrar por status",
    options: [
      { label: "Todos", value: "todos" },
      { label: "Ativo", value: "ativo" },
      { label: "Inativo", value: "inativo" },
    ],
    defaultValue: "todos",
  },
];
