export const StatusVenda = {
  PENDENTE: "PENDENTE",
  PAGO: "PAGO",
  CANCELADO: "CANCELADO",
  ENTREGUE: "ENTREGUE",
  PRODUZIDO: "PRODUZIDO",
} as const;

export type StatusVenda = (typeof StatusVenda)[keyof typeof StatusVenda];

export interface VendasEntity {
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
  item_venda: ItemVendasEntity[];
  pagamentos?: PagamentoEntityResponse[];
}

export interface CreateVendasEntity {
  cliente_id: string;
  observacoes?: string;
  data_venda: Date;
  item_venda: CreateItemVendasEntity[];
}

export interface CreateItemVendasEntity {
  produto_id: string;
  quantidade: number;
}

export interface VendasResponse {
  vendas: VendasEntity[];
  total: number;
  totalPagas: number;
  totalPendentes: number;
  totalCanceladas: number;
  totalEntregues: number;
  totalProduzidas: number;
  totalFaturamento: number;
}

export interface ItemVendasEntity {
  id: string;
  venda_id: string;
  produto_id: string;
  quantidade: number;
  preco_venda: string;
  createdAt: string;
  updatedAt: string;
  produto: {
    id: string;
    nome: string;
    preco_minimo_venda: string;
  };
  devolucoes?: DevolucaoEntityResponse[];
}

export interface UpdateVendasEntity extends Partial<CreateVendasEntity> {}

export interface ProcessarVendaEntity {
  pagamentos: PagamentoEntity[];
  devolucoes: DevolucaoEntity[];
  data_pagamento: Date;
}

export interface PagamentoEntity {
  forma: "PIX" | "DINHEIRO" | "CREDITO" | "DEBITO";
  valor: number;
}

export interface DevolucaoEntity {
  item_venda_id: string;
  quantidade: number;
  motivo: string;
}

export interface DevolucaoEntityResponse {
  quantidade: number;
  motivo: string;
}

export interface PagamentoEntityResponse {
  forma: "PIX" | "DINHEIRO" | "CREDITO" | "DEBITO";
  valor: string;
  data_pagamento: string;
}

export interface RelatorioVendasEntity {
  vendas: [
    {
      id: string;
      cliente_id: string;
      total: string;
      status: "PENDENTE";
      observacoes: string | null;
      data_venda: string;
      createdAt: string;
      updatedAt: string;
      cliente: {
        id: string;
        nome: string;
        contato: string;
      };
      item_venda: [
        {
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
        }
      ];
    }
  ];
  total: number;
}
