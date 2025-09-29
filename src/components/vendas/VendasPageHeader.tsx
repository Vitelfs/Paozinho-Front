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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  ShoppingCart,
  FileSpreadsheet,
  Calendar as CalendarIcon,
  RotateCcw,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
} from "lucide-react";
import { StatusVenda } from "@/models/vendas.entity";
import { cn } from "@/lib/utils";
import { clienteService } from "@/services/cliente.service";
import type { ClienteEntity } from "@/models/cliente.entity";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

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
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <Heading1 className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Vendas
          </Heading1>
          <Paragraph className="text-muted-foreground mt-2">
            Gerencie todas as vendas realizadas
          </Paragraph>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            onClick={onRelatorio}
            variant="outline"
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Relatórios</span>
            <span className="sm:hidden">Relatórios</span>
          </Button>
          <Button
            onClick={onNewVenda}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Venda</span>
            <span className="sm:hidden">Nova Venda</span>
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <Tabs defaultValue="vendas">
        <TabsList>
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
        </TabsList>
        <TabsContent value="vendas">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Total
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  {estatisticas.totalVendas}
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 dark:border-yellow-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                  Pendentes
                </CardTitle>
                <Clock className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                  {estatisticas.vendasPendentes}
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  Produzidas
                </CardTitle>
                <Package className="h-4 w-4 text-orange-500 dark:text-orange-400" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                  {estatisticas.vendasProduzidas}
                </div>
              </CardContent>
            </Card>

            <Card className="border-violet-200 dark:border-violet-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-sm font-medium text-violet-700 dark:text-violet-300">
                  Entregues
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-violet-500 dark:text-violet-400" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-violet-800 dark:text-violet-200">
                  {estatisticas.vendasEntregues}
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Pagas
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                  {estatisticas.vendasPagas}
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">
                  Canceladas
                </CardTitle>
                <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-red-800 dark:text-red-200">
                  {estatisticas.vendasCanceladas}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="estatisticas">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Faturamento Total
                </CardTitle>
                <DollarSign className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  R${" "}
                  {Number(estatisticas.totalFaturamento).toLocaleString(
                    "pt-BR",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Total a Receber
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                  R${" "}
                  {Number(estatisticas.totalAReceber).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Total Recebido
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                  R${" "}
                  {Number(estatisticas.totalRecebido).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Filtros */}
      <div className="bg-card dark:bg-card p-4 rounded-lg border">
        <div className="space-y-4">
          {/* Filtros em Grid Responsivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={loadingClientes ? "Carregando..." : "Cliente"}
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
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
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
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {localFilters.data_inicio
                        ? localFilters.data_inicio.toLocaleDateString()
                        : "Data início"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
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
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {localFilters.data_fim
                        ? localFilters.data_fim.toLocaleDateString()
                        : "Data fim"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters.data_fim}
                    onSelect={(date) => handleDateChange("data_fim", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Botão para limpar filtros */}
            <div className="flex items-end">
              <Button
                onClick={handleClearFilters}
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-2 w-full h-10"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Limpar</span>
                <span className="sm:hidden">Limpar Filtros</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
