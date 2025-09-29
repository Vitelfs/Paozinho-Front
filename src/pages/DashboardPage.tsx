import { useState, useEffect } from "react";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { type DateRange } from "react-day-picker";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Calendar as CalendarIcon,
  Crown,
  Star,
  Clock,
  Layers,
  Award,
} from "lucide-react";

import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading1, Paragraph } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  XAxis,
  YAxis,
  Line,
  LineChart,
  CartesianGrid,
} from "recharts";

import {
  dashboardService,
  type DashboardMetrics,
} from "@/services/dashboard.service";
import { cn } from "@/lib/utils";
import { StatusVenda } from "@/models/vendas.entity";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Configuração de cores para os gráficos
const chartConfig = {
  vendas: {
    label: "Qnt. vendida",
    color: "#3b82f6", // azul mais vibrante
  },
  faturamento: {
    label: "Faturamento",
    color: "#10b981", // verde
  },
  PENDENTE: {
    label: "Pendente",
    color: "#fbbf24", // amarelo
  },
  PRODUZIDO: {
    label: "Produzido",
    color: "#3b82f6", // azul
  },
  ENTREGUE: {
    label: "Entregue",
    color: "#8b5cf6", // roxo
  },
  PAGO: {
    label: "Pago",
    color: "#10b981", // verde
  },
  CANCELADO: {
    label: "Cancelado",
    color: "#ef4444", // vermelho
  },
};

const COLORS = ["#fbbf24", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444"];

// Componente reutilizável para listar produtos
interface ProdutosListProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  data: {
    produto: string;
    quantidade: number;
    faturamento: number;
    percentualParticipacao: number;
  }[];
  loading: boolean;
}

