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
