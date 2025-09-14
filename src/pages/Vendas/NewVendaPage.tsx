import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  User,
  Package,
  Calendar as CalendarIcon,
  FileText,
} from "lucide-react";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heading1, Paragraph } from "@/components/ui/typography";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { clienteService } from "@/services/cliente.service";
import { produtoService } from "@/services/produto.service";
import { vendasService } from "@/services/vendas.service";
import { precosPersonalizadosService } from "@/services/precos-personalizados.service";
import { createVendasSchema } from "@/schemas/vendas.schema";
import type { ClienteEntity } from "@/models/cliente.entity";
import type { ProdutoEntity } from "@/models/produto.entity";
import type { clientesPrecosPersonalizados } from "@/models/precos_personalizados.entity";
import type {
  CreateVendasEntity,
  CreateItemVendasEntity,
} from "@/models/vendas.entity";

interface ItemVenda {
  produto: ProdutoEntity;
  quantidade: number;
  preco_unitario: number;
}

export function NewVenda() {
  const navigate = useNavigate();

  // Estados principais
  const [clienteSelecionado, setClienteSelecionado] =
    useState<ClienteEntity | null>(null);
  const [clienteComPrecosPersonalizados, setClienteComPrecosPersonalizados] =
    useState<clientesPrecosPersonalizados | null>(null);
  const [itensVenda, setItensVenda] = useState<ItemVenda[]>([]);
  const [dataVenda, setDataVenda] = useState(new Date());
  const [observacoes, setObservacoes] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Estados de busca e filtros
  const [buscaCliente, setBuscaCliente] = useState("");
  const [buscaProduto, setBuscaProduto] = useState("");
  const [clientes, setClientes] = useState<ClienteEntity[]>([]);
  const [produtosDisponiveis, setProdutosDisponiveis] = useState<
    ProdutoEntity[]
  >([]);

  // Estados de loading
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [loadingPrecosPersonalizados, setLoadingPrecosPersonalizados] =
    useState(false);
  const [salvando, setSalvando] = useState(false);

  // Carregar clientes
  const loadClientes = useCallback(async () => {
    try {
      setLoadingClientes(true);
      const response = await clienteService.getClientes({
        limit: 100,
        offset: 0,
      });
      setClientes(response.clientes.filter((c) => c.ativo)); // Apenas clientes ativos
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  // Carregar produtos
  const loadProdutos = useCallback(async () => {
    try {
      setLoadingProdutos(true);
      const response = await produtoService.getProdutosWithCategorias({
        limit: 100,
        offset: 0,
      });
      setProdutosDisponiveis(response.produtos);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoadingProdutos(false);
    }
  }, []);

  // Carregar preços personalizados do cliente
  const loadPrecosPersonalizados = useCallback(async (clienteId: string) => {
    try {
      setLoadingPrecosPersonalizados(true);
      const clienteComPrecos =
        await precosPersonalizadosService.getPrecosPersonalizadosPorCliente(
          clienteId
        );
      setClienteComPrecosPersonalizados(clienteComPrecos);
    } catch (error) {
      console.error("Erro ao carregar preços personalizados:", error);
      // Não mostrar erro se o cliente não tiver preços personalizados
      setClienteComPrecosPersonalizados(null);
    } finally {
      setLoadingPrecosPersonalizados(false);
    }
  }, []);

  useEffect(() => {
    loadClientes();
    loadProdutos();
  }, [loadClientes, loadProdutos]);

  // Carregar preços personalizados quando cliente é selecionado
  useEffect(() => {
    if (clienteSelecionado) {
      loadPrecosPersonalizados(clienteSelecionado.id);
    } else {
      setClienteComPrecosPersonalizados(null);
    }
  }, [clienteSelecionado, loadPrecosPersonalizados]);

  // Filtrar clientes por busca
  const clientesFiltrados = useMemo(() => {
    if (!buscaCliente) return clientes;
    return clientes.filter(
      (cliente) =>
        cliente.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
        cliente.contato.toLowerCase().includes(buscaCliente.toLowerCase())
    );
  }, [clientes, buscaCliente]);

  // Filtrar produtos por busca
  const produtosFiltrados = useMemo(() => {
    if (!buscaProduto) return produtosDisponiveis;
    return produtosDisponiveis.filter(
      (produto) =>
        produto.nome.toLowerCase().includes(buscaProduto.toLowerCase()) ||
        produto.descricao.toLowerCase().includes(buscaProduto.toLowerCase()) ||
        produto.categoria.nome
          .toLowerCase()
          .includes(buscaProduto.toLowerCase())
    );
  }, [produtosDisponiveis, buscaProduto]);

  // Obter preço correto do produto (personalizado ou original)
  const obterPrecoProduto = useCallback(
    (produto: ProdutoEntity) => {
      if (!clienteComPrecosPersonalizados) {
        return produto.preco_minimo_venda;
      }

      const precoPersonalizado =
        clienteComPrecosPersonalizados.precoPersonalizado.find(
          (p) => p.produto.id === produto.id
        );

      return precoPersonalizado
        ? precoPersonalizado.preco_venda
        : produto.preco_minimo_venda;
    },
    [clienteComPrecosPersonalizados]
  );

  // Verificar se produto tem preço personalizado
  const temPrecoPersonalizado = useCallback(
    (produto: ProdutoEntity) => {
      if (!clienteComPrecosPersonalizados) return false;

      return clienteComPrecosPersonalizados.precoPersonalizado.some(
        (p) => p.produto.id === produto.id
      );
    },
    [clienteComPrecosPersonalizados]
  );

  // Adicionar produto à venda
  const adicionarProduto = useCallback(
    (produto: ProdutoEntity) => {
      const itemExistente = itensVenda.find(
        (item) => item.produto.id === produto.id
      );

      if (itemExistente) {
        setItensVenda((prev) =>
          prev.map((item) =>
            item.produto.id === produto.id
              ? { ...item, quantidade: item.quantidade + 1 }
              : item
          )
        );
      } else {
        const novoItem: ItemVenda = {
          produto,
          quantidade: 1,
          preco_unitario: Number(obterPrecoProduto(produto)),
        };
        setItensVenda((prev) => [...prev, novoItem]);
      }
    },
    [itensVenda, obterPrecoProduto]
  );

  // Remover produto da venda
  const removerProduto = useCallback((produtoId: string) => {
    setItensVenda((prev) =>
      prev.filter((item) => item.produto.id !== produtoId)
    );
  }, []);

  // Atualizar quantidade
  const atualizarQuantidade = useCallback(
    (produtoId: string, novaQuantidade: number) => {
      if (novaQuantidade <= 0) {
        removerProduto(produtoId);
        return;
      }

      setItensVenda((prev) =>
        prev.map((item) =>
          item.produto.id === produtoId
            ? { ...item, quantidade: novaQuantidade }
            : item
        )
      );
    },
    [removerProduto]
  );

  // Calcular total da venda
  const totalVenda = useMemo(() => {
    return itensVenda.reduce((total, item) => {
      return total + item.preco_unitario * item.quantidade;
    }, 0);
  }, [itensVenda]);

  // Salvar venda
  const salvarVenda = useCallback(async () => {
    if (!clienteSelecionado) {
      toast.error("Selecione um cliente");
      return;
    }

    if (itensVenda.length === 0) {
      toast.error("Adicione pelo menos um produto à venda");
      return;
    }

    try {
      setSalvando(true);

      const itemVendas: CreateItemVendasEntity[] = itensVenda.map((item) => ({
        produto_id: item.produto.id,
        quantidade: item.quantidade,
      }));

      const venda: CreateVendasEntity = {
        cliente_id: clienteSelecionado.id,
        observacoes: observacoes || undefined,
        data_venda: dataVenda,
        item_venda: itemVendas,
      };

      // Validação com Zod
      const validationResult = createVendasSchema.safeParse(venda);
      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        toast.error(firstError.message);
        return;
      }

      await vendasService.createVenda(venda);
      toast.success("Venda criada com sucesso!");
      navigate("/vendas");
    } catch (error) {
      console.error("Erro ao criar venda:", error);
      toast.error("Erro ao criar venda");
    } finally {
      setSalvando(false);
    }
  }, [clienteSelecionado, itensVenda, observacoes, dataVenda, navigate]);

  const handleVoltar = () => {
    navigate("/vendas");
  };

  const handleDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      setDataVenda(date);
      setIsDatePickerOpen(false);
    }
  }, []);

  return (
    <DefaultLayout>
      <div className="w-full max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleVoltar}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <Heading1 className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Nova Venda
            </Heading1>
            <Paragraph className="text-muted-foreground mt-2">
              Crie uma nova venda selecionando o cliente e os produtos
            </Paragraph>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna esquerda - Seleção de cliente e produtos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Seleção de Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Selecionar Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={buscaCliente}
                    onChange={(e) => setBuscaCliente(e.target.value)}
                    placeholder="Buscar cliente..."
                    className="pl-10"
                  />
                </div>

                {clienteSelecionado ? (
                  <div className="p-4 border rounded-xl bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-green-800 dark:text-green-200">
                          {clienteSelecionado.nome}
                        </h4>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                          {clienteSelecionado.contato}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                          {clienteSelecionado.endereco}
                        </p>
                        {loadingPrecosPersonalizados ? (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-green-600"></div>
                            <p className="text-xs text-green-600">
                              Carregando preços personalizados...
                            </p>
                          </div>
                        ) : clienteComPrecosPersonalizados &&
                          clienteComPrecosPersonalizados.precoPersonalizado
                            .length > 0 ? (
                          <div className="mt-2">
                            <Badge className="text-xs bg-green-200 text-green-800 hover:bg-green-300 dark:bg-green-800 dark:text-green-200">
                              ⭐{" "}
                              {
                                clienteComPrecosPersonalizados
                                  .precoPersonalizado.length
                              }{" "}
                              produto(s) com preço personalizado
                            </Badge>
                          </div>
                        ) : (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                            Usando preços padrão
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setClienteSelecionado(null)}
                        className="h-8 px-3 text-xs border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/30"
                      >
                        Alterar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {loadingClientes ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">
                          Carregando clientes...
                        </p>
                      </div>
                    ) : clientesFiltrados.length === 0 ? (
                      <div className="text-center py-8">
                        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {buscaCliente
                            ? "Nenhum cliente encontrado"
                            : "Nenhum cliente disponível"}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {clientesFiltrados.map((cliente) => (
                          <div
                            key={cliente.id}
                            className="group p-4 border rounded-xl hover:border-primary/50 hover:shadow-md cursor-pointer transition-all duration-200 bg-card hover:bg-accent/50"
                            onClick={() => setClienteSelecionado(cliente)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                                  {cliente.nome}
                                </h4>
                                <p className="text-xs text-muted-foreground truncate mt-1">
                                  {cliente.contato}
                                </p>
                                <p className="text-xs text-muted-foreground truncate mt-1">
                                  {cliente.endereco}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seleção de Produtos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produtos Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={buscaProduto}
                    onChange={(e) => setBuscaProduto(e.target.value)}
                    placeholder="Buscar produtos..."
                    className="pl-10"
                  />
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {loadingProdutos ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">
                        Carregando produtos...
                      </p>
                    </div>
                  ) : produtosFiltrados.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {buscaProduto
                          ? "Nenhum produto encontrado"
                          : "Nenhum produto disponível"}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {produtosFiltrados.map((produto) => (
                        <div
                          key={produto.id}
                          className="group p-4 border rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-200 bg-card hover:bg-accent/50"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                                  {produto.nome}
                                </h4>
                                <Button
                                  size="sm"
                                  onClick={() => adicionarProduto(produto)}
                                  className="h-6 w-6 p-0 bg-primary hover:bg-primary/90 transition-colors flex-shrink-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {produto.descricao}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs px-2 py-0.5"
                                >
                                  {produto.categoria.nome}
                                </Badge>
                                <Badge
                                  variant={
                                    temPrecoPersonalizado(produto)
                                      ? "default"
                                      : "secondary"
                                  }
                                  className={`text-xs px-2 py-0.5 ${
                                    temPrecoPersonalizado(produto)
                                      ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                                      : ""
                                  }`}
                                >
                                  R${" "}
                                  {Number(obterPrecoProduto(produto))
                                    .toFixed(2)
                                    .replace(".", ",")}
                                  {temPrecoPersonalizado(produto) && (
                                    <span className="ml-1">⭐</span>
                                  )}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna direita - Resumo da venda */}
          <div className="space-y-6">
            {/* Resumo da Venda */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Resumo da Venda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Data da Venda */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Data da Venda
                  </Label>
                  <Popover
                    open={isDatePickerOpen}
                    onOpenChange={setIsDatePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dataVenda && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataVenda ? (
                          dataVenda.toLocaleDateString()
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dataVenda}
                        onSelect={handleDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Observações */}
                <div className="space-y-2">
                  <Label
                    htmlFor="observacoes"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Observações
                  </Label>
                  <textarea
                    id="observacoes"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Observações da venda..."
                    className="w-full p-3 border rounded-lg resize-none h-20 text-sm"
                  />
                </div>

                {/* Itens da Venda */}
                <div className="space-y-2">
                  <Label>Itens da Venda</Label>
                  {itensVenda.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Nenhum produto adicionado</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {itensVenda.map((item) => (
                        <div
                          key={item.produto.id}
                          className="p-3 border rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">
                              {item.produto.nome}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removerProduto(item.produto.id)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  atualizarQuantidade(
                                    item.produto.id,
                                    item.quantidade - 1
                                  )
                                }
                                className="h-6 w-6 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium w-8 text-center">
                                {item.quantidade}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  atualizarQuantidade(
                                    item.produto.id,
                                    item.quantidade + 1
                                  )
                                }
                                className="h-6 w-6 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-medium">
                                R${" "}
                                {Number(item.preco_unitario * item.quantidade)
                                  .toFixed(2)
                                  .replace(".", ",")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                R${" "}
                                {Number(item.preco_unitario)
                                  .toFixed(2)
                                  .replace(".", ",")}{" "}
                                cada
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Total */}
                {itensVenda.length > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-lg font-semibold text-green-600">
                        R$ {Number(totalVenda).toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-md font-semibold">
                        Total de bolos:
                      </span>
                      <span className="text-md font-semibold text-purple-600">
                        {itensVenda.reduce(
                          (total, item) => total + item.quantidade,
                          0
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Botões de ação */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={salvarVenda}
                    disabled={
                      !clienteSelecionado || itensVenda.length === 0 || salvando
                    }
                    className="flex-1"
                  >
                    {salvando ? "Salvando..." : "Finalizar Venda"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
