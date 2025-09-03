import type { CategoriaEntity } from "./categoria.entity";


export interface ProdutoEntity {
    id: string;
    nome: string;
    categoria: CategoriaEntity;
    descricao: string;
    preco_custo: number;
    preco_minimo_venda: number;
}

export interface CreateProdutoEntity {
    nome: string;
    categoria: CategoriaEntity;
    descricao: string;
    preco_custo: number;
    preco_minimo_venda: number;
}

export interface UpdateProdutoEntity {
    id: string;
    nome?: string;
    categoria?: CategoriaEntity;
    descricao?: string;
    preco_custo?: number;
    preco_minimo_venda?: number;
}

export interface DeleteProdutoEntity {
    id: string;
}