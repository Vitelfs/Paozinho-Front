import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Save,
  Package,
  DollarSign,
  Info,
  Calendar,
  Tag,
  FileText,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Heading1, Paragraph } from "@/components/ui/typography";
import {
  updateProdutoSchema,
  updateProdutoBackendSchema,
  type UpdateProdutoFormData,
  type UpdateProdutoBackendData,
} from "@/schemas/produto.schema";
import { produtoService } from "@/services/produto.service";
import { categoriaService } from "@/services/categoria.service";
import type { CategoriaEntity } from "@/models/categoria.entity";
import { toast } from "react-toastify";
import { calculateMargemLucro } from "@/utils/dataFormater";

export function EditProdutoPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaEntity[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [margemLucroValue, setMargemLucroValue] = useState("");
  const [margemLucroClienteValue, setMargemLucroClienteValue] = useState("");
  const { state } = useLocation();
  const produto = state?.produto;

  const form = useForm<UpdateProdutoFormData>({
    resolver: zodResolver(updateProdutoSchema),
    defaultValues: {
      nome: produto?.nome || "",
      categoria_id: produto?.categoria?.id || "",
      descricao: produto?.descricao || "",
      preco_custo: produto?.preco_custo
        ? parseFloat(produto.preco_custo.toString())
        : 0,
      preco_minimo_venda: produto?.preco_minimo_venda
        ? parseFloat(produto.preco_minimo_venda.toString())
        : 0,
      margem_lucro: produto?.margem_lucro || 0,
      preco_revenda: produto?.preco_revenda
        ? parseFloat(produto.preco_revenda.toString())
        : 0,
      margem_lucro_cliente: produto?.margem_lucro_cliente || 0,
      validade: produto?.validade ?? true,
      validade_dias: produto?.validade_dias || 0,
    },
  });

  // Carregar categorias para o select
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const data = await categoriaService.getCategorias();
        setCategorias(data);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        toast.error("Erro ao carregar categorias");
      } finally {
        setLoadingCategorias(false);
      }
    };

    loadCategorias();
  }, []);

  // Calcular margens automaticamente
  const calcularMargens = () => {
    const precoCusto = parseFloat(produto?.preco_custo?.toString() || "0");
    const precoMinimoVenda = parseFloat(
      produto?.preco_minimo_venda?.toString() || "0"
    );
    const precoRevenda = parseFloat(produto?.preco_revenda?.toString() || "0");

    // Calcular margem de lucro normal usando a função utilitária
    if (precoCusto > 0 && precoMinimoVenda > 0) {
      const margemCalculada = calculateMargemLucro(
        precoCusto,
        precoMinimoVenda
      );
      form.setValue("margem_lucro", margemCalculada);
      setMargemLucroValue(margemCalculada.toFixed(2).replace(".", ","));
    }

    // Calcular margem de lucro do cliente usando a função utilitária
    if (precoMinimoVenda > 0 && precoRevenda > 0) {
      const margemClienteCalculada = calculateMargemLucro(
        precoMinimoVenda,
        precoRevenda
      );
      form.setValue("margem_lucro_cliente", margemClienteCalculada);
      setMargemLucroClienteValue(
        margemClienteCalculada.toFixed(2).replace(".", ",")
      );
    }
  };

  // Verificar se o produto foi passado via state
  useEffect(() => {
    if (!produto) {
      toast.error("Produto não encontrado");
      navigate("/produtos");
    } else {
      // Calcular as margens automaticamente
      calcularMargens();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produto, navigate]);

  const onSubmit = async (data: UpdateProdutoFormData) => {
    setIsSubmitting(true);
    try {
      // Valida com schema completo (incluindo margem de lucro)
      const validatedData = updateProdutoSchema.parse(data);

      // Transforma para enviar ao backend (remove margem de lucro)
      const backendData: UpdateProdutoBackendData =
        updateProdutoBackendSchema.parse(validatedData);

      console.log("Dados validados (frontend):", validatedData);
      console.log("Dados para backend:", backendData);

      await produtoService.updateProduto(produto.id, backendData);
      navigate("/produtos?edited=true");
    } catch (error) {
      console.error("Erro ao editar produto:", error);
      toast.error("Erro ao editar produto. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/produtos");
  };

  const formatCurrency = (value: string) => {
    // Remove tudo que não é dígito
    const numericValue = value.replace(/\D/g, "");

    // Converte para centavos e depois para reais
    const realValue = parseFloat(numericValue) / 100;

    return realValue.toFixed(2);
  };

  const handlePriceChange = (
    field: "preco_custo" | "preco_minimo_venda" | "preco_revenda",
    value: string
  ) => {
    const numericValue = parseFloat(formatCurrency(value));
    form.setValue(field, numericValue);

    // Recalcular margem quando os preços mudam
    if (field === "preco_custo" || field === "preco_minimo_venda") {
      const precoCusto =
        field === "preco_custo" ? numericValue : form.getValues("preco_custo");
      const precoVenda =
        field === "preco_minimo_venda"
          ? numericValue
          : form.getValues("preco_minimo_venda");

      if (precoCusto > 0 && precoVenda > 0) {
        const margem = calculateMargemLucro(precoCusto, precoVenda);
        form.setValue("margem_lucro", margem);
        setMargemLucroValue(margem.toFixed(2).replace(".", ","));
      }
    }

    // Recalcular margem do cliente quando preços de revenda mudam
    if (field === "preco_minimo_venda" || field === "preco_revenda") {
      const precoMinimoVenda =
        field === "preco_minimo_venda"
          ? numericValue
          : form.getValues("preco_minimo_venda");
      const precoRevenda =
        field === "preco_revenda"
          ? numericValue
          : form.getValues("preco_revenda");

      if (precoMinimoVenda > 0 && precoRevenda > 0) {
        const margemCliente = calculateMargemLucro(
          precoMinimoVenda,
          precoRevenda
        );
        form.setValue("margem_lucro_cliente", margemCliente);
        setMargemLucroClienteValue(margemCliente.toFixed(2).replace(".", ","));
      }
    }
  };

  const handleMargemChange = (value: string) => {
    // Remove caracteres não numéricos exceto vírgula e ponto
    const cleanValue = value.replace(/[^\d,.]/g, "");

    // Atualizar o estado local
    setMargemLucroValue(cleanValue);

    // Converte vírgula para ponto para parseFloat
    const numericValue = parseFloat(cleanValue.replace(",", ".")) || 0;

    // Atualizar o valor no form
    form.setValue("margem_lucro", numericValue);

    // Recalcular preço de venda baseado na margem
    const precoCusto = form.getValues("preco_custo");
    if (precoCusto > 0 && numericValue >= 0) {
      // Fórmula inversa da calculateMargemLucro: precoVenda = precoCusto / (1 - margem/100)
      const novoPrecoVenda = precoCusto / (1 - numericValue / 100);
      const precoVendaArredondado = Math.round(novoPrecoVenda * 100) / 100;
      form.setValue("preco_minimo_venda", precoVendaArredondado);

      // Recalcular margem do cliente se necessário
      const precoRevenda = form.getValues("preco_revenda");
      if (precoRevenda > 0) {
        const margemCliente = calculateMargemLucro(
          precoVendaArredondado,
          precoRevenda
        );
        form.setValue("margem_lucro_cliente", margemCliente);
        setMargemLucroClienteValue(margemCliente.toFixed(2).replace(".", ","));
      }
    }
  };

  const handleMargemClienteChange = (value: string) => {
    // Remove caracteres não numéricos exceto vírgula e ponto
    const cleanValue = value.replace(/[^\d,.]/g, "");

    // Atualizar o estado local
    setMargemLucroClienteValue(cleanValue);

    // Converte vírgula para ponto para parseFloat
    const numericValue = parseFloat(cleanValue.replace(",", ".")) || 0;

    // Atualizar o valor no form
    form.setValue("margem_lucro_cliente", numericValue);

    // Recalcular preço de revenda baseado na margem do cliente
    const precoMinimoVenda = form.getValues("preco_minimo_venda");
    if (precoMinimoVenda > 0 && numericValue >= 0) {
      // Fórmula inversa da calculateMargemLucro: precoRevenda = precoMinimoVenda / (1 - margem/100)
      const novoPrecoRevenda = precoMinimoVenda / (1 - numericValue / 100);
      const precoRevendaArredondado = Math.round(novoPrecoRevenda * 100) / 100;
      form.setValue("preco_revenda", precoRevendaArredondado);
    }
  };

  return (
    <DefaultLayout>
      <div className="w-full">
        {/* Cabeçalho da página */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <Heading1>Editar Produto</Heading1>
            <Paragraph className="text-muted-foreground mt-2">
              Atualize os dados do produto
            </Paragraph>
          </div>
        </div>

        {/* Formulário */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal - Informações Básicas */}
          <div className="lg:col-span-2 space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Informações Básicas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-600" />
                      Informações Básicas
                    </CardTitle>
                    <CardDescription>
                      Dados principais do produto
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Nome */}
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Nome do Produto
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Bolo de Chocolate"
                              className="text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Nome que aparecerá na lista de produtos
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Categoria */}
                    <FormField
                      control={form.control}
                      name="categoria_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Categoria
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={loadingCategorias}
                          >
                            <FormControl>
                              <SelectTrigger className="text-base">
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categorias.map((categoria) => (
                                <SelectItem
                                  key={categoria.id}
                                  value={categoria.id}
                                >
                                  {categoria.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Categoria para organizar seus produtos
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Descrição */}
                    <FormField
                      control={form.control}
                      name="descricao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Descrição
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva os ingredientes, sabor, características especiais..."
                              className="min-h-[120px] text-base resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Descrição detalhada do produto
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Preços e Margens */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Preços e Margens
                    </CardTitle>
                    <CardDescription>
                      Configure os preços de custo, venda e revenda
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Coluna 1 - Preços Base */}
                      <div className="space-y-4">
                        <div className="text-sm font-medium text-muted-foreground mb-3">
                          Preços Base
                        </div>

                        {/* Preço de Custo */}
                        <FormField
                          control={form.control}
                          name="preco_custo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preço de Custo</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                    R$
                                  </span>
                                  <Input
                                    type="text"
                                    placeholder="0,00"
                                    className="pl-10 text-base"
                                    value={
                                      Number(field.value)
                                        ? Number(field.value)
                                            .toFixed(2)
                                            .replace(".", ",")
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const value = e.target.value.replace(
                                        ",",
                                        "."
                                      );
                                      handlePriceChange("preco_custo", value);
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Quanto custa para produzir
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Preço Mínimo de Venda */}
                        <FormField
                          control={form.control}
                          name="preco_minimo_venda"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preço Mínimo de Venda</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                    R$
                                  </span>
                                  <Input
                                    type="text"
                                    placeholder="0,00"
                                    className="pl-10 text-base"
                                    value={
                                      Number(field.value)
                                        ? Number(field.value)
                                            .toFixed(2)
                                            .replace(".", ",")
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const value = e.target.value.replace(
                                        ",",
                                        "."
                                      );
                                      handlePriceChange(
                                        "preco_minimo_venda",
                                        value
                                      );
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Preço mínimo para vender
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Margem de Lucro */}
                        <FormField
                          control={form.control}
                          name="margem_lucro"
                          render={() => (
                            <FormItem>
                              <FormLabel>Margem de Lucro</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="text"
                                    placeholder="0,00"
                                    className="pr-8 text-base"
                                    value={margemLucroValue}
                                    onChange={(e) => {
                                      handleMargemChange(e.target.value);
                                    }}
                                  />
                                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                    %
                                  </span>
                                </div>
                              </FormControl>
                              <FormDescription>
                                Calculado automaticamente
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Coluna 2 - Revenda */}
                      <div className="space-y-4">
                        <div className="text-sm font-medium text-muted-foreground mb-3">
                          Preços de Revenda
                        </div>

                        {/* Preço de Revenda */}
                        <FormField
                          control={form.control}
                          name="preco_revenda"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preço de Revenda</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                    R$
                                  </span>
                                  <Input
                                    type="text"
                                    placeholder="0,00"
                                    className="pl-10 text-base"
                                    value={
                                      Number(field.value)
                                        ? Number(field.value)
                                            .toFixed(2)
                                            .replace(".", ",")
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const value = e.target.value.replace(
                                        ",",
                                        "."
                                      );
                                      handlePriceChange("preco_revenda", value);
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Preço sugerido para clientes
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Margem de Lucro do Cliente */}
                        <FormField
                          control={form.control}
                          name="margem_lucro_cliente"
                          render={() => (
                            <FormItem>
                              <FormLabel>Margem do Cliente</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="text"
                                    placeholder="0,00"
                                    className="pr-8 text-base"
                                    value={margemLucroClienteValue}
                                    onChange={(e) => {
                                      handleMargemClienteChange(e.target.value);
                                    }}
                                  />
                                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                    %
                                  </span>
                                </div>
                              </FormControl>
                              <FormDescription>
                                Margem de lucro para o cliente
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Validade */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-amber-600" />
                      Validade do Produto
                    </CardTitle>
                    <CardDescription>
                      Configure se o produto possui prazo de validade
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Switch de Validade */}
                      <FormField
                        control={form.control}
                        name="validade"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/30">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-medium">
                                Produto possui validade?
                              </FormLabel>
                              <FormDescription>
                                Ative se o produto tem prazo de validade
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Dias de Validade */}
                      <FormField
                        control={form.control}
                        name="validade_dias"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Validade (em dias)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0"
                                min="0"
                                max="9999"
                                className="text-base"
                                disabled={!form.watch("validade")}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Quantos dias o produto dura após a produção
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </form>
            </Form>
          </div>

          {/* Coluna Lateral - Resumo e Ações */}
          <div className="space-y-6">
            {/* Resumo */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Resumo do Produto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Preço de Custo:
                    </span>
                    <span className="font-medium">
                      R${" "}
                      {Number(form.watch("preco_custo") || 0)
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Preço de Venda:
                    </span>
                    <span className="font-medium">
                      R${" "}
                      {Number(form.watch("preco_minimo_venda") || 0)
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Preço de Revenda:
                    </span>
                    <span className="font-medium">
                      R${" "}
                      {Number(form.watch("preco_revenda") || 0)
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Margem de Lucro:
                    </span>
                    <span className="font-medium text-green-600">
                      {margemLucroValue || "0,00"}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Margem do Cliente:
                    </span>
                    <span className="font-medium text-blue-600">
                      {margemLucroClienteValue || "0,00"}%
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Botões de Ação */}
                <div className="space-y-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || loadingCategorias}
                    className="w-full flex items-center gap-2"
                    size="lg"
                    onClick={form.handleSubmit(onSubmit)}
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? "Salvando..." : "Salvar Produto"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    Cancelar
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
