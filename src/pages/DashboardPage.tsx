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
  HelpCircle,
  Info,
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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  XAxis,
  YAxis,
  Line,
  LineChart,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

// Cores para o gráfico de pizza
const STATUS_COLORS = {
  PENDENTE: "#fbbf24", // amarelo
  PRODUZIDO: "#3b82f6", // azul
  ENTREGUE: "#8b5cf6", // roxo
  PAGO: "#10b981", // verde
  CANCELADO: "#ef4444", // vermelho
};

// Função para formatar datas de forma mais amigável
function formatarDataAmigavel(dataString: string): string {
  try {
    // Se já está no formato YYYY-MM, converter para data
    if (dataString.match(/^\d{4}-\d{2}$/)) {
      const [ano, mes] = dataString.split("-");

      const meses = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ];

      return `${meses[parseInt(mes) - 1]} ${ano}`;
    }

    // Se for uma data ISO, converter
    const data = new Date(dataString);
    if (!isNaN(data.getTime())) {
      const meses = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ];

      return `${meses[data.getMonth()]} ${data.getFullYear()}`;
    }

    return dataString;
  } catch {
    return dataString;
  }
}

// Componente de ajuda com tooltip
interface HelpTooltipProps {
  content: string;
  children: React.ReactNode;
}

function HelpTooltip({ content, children }: HelpTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex items-center gap-1">
          {children}
          <HelpCircle className="h-3 w-3 text-muted-foreground" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs text-xs">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}

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
  const pieData = vendasPorStatus.map((item) => ({
    name: item.status,
    value: item.count,
    total: item.total,
    color: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS],
  }));

  // Usar métricas de performance do backend
  const ticketMedio = metrics.ticketMedio?.atual || 0;
  const vendasPorCliente = metrics.vendasPorCliente?.atual || 0;
  const produtosPorVenda = metrics.produtosPorVenda?.atual || 0;
  const taxaCancelamento = metrics.taxaCancelamento?.atual || 0;

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
          <TabsList className="w-full overflow-x-auto">
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="operacional">Operacional</TabsTrigger>
            <TabsTrigger value="metricas">Métricas</TabsTrigger>
            <TabsTrigger value="sazonalidade">Sazonalidade</TabsTrigger>
            <TabsTrigger value="qualidade">Qualidade</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
          </TabsList>
          <TabsContent value="financeiro">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <HelpTooltip content="Valor total recebido de vendas concluídas (status PAGO e ENTREGUE). Representa a receita efetivamente obtida no período.">
                    <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Faturamento
                    </CardTitle>
                  </HelpTooltip>
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

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <HelpTooltip content="Valor total de vendas entregues mas ainda não pagas (status ENTREGUE). Representa o dinheiro que está para ser recebido.">
                    <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      À receber
                    </CardTitle>
                  </HelpTooltip>
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <HelpTooltip content="Valor total de vendas já pagas (status PAGO). Representa o dinheiro efetivamente recebido no período.">
                    <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      Recebido
                    </CardTitle>
                  </HelpTooltip>
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <HelpTooltip content="Lucro líquido calculado como: Recebido - Custos dos produtos vendidos. Representa o ganho real após descontar os custos.">
                    <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      Lucro
                    </CardTitle>
                  </HelpTooltip>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <HelpTooltip content="Número total de vendas realizadas no período, independente do status. Inclui vendas pendentes, produzidas, entregues, pagas e canceladas.">
                    <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Total de Vendas
                    </CardTitle>
                  </HelpTooltip>
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <HelpTooltip content="Número total de clientes cadastrados e ativos no sistema. Clientes ativos são aqueles que podem realizar compras.">
                    <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                      Clientes Ativos
                    </CardTitle>
                  </HelpTooltip>
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

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <HelpTooltip content="Número total de produtos cadastrados no sistema. Inclui todos os produtos disponíveis para venda, independente de terem sido vendidos ou não.">
                    <CardTitle className="text-sm font-medium text-violet-700 dark:text-violet-300">
                      Produtos Cadastrados
                    </CardTitle>
                  </HelpTooltip>
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <HelpTooltip content="Quantidade total de itens vendidos no período. Soma de todas as quantidades de produtos vendidos, independente do status da venda.">
                    <CardTitle className="text-sm font-medium text-pink-700 dark:text-pink-300">
                      Produtos Vendidos
                    </CardTitle>
                  </HelpTooltip>
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
          <TabsContent value="metricas">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <HelpTooltip content="Valor médio por venda. Calculado como: Faturamento Total ÷ Número de Vendas. Indica o valor médio que cada cliente gasta por compra.">
                    <CardTitle className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                      Ticket Médio
                    </CardTitle>
                  </HelpTooltip>
                  <DollarSign className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-cyan-800 dark:text-cyan-200">
                    R${" "}
                    {ticketMedio.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                    {getTrendIcon(metrics.ticketMedio?.tendencia || "estavel")}
                    <span>{getTrendText(metrics.ticketMedio)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <HelpTooltip content="Número médio de vendas por cliente. Calculado como: Total de Vendas ÷ Número de Clientes. Indica quantas compras cada cliente faz em média.">
                    <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                      Vendas por Cliente
                    </CardTitle>
                  </HelpTooltip>
                  <Users className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                    {vendasPorCliente.toFixed(1)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 mt-1">
                    {getTrendIcon(
                      metrics.vendasPorCliente?.tendencia || "estavel"
                    )}
                    <span>{getTrendText(metrics.vendasPorCliente)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <HelpTooltip content="Número médio de produtos por venda. Calculado como: Total de Produtos Vendidos ÷ Número de Vendas. Indica quantos itens cada cliente compra em média.">
                    <CardTitle className="text-sm font-medium text-teal-700 dark:text-teal-300">
                      Produtos por Venda
                    </CardTitle>
                  </HelpTooltip>
                  <Package className="h-4 w-4 text-teal-500 dark:text-teal-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-teal-800 dark:text-teal-200">
                    {produtosPorVenda.toFixed(1)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 mt-1">
                    {getTrendIcon(
                      metrics.produtosPorVenda?.tendencia || "estavel"
                    )}
                    <span>{getTrendText(metrics.produtosPorVenda)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <HelpTooltip content="Percentual de vendas canceladas. Calculado como: (Vendas Canceladas ÷ Total de Vendas) × 100. Indica a taxa de desistência dos clientes.">
                    <CardTitle className="text-sm font-medium text-rose-700 dark:text-rose-300">
                      Taxa de Cancelamento
                    </CardTitle>
                  </HelpTooltip>
                  <TrendingDown className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-rose-800 dark:text-rose-200">
                    {taxaCancelamento.toFixed(1)}%
                  </div>
                  <div className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 mt-1">
                    {getTrendIcon(
                      metrics.taxaCancelamento?.tendencia || "estavel"
                    )}
                    <span>{getTrendText(metrics.taxaCancelamento)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Análise de Sazonalidade */}
          <TabsContent value="sazonalidade">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <HelpTooltip content="Crescimento médio mensal comparado ao mês anterior. Mostra se as vendas estão aumentando, diminuindo ou se mantendo estáveis.">
                    <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                      Crescimento Mensal
                    </CardTitle>
                  </HelpTooltip>
                  <TrendingUp className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">
                    {metrics.crescimentoMensal?.atual?.toFixed(1) || 0}%
                  </div>
                  <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                    {getTrendIcon(
                      metrics.crescimentoMensal?.tendencia || "estavel"
                    )}
                    <span>{getTrendText(metrics.crescimentoMensal)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <HelpTooltip content="Previsão baseada no histórico dos últimos 6 meses. Usa média móvel e fatores sazonais para estimar vendas futuras.">
                    <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      Previsão Próximo Mês
                    </CardTitle>
                  </HelpTooltip>
                  <CalendarIcon className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                    {metrics.previsaoDemanda?.proximoMes?.vendasPrevistas || 0}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    {metrics.previsaoDemanda?.proximoMes?.confianca || 0}% de
                    confiança
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <HelpTooltip content="Tendência geral baseada na análise dos últimos meses. Indica se o negócio está em crescimento, queda ou estável.">
                    <CardTitle className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                      Tendência Geral
                    </CardTitle>
                  </HelpTooltip>
                  <BarChart3 className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-cyan-800 dark:text-cyan-200">
                    {metrics.previsaoDemanda?.tendenciaGeral === "crescimento"
                      ? "📈"
                      : metrics.previsaoDemanda?.tendenciaGeral === "queda"
                      ? "📉"
                      : "➡️"}
                  </div>
                  <div className="text-xs text-cyan-600 dark:text-cyan-400 mt-1 capitalize">
                    {metrics.previsaoDemanda?.tendenciaGeral || "estável"}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Métricas de Qualidade */}
          <TabsContent value="qualidade">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <HelpTooltip content="Taxa de satisfação baseada em vendas não canceladas. Calculada como: (Vendas Totais - Cancelamentos) / Vendas Totais * 100">
                    <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                      Taxa de Satisfação
                    </CardTitle>
                  </HelpTooltip>
                  <Star className="h-4 w-4 text-green-500 dark:text-green-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                    {metrics.taxaSatisfacao?.atual?.toFixed(1) || 0}%
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-1">
                    {getTrendIcon(
                      metrics.taxaSatisfacao?.tendencia || "estavel"
                    )}
                    <span>{getTrendText(metrics.taxaSatisfacao)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <HelpTooltip content="Produtos que mais geraram cancelamentos. Útil para identificar problemas de qualidade ou adequação ao mercado.">
                    <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                      Produtos com Problemas
                    </CardTitle>
                  </HelpTooltip>
                  <Package className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                    {metrics.produtosMaisDevolvidos?.length || 0}
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    produtos identificados
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <HelpTooltip content="Principais motivos de cancelamento identificados. Ajuda a entender por que os clientes desistem das compras.">
                    <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">
                      Motivos de Cancelamento
                    </CardTitle>
                  </HelpTooltip>
                  <TrendingDown className="h-4 w-4 text-red-500 dark:text-red-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-red-800 dark:text-red-200">
                    {metrics.motivosCancelamento?.length || 0}
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                    categorias identificadas
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Métricas de Cliente Avançadas */}
          <TabsContent value="clientes">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <HelpTooltip content="Valor total médio que um cliente gasta durante todo o relacionamento com a empresa. Calculado como: Soma total de compras / Número de clientes">
                    <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      Lifetime Value
                    </CardTitle>
                  </HelpTooltip>
                  <DollarSign className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                    R${" "}
                    {(metrics.lifetimeValue?.atual || 0).toLocaleString(
                      "pt-BR",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    {getTrendIcon(
                      metrics.lifetimeValue?.tendencia || "estavel"
                    )}
                    <span>{getTrendText(metrics.lifetimeValue)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <HelpTooltip content="Número médio de compras que um cliente realiza por mês. Calculado baseado no histórico de compras de cada cliente.">
                    <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Frequência de Compra
                    </CardTitle>
                  </HelpTooltip>
                  <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    {(metrics.frequenciaCompra?.atual || 0).toFixed(1)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {getTrendIcon(
                      metrics.frequenciaCompra?.tendencia || "estavel"
                    )}
                    <span>{getTrendText(metrics.frequenciaCompra)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <HelpTooltip content="Análise de retenção de clientes por mês. Mostra quantos clientes novos vs. quantos retornaram em cada período.">
                    <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      Análise de Coorte
                    </CardTitle>
                  </HelpTooltip>
                  <Users className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                    {metrics.analiseCoorte?.length || 0}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    meses analisados
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <HelpTooltip content="Ranking dos clientes ordenados pelo valor total gasto (LTV). Ajuda a identificar os clientes mais valiosos.">
                    <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                      Clientes por LTV
                    </CardTitle>
                  </HelpTooltip>
                  <Crown className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                    {metrics.clientesPorLTV?.length || 0}
                  </div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    clientes analisados
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        {/* Métricas de Performance */}

        <Separator />
        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
          {/* Gráfico de Vendas por Dia */}
          <Card className="col-span-3">
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

          {/* Gráfico de Funil de Vendas */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Distribuição por Status</CardTitle>
              <Paragraph className="text-sm text-muted-foreground">
                Proporção das vendas por status atual
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
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const statusMap: Record<string, string> = {
                            PENDENTE: "Pendente",
                            PRODUZIDO: "Produzido",
                            ENTREGUE: "Entregue",
                            PAGO: "Pago",
                            CANCELADO: "Cancelado",
                          };
                          return (
                            <div className="rounded-lg border bg-background p-3 shadow-md">
                              <div className="text-sm font-medium text-foreground mb-2">
                                {statusMap[data.name] || data.name}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: data.color }}
                                  />
                                  <span className="text-xs text-muted-foreground">
                                    Vendas:
                                  </span>
                                  <span className="text-xs font-medium">
                                    {data.value}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: data.color }}
                                  />
                                  <span className="text-xs text-muted-foreground">
                                    Valor:
                                  </span>
                                  <span className="text-xs font-medium">
                                    R${" "}
                                    {data.total.toLocaleString("pt-BR", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
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
                  </PieChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Comparação de Períodos */}
        <Card>
          <CardHeader>
            <CardTitle>Comparação de Períodos</CardTitle>
            <Paragraph className="text-sm text-muted-foreground">
              Compare o período atual com o anterior para identificar tendências
            </Paragraph>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Faturamento */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Faturamento
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Atual:
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        R${" "}
                        {(metrics.totalFaturamento?.atual || 0).toLocaleString(
                          "pt-BR",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Anterior:
                      </span>
                      <span className="text-sm font-semibold text-muted-foreground">
                        R${" "}
                        {(
                          metrics.totalFaturamento?.anterior || 0
                        ).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t">
                      <span className="text-xs text-muted-foreground">
                        Variação:
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          (metrics.totalFaturamento?.percentualMudanca || 0) >=
                          0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {metrics.totalFaturamento?.percentualMudanca || 0 >= 0
                          ? "+"
                          : ""}
                        {(
                          metrics.totalFaturamento?.percentualMudanca || 0
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vendas */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Vendas
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Atual:
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        {metrics.totalVendas?.atual || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Anterior:
                      </span>
                      <span className="text-sm font-semibold text-muted-foreground">
                        {metrics.totalVendas?.anterior || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t">
                      <span className="text-xs text-muted-foreground">
                        Variação:
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          (metrics.totalVendas?.percentualMudanca || 0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {metrics.totalVendas?.percentualMudanca || 0 >= 0
                          ? "+"
                          : ""}
                        {(metrics.totalVendas?.percentualMudanca || 0).toFixed(
                          1
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* Clientes */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Clientes
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Atual:
                      </span>
                      <span className="text-sm font-semibold text-purple-600">
                        {metrics.totalClientes?.atual || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Anterior:
                      </span>
                      <span className="text-sm font-semibold text-muted-foreground">
                        {metrics.totalClientes?.anterior || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t">
                      <span className="text-xs text-muted-foreground">
                        Variação:
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          (metrics.totalClientes?.percentualMudanca || 0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {metrics.totalClientes?.percentualMudanca || 0 >= 0
                          ? "+"
                          : ""}
                        {(
                          metrics.totalClientes?.percentualMudanca || 0
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* Produtos Vendidos */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Produtos Vendidos
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Atual:
                      </span>
                      <span className="text-sm font-semibold text-orange-600">
                        {metrics.totalProdutosVendidos?.atual || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Anterior:
                      </span>
                      <span className="text-sm font-semibold text-muted-foreground">
                        {metrics.totalProdutosVendidos?.anterior || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t">
                      <span className="text-xs text-muted-foreground">
                        Variação:
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          (metrics.totalProdutosVendidos?.percentualMudanca ||
                            0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {metrics.totalProdutosVendidos?.percentualMudanca ||
                        0 >= 0
                          ? "+"
                          : ""}
                        {(
                          metrics.totalProdutosVendidos?.percentualMudanca || 0
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabelas de dados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
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

        {/* Novas Seções de Análise */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Análise de Sazonalidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Análise de Sazonalidade
              </CardTitle>
              <Paragraph className="text-sm text-muted-foreground">
                <HelpTooltip content="Análise de padrões mensais nas vendas para identificar períodos de alta/baixa demanda e prever vendas futuras.">
                  <span>Tendências mensais e previsão de demanda</span>
                </HelpTooltip>
              </Paragraph>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs defaultValue="tendencias" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tendencias">
                    Tendências Mensais
                  </TabsTrigger>
                  <TabsTrigger value="previsao">
                    Previsão de Demanda
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="tendencias" className="mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Info className="h-4 w-4" />
                      <span>Comparação mês a mês das vendas e faturamento</span>
                    </div>
                    <ScrollArea className="h-[250px] pr-4">
                      <div className="space-y-2">
                        {metrics.tendenciasSazonais?.map((tendencia, index) => (
                          <div
                            key={tendencia.mes}
                            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm text-foreground">
                                {formatarDataAmigavel(tendencia.mes)}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground font-medium">
                                  {tendencia.vendas} vendas
                                </span>
                                <span className="text-xs text-muted-foreground font-medium">
                                  R${" "}
                                  {tendencia.faturamento.toLocaleString(
                                    "pt-BR",
                                    {
                                      minimumFractionDigits: 2,
                                    }
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`text-sm font-semibold ${
                                  tendencia.crescimento > 0
                                    ? "text-green-600"
                                    : tendencia.crescimento < 0
                                    ? "text-red-600"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {tendencia.crescimento > 0 ? "+" : ""}
                                {tendencia.crescimento.toFixed(1)}%
                              </div>
                              <div className="text-xs text-muted-foreground capitalize">
                                {tendencia.tendencia}
                              </div>
                            </div>
                          </div>
                        ))}
                        {(!metrics.tendenciasSazonais ||
                          metrics.tendenciasSazonais.length === 0) && (
                          <div className="text-center py-4 text-muted-foreground text-sm">
                            Nenhuma tendência encontrada
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>

                <TabsContent value="previsao" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Info className="h-4 w-4" />
                      <span>
                        Previsão baseada em dados históricos dos últimos 6 meses
                      </span>
                    </div>
                    <div className="p-4 rounded-lg border bg-muted/50">
                      <h4 className="font-semibold text-sm mb-3">
                        Previsão para o Próximo Mês
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Vendas Previstas
                          </div>
                          <div className="text-lg font-bold">
                            {metrics.previsaoDemanda?.proximoMes
                              ?.vendasPrevistas || 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Faturamento Previsto
                          </div>
                          <div className="text-lg font-bold">
                            R${" "}
                            {(
                              metrics.previsaoDemanda?.proximoMes
                                ?.faturamentoPrevisto || 0
                            ).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs text-muted-foreground">
                          Nível de Confiança
                        </div>
                        <div className="text-sm font-medium">
                          {metrics.previsaoDemanda?.proximoMes?.confianca || 0}%
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border bg-muted/50">
                      <h4 className="font-semibold text-sm mb-2">
                        Fatores Considerados
                      </h4>
                      <ul className="space-y-1">
                        {metrics.previsaoDemanda?.fatoresInfluencia?.map(
                          (fator, index) => (
                            <li
                              key={index}
                              className="text-xs text-muted-foreground flex items-center gap-2"
                            >
                              <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                              {fator}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Métricas de Qualidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Métricas de Qualidade
              </CardTitle>
              <Paragraph className="text-sm text-muted-foreground">
                <HelpTooltip content="Análise de problemas de qualidade baseada em cancelamentos e devoluções para identificar pontos de melhoria.">
                  <span>Análise de satisfação e problemas identificados</span>
                </HelpTooltip>
              </Paragraph>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs defaultValue="problemas" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="problemas">
                    Produtos com Problemas
                  </TabsTrigger>
                  <TabsTrigger value="cancelamentos">
                    Motivos de Cancelamento
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="problemas" className="mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Info className="h-4 w-4" />
                      <span>
                        Produtos que mais geraram cancelamentos - útil para
                        identificar problemas de qualidade
                      </span>
                    </div>
                    <ScrollArea className="h-[250px] pr-4">
                      <div className="space-y-2">
                        {metrics.produtosMaisDevolvidos?.map(
                          (produto, index) => (
                            <div
                              key={produto.produto}
                              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm text-foreground truncate">
                                  {produto.produto}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-muted-foreground font-medium">
                                    {produto.totalDevolvido} cancelamentos
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {produto.percentualDevolucao.toFixed(1)}% do
                                    total
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold">
                                  R${" "}
                                  {produto.valorPerdido.toLocaleString(
                                    "pt-BR",
                                    {
                                      minimumFractionDigits: 2,
                                    }
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  valor perdido
                                </div>
                              </div>
                            </div>
                          )
                        )}
                        {(!metrics.produtosMaisDevolvidos ||
                          metrics.produtosMaisDevolvidos.length === 0) && (
                          <div className="text-center py-4 text-muted-foreground text-sm">
                            Nenhum problema identificado
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>

                <TabsContent value="cancelamentos" className="mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Info className="h-4 w-4" />
                      <span>
                        Principais motivos pelos quais os clientes cancelam suas
                        compras
                      </span>
                    </div>
                    <ScrollArea className="h-[250px] pr-4">
                      <div className="space-y-2">
                        {metrics.motivosCancelamento?.map((motivo, index) => (
                          <div
                            key={motivo.motivo}
                            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm text-foreground">
                                {motivo.motivo}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground font-medium">
                                  {motivo.quantidade} cancelamentos
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {motivo.percentual}% do total
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold">
                                R${" "}
                                {motivo.valorPerdido.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                valor perdido
                              </div>
                            </div>
                          </div>
                        ))}
                        {(!metrics.motivosCancelamento ||
                          metrics.motivosCancelamento.length === 0) && (
                          <div className="text-center py-4 text-muted-foreground text-sm">
                            Nenhum cancelamento encontrado
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Análise de Clientes Avançada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Análise Avançada de Clientes
            </CardTitle>
            <Paragraph className="text-sm text-muted-foreground">
              <HelpTooltip content="Análise detalhada do comportamento dos clientes: valor total gasto, frequência de compra e retenção por período.">
                <span>
                  Lifetime Value, frequência de compra e análise de coorte
                </span>
              </HelpTooltip>
            </Paragraph>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs defaultValue="ltv" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ltv">Clientes por LTV</TabsTrigger>
                <TabsTrigger value="coorte">Análise de Coorte</TabsTrigger>
                <TabsTrigger value="frequencia">
                  Frequência de Compra
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ltv" className="mt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Info className="h-4 w-4" />
                    <span>
                      Ranking dos clientes ordenados pelo valor total gasto
                      (Lifetime Value)
                    </span>
                  </div>
                  <ScrollArea className="h-[250px] pr-4">
                    <div className="space-y-2">
                      {metrics.clientesPorLTV?.map((cliente, index) => (
                        <div
                          key={cliente.cliente}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-foreground truncate">
                              {cliente.cliente}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground font-medium">
                                {cliente.totalCompras} compras
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {cliente.frequenciaCompra.toFixed(1)}{" "}
                                compras/mês
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">
                              R${" "}
                              {cliente.ltv.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              LTV
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!metrics.clientesPorLTV ||
                        metrics.clientesPorLTV.length === 0) && (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                          Nenhum cliente encontrado
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="coorte" className="mt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Info className="h-4 w-4" />
                    <span>
                      Análise de retenção: quantos clientes novos vs. quantos
                      retornaram em cada mês
                    </span>
                  </div>
                  <ScrollArea className="h-[250px] pr-4">
                    <div className="space-y-2">
                      {metrics.analiseCoorte?.map((coorte, index) => (
                        <div
                          key={coorte.mes}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-foreground">
                              {formatarDataAmigavel(coorte.mes)}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground font-medium">
                                {coorte.clientesNovos} novos
                              </span>
                              <span className="text-xs text-muted-foreground font-medium">
                                {coorte.clientesRetidos} retidos
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">
                              {coorte.taxaRetencao.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              retenção
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!metrics.analiseCoorte ||
                        metrics.analiseCoorte.length === 0) && (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                          Nenhuma análise de coorte disponível
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="frequencia" className="mt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Info className="h-4 w-4" />
                    <span>Métricas gerais de comportamento dos clientes</span>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border bg-muted/50">
                      <h4 className="font-semibold text-sm mb-2">
                        Frequência Média de Compra
                      </h4>
                      <div className="text-2xl font-bold">
                        {(metrics.frequenciaCompra?.atual || 0).toFixed(1)}{" "}
                        compras por mês
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        {getTrendIcon(
                          metrics.frequenciaCompra?.tendencia || "estavel"
                        )}
                        <span>{getTrendText(metrics.frequenciaCompra)}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border bg-muted/50">
                      <h4 className="font-semibold text-sm mb-2">
                        Lifetime Value Médio
                      </h4>
                      <div className="text-2xl font-bold">
                        R${" "}
                        {(metrics.lifetimeValue?.atual || 0).toLocaleString(
                          "pt-BR",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        {getTrendIcon(
                          metrics.lifetimeValue?.tendencia || "estavel"
                        )}
                        <span>{getTrendText(metrics.lifetimeValue)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DefaultLayout>
  );
}
