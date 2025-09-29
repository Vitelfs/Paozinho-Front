import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  User,
  Package,
  FileText,
  Clock,
  Phone,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { StatusVenda } from "@/models/vendas.entity";
import type { VendasEntity } from "@/models/vendas.entity";

interface VendaDetailsModalProps {
  venda: VendasEntity | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VendaDetailsModal({
  venda,
  isOpen,
  onClose,
}: VendaDetailsModalProps) {
  if (!venda) return null;

  const getStatusConfig = (status: StatusVenda) => {
    const configs = {
      [StatusVenda.PENDENTE]: {
        label: "Pendente",
        variant: "secondary" as const,
        color: "text-yellow-600",
      },
      [StatusVenda.PAGO]: {
        label: "Pago",
        variant: "default" as const,
        color: "text-green-600",
      },
      [StatusVenda.CANCELADO]: {
        label: "Cancelado",
        variant: "destructive" as const,
        color: "text-red-600",
      },
      [StatusVenda.ENTREGUE]: {
        label: "Entregue",
        variant: "outline" as const,
        color: "text-purple-600",
      },
      [StatusVenda.PRODUZIDO]: {
        label: "Produzido",
        variant: "default" as const,
        color: "text-green-600",
      },
    };
    return configs[status];
  };

  const statusConfig = getStatusConfig(venda.status);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value: string) => {
    return `R$ ${Number(value).toFixed(2).replace(".", ",")}`;
  };

  const getFormaIcon = (forma: string) => {
    const icons = {
      PIX: "📱",
      DINHEIRO: "💵",
      CREDITO: "💳",
      DEBITO: "💳",
    };
    return icons[forma as keyof typeof icons] || "💰";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-xl">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Detalhes da Venda #{venda.id.slice(-8)}
            </div>
            <Badge
              variant={statusConfig.variant}
              className={`text-sm font-semibold px-3 mr-2 py-1 ${
                statusConfig.variant === "default"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : statusConfig.variant === "destructive"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : statusConfig.variant === "secondary"
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : statusConfig.variant === "outline"
                  ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                  : ""
              }`}
            >
              {statusConfig.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-4 w-4" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Nome
                  </label>
                  <p className="text-sm font-medium">{venda.cliente.nome}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Contato
                  </label>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {venda.cliente.contato}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações da Venda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-4 w-4" />
                Informações da Venda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Data da Venda
                  </label>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(venda.data_venda)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Criado em
                  </label>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(venda.createdAt)}
                  </p>
                </div>
              </div>
              {venda.observacoes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Observações
                  </label>
                  <p className="text-sm font-medium flex items-start gap-1">
                    <FileText className="h-3 w-3 mt-0.5" />
                    {venda.observacoes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Produtos da Venda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-4 w-4" />
                Produtos ({venda.item_venda.length})
              </CardTitle>
              <CardDescription>
                {venda.item_venda.map((item) => item.produto.nome).join(", ")} -
                Total de bolos vendidos:{" "}
                <span className="bg-dark-500 text-card-foreground px-2 py-1 rounded-md">
                  {venda.item_venda.reduce(
                    (acc, item) => acc + item.quantidade,
                    0
                  )}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-3 font-semibold text-sm">
                        Produto
                      </th>
                      <th className="text-right p-3 font-semibold text-sm">
                        Preço Unit.
                      </th>
                      <th className="text-center p-3 font-semibold text-sm">
                        Qtd.
                      </th>
                      <th className="text-right p-3 font-semibold text-sm">
                        Subtotal
                      </th>
                      <th className="text-right p-3 font-semibold text-sm">
                        Devoluções
                      </th>
                      <th className="text-left p-3 font-semibold text-sm">
                        Motivo
                      </th>
                      <th className="text-right p-3 font-semibold text-sm">
                        Saldo Final
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {venda.item_venda.map((item, index) => {
                      const subtotal =
                        Number(item.preco_venda) * item.quantidade;
                      const totalDevolucoes = item.devolucoes
                        ? item.devolucoes.reduce(
                            (sum, dev) =>
                              sum + Number(item.preco_venda) * dev.quantidade,
                            0
                          )
                        : 0;
                      const saldo = subtotal - totalDevolucoes;

                      return (
                        <tr
                          key={item.id}
                          className={`border-b border-border hover:bg-muted/30 transition-colors ${
                            index % 2 === 0 ? "bg-background" : "bg-muted/10"
                          }`}
                        >
                          <td className="p-3">
                            <div className="space-y-1">
                              <div className="font-medium text-sm text-foreground">
                                {item.produto.nome}
                              </div>
                              <div className="text-xs text-muted-foreground font-mono">
                                #{item.produto.id.slice(-8)}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="text-sm font-semibold text-foreground">
                              {formatCurrency(item.preco_venda)}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <Badge
                              variant="secondary"
                              className="text-sm font-bold px-2 py-1"
                            >
                              {item.quantidade}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <div className="text-sm font-bold text-green-600">
                              {formatCurrency(subtotal.toString())}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="text-sm">
                              {totalDevolucoes > 0 ? (
                                <div className="text-red-600 font-bold">
                                  -{formatCurrency(totalDevolucoes.toString())}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">
                                  -
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              {item.devolucoes && item.devolucoes.length > 0 ? (
                                <div className="space-y-1">
                                  {item.devolucoes.map((dev, idx) => (
                                    <div
                                      key={idx}
                                      className="bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-md border border-red-200 dark:border-red-800"
                                    >
                                      <div className="text-xs text-red-700 dark:text-red-300 font-medium">
                                        {dev.motivo}
                                      </div>
                                      <div className="text-xs text-red-600 dark:text-red-400">
                                        Qtd dev: {dev.quantidade}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">
                                  -
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div
                              className={`text-sm font-bold ${
                                saldo > 0
                                  ? "text-green-600"
                                  : saldo < 0
                                  ? "text-red-600"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {formatCurrency(saldo.toString())}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total da Venda:</span>
                <span className="text-green-600">
                  {formatCurrency(venda.total)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Formas de Pagamento */}
          {venda.pagamentos && venda.pagamentos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-4 w-4" />
                  Formas de Pagamento ({venda.pagamentos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {venda.pagamentos.map((pagamento, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/30 dark:border-green-800"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {getFormaIcon(pagamento.forma)}
                          </span>
                          <span className="font-medium text-sm">
                            {pagamento.forma}
                          </span>
                        </div>
                        <Badge
                          variant="default"
                          className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                        >
                          <DollarSign className="h-3 w-3 mr-1" />
                          {formatCurrency(pagamento.valor)}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Processado em: {formatDate(pagamento.data_pagamento)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Pago:</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(
                      venda.pagamentos
                        .reduce((sum, p) => sum + Number(p.valor), 0)
                        .toString()
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
