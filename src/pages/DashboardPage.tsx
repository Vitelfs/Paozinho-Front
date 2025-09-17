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
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  dashboardService,
  type DashboardMetrics,
} from "@/services/dashboard.service";
import { cn } from "@/lib/utils";
import { StatusVenda } from "@/models/vendas.entity";

// Configuração de cores para os gráficos
const chartConfig = {
  vendas: {
    label: "Vendas",
    color: "hsl(var(--chart-1))",
  },
  faturamento: {
    label: "Faturamento",
    color: "hsl(var(--chart-2))",
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

  // Dados mockados para demonstração quando não há dados do backend
  const mockVendasPorDia = [
    { data: "01/01", vendas: 12, faturamento: 450 },
    { data: "02/01", vendas: 8, faturamento: 320 },
    { data: "03/01", vendas: 15, faturamento: 580 },
    { data: "04/01", vendas: 20, faturamento: 750 },
    { data: "05/01", vendas: 18, faturamento: 680 },
    { data: "06/01", vendas: 22, faturamento: 820 },
    { data: "07/01", vendas: 25, faturamento: 950 },
  ];

  const mockProdutosMaisVendidos = [
    { produto: "Pão Francês", quantidade: 120, faturamento: 360 },
    { produto: "Croissant", quantidade: 85, faturamento: 425 },
    { produto: "Bolo de Chocolate", quantidade: 45, faturamento: 675 },
    { produto: "Pão de Açúcar", quantidade: 60, faturamento: 480 },
    { produto: "Torta de Frango", quantidade: 30, faturamento: 450 },
  ];

  // Preparar dados dos gráficos
  const vendasPorDia = metrics.vendasPorDia || mockVendasPorDia;
  const produtosMaisVendidos =
    metrics.produtosMaisVendidos || mockProdutosMaisVendidos;
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
              Dashboard - Pãozinho Delícia Gourmet
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Vendas
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {metrics.totalVendas || 0}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span>+12% em relação ao período anterior</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    R${" "}
                    {(metrics.totalFaturamento || 0).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span>+8% em relação ao período anterior</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">À receber</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    R${" "}
                    {(metrics.aReceber || 0).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Clientes Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {metrics.totalClientes || 0}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span>+5 novos este mês</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Produtos Cadastrados
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {metrics.totalProdutos || 0}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingDown className="h-3 w-3 text-red-600" />
                    <span>2 produtos em falta</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Gráfico de Vendas por Dia */}
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Dia</CardTitle>
              <Paragraph className="text-sm text-muted-foreground">
                Acompanhe o desempenho diário das suas vendas
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
                  <AreaChart
                    data={vendasPorDia}
                    width={525}
                    height={300}
                    margin={{ top: 20, right: 10, left: -10, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient
                        id="fillVendas"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--color-vendas)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-vendas)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="data"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      width={30}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Area
                      dataKey="vendas"
                      type="natural"
                      fill="url(#fillVendas)"
                      fillOpacity={0.4}
                      stroke="var(--color-vendas)"
                      strokeWidth={2}
                    />
                  </AreaChart>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Produtos Mais Vendidos */}
          <Card>
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
              <Paragraph className="text-sm text-muted-foreground">
                Ranking dos produtos com maior saída
              </Paragraph>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {produtosMaisVendidos.slice(0, 5).map((produto, index) => (
                    <div
                      key={produto.produto}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {produto.produto}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {produto.quantidade} unidades
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">
                          R${" "}
                          {produto.faturamento.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clientes Mais Ativos */}
          <Card>
            <CardHeader>
              <CardTitle>Clientes Mais Ativos</CardTitle>
              <Paragraph className="text-sm text-muted-foreground">
                Clientes com maior número de compras
              </Paragraph>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(metrics.clientesMaisAtivos || [])
                    .slice(0, 5)
                    .map((cliente, index) => (
                      <div
                        key={cliente.cliente}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {cliente.cliente}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {cliente.totalCompras} compra
                              {cliente.totalCompras !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            {format(
                              new Date(cliente.ultimaCompra),
                              "dd/MM/yyyy",
                              { locale: ptBR }
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  {(!metrics.clientesMaisAtivos ||
                    metrics.clientesMaisAtivos.length === 0) &&
                    !loading && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        Nenhum cliente encontrado
                      </div>
                    )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status das Vendas - Lista */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo por Status</CardTitle>
              <Paragraph className="text-sm text-muted-foreground">
                Detalhamento das vendas por cada status
              </Paragraph>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {vendasPorStatus.map((item) => (
                    <div
                      key={item.status}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          className={cn(
                            "text-xs border",
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
                        <span className="font-medium text-sm">
                          {item.count} vendas
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">
                          R${" "}
                          {(item.total || 0).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
}
