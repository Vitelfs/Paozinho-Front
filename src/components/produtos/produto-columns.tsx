import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type {
  DataTableColumn,
  DataTableAction,
  DataTableFilter,
} from "@/types/datatable.type";
import type { ProdutoEntity } from "@/models/produto.entity";
import type { CategoriaEntity } from "@/models/categoria.entity";

export const createProdutoColumns = (): DataTableColumn<ProdutoEntity>[] => [
  {
    id: "nome",
    header: "Nome",
    accessorKey: "nome",
    enableSorting: true,
    cell: ({ row }: { row: { original: ProdutoEntity } }) => (
      <div className="font-medium">{row.original.nome}</div>
    ),
  },
  {
    id: "categoria",
    header: "Categoria",
    accessorKey: "categoria",
    enableSorting: true,
    cell: ({ row }: { row: { original: ProdutoEntity } }) => (
      <Badge variant="secondary">{row.original.categoria.nome}</Badge>
    ),
  },
  {
    id: "descricao",
    header: "Descrição",
    accessorKey: "descricao",
    enableSorting: true,
    cell: ({ row }: { row: { original: ProdutoEntity } }) => (
      <div className="max-w-[200px] truncate">{row.original.descricao}</div>
    ),
  },
  {
    id: "preco_custo",
    header: "Preço Custo",
    accessorKey: "preco_custo",
    enableSorting: true,
    cell: ({ row }: { row: { original: ProdutoEntity } }) => (
      <div>{formatCurrency(row.original.preco_custo)}</div>
    ),
  },
  {
    id: "preco_minimo_venda",
    header: "Preço Venda",
    accessorKey: "preco_minimo_venda",
    enableSorting: true,
    cell: ({ row }: { row: { original: ProdutoEntity } }) => (
      <div>{formatCurrency(row.original.preco_minimo_venda)}</div>
    ),
  },
  {
    id: "margem",
    header: "Margem",
    accessorKey: "margem_lucro",
    enableSorting: true,
    cell: ({ row }: { row: { original: ProdutoEntity } }) => {
      return (
        <div>
          <Badge
            variant={
              row.original.margem_lucro >= 50
                ? "default"
                : row.original.margem_lucro >= 30
                ? "secondary"
                : "destructive"
            }
          >
            {row.original.margem_lucro.toFixed(1)}%
          </Badge>
        </div>
      );
    },
  },
  {
    id: "preco_revenda",
    header: "Preço Revenda",
    accessorKey: "preco_revenda",
    enableSorting: true,
    cell: ({ row }: { row: { original: ProdutoEntity } }) => (
      <div>{formatCurrency(row.original.preco_revenda)}</div>
    ),
  },
  {
    id: "margem_lucro_cliente",
    header: "Margem Cliente",
    accessorKey: "margem_lucro_cliente",
    enableSorting: true,
    cell: ({ row }: { row: { original: ProdutoEntity } }) => (
      <div>
        <Badge
          variant={
            row.original.margem_lucro_cliente >= 50
              ? "default"
              : row.original.margem_lucro_cliente >= 30
              ? "secondary"
              : "destructive"
          }
        >
          {row.original.margem_lucro_cliente.toFixed(1)}%
        </Badge>
      </div>
    ),
  },
];

export const createProdutoActions = (
  onEdit?: (produto: ProdutoEntity) => void,
  onDelete?: (produto: { id: string }) => void
): DataTableAction<ProdutoEntity>[] => [
  {
    id: "edit",
    label: "Editar",
    icon: Edit,
    onClick: (produto) => onEdit?.(produto),
  },
  {
    id: "delete",
    label: "Excluir",
    icon: Trash2,
    variant: "destructive",
    onClick: (produto) => onDelete?.({ id: produto.id }),
  },
];

export const createProdutoFilters = (
  categorias: CategoriaEntity[]
): DataTableFilter[] => [
  {
    id: "categoria",
    label: "Categoria",
    type: "select",
    placeholder: "Filtrar por categoria",
    options: [
      { label: "Todas as categorias", value: "all" },
      ...categorias.map((categoria) => ({
        label: categoria.nome,
        value: categoria.id,
      })),
    ],
    defaultValue: "all",
  },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};
