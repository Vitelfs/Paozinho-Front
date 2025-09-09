import type {
  CreateProdutoEntity,
  UpdateProdutoEntity,
} from "@/models/produto.entity";
import { request } from "./request";
import type { ProdutoPagination } from "@/types/pagination.type";

export const produtoService = {
  createProduto: async (produto: CreateProdutoEntity) => {
    const response = await request.post("/produto", produto);
    return response.data;
  },
  getProdutos: async (pagination: ProdutoPagination) => {
    const response = await request.get("/produto", { params: pagination });
    return response.data;
  },
  getProdutoById: async (id: string) => {
    const response = await request.get(`/produto/${id}`);
    return response.data;
  },
  getProdutosWithCategorias: async (pagination: ProdutoPagination) => {
    const response = await request.get("/produto/with-categoria", {
      params: pagination,
    });
    return response.data;
  },
  getProdutoWithCategoriaById: async (id: string) => {
    const response = await request.get(`/produto/${id}/with-categoria`);
    return response.data;
  },
  getProdutosWithoutPrecosPersonalizados: async (
    ids: string[],
    pagination: ProdutoPagination
  ) => {
    const response = await request.post(
      "/produto/that-does-not-have-preco-personalizado",
      {
        ids,
      },
      {
        params: pagination,
      }
    );
    return response.data;
  },
  updateProduto: async (id: string, produto: UpdateProdutoEntity) => {
    const response = await request.put(`/produto/${id}`, produto);
    return response.data;
  },
  deleteProduto: async (id: string) => {
    const response = await request.delete(`/produto/${id}`);
    return response.data;
  },
};
