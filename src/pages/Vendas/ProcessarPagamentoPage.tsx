import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  Calendar,
  Package,
  AlertTriangle,
  Check,
} from "lucide-react";

import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Heading1, Paragraph } from "@/components/ui/typography";
import { toast } from "react-toastify";

import type { VendasEntity } from "@/models/vendas.entity";
import { vendasService } from "@/services/vendas.service";
import { cn } from "@/lib/utils";
import {
  processarVendaSchema,
  type ProcessarVendaForm,
} from "@/schemas/processar-pagamento.schema";

const formasPagamento = [
  { value: "PIX", label: "PIX", icon: "📱" },
  { value: "DINHEIRO", label: "Dinheiro", icon: "💵" },
  { value: "CREDITO", label: "Cartão de Crédito", icon: "💳" },
  { value: "DEBITO", label: "Cartão de Débito", icon: "💳" },
] as const;

export function ProcessarPagamentoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [venda, setVenda] = useState<VendasEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const form = useForm<ProcessarVendaForm>({
    resolver: zodResolver(processarVendaSchema),
    defaultValues: {
      data_pagamento: new Date(),
      pagamentos: [{ forma: "PIX", valor: 0 }],
      devolucoes: [],
    },
  });

  const {
    fields: pagamentosFields,
    append: appendPagamento,
    remove: removePagamento,
  } = useFieldArray({
    control: form.control,
    name: "pagamentos",
  });

  const {
    fields: devolucoesFields,
    append: appendDevolucao,
    remove: removeDevolucao,
  } = useFieldArray({
    control: form.control,
    name: "devolucoes",
  });

  // Carregar dados da venda
  useEffect(() => {
    if (!id) return;

    const loadVenda = async () => {
      try {
        setLoading(true);
        const data = await vendasService.getVendaById(id);
        setVenda(data);

        // Definir valor inicial do primeiro pagamento como o total da venda
        form.setValue("pagamentos.0.valor", Number(data.total));
      } catch (error) {
        console.error("Erro ao carregar venda:", error);
        toast.error("Erro ao carregar dados da venda");
        navigate("/vendas");
      } finally {
        setLoading(false);
      }
    };

    loadVenda();
  }, [id, navigate, form]);

  // Calcular valores
  const totalVenda = Number(venda?.total || 0);
  const pagamentos = form.watch("pagamentos");
  const devolucoes = form.watch("devolucoes");

  const totalPagamentos = pagamentos.reduce(
    (sum, p) => sum + (p.valor || 0),
    0
  );
  const totalDevolucoes = devolucoes.reduce((sum, d) => {
    const item = venda?.item_venda.find((i) => i.id === d.item_venda_id);
    return sum + (item ? Number(item.preco_venda) * d.quantidade : 0);
  }, 0);

  const valorFinal = totalVenda - totalDevolucoes;
  const diferenca = totalPagamentos - valorFinal;

  const adicionarPagamento = () => {
    appendPagamento({
      forma: "PIX",
      valor: Math.max(0, valorFinal - totalPagamentos),
    });
  };

  const adicionarDevolucao = () => {
    if (!venda?.item_venda.length) return;

    appendDevolucao({
      item_venda_id: "",
      quantidade: 1,
      motivo: "",
    });
  };

  const onSubmit = async (data: ProcessarVendaForm) => {
    if (!venda) return;

    // Validação final
    console.log(data);
    if (Math.abs(diferenca) > 0.01) {
      toast.error(
        "O valor total dos pagamentos deve ser igual ao valor final da venda"
      );
      return;
    }

    // Validar devoluções - agrupar por item e verificar total
    const devolucoesAgrupadas = data.devolucoes.reduce((acc, devolucao) => {
      if (!acc[devolucao.item_venda_id]) {
        acc[devolucao.item_venda_id] = 0;
      }
      acc[devolucao.item_venda_id] += devolucao.quantidade;
      return acc;
    }, {} as Record<string, number>);

    for (const [itemVendaId, totalDevolvido] of Object.entries(
      devolucoesAgrupadas
    )) {
      const item = venda.item_venda.find((i) => i.id === itemVendaId);
      if (!item) {
        toast.error("Item da venda não encontrado");
        return;
      }

      if (totalDevolvido > item.quantidade) {
        const produtoNome = item.produto.nome;
        toast.error(
          `Quantidade de devolução do produto "${produtoNome}" (${totalDevolvido}) excede a quantidade vendida (${item.quantidade})`
        );
        return;
      }
    }

    try {
      setProcessing(true);

      const processarData = {
        pagamentos: data.pagamentos,
        devolucoes: data.devolucoes,
        data_pagamento: data.data_pagamento,
      };

      await vendasService.processarVenda(venda.id, processarData);

      toast.success("Pagamento processado com sucesso!");
      navigate("/vendas?processed=true");
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      toast.error("Erro ao processar pagamento");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DefaultLayout>
    );
  }

  if (!venda) {
    return (
      <DefaultLayout>
        <div className="text-center">
          <Paragraph>Venda não encontrada</Paragraph>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/vendas")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <Heading1 className="flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Processar Pagamento
            </Heading1>
            <Paragraph className="text-muted-foreground">
              Finalize o pagamento da venda #{venda.id.slice(-8)}
            </Paragraph>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações da Venda */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Dados da Venda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Cliente</Label>
                  <p className="text-sm">{venda.cliente.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {venda.cliente.contato}
                  </p>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium">Data da Venda</Label>
                  <p className="text-sm">
                    {format(
                      new Date(venda.data_venda),
                      "dd 'de' MMMM 'de' yyyy",
                      {
                        locale: ptBR,
                      }
                    )}
                  </p>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Itens
                  </Label>
                  <div className="space-y-2">
                    {venda.item_venda.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <div>
                          <p className="font-medium">{item.produto.nome}</p>
                          <p className="text-muted-foreground">
                            {item.quantidade}x R${" "}
                            {Number(item.preco_venda)
                              .toFixed(2)
                              .replace(".", ",")}
                          </p>
                        </div>
                        <p className="font-medium">
                          R${" "}
                          {(item.quantidade * Number(item.preco_venda))
                            .toFixed(2)
                            .replace(".", ",")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>R$ {totalVenda.toFixed(2).replace(".", ",")}</span>
                  </div>
                  {totalDevolucoes > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Devoluções:</span>
                      <span>
                        - R$ {totalDevolucoes.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total Final:</span>
                    <span>R$ {valorFinal.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>

                {/* Indicador de diferença */}
                {Math.abs(diferenca) > 0.01 && (
                  <div
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md text-sm",
                      diferenca > 0
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    )}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    {diferenca > 0
                      ? `Excesso: R$ ${diferenca.toFixed(2).replace(".", ",")}`
                      : `Faltam: R$ ${Math.abs(diferenca)
                          .toFixed(2)
                          .replace(".", ",")}`}
                  </div>
                )}

                {Math.abs(diferenca) <= 0.01 && totalPagamentos > 0 && (
                  <div className="flex items-center gap-2 p-2 rounded-md text-sm bg-green-50 text-green-700 border border-green-200">
                    <Check className="h-4 w-4" />
                    Valores conferem
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Formulário */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Data de Pagamento */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Data do Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="data_pagamento"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(
                                      field.value,
                                      "dd 'de' MMMM 'de' yyyy",
                                      {
                                        locale: ptBR,
                                      }
                                    )
                                  ) : (
                                    <span>Selecione uma data</span>
                                  )}
                                  <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date: Date) =>
                                  date > new Date() ||
                                  date < new Date("1900-01-01")
                                }
                                locale={ptBR}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Formas de Pagamento */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Formas de Pagamento
                      </CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={adicionarPagamento}
                      >
                        Adicionar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pagamentosFields.map((field, index) => (
                      <div key={field.id} className="flex gap-4 items-end">
                        <FormField
                          control={form.control}
                          name={`pagamentos.${index}.forma`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Forma de Pagamento</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {formasPagamento.map((forma) => (
                                    <SelectItem
                                      key={forma.value}
                                      value={forma.value}
                                    >
                                      <span className="flex items-center gap-2">
                                        <span>{forma.icon}</span>
                                        {forma.label}
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`pagamentos.${index}.valor`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Valor</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0,00"
                                  value={
                                    field.value !== undefined ? field.value : ""
                                  }
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(
                                      value === "" ? 0 : Number(value)
                                    );
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {pagamentosFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removePagamento(index)}
                          >
                            Remover
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Devoluções */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Devoluções
                      </CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={adicionarDevolucao}
                        disabled={!venda.item_venda.length}
                      >
                        Adicionar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {devolucoesFields.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma devolução
                      </p>
                    ) : (
                      devolucoesFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="space-y-4 p-4 border rounded-md"
                        >
                          <div className="flex gap-4">
                            <FormField
                              control={form.control}
                              name={`devolucoes.${index}.item_venda_id`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>Produto</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione um produto" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {venda.item_venda.map((item) => {
                                        const totalDevolvido = devolucoes
                                          .filter(
                                            (d) => d.item_venda_id === item.id
                                          )
                                          .reduce(
                                            (sum, d) =>
                                              sum + (d.quantidade || 0),
                                            0
                                          );
                                        const disponivel =
                                          item.quantidade - totalDevolvido;

                                        return (
                                          <SelectItem
                                            key={item.id}
                                            value={item.id}
                                            disabled={disponivel <= 0}
                                          >
                                            {item.produto.nome} (Qtd:{" "}
                                            {item.quantidade}, Disponível:{" "}
                                            {disponivel})
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`devolucoes.${index}.quantidade`}
                              render={({ field }) => {
                                const itemVendaId = form.watch(
                                  `devolucoes.${index}.item_venda_id`
                                );
                                const item = venda.item_venda.find(
                                  (i) => i.id === itemVendaId
                                );
                                const maxQuantidade = item?.quantidade || 1;

                                // Calcular quantidade já devolvida deste item em outras devoluções (excluindo a atual)
                                const outrasDevolucoesDoItem = devolucoes
                                  .filter(
                                    (d, idx) =>
                                      idx !== index &&
                                      d.item_venda_id === itemVendaId
                                  )
                                  .reduce(
                                    (sum, d) => sum + (d.quantidade || 0),
                                    0
                                  );

                                const quantidadeDisponivel =
                                  maxQuantidade - outrasDevolucoesDoItem;

                                return (
                                  <FormItem className="w-32">
                                    <FormLabel>Quantidade</FormLabel>
                                    <Select
                                      onValueChange={(value) =>
                                        field.onChange(Number(value))
                                      }
                                      value={field.value?.toString()}
                                      disabled={
                                        !itemVendaId ||
                                        quantidadeDisponivel <= 0
                                      }
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Qtd" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {itemVendaId &&
                                        quantidadeDisponivel > 0 ? (
                                          Array.from(
                                            { length: quantidadeDisponivel },
                                            (_, i) => i + 1
                                          ).map((qtd) => (
                                            <SelectItem
                                              key={qtd}
                                              value={qtd.toString()}
                                            >
                                              {qtd}
                                            </SelectItem>
                                          ))
                                        ) : (
                                          <SelectItem value="disabled" disabled>
                                            Selecione um produto primeiro
                                          </SelectItem>
                                        )}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                );
                              }}
                            />

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeDevolucao(index)}
                              className="mt-8"
                            >
                              Remover
                            </Button>
                          </div>

                          <FormField
                            control={form.control}
                            name={`devolucoes.${index}.motivo`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Motivo da Devolução</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Descreva o motivo da devolução..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Ações */}
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/vendas")}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={processing || Math.abs(diferenca) > 0.01}
                    className="min-w-32"
                  >
                    {processing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      "Processar Pagamento"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
