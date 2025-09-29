import { z } from "zod";

export const precoPersonalizadoSchema = z
  .object({
    preco_venda: z
      .number()
      .min(0.01, "Preço de venda deve ser maior que zero")
      .max(999999.99, "Preço de venda muito alto"),
    preco_revenda: z
      .number()
      .min(0.01, "Preço de revenda deve ser maior que zero")
      .max(999999.99, "Preço de revenda muito alto"),
  })
  .refine((data) => data.preco_revenda >= data.preco_venda, {
    message: "Preço de revenda deve ser maior ou igual ao preço de venda",
    path: ["preco_revenda"],
  });

export const updatePrecoPersonalizadoSchema = z
  .object({
    preco_venda: z
      .number()
      .min(0.01, "Preço de venda deve ser maior que zero")
      .max(999999.99, "Preço de venda muito alto"),
    preco_revenda: z
      .number()
      .min(0.01, "Preço de revenda deve ser maior que zero")
      .max(999999.99, "Preço de revenda muito alto"),
  })
  .refine((data) => data.preco_revenda >= data.preco_venda, {
    message: "Preço de revenda deve ser maior ou igual ao preço de venda",
    path: ["preco_revenda"],
  });

export const createPrecoPersonalizadoSchema = z.object({
  cliente_id: z.string().min(1, "ID do cliente é obrigatório"),
  precoPersonalizado: z
    .array(
      z.object({
        produto_id: z.string().min(1, "ID do produto é obrigatório"),
        preco_revenda: z
          .number()
          .min(0.01, "Preço de revenda deve ser maior que zero")
          .max(999999.99, "Preço de revenda muito alto"),
        preco_venda: z
          .number()
          .min(0.01, "Preço de venda deve ser maior que zero")
          .max(999999.99, "Preço de venda muito alto"),
      })
    )
    .min(1, "Pelo menos um preço personalizado deve ser fornecido"),
});

export type PrecoPersonalizadoFormData = z.infer<
  typeof precoPersonalizadoSchema
>;
export type UpdatePrecoPersonalizadoFormData = z.infer<
  typeof updatePrecoPersonalizadoSchema
>;
export type CreatePrecoPersonalizadoFormData = z.infer<
  typeof createPrecoPersonalizadoSchema
>;
