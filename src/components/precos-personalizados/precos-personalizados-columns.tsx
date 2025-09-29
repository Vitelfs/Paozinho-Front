import { Package, User, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DataTableColumn, DataTableAction } from "@/types/datatable.type";
import type { clientesPrecosPersonalizados } from "@/models/precos_personalizados.entity";

export const createPrecosPersonalizadosColumns =
  (): DataTableColumn<clientesPrecosPersonalizados>[] => [
    {
      id: "nome",
      header: "Nome do Cliente",
      accessorKey: "nome",
      enableSorting: true,
      cell: ({ row }: { row: { original: clientesPrecosPersonalizados } }) => {
        const cliente = row.original;
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{cliente.nome}</span>
          </div>
        );
      },
    },
    {
      id: "contato",
      header: "Contato",
      accessorKey: "contato",
      enableSorting: true,
      cell: ({ row }: { row: { original: clientesPrecosPersonalizados } }) => {
        return (
          <span className="text-muted-foreground">{row.original.contato}</span>
        );
      },
    },
    {
      id: "ativo",
      header: "Status",
      accessorKey: "ativo",
      enableSorting: true,
      cell: ({ row }: { row: { original: clientesPrecosPersonalizados } }) => {
        const ativo = row.original.ativo;
        return (
          <Badge variant={ativo ? "default" : "secondary"}>
            {ativo ? "Ativo" : "Inativo"}
          </Badge>
        );
      },
    },
    {
      id: "precoPersonalizado",
      header: "Produtos com Preço Personalizado",
      accessorKey: "precoPersonalizado",
      enableSorting: false,
      cell: ({ row }: { row: { original: clientesPrecosPersonalizados } }) => {
        const quantidade = row.original.precoPersonalizado?.length || 0;

        return (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {quantidade} produto{quantidade !== 1 ? "s" : ""}
            </span>
          </div>
        );
      },
    },
  ];

export const createPrecosPersonalizadosActions = (
  onViewProducts: (cliente: clientesPrecosPersonalizados) => void
): DataTableAction<clientesPrecosPersonalizados>[] => {
  return [
    {
      id: "view-products",
      label: "Ver Produtos",
      icon: Eye,
      variant: "outline",
      onClick: onViewProducts,
    },
  ];
};
