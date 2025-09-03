// Tabela de relacao para relacionar o valor de X produto para X cliente
export interface RelProdClienteEntity {
    id: string;
    produto_id: string;
    cliente_id: string;
    valor_final: number;
}

export interface CreateRelProdClienteEntity {
    produto_id: string;
    cliente_id: string; 
    valor: number;
}

export interface UpdateRelProdClienteEntity {
    id: string;
    produto_id?: string;
    cliente_id?: string;
    valor_final?: number;
}

export interface DeleteRelProdClienteEntity {
    id: string;
}