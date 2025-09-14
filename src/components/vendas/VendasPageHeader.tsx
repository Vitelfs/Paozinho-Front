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
import { Plus, ShoppingCart, FileSpreadsheet, Search } from "lucide-react";
import { StatusVenda } from "@/models/vendas.entity";

interface VendasFilters {
  status: string;
  data_inicio: string;
  data_fim: string;
  cliente_nome: string;
}

interface VendasPageHeaderProps {
  onNewVenda: () => void;
  onRelatorio: () => void;
  filters: VendasFilters;
  onFiltersChange: (filters: VendasFilters) => void;
  estatisticas: any;
}

export function VendasPageHeader({
  onNewVenda,
  onRelatorio,
  filters,
  onFiltersChange,
  estatisticas,
}: VendasPageHeaderProps) {
  const [localFilters, setLocalFilters] = useState<VendasFilters>(filters);

  // Debounce para pesquisa por nome do cliente
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localFilters.cliente_nome !== filters.cliente_nome) {
        onFiltersChange(localFilters);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    localFilters.cliente_nome,
    filters.cliente_nome,
    onFiltersChange,
    localFilters,
  ]);

  const handleFilterChange = useCallback(
    (key: keyof VendasFilters, value: string) => {
      const newFilters = { ...localFilters, [key]: value };
      setLocalFilters(newFilters);

      // Para filtros não-texto, aplicar imediatamente
      if (key !== "cliente_nome") {
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
          <Heading1 className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Vendas
          </Heading1>
          <Paragraph className="text-muted-foreground mt-2">
            Gerencie todas as vendas realizadas
          </Paragraph>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onRelatorio}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Relatórios
          </Button>
          <Button onClick={onNewVenda} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Venda
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-8">
        <div className="bg-white dark:bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">
            {estatisticas.totalVendas}
          </div>
          <div className="text-sm text-muted-foreground">Total de Vendas</div>
        </div>
        <div className="bg-white dark:bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">
            {estatisticas.vendasPendentes}
          </div>
          <div className="text-sm text-muted-foreground">Vendas Pendentes</div>
        </div>
        <div className="bg-white dark:bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">
            {estatisticas.vendasProduzidas}
          </div>
          <div className="text-sm text-muted-foreground">Vendas Produzidas</div>
        </div>
        <div className="bg-white dark:bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {estatisticas.vendasEntregues}
          </div>
          <div className="text-sm text-muted-foreground">Vendas Entregues</div>
        </div>
        <div className="bg-white dark:bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {estatisticas.vendasPagas}
          </div>
          <div className="text-sm text-muted-foreground">Vendas Pagas</div>
        </div>
        <div className="bg-white dark:bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">
            {estatisticas.vendasCanceladas}
          </div>
          <div className="text-sm text-muted-foreground">Vendas Canceladas</div>
        </div>
        <div className="bg-white dark:bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-indigo-600">
            R${" "}
            {Number(estatisticas.totalFaturamento).toFixed(2).replace(".", ",")}
          </div>
          <div className="text-sm text-muted-foreground">Faturamento Total</div>
        </div>
      </div>
      {/* Filtros */}
      <div className="bg-card dark:bg-card p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pesquisa por Cliente */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Cliente</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Pesquisar por nome do cliente..."
                value={localFilters.cliente_nome}
                onChange={(e) =>
                  handleFilterChange("cliente_nome", e.target.value)
                }
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
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value={StatusVenda.PENDENTE}>Pendente</SelectItem>
                <SelectItem value={StatusVenda.PRODUZIDO}>Produzido</SelectItem>
                <SelectItem value={StatusVenda.ENTREGUE}>Entregue</SelectItem>
                <SelectItem value={StatusVenda.PAGO}>Pago</SelectItem>
                <SelectItem value={StatusVenda.CANCELADO}>Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Início */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Início</label>
            <Input
              type="date"
              value={localFilters.data_inicio}
              onChange={(e) =>
                handleFilterChange("data_inicio", e.target.value)
              }
            />
          </div>

          {/* Data Fim */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Fim</label>
            <Input
              type="date"
              value={localFilters.data_fim}
              onChange={(e) => handleFilterChange("data_fim", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
