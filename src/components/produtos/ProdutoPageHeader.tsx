import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heading1, Paragraph } from "@/components/ui/typography";
import { Plus, Search } from "lucide-react";
import type { CategoriaEntity } from "@/models/categoria.entity";

interface ProdutoFilters {
  categoria: string;
  nome: string;
}

interface ProdutoPageHeaderProps {
  onNewProduct: () => void;
  filters: ProdutoFilters;
  onFiltersChange: (filters: ProdutoFilters) => void;
  categorias: CategoriaEntity[];
}

export function ProdutoPageHeader({
  onNewProduct,
  filters,
  onFiltersChange,
  categorias,
}: ProdutoPageHeaderProps) {
  const [localFilters, setLocalFilters] = useState<ProdutoFilters>(filters);

  // Debounce para pesquisa por nome
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localFilters.nome !== filters.nome) {
        onFiltersChange(localFilters);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localFilters.nome, filters.nome, onFiltersChange, localFilters]);

  const handleFilterChange = useCallback(
    (key: keyof ProdutoFilters, value: string) => {
      const newFilters = { ...localFilters, [key]: value };
      setLocalFilters(newFilters);

      // Para filtros não-texto, aplicar imediatamente
      if (key !== "nome") {
        onFiltersChange(newFilters);
      }
    },
    [localFilters, onFiltersChange]
  );

  // Sincronizar com mudanças externas dos filtros
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  return (
    <div className="space-y-6 mb-8">
      {/* Header Principal */}
      <div className="flex justify-between items-center">
        <div>
          <Heading1>Produtos</Heading1>
          <Paragraph className="text-muted-foreground mt-2">
            Gerencie seus produtos e informações de preços
          </Paragraph>
        </div>
        <Button onClick={onNewProduct} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-card dark:bg-card p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pesquisa por Nome */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Produto</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Pesquisar produtos..."
                value={localFilters.nome}
                onChange={(e) => handleFilterChange("nome", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtro por Categoria */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria</label>
            <Select
              value={localFilters.categoria}
              onValueChange={(value) => handleFilterChange("categoria", value)}
            >
              <SelectTrigger>
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
        </div>
      </div>
    </div>
  );
}
