import type {
  CreateCategoriaEntity,
  UpdateCategoriaEntity,
} from "@/models/categoria.entity";
import { request } from "./request";
import type { CategoriaPagination } from "@/types/pagination.type";

export const categoriaService = {
  createCategoria: async (categoria: CreateCategoriaEntity) => {
    const response = await request.post("/categoria", categoria);
    return response.data;
  },
  getCategoriasWithPagination: async (pagination: CategoriaPagination) => {
    const response = await request.get("/categoria", { params: pagination });
    return response.data;
  },
  getCategorias: async () => {
    const response = await request.get("/categoria/all");
    return response.data;
  },
  getCategoriaById: async (id: string) => {
    const response = await request.get(`/categoria/${id}`);
    return response.data;
  },
  updateCategoria: async (id: string, categoria: UpdateCategoriaEntity) => {
    const response = await request.put(`/categoria/${id}`, categoria);
    return response.data;
  },
  deleteCategoria: async (id: string) => {
    const response = await request.delete(`/categoria/${id}`);
    return response.data;
  },
};
