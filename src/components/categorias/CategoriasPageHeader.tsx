import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heading1, Paragraph } from "@/components/ui/typography";
import { Plus, Search } from "lucide-react";

interface CategoriasFilters {
  nome: string;
}

interface CategoriasPageHeaderProps {
  onNewCategory: () => void;
  filters: CategoriasFilters;
  onFiltersChange: (filters: CategoriasFilters) => void;
}

export function CategoriasPageHeader({
  onNewCategory,
  filters,
  onFiltersChange,
}: CategoriasPageHeaderProps) {
  const [localFilters, setLocalFilters] = useState<CategoriasFilters>(filters);

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
    (key: keyof CategoriasFilters, value: string) => {
      const newFilters = { ...localFilters, [key]: value };
      setLocalFilters(newFilters);
    },
    [localFilters]
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
          <Heading1>Categorias</Heading1>
          <Paragraph className="text-muted-foreground mt-2">
            Gerencie as categorias dos seus produtos
          </Paragraph>
        </div>
        <Button onClick={onNewCategory} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-card dark:bg-card p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          {/* Pesquisa por Nome */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome da Categoria</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Pesquisar categorias..."
                value={localFilters.nome}
                onChange={(e) => handleFilterChange("nome", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
