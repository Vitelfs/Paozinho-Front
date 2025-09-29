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

interface ClientesFilters {
  status: string;
  nome: string;
}

interface ClientesPageHeaderProps {
  onNewClient: () => void;
  filters: ClientesFilters;
  onFiltersChange: (filters: ClientesFilters) => void;
}

export function ClientesPageHeader({
  onNewClient,
  filters,
  onFiltersChange,
}: ClientesPageHeaderProps) {
  const [localFilters, setLocalFilters] = useState<ClientesFilters>(filters);

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
    (key: keyof ClientesFilters, value: string) => {
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
          <Heading1>Clientes</Heading1>
          <Paragraph className="text-muted-foreground mt-2">
            Gerencie seus clientes e informações de contato
          </Paragraph>
        </div>
        <Button onClick={onNewClient} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-card dark:bg-card p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pesquisa por Nome */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Cliente</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Pesquisar por nome..."
                value={localFilters.nome}
                onChange={(e) => handleFilterChange("nome", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtro por Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={localFilters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
