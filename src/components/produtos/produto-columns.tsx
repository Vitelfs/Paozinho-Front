import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type {
  DataTableColumn,
  DataTableAction,
  DataTableFilter,
} from "@/types/datatable.type";
import type { ProdutoEntity } from "@/models/produto.entity";
import type { CategoriaEntity } from "@/models/categoria.entity";
import { calculateMargemLucro, calculateMarkup } from "@/utils/dataFormater";

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
    enableSorting: true,
    cell: ({ row }: { row: { original: ProdutoEntity } }) => {
      return (
        <div>
          <Badge
            variant={
              calculateMargemLucro(row.original.preco_custo, row.original.preco_minimo_venda) >= 50
                ? "default"
                : calculateMargemLucro(row.original.preco_custo, row.original.preco_minimo_venda) >= 30
                ? "secondary"
                : "destructive"
            }
          >
            {calculateMargemLucro(row.original.preco_custo, row.original.preco_minimo_venda).toFixed(1)}%
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
    enableSorting: true,
    cell: ({ row }: { row: { original: ProdutoEntity } }) => (
      <div>
        <Badge
          variant={
            calculateMargemLucro(row.original.preco_minimo_venda, row.original.preco_revenda) >= 50
              ? "default"
              : calculateMargemLucro(row.original.preco_minimo_venda, row.original.preco_revenda) >= 30
              ? "secondary"
              : "destructive"
          }
        >
          {calculateMargemLucro(row.original.preco_minimo_venda, row.original.preco_revenda).toFixed(1)}%
        </Badge>
      </div>
    ),
  },
  {
    id: "markup_cliente",
    header: "Markup Cliente",
    enableSorting: true,
    cell: ({ row }: { row: { original: ProdutoEntity } }) => (
      <div>{calculateMarkup(row.original.preco_minimo_venda, row.original.preco_revenda).toFixed(1)}%</div>
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