function ProdutosList({
  data,
  loading,
  title,
  description,
  icon,
}: ProdutosListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {data.slice(0, 10).map((produto, index) => (
              <div
                key={produto.produto}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                {/* Ranking com ícone especial para top 3 */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium">
                  {index < 3 ? (
                    <Award
                      className={`h-4 w-4 ${
                        index === 0
                          ? "text-yellow-500"
                          : index === 1
                          ? "text-gray-500"
                          : "text-amber-600"
                      }`}
                    />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Informações do produto */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground truncate">
                    {produto.produto}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {produto.quantidade} unidades
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      {produto.percentualParticipacao.toFixed(1)}% do total
                    </span>
                  </div>
                </div>

                {/* Faturamento */}
                <div className="text-right">
                  <div className="font-semibold text-sm text-foreground">
                    R${" "}
                    {produto.faturamento.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    faturamento
                  </div>
                </div>
              </div>
            ))}
            {data.length === 0 && !loading && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Nenhum produto encontrado
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// Componente reutilizável para listar status
interface StatusListProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  data: {
    status: StatusVenda;
    count: number;
    total: number;
  }[];
  loading: boolean;
}

function StatusList({
  data,
  loading,
  title,
  description,
  icon,
}: StatusListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        data.map((item) => (
          <div
            key={item.status}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
          >
            {/* Status Badge */}
            <Badge
              className={cn(
                "text-xs border font-medium",
                item.status === "PENDENTE" &&
                  "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
                item.status === "PRODUZIDO" &&
                  "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
                item.status === "ENTREGUE" &&
                  "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
                item.status === "PAGO" &&
                  "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
                item.status === "CANCELADO" &&
                  "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
              )}
            >
              {item.status.charAt(0).toUpperCase() +
                item.status.slice(1).toLowerCase()}
            </Badge>

            {/* Informações do status */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-foreground">
                <span className="text-violet-600 dark:text-violet-400 font-medium">
                  {item.count}
                </span>{" "}
                vendas
              </div>
              <div className="text-xs text-muted-foreground">
                {item.status.toLowerCase()}
              </div>
            </div>

            {/* Valor total */}
            <div className="text-right">
              <div className="font-semibold text-sm text-foreground">
                R${" "}
                {(item.total || 0).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="text-xs text-muted-foreground">total</div>
            </div>
          </div>
        ))
      )}
      {data.length === 0 && !loading && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          Nenhum status encontrado
        </div>
      )}
    </div>
  );
}

// Componente reutilizável para listar clientes
interface ClientesListProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  data: {
    cliente: string;
    totalCompras: number;
    ultimaCompra: string;
  }[];
  loading: boolean;
  formatValue: (value: number) => string;
  valueLabel: string;
}

function ClientesList({
  title,
  description,
  icon,
  data,
  loading,
  formatValue,
  valueLabel,
}: ClientesListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {data.slice(0, 10).map((cliente, index) => (
              <div
                key={cliente.cliente}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                {/* Ranking com ícone especial para top 3 */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium">
                  {index < 3 ? (
                    <Award
                      className={`h-4 w-4 ${
                        index === 0
                          ? "text-yellow-500"
                          : index === 1
                          ? "text-gray-500"
                          : "text-amber-600"
                      }`}
                    />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Informações do cliente */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground truncate">
                    {cliente.cliente}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-primary font-medium">
                      {formatValue(cliente.totalCompras)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {valueLabel}
                    </span>
                  </div>
                </div>

                {/* Última compra */}
                <div className="text-right">
                  <div className="font-medium text-sm text-foreground">
                    {format(new Date(cliente.ultimaCompra), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    última compra
                  </div>
                </div>
              </div>
            ))}
            {data.length === 0 && !loading && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Nenhum cliente encontrado
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

export function DashboardPage() {
  const [metrics, setMetrics] = useState<Partial<DashboardMetrics>>({});
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const loadMetrics = async () => {
    try {
      setLoading(true);

      // Usar as datas do range selecionado
      const startDate = dateRange?.from
        ? startOfDay(dateRange.from)
        : startOfDay(subDays(new Date(), 7));
      const endDate = dateRange?.to
        ? endOfDay(dateRange.to)
        : endOfDay(new Date());

      const dataInicio = format(startDate, "yyyy-MM-dd");
      const dataFim = format(endDate, "yyyy-MM-dd");

      // Tentar buscar dados do endpoint dedicado primeiro
      try {
        const data = await dashboardService.getMetrics(dataInicio, dataFim);
        setMetrics(data);
      } catch (error) {
        // Fallback para dados básicos usando serviços existentes
        console.log("Usando fallback para métricas do dashboard");
        const data = await dashboardService.getMetricsFallback();
        setMetrics(data);
      }
    } catch (error) {
      console.error("Erro ao carregar métricas:", error);
      setMetrics({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [dateRange]);

  // Função para obter o ícone de tendência
  const getTrendIcon = (tendencia: string) => {
    switch (tendencia) {
      case "crescimento":
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case "queda":
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <div className="h-3 w-3" />; // Espaço vazio para manter alinhamento
    }
  };

  // Função para formatar o texto da tendência
  const getTrendText = (metrica: any) => {
    if (!metrica || metrica.percentualMudanca === 0) {
      return "Sem alterações";
    }

    const sinal = metrica.percentualMudanca > 0 ? "+" : "";
    return `${sinal}${metrica.percentualMudanca.toFixed(
      1
    )}% em relação ao período anterior`;
  };

  // Preparar dados dos gráficos
  const vendasPorDia = metrics.vendasPorDia;
  const produtosMaisVendidos = metrics.produtosMaisVendidos;
  const vendasPorStatus = metrics.vendasPorStatus || [
    { status: "PENDENTE" as StatusVenda, count: 8, total: 320 },
    { status: "PRODUZIDO" as StatusVenda, count: 12, total: 480 },
    { status: "ENTREGUE" as StatusVenda, count: 15, total: 600 },
    { status: "PAGO" as StatusVenda, count: 25, total: 1250 },
    { status: "CANCELADO" as StatusVenda, count: 2, total: 80 },
  ];

  // Preparar dados para o gráfico de pizza
  const pieData = vendasPorStatus.map((item, index) => ({
    name: item.status,
    value: item.count,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <DefaultLayout>
      <div className="w-full space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Heading1 className="flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              Dashboard
            </Heading1>
            <Paragraph className="text-muted-foreground mt-2">
              Visão geral do seu negócio e métricas importantes
            </Paragraph>
          </div>

          {/* Controles de filtro */}
          <div className="flex items-center gap-2">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className="w-[280px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })}{" "}
                        - {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                    )
                  ) : (
                    "Selecione o período"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(newDateRange) => {
                    setDateRange(newDateRange);
                    if (newDateRange?.from && newDateRange?.to) {
                      setIsCalendarOpen(false);
                    }
                  }}
                  numberOfMonths={2}
                  className="rounded-lg border shadow-sm"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Cards de KPIs */}
        <Tabs defaultValue="financeiro">
          <TabsList className="w-sm">
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="operacional">Operacional</TabsTrigger>
          </TabsList>
          <TabsContent value="financeiro">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Faturamento
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  {loading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                        R${" "}
                        {(metrics.totalFaturamento?.atual || 0).toLocaleString(
                          "pt-BR",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {getTrendIcon(
                          metrics.totalFaturamento?.tendencia || "estavel"
                        )}
                        <span>{getTrendText(metrics.totalFaturamento)}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="border-amber-200 dark:border-amber-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                  <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    À receber
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  {loading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                        R${" "}
                        {(metrics.aReceber?.atual || 0).toLocaleString(
                          "pt-BR",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 mt-1">
                        {getTrendIcon(metrics.aReceber?.tendencia || "estavel")}
                        <span>{getTrendText(metrics.aReceber)}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                  <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    Recebido
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        R${" "}
                        {(metrics.recebido?.atual || 0).toLocaleString(
                          "pt-BR",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                        {getTrendIcon(metrics.recebido?.tendencia || "estavel")}
                        <span>{getTrendText(metrics.recebido)}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                  <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Lucro
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                        R${" "}
                        {(metrics.lucro?.atual || 0).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 mt-1">
                        {getTrendIcon(metrics.lucro?.tendencia || "estavel")}
                        <span>{getTrendText(metrics.lucro)}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="operacional">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                  <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Total de Vendas
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  {loading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        {metrics.totalVendas?.atual || 0}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {getTrendIcon(
                          metrics.totalVendas?.tendencia || "estavel"
                        )}
                        <span>{getTrendText(metrics.totalVendas)}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card className="border-indigo-200 dark:border-indigo-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                  <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                    Clientes Ativos
                  </CardTitle>
                  <Users className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">
                        {metrics.totalClientes?.atual || 0}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                        {getTrendIcon(
                          metrics.totalClientes?.tendencia || "estavel"
                        )}
                        <span>{getTrendText(metrics.totalClientes)}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="border-violet-200 dark:border-violet-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                  <CardTitle className="text-sm font-medium text-violet-700 dark:text-violet-300">
                    Produtos Cadastrados
                  </CardTitle>
                  <Package className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-violet-800 dark:text-violet-200">
                        {metrics.totalProdutos?.atual || 0}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 mt-1">
                        {getTrendIcon(
                          metrics.totalProdutos?.tendencia || "estavel"
                        )}
                        <span>{getTrendText(metrics.totalProdutos)}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card className="border-pink-200 dark:border-pink-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                  <CardTitle className="text-sm font-medium text-pink-700 dark:text-pink-300">
                    Produtos Vendidos
                  </CardTitle>
                  <Package className="h-4 w-4 text-pink-500 dark:text-pink-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-pink-800 dark:text-pink-200">
                        {metrics.totalProdutosVendidos?.atual || 0}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-pink-600 dark:text-pink-400 mt-1">
                        {getTrendIcon(
                          metrics.totalProdutosVendidos?.tendencia || "estavel"
                        )}
                        <span>
                          {getTrendText(metrics.totalProdutosVendidos)}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        <Separator />
        {/* Gráficos */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Gráfico de Vendas por Dia */}
          <Card>
            <CardHeader>
              <CardTitle>Vendas e Faturamento por Dia</CardTitle>
              <Paragraph className="text-sm text-muted-foreground">
                Acompanhe a quantidade de vendas e o faturamento diário
              </Paragraph>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              {loading ? (
                <Skeleton className="h-[250px] sm:h-[300px] w-full" />
              ) : (
                <ChartContainer
                  config={chartConfig}
                  className="h-[250px] sm:h-[300px] w-full"
                >
                  <LineChart
                    data={vendasPorDia}
                    width={525}
                    height={300}
                    margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="data"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <YAxis
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      width={30}
                      domain={[0, "dataMax + 1"]}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      width={50}
                      domain={[0, "dataMax + 100"]}
                      tickFormatter={(value) => `R$ ${value.toLocaleString()}`}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-3 shadow-md">
                              <div className="text-sm font-medium text-foreground mb-2">
                                {label}
                              </div>
                              <div className="space-y-1">
                                {payload.map((entry, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2"
                                  >
                                    <div
                                      className="h-2 w-2 rounded-full"
                                      style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-xs text-muted-foreground">
                                      {entry.dataKey === "vendas"
                                        ? "Qnt. vendida"
                                        : "Faturamento"}
                                      :
                                    </span>
                                    <span className="text-xs font-medium">
                                      {entry.dataKey === "vendas"
                                        ? `${entry.value} vendas`
                                        : `R$ ${Number(
                                            entry.value
                                          ).toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                          })}`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ChartLegend
                      content={<ChartLegendContent />}
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                    <Line
                      yAxisId="left"
                      dataKey="vendas"
                      type="monotone"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      connectNulls={false}
                    />
                    <Line
                      yAxisId="right"
                      dataKey="faturamento"
                      type="monotone"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Status das Vendas */}
          <Card>
            <CardHeader>
              <CardTitle>Status das Vendas</CardTitle>
              <Paragraph className="text-sm text-muted-foreground">
                Distribuição das vendas por status atual
              </Paragraph>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              {loading ? (
                <Skeleton className="h-[250px] sm:h-[300px] w-full" />
              ) : (
                <ChartContainer
                  config={chartConfig}
                  className="h-[250px] sm:h-[300px] w-full"
                >
                  <RechartsPieChart width={525} height={300}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={<ChartTooltipContent nameKey="name" hideLabel />}
                    />
                    <ChartLegend
                      content={<ChartLegendContent />}
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                  </RechartsPieChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabelas de dados */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Produtos e Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Análise de Produtos e Status
              </CardTitle>
              <Paragraph className="text-sm text-muted-foreground">
                Produtos mais vendidos e distribuição por status
              </Paragraph>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs defaultValue="produtos" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="produtos"
                    className="flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    Produtos
                  </TabsTrigger>
                  <TabsTrigger
                    value="status"
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Status
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="produtos" className="mt-4">
                  <ProdutosList
                    data={produtosMaisVendidos || []}
                    loading={loading}
                    title="Produtos mais vendidos"
                    description="Produtos mais vendidos no período"
                    icon={<Crown className="h-4 w-4 text-yellow-500" />}
                  />
                </TabsContent>

                <TabsContent value="status" className="mt-4">
                  <StatusList
                    data={vendasPorStatus}
                    loading={loading}
                    title="Status das Vendas"
                    description="Distribuição das vendas por status atual"
                    icon={<BarChart3 className="h-4 w-4" />}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Análise de Clientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Análise de Clientes
              </CardTitle>
              <Paragraph className="text-sm text-muted-foreground">
                Diferentes perspectivas sobre o comportamento dos seus clientes
              </Paragraph>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs defaultValue="valor" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                  <TabsTrigger
                    value="valor"
                    className="flex items-center gap-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    <span className="hidden sm:inline">Por Valor</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="frequencia"
                    className="flex items-center gap-2"
                  >
                    <Star className="h-4 w-4" />
                    <span className="hidden sm:inline">Frequência</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="recencia"
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline">Recência</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="diversidade"
                    className="flex items-center gap-2"
                  >
                    <Layers className="h-4 w-4" />
                    <span className="hidden sm:inline">Diversidade</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="valor" className="mt-4">
                  <ClientesList
                    title="Clientes por Valor Total"
                    description="Clientes que mais gastaram no período"
                    icon={<Crown className="h-4 w-4 text-yellow-500" />}
                    data={metrics.clientesMaisAtivosPorValor || []}
                    loading={loading}
                    formatValue={(value) =>
                      `R$ ${value.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    }
                    valueLabel="gastou"
                  />
                </TabsContent>

                <TabsContent value="frequencia" className="mt-4">
                  <ClientesList
                    title="Clientes por Frequência"
                    description="Clientes com mais compras realizadas"
                    icon={<Star className="h-4 w-4 text-blue-500" />}
                    data={metrics.clientesMaisAtivosPorFrequencia || []}
                    loading={loading}
                    formatValue={(value) =>
                      `${value} compra${value !== 1 ? "s" : ""}`
                    }
                    valueLabel="realizou"
                  />
                </TabsContent>

                <TabsContent value="recencia" className="mt-4">
                  <ClientesList
                    title="Clientes por Recência"
                    description="Clientes com compras mais recentes"
                    icon={<Clock className="h-4 w-4 text-green-500" />}
                    data={metrics.clientesMaisAtivosPorRecencia || []}
                    loading={loading}
                    formatValue={(value) =>
                      `R$ ${value.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    }
                    valueLabel="gastou"
                  />
                </TabsContent>

                <TabsContent value="diversidade" className="mt-4">
                  <ClientesList
                    title="Clientes por Diversidade"
                    description="Clientes que compraram mais produtos diferentes"
                    icon={<Layers className="h-4 w-4 text-purple-500" />}
                    data={metrics.clientesMaisAtivosPorDiversidade || []}
                    loading={loading}
                    formatValue={(value) =>
                      `${value} produto${value !== 1 ? "s" : ""} diferentes`
                    }
                    valueLabel="comprou"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
}
