import { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  FileSpreadsheet,
  Download,
  Package,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading1, Paragraph } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";

import { vendasService } from "@/services/vendas.service";
import {
  gerarRelatorioProducaoExcel,
  criarResumoProdutos,
  type RelatorioProducaoData,
} from "@/utils/excelGenerator";

// Tipo para o estado dos relatórios
type RelatorioVenda = {
  id: string;
  cliente_id: string;
  total: string;
  status: StatusVenda;
  observacoes: string | null;
  data_venda: string;
  createdAt: string;
  updatedAt: string;
  cliente: {
    id: string;
    nome: string;
    contato: string;
  };
  item_venda: Array<{
    id: string;
    venda_id: string;
    produto_id: string;
    quantidade: number;
    preco_venda: string;
    createdAt: string;
    updatedAt: string;
    produto: {
      nome: string;
    };
  }>;
};
import { cn } from "@/lib/utils";
import { StatusVenda } from "@/models/vendas.entity";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ITEMS_PER_PAGE = 20;

export function VendasRelatorioPage() {
  // Criar data de hoje com horário zerado (início do dia)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [relatorios, setRelatorios] = useState<RelatorioVenda[]>([]);
  const [relatorioData, setRelatorioData] =
    useState<RelatorioProducaoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [status, setStatus] = useState<StatusVenda>("PENDENTE");

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const loadRelatorios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const offset = (currentPage - 1) * ITEMS_PER_PAGE;

      // Carregar dados antigos para a tabela
      const data = await vendasService.getRelatorioVendas({
        data_venda: selectedDate,
        limit: ITEMS_PER_PAGE,
        offset: offset,
        status: status,
      });

      setRelatorios(data.vendas || []);
      setTotalItems(data.total || 0);

      // Carregar dados novos para estatísticas e resumo
      try {
        const relatorioCompleto = await vendasService.getRelatorioVendasExcel(
          selectedDate,
          status
        );
        setRelatorioData(relatorioCompleto);
      } catch (err) {
        console.warn("Não foi possível carregar dados do novo formato:", err);
        // Manter funcionando com dados antigos
        setRelatorioData(null);
      }
    } catch (err) {
      console.error("Erro ao carregar relatórios:", err);
      setError("Erro ao carregar relatórios. Tente novamente.");
      toast.error("Erro ao carregar relatórios");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, currentPage, status]);

  const handleExportExcel = useCallback(async () => {
    try {
      setExportingExcel(true);

      const data = await vendasService.getRelatorioVendasExcel(
        selectedDate,
        status
      );

      // Usar a função utilitária para gerar e baixar o Excel
      gerarRelatorioProducaoExcel(data);

      toast.success("Relatório exportado com sucesso!");
    } catch (err) {
      console.error("Erro ao exportar relatório:", err);
      toast.error("Erro ao exportar relatório");
    } finally {
      setExportingExcel(false);
    }
  }, [selectedDate, status]);

  const handleDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      // Zerar o horário da data selecionada
      const dateWithZeroTime = new Date(date);
      dateWithZeroTime.setHours(0, 0, 0, 0);

      setSelectedDate(dateWithZeroTime);
      setCurrentPage(1);
      setIsDatePickerOpen(false);
    }
  }, []);

  const handleRetry = useCallback(() => {
    loadRelatorios();
  }, [loadRelatorios]);

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages]
  );

  const formatCurrency = useCallback((value: string) => {
    return `R$ ${Number(value).toFixed(2).replace(".", ",")}`;
  }, []);

  // Calcular resumo de produtos para produção usando nova estrutura
  const resumoProdutos = useMemo(() => {
    if (!relatorioData) {
      // Fallback para estrutura antiga se ainda não temos dados novos
      const produtos = new Map<
        string,
        { nome: string; quantidade: number; categoria?: string }
      >();

      relatorios.forEach((venda) => {
        venda.item_venda.forEach((item) => {
          const key = item.produto.nome;
          if (produtos.has(key)) {
            produtos.set(key, {
              nome: item.produto.nome,
              quantidade: produtos.get(key)!.quantidade + item.quantidade,
            });
          } else {
            produtos.set(key, {
              nome: item.produto.nome,
              quantidade: item.quantidade,
            });
          }
        });
      });

      return Array.from(produtos.values()).sort(
        (a, b) => b.quantidade - a.quantidade
      );
    }
    return criarResumoProdutos(relatorioData);
  }, [relatorios, relatorioData]);

  // Calcular estatísticas usando nova estrutura ou fallback
  const estatisticas = useMemo(() => {
    if (relatorioData) {
      return {
        totalVendas: relatorioData.resumo.totalVendas,
        totalClientes: relatorioData.resumo.clientesUnicos,
        valorTotal: relatorioData.resumo.valorTotal,
        totalItens: relatorioData.resumo.totalItens,
      };
    }

    if (!relatorios.length) {
      return {
        totalVendas: 0,
        totalClientes: 0,
        valorTotal: 0,
        totalItens: 0,
      };
    }

    const totalVendas = relatorios.length;
    const clientesUnicos = new Set(relatorios.map((v) => v.cliente.id)).size;
    const valorTotal = relatorios.reduce(
      (sum, venda) => sum + Number(venda.total),
      0
    );
    const totalItens = relatorios.reduce(
      (sum, venda) =>
        sum +
        venda.item_venda.reduce(
          (itemSum, item) => itemSum + item.quantidade,
          0
        ),
      0
    );

    return {
      totalVendas,
      totalClientes: clientesUnicos,
      valorTotal,
      totalItens,
    };
  }, [relatorios, relatorioData]);

  useEffect(() => {
    loadRelatorios();
  }, [loadRelatorios]);

  return (
    <DefaultLayout>
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <Heading1 className="flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6" />
              Relatório de Produção
            </Heading1>
            <Paragraph className="text-muted-foreground mt-2">
              Visualize e exporte relatórios de produção por data
            </Paragraph>
          </div>

          <div className="flex gap-2">
            {/* Date Picker */}
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            {/* Status */}

            <Select
              value={status}
              onValueChange={(value) => setStatus(value as StatusVenda)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={StatusVenda.PENDENTE}>Pendente</SelectItem>
                <SelectItem value={StatusVenda.PRODUZIDO}>Produzido</SelectItem>
                <SelectItem value={StatusVenda.ENTREGUE}>Entregue</SelectItem>
                <SelectItem value={StatusVenda.PAGO}>Pago</SelectItem>
                <SelectItem value={StatusVenda.CANCELADO}>Cancelado</SelectItem>
              </SelectContent>
            </Select>

            {/* Export Button */}
            <Button
              onClick={handleExportExcel}
              disabled={
                exportingExcel || (!relatorios.length && !relatorioData)
              }
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {exportingExcel ? "Exportando..." : "Exportar Excel"}
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Vendas
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {estatisticas.totalVendas}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Clientes Únicos
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {estatisticas.totalClientes}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(estatisticas.valorTotal.toString())}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Itens a Produzir
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {estatisticas.totalItens}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Resumo de Produtos para Produção */}
        {!loading && !error && resumoProdutos.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Resumo de Produção por Produto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {resumoProdutos.map((produto) => (
                  <div
                    key={produto.nome}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div
                        className="font-medium text-sm truncate"
                        title={produto.nome}
                      >
                        {produto.nome}
                      </div>
                      {produto.categoria && (
                        <div className="text-xs text-muted-foreground truncate">
                          {produto.categoria}
                        </div>
                      )}
                    </div>
                    <Badge
                      variant="default"
                      className="ml-2 bg-orange-600 hover:bg-orange-700 text-white font-bold"
                    >
                      {produto.quantidade}x
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela Excel Style */}
        <Card>
          <CardHeader>
            <CardTitle>
              Vendas para Produção - {format(selectedDate, "dd/MM/yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Carregando relatórios...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button onClick={handleRetry} variant="outline">
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            ) : !relatorios.length ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">
                    Nenhuma venda encontrada
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Não há vendas para produção na data selecionada.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Tabela */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    {/* Header */}
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left p-3 font-semibold text-sm border-r border-border min-w-[80px]">
                          ID Venda
                        </th>
                        <th className="text-left p-3 font-semibold text-sm border-r border-border min-w-[180px]">
                          Cliente
                        </th>
                        <th className="text-left p-3 font-semibold text-sm border-r border-border min-w-[200px]">
                          Produto
                        </th>
                        <th className="text-center p-3 font-semibold text-sm border-r border-border min-w-[80px]">
                          Qtd
                        </th>
                        <th className="text-right p-3 font-semibold text-sm border-r border-border min-w-[100px]">
                          Preço Unit.
                        </th>
                        <th className="text-right p-3 font-semibold text-sm border-r border-border min-w-[100px]">
                          Subtotal
                        </th>
                        <th className="text-left p-3 font-semibold text-sm border-r border-border min-w-[100px]">
                          Status
                        </th>
                        <th className="text-left p-3 font-semibold text-sm min-w-[180px]">
                          Observações
                        </th>
                      </tr>
                    </thead>

                    {/* Body */}
                    <tbody>
                      {relatorios.map((venda, vendaIndex) =>
                        venda.item_venda.map((item, itemIndex) => (
                          <tr
                            key={`${venda.id}-${item.id}`}
                            className={cn(
                              "border-b border-border hover:bg-muted/30 transition-colors",
                              vendaIndex % 2 === 0 && "bg-background",
                              vendaIndex % 2 === 1 && "bg-muted/20"
                            )}
                          >
                            <td className="p-3 border-r border-border text-sm font-mono">
                              {itemIndex === 0 ? (
                                <div className="font-semibold">
                                  #{venda.id.slice(-8)}
                                </div>
                              ) : (
                                <div className="text-muted-foreground text-xs">
                                  ↳ mesmo pedido
                                </div>
                              )}
                            </td>
                            <td className="p-3 border-r border-border text-sm">
                              {itemIndex === 0 ? (
                                <div>
                                  <div className="font-medium">
                                    {venda.cliente.nome}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {venda.cliente.contato}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-muted-foreground text-xs">
                                  ↳ {venda.cliente.nome}
                                </div>
                              )}
                            </td>
                            <td className="p-3 border-r border-border text-sm">
                              <div className="font-medium text-blue-700 dark:text-blue-400">
                                {item.produto.nome}
                              </div>
                            </td>
                            <td className="p-3 border-r border-border text-center">
                              <Badge
                                variant="outline"
                                className="text-sm font-bold"
                              >
                                {item.quantidade}
                              </Badge>
                            </td>
                            <td className="p-3 border-r border-border text-sm text-right font-medium">
                              {formatCurrency(item.preco_venda)}
                            </td>
                            <td className="p-3 border-r border-border text-sm text-right font-semibold text-green-600">
                              {formatCurrency(
                                (
                                  Number(item.preco_venda) * item.quantidade
                                ).toString()
                              )}
                            </td>
                            <td className="p-3 border-r border-border">
                              {itemIndex === 0 && (
                                <Badge
                                  variant={
                                    venda.status === "PENDENTE"
                                      ? "secondary"
                                      : "default"
                                  }
                                  className="text-xs"
                                >
                                  {venda.status}
                                </Badge>
                              )}
                            </td>
                            <td className="p-3 text-sm">
                              {itemIndex === 0 && venda.observacoes ? (
                                <span className="text-muted-foreground">
                                  {venda.observacoes.length > 40
                                    ? `${venda.observacoes.substring(0, 40)}...`
                                    : venda.observacoes}
                                </span>
                              ) : itemIndex === 0 ? (
                                <span className="text-muted-foreground italic text-xs">
                                  Sem observações
                                </span>
                              ) : null}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <Separator />

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="text-sm text-muted-foreground">
                    Mostrando{" "}
                    {Math.min(
                      (currentPage - 1) * ITEMS_PER_PAGE + 1,
                      totalItems
                    )}{" "}
                    até {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} de{" "}
                    {totalItems} vendas • {estatisticas.totalItens} itens para
                    produção
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <span className="text-sm text-muted-foreground px-3">
                      Página {currentPage} de {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DefaultLayout>
  );
}
