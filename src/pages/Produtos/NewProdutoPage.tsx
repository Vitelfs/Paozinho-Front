import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Package, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
} from "@/components/ui/form";
import { Heading1, Paragraph } from "@/components/ui/typography";
import {
  produtoSchema,
  type ProdutoFormData,
} from "../../schemas/produto.schema";
import { toast } from "react-toastify";
import { produtoService } from "@/services/produto.service";
import { categoriaService } from "@/services/categoria.service";
import type { CategoriaEntity } from "@/models/categoria.entity";

export function NewProdutoPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaEntity[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [margemLucroValue, setMargemLucroValue] = useState("");
  const [margemLucroClienteValue, setMargemLucroClienteValue] = useState("");

  const form = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      nome: "",
      categoria_id: "",
      descricao: "",
      preco_custo: 0,
      preco_minimo_venda: 0,
      margem_lucro: 0,
      preco_revenda: 0,
      margem_lucro_cliente: 0,
    },
  });

  // Carregar categorias para o select
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const data = await categoriaService.getCategorias();
        console.log(data);
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

  const onSubmit = async (data: ProdutoFormData) => {
    setIsSubmitting(true);

    try {
      await produtoService.createProduto(data);
      navigate("/produtos?created=true");
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      toast.error("Erro ao criar produto. Tente novamente.");
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
        const margem = ((precoVenda - precoCusto) / precoCusto) * 100;
        form.setValue("margem_lucro", Math.round(margem * 100) / 100);
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
        const margemCliente =
          ((precoRevenda - precoMinimoVenda) / precoMinimoVenda) * 100;
        form.setValue(
          "margem_lucro_cliente",
          Math.round(margemCliente * 100) / 100
        );
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
      const novoPrecoVenda = precoCusto * (1 + numericValue / 100);
      form.setValue(
        "preco_minimo_venda",
        Math.round(novoPrecoVenda * 100) / 100
      );
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
      const novoPrecoRevenda = precoMinimoVenda * (1 + numericValue / 100);
      form.setValue("preco_revenda", Math.round(novoPrecoRevenda * 100) / 100);
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
            <Heading1>Novo Produto</Heading1>
            <Paragraph className="text-muted-foreground mt-2">
              Preencha os dados para criar um novo produto
            </Paragraph>
          </div>
        </div>

        {/* Formulário */}
        <Card className="mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informações do Produto
            </CardTitle>
            <CardDescription>
              Todos os campos são obrigatórios para o cadastro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
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
                          placeholder="Digite o nome do produto"
                          {...field}
                        />
                      </FormControl>
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
                        <Package className="h-4 w-4" />
                        Categoria
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={loadingCategorias}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categorias.map((categoria) => (
                            <SelectItem key={categoria.id} value={categoria.id}>
                              {categoria.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o produto..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Preços */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Preço de Custo */}
                  <FormField
                    control={form.control}
                    name="preco_custo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Preço de Custo
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="0,00"
                            value={
                              field.value
                                ? field.value.toFixed(2).replace(".", ",")
                                : ""
                            }
                            onChange={(e) => {
                              const value = e.target.value.replace(",", ".");
                              handlePriceChange("preco_custo", value);
                            }}
                          />
                        </FormControl>
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
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Preço Mínimo de Venda
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="0,00"
                            value={
                              field.value
                                ? field.value.toFixed(2).replace(".", ",")
                                : ""
                            }
                            onChange={(e) => {
                              const value = e.target.value.replace(",", ".");
                              handlePriceChange("preco_minimo_venda", value);
                            }}
                          />
                        </FormControl>
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
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Margem de Lucro (%)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="0,00"
                            value={margemLucroValue}
                            onChange={(e) => {
                              handleMargemChange(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Preço de Revenda */}
                  <FormField
                    control={form.control}
                    name="preco_revenda"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Preço de Revenda
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="0,00"
                            value={
                              field.value
                                ? field.value.toFixed(2).replace(".", ",")
                                : ""
                            }
                            onChange={(e) => {
                              const value = e.target.value.replace(",", ".");
                              handlePriceChange("preco_revenda", value);
                            }}
                          />
                        </FormControl>
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
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Margem de Lucro Cliente (%)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="0,00"
                            value={margemLucroClienteValue}
                            onChange={(e) => {
                              handleMargemClienteChange(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Botões de ação */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || loadingCategorias}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? "Criando..." : "Criar Produto"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DefaultLayout>
  );
}
