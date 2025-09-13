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
  Calendar,
  FileText,
} from "lucide-react";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heading1, Paragraph } from "@/components/ui/typography";
import { toast } from "react-toastify";
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
      toast.success(`${produto.nome} adicionado à venda`);
    },
    [itensVenda, obterPrecoProduto]
  );

  // Remover produto da venda
  const removerProduto = useCallback((produtoId: string) => {
    setItensVenda((prev) =>
      prev.filter((item) => item.produto.id !== produtoId)
    );
    toast.success("Produto removido da venda");
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
                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          {clienteSelecionado.nome}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {clienteSelecionado.contato}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {clienteSelecionado.endereco}
                        </p>
                        {loadingPrecosPersonalizados ? (
                          <p className="text-xs text-blue-600 mt-1">
                            Carregando preços personalizados...
                          </p>
                        ) : clienteComPrecosPersonalizados &&
                          clienteComPrecosPersonalizados.precoPersonalizado
                            .length > 0 ? (
                          <p className="text-xs text-green-600 mt-1">
                            ⭐{" "}
                            {
                              clienteComPrecosPersonalizados.precoPersonalizado
                                .length
                            }{" "}
                            produto(s) com preço personalizado
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">
                            Usando preços padrão
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setClienteSelecionado(null)}
                      >
                        Alterar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {loadingClientes ? (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">
                          Carregando clientes...
                        </p>
                      </div>
                    ) : clientesFiltrados.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">
                          {buscaCliente
                            ? "Nenhum cliente encontrado"
                            : "Nenhum cliente disponível"}
                        </p>
                      </div>
                    ) : (
                      clientesFiltrados.map((cliente) => (
                        <div
                          key={cliente.id}
                          className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                          onClick={() => setClienteSelecionado(cliente)}
                        >
                          <h4 className="font-medium">{cliente.nome}</h4>
                          <p className="text-sm text-muted-foreground">
                            {cliente.contato}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {cliente.endereco}
                          </p>
                        </div>
                      ))
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

                <div className="max-h-80 overflow-y-auto space-y-2">
                  {loadingProdutos ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">
                        Carregando produtos...
                      </p>
                    </div>
                  ) : produtosFiltrados.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">
                        {buscaProduto
                          ? "Nenhum produto encontrado"
                          : "Nenhum produto disponível"}
                      </p>
                    </div>
                  ) : (
                    produtosFiltrados.map((produto) => (
                      <div
                        key={produto.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{produto.nome}</h4>
                            <p className="text-sm text-muted-foreground">
                              {produto.descricao}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {produto.categoria.nome}
                              </Badge>
                              <Badge
                                variant={
                                  temPrecoPersonalizado(produto)
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                R${" "}
                                {Number(obterPrecoProduto(produto))
                                  .toFixed(2)
                                  .replace(".", ",")}
                                {temPrecoPersonalizado(produto) && (
                                  <span className="ml-1 text-xs">⭐</span>
                                )}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => adicionarProduto(produto)}
                            className="ml-4"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
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
                  <Label
                    htmlFor="data-venda"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Data da Venda
                  </Label>
                  <Input
                    id="data-venda"
                    type="date"
                    value={dataVenda.toISOString().split("T")[0]}
                    onChange={(e) => setDataVenda(new Date(e.target.value))}
                  />
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
