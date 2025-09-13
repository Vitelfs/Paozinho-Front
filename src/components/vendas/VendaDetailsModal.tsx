import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  User,
  Package,
  FileText,
  Clock,
  Phone,
  CreditCard,
  RotateCcw,
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
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-5 w-5" />
            Detalhes da Venda #{venda.id.slice(-8)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status e Total */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <Badge variant={statusConfig.variant} className="text-sm">
                {statusConfig.label}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(venda.total)}
              </div>
              <div className="text-sm text-muted-foreground">
                Total da Venda
              </div>
            </div>
          </div>

          <Separator />

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
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {venda.item_venda.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">
                          {item.produto.nome}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          ID: {item.produto.id.slice(-8)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatCurrency(item.preco_venda)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          por unidade
                        </div>
                      </div>
                    </div>
                    <div className="pt-3 border-t space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Quantidade:
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {item.quantidade}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-600">
                            {formatCurrency(
                              (
                                Number(item.preco_venda) * item.quantidade
                              ).toString()
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            subtotal
                          </div>
                        </div>
                      </div>

                      {/* Devoluções */}
                      {item.devolucoes && item.devolucoes.length > 0 && (
                        <div className="pt-2 border-t border-red-100 dark:border-red-800">
                          <div className="flex items-center gap-1 mb-2">
                            <RotateCcw className="h-3 w-3 text-red-600 dark:text-red-400" />
                            <span className="text-xs font-medium text-red-600 dark:text-red-400">
                              Devoluções
                            </span>
                          </div>
                          {item.devolucoes.map((devolucao, devIndex) => (
                            <div
                              key={devIndex}
                              className="bg-red-50 dark:bg-red-950/30 p-2 rounded text-xs border dark:border-red-800"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-red-700 dark:text-red-300">
                                  Qtd: {devolucao.quantidade}
                                </span>
                                <span className="text-red-600 dark:text-red-400 font-medium">
                                  -
                                  {formatCurrency(
                                    (
                                      Number(item.preco_venda) *
                                      devolucao.quantidade
                                    ).toString()
                                  )}
                                </span>
                              </div>
                              <p className="text-red-600 dark:text-red-400 text-xs">
                                {devolucao.motivo}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
