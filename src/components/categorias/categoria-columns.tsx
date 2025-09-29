import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DataTableColumn, DataTableAction } from "@/types/datatable.type";
import type { CategoriaEntity } from "@/models/categoria.entity";

export const createCategoriaColumns =
  (): DataTableColumn<CategoriaEntity>[] => [
    {
      id: "nome",
      header: "Nome",
      accessorKey: "nome",
      enableSorting: true,
      cell: ({ row }: { row: { original: CategoriaEntity } }) => (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {row.original.nome}
          </Badge>
        </div>
      ),
    },
    {
      id: "id",
      header: "ID",
      accessorKey: "id",
      enableSorting: true,
      cell: ({ row }: { row: { original: CategoriaEntity } }) => (
        <div className="text-muted-foreground text-sm">{row.original.id}</div>
      ),
    },
  ];

export const createCategoriaActions = (
  onEdit?: (categoria: CategoriaEntity) => void,
  onDelete?: (categoria: { id: string }) => void
): DataTableAction<CategoriaEntity>[] => [
  {
    id: "edit",
    label: "Editar",
    icon: Edit,
    onClick: (categoria) => onEdit?.(categoria),
  },
  {
    id: "delete",
    label: "Excluir",
    icon: Trash2,
    variant: "destructive",
    onClick: (categoria) => onDelete?.({ id: categoria.id }),
  },
];
