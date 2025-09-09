import type { CategoriaEntity } from "./categoria.entity";

export interface ProdutoEntity {
  id: string;
  nome: string;
  categoria: CategoriaEntity;
  descricao: string;
  preco_custo: number;
  preco_minimo_venda: number;
  margem_lucro: number;
  preco_revenda: number;
  margem_lucro_cliente: number;
}

export interface CreateProdutoEntity {
  nome: string;
  categoria_id: string;
  descricao: string;
  preco_custo: number;
  preco_minimo_venda: number;
  margem_lucro: number;
  preco_revenda: number;
  margem_lucro_cliente: number;
}

export interface UpdateProdutoEntity {
  nome?: string;
  categoria_id?: string;
  descricao?: string;
  preco_custo?: number;
  preco_minimo_venda?: number;
  margem_lucro?: number;
  preco_revenda?: number;
  margem_lucro_cliente?: number;
}

export interface DeleteProdutoEntity {
  id: string;
}
