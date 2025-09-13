import { z } from "zod";

export const createVendasSchema = z.object({
  cliente_id: z.string().min(1, "Cliente é obrigatório"),
  observacoes: z.string().optional(),
  data_venda: z.date(),
  item_venda: z.array(
    z.object({
      produto_id: z.string().min(1, "Produto é obrigatório"),
      quantidade: z.number().min(1, "Quantidade é obrigatória"),
    })
  ),
});

export const updateVendasSchema = z.object({
  cliente_id: z.string().min(1, "Cliente é obrigatório"),
  observacoes: z.string().optional(),
  data_venda: z.date(),
  item_venda: z.array(
    z.object({
      produto_id: z.string().min(1, "Produto é obrigatório"),
      quantidade: z.number().min(1, "Quantidade é obrigatória"),
    })
  ),
});

export type CreateVendasSchema = z.infer<typeof createVendasSchema>;
export type UpdateVendasSchema = z.infer<typeof updateVendasSchema>;
