import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Heading1, Paragraph } from "@/components/ui/typography";
import {
  Plus,
  ShoppingCart,
  FileSpreadsheet,
  Calendar as CalendarIcon,
  RotateCcw,
} from "lucide-react";
import { StatusVenda } from "@/models/vendas.entity";
import { cn } from "@/lib/utils";
import { clienteService } from "@/services/cliente.service";
import type { ClienteEntity } from "@/models/cliente.entity";

// Alteração 1: Tipos de data agora são Date | undefined
interface VendasFilters {
  status: string;
  data_inicio: Date | undefined;
  data_fim: Date | undefined;
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
  const [isDataInicioOpen, setIsDataInicioOpen] = useState(false);
  const [isDataFimOpen, setIsDataFimOpen] = useState(false);
  const [clientes, setClientes] = useState<ClienteEntity[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

  // Carregar clientes ativos
  const loadClientes = useCallback(async () => {
    try {
      setLoadingClientes(true);
      const response = await clienteService.getClientes({
        limit: 1000, // Carregar todos os clientes ativos
        offset: 0,
      });
      // Filtrar apenas clientes ativos
      const clientesAtivos = response.clientes.filter(
        (cliente) => cliente.ativo
      );
      setClientes(clientesAtivos);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  // Carregar clientes quando o componente montar
  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  const handleFilterChange = useCallback(
    (key: keyof VendasFilters, value: string) => {
      const newFilters = { ...localFilters, [key]: value };
      setLocalFilters(newFilters);
      onFiltersChange(newFilters);
    },
    [localFilters, onFiltersChange]
  );

  // Função específica para mudança de cliente
  const handleClienteChange = useCallback(
    (clienteId: string) => {
      // Se clienteId for "todos", significa "Todos os clientes"
      if (clienteId === "todos") {
        const newFilters = { ...localFilters, cliente_nome: "" };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
        return;
      }

      const clienteSelecionado = clientes.find(
        (cliente) => cliente.id === clienteId
      );
      const nomeCliente = clienteSelecionado ? clienteSelecionado.nome : "";

      const newFilters = { ...localFilters, cliente_nome: nomeCliente };
      setLocalFilters(newFilters);
      onFiltersChange(newFilters);
    },
    [localFilters, onFiltersChange, clientes]
  );

  // Alteração 2: Removida a conversão para string. Trabalha diretamente com o objeto Date.
  const handleDateChange = useCallback(
    (key: "data_inicio" | "data_fim", date: Date | undefined) => {
      const newFilters = { ...localFilters, [key]: date };
      setLocalFilters(newFilters);
      onFiltersChange(newFilters);

      // Fechar o popover
      if (key === "data_inicio") {
        setIsDataInicioOpen(false);
      } else {
        setIsDataFimOpen(false);
      }
    },
    [localFilters, onFiltersChange]
  );

  // Função para limpar todos os filtros
  const handleClearFilters = useCallback(() => {
    const clearedFilters: VendasFilters = {
      status: "todos",
      data_inicio: undefined,
      data_fim: undefined,
      cliente_nome: "",
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  }, [onFiltersChange]);

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
      <div className="bg-card dark:bg-card p-4 rounded-lg border">
        <div className="flex flex-col space-y-4">
          <div className="flex gap-3">
            {/* Seleção de Cliente */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <Select
                value={
                  clientes.find(
                    (cliente) => cliente.nome === localFilters.cliente_nome
                  )?.id || "todos"
                }
                onValueChange={handleClienteChange}
                disabled={loadingClientes}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingClientes
                        ? "Carregando clientes..."
                        : "Selecione um cliente"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os clientes</SelectItem>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <SelectItem value={StatusVenda.PRODUZIDO}>
                    Produzido
                  </SelectItem>
                  <SelectItem value={StatusVenda.ENTREGUE}>Entregue</SelectItem>
                  <SelectItem value={StatusVenda.PAGO}>Pago</SelectItem>
                  <SelectItem value={StatusVenda.CANCELADO}>
                    Cancelado
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data Início */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Início</label>
              <Popover
                open={isDataInicioOpen}
                onOpenChange={setIsDataInicioOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localFilters.data_inicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {/* Alteração 3: Não precisa mais de new Date() */}
                    {localFilters.data_inicio ? (
                      localFilters.data_inicio.toLocaleDateString()
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    // Alteração 4: Não precisa mais de new Date()
                    selected={localFilters.data_inicio}
                    onSelect={(date) => handleDateChange("data_inicio", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Data Fim */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Fim</label>
              <Popover open={isDataFimOpen} onOpenChange={setIsDataFimOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localFilters.data_fim && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {/* Alteração 3: Não precisa mais de new Date() */}
                    {localFilters.data_fim ? (
                      localFilters.data_fim.toLocaleDateString()
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    // Alteração 4: Não precisa mais de new Date()
                    selected={localFilters.data_fim}
                    onSelect={(date) => handleDateChange("data_fim", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* Botão para limpar filtros */}
            <div className="flex justify-end mt-auto">
              <Button
                onClick={handleClearFilters}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 h-9"
              >
                <RotateCcw className="h-4 w-4" />
                Limpar Filtros
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
