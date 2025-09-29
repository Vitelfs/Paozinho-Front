import type {
  ChangeStatusClienteEntity,
  ClienteEntity,
  CreateClienteEntity,
  UpdateClienteEntity,
} from "@/models/cliente.entity";
import { request } from "./request";
import type { ClientePagination } from "@/types/pagination.type";

export const clienteService = {
  createCliente: async (cliente: CreateClienteEntity) => {
    const response = await request.post("/cliente", cliente);
    return response.data;
  },
  getClientes: async (
    pagination: ClientePagination
  ): Promise<{ clientes: ClienteEntity[]; total: number }> => {
    const response = await request.get("/cliente", { params: pagination });
    return response.data;
  },
  updateCliente: async (id: string, cliente: UpdateClienteEntity) => {
    const response = await request.put(`/cliente/${id}`, cliente);
    return response.data;
  },
  deleteCliente: async (id: string) => {
    const response = await request.delete(`/cliente/${id}`);
    return response.data;
  },
  changeStatusCliente: async (cliente: ChangeStatusClienteEntity) => {
    const response = await request.put(`/cliente/${cliente.id}/status`, {
      ativo: cliente.ativo,
    });
    return response.data;
  },
};
