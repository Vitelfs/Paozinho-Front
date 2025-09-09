import { z } from "zod";

export const produtoSchema = z
  .object({
    nome: z
      .string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(100, "Nome deve ter no máximo 100 caracteres")
      .regex(
        /^[a-zA-ZÀ-ÿ0-9\s\-\.]+$/,
        "Nome deve conter apenas letras, números, espaços, hífens e pontos"
      ),
    categoria_id: z.string().min(1, "Categoria é obrigatória"),
    descricao: z
      .string()
      .min(10, "Descrição deve ter pelo menos 10 caracteres")
      .max(500, "Descrição deve ter no máximo 500 caracteres"),
    preco_custo: z
      .number()
      .min(0.01, "Preço de custo deve ser maior que zero")
      .max(999999.99, "Preço de custo muito alto"),
    preco_minimo_venda: z
      .number()
      .min(0.01, "Preço mínimo de venda deve ser maior que zero")
      .max(999999.99, "Preço mínimo de venda muito alto"),
    margem_lucro: z
      .number()
      .min(0, "Margem de lucro deve ser maior que zero")
      .max(10000, "Margem de lucro muito alta"),
    preco_revenda: z
      .number()
      .min(0.01, "Preço de revenda deve ser maior que zero")
      .max(999999.99, "Preço de revenda muito alto"),
    margem_lucro_cliente: z
      .number()
      .min(0, "Margem de lucro cliente deve ser maior que zero")
      .max(10000, "Margem de lucro cliente muito alta"),
  })
  .refine((data) => data.preco_minimo_venda >= data.preco_custo, {
    message: "Preço mínimo de venda deve ser maior ou igual ao preço de custo",
    path: ["preco_minimo_venda"],
  });

export const updateProdutoSchema = z
  .object({
    nome: z
      .string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(100, "Nome deve ter no máximo 100 caracteres")
      .regex(
        /^[a-zA-ZÀ-ÿ0-9\s\-\.]+$/,
        "Nome deve conter apenas letras, números, espaços, hífens e pontos"
      ),
    categoria_id: z.string().min(1, "Categoria é obrigatória"),
    descricao: z
      .string()
      .min(10, "Descrição deve ter pelo menos 10 caracteres")
      .max(500, "Descrição deve ter no máximo 500 caracteres"),
    preco_custo: z
      .number()
      .min(0.01, "Preço de custo deve ser maior que zero")
      .max(999999.99, "Preço de custo muito alto"),
    preco_minimo_venda: z
      .number()
      .min(0.01, "Preço mínimo de venda deve ser maior que zero")
      .max(999999.99, "Preço mínimo de venda muito alto"),
    margem_lucro: z
      .number()
      .min(0, "Margem de lucro deve ser maior que zero")
      .max(10000, "Margem de lucro muito alta"),
    preco_revenda: z
      .number()
      .min(0.01, "Preço de revenda deve ser maior que zero")
      .max(999999.99, "Preço de revenda muito alto"),
    margem_lucro_cliente: z
      .number()
      .min(0, "Margem de lucro cliente deve ser maior que zero")
      .max(10000, "Margem de lucro cliente muito alta"),
  })
  .refine((data) => data.preco_minimo_venda >= data.preco_custo, {
    message: "Preço mínimo de venda deve ser maior ou igual ao preço de custo",
    path: ["preco_minimo_venda"],
  });

export type ProdutoFormData = z.infer<typeof produtoSchema>;
export type UpdateProdutoFormData = z.infer<typeof updateProdutoSchema>;
