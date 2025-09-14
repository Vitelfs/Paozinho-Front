export interface Pagination {
  limit?: number;
  offset?: number;
}

export interface ClientePagination extends Pagination {
  nome?: string;
}

export interface CategoriaPagination extends Pagination {
  nome?: string;
}

export interface ProdutoPagination extends Pagination {
  nome?: string;
  categoria_id?: string;
}

export interface VendasPagination extends Pagination {
  cliente_nome?: string;
  status?: string;
  data_inicio?: Date;
  data_fim?: Date;
}

export interface RelatorioVendasPagination extends Pagination {
  data_venda: Date;
}
