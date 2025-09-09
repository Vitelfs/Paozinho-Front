import { useState } from "react";
import { Edit, Trash2, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type {
  ProdutoEntity,
  UpdateProdutoEntity,
  DeleteProdutoEntity,
} from "@/models/produto.entity";
import type { CategoriaEntity } from "@/models/categoria.entity";

interface ProdutosTableProps {
  produtos: ProdutoEntity[];
  onEdit: (produto: UpdateProdutoEntity) => void;
  onDelete: (produto: DeleteProdutoEntity) => void;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  categorias: CategoriaEntity[];
  categoriaFilter: string;
  onCategoriaFilterChange: (categoriaId: string) => void;
}

export function ProdutosTable({
  produtos,
  onEdit,
  onDelete,
  totalItems,
  currentPage,
  itemsPerPage,
  categorias,
  categoriaFilter,
  onCategoriaFilterChange,
}: ProdutosTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [produtoToDelete, setProdutoToDelete] = useState<ProdutoEntity | null>(
    null
  );

  const filteredProdutos = produtos.filter(
    (produto) =>
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.categoria.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (produto: ProdutoEntity) => {
    setProdutoToDelete(produto);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (produtoToDelete) {
      onDelete({ id: produtoToDelete.id });
      setDeleteDialogOpen(false);
      setProdutoToDelete(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-4">
      {/* Barra de pesquisa e filtros */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={categoriaFilter} onValueChange={onCategoriaFilterChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categorias.map((categoria) => (
              <SelectItem key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Preço Custo</TableHead>
              <TableHead className="text-right">Preço Venda</TableHead>
              <TableHead className="text-right">Margem</TableHead>
              <TableHead className="text-right">Preço Revenda</TableHead>
              <TableHead className="text-right">Margem Cliente</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProdutos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredProdutos.map((produto) => {
                const margem =
                  ((produto.preco_minimo_venda - produto.preco_custo) /
                    produto.preco_custo) *
                  100;

                return (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium">
                      {produto.nome}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {produto.categoria.nome}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {produto.descricao}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(produto.preco_custo)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(produto.preco_minimo_venda)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          margem >= 50
                            ? "default"
                            : margem >= 30
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {margem.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                              />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onEdit(produto)}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(produto)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Contador de resultados */}
      <div className="text-sm text-muted-foreground">
        Exibindo {(currentPage - 1) * itemsPerPage + 1} a{" "}
        {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}{" "}
        produtos
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto "{produtoToDelete?.nome}
              "? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
