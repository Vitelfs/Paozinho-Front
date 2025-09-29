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
      .optional(),
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
    validade: z.boolean(),
    validade_dias: z.number().min(0, "Validade deve ser maior que zero"),
  })
  .refine((data) => data.validade, {
    message: "Validade é obrigatória",
    path: ["validade"],
  })
  .refine((data) => data.validade_dias > 0, {
    message: "Validade deve ser maior que zero",
    path: ["validade_dias"],
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
      .optional(),
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
    validade: z.boolean(),
    validade_dias: z.number().min(0, "Validade deve ser maior que zero"),
  })
  .refine((data) => data.validade, {
    message: "Validade é obrigatória",
    path: ["validade"],
  })
  .refine((data) => data.validade_dias > 0, {
    message: "Validade deve ser maior que zero",
    path: ["validade_dias"],
  })
  .refine((data) => data.preco_minimo_venda >= data.preco_custo, {
    message: "Preço mínimo de venda deve ser maior ou igual ao preço de custo",
    path: ["preco_minimo_venda"],
  });

// Schema para envio ao backend (sem campos de margem de lucro)
export const produtoBackendSchema = produtoSchema.transform((data) => {
  const { margem_lucro, margem_lucro_cliente, ...backendData } = data;
  return backendData;
});

export const updateProdutoBackendSchema = updateProdutoSchema.transform(
  (data) => {
    const { margem_lucro, margem_lucro_cliente, ...backendData } = data;
    return backendData;
  }
);

// Exemplo: Schema que calcula preço final baseado na margem
export const produtoComPrecoFinalSchema = produtoSchema.transform((data) => {
  const preco_final =
    data.preco_custo + (data.preco_custo * data.margem_lucro) / 100;
  return {
    ...data,
    preco_final: Math.round(preco_final * 100) / 100, // Arredonda para 2 casas decimais
  };
});

// Exemplo: Schema que formata dados para exibição
export const produtoDisplaySchema = produtoSchema.transform((data) => {
  return {
    ...data,
    nome_formatado: data.nome.toUpperCase(),
    preco_custo_formatado: `R$ ${data.preco_custo.toFixed(2)}`,
    preco_minimo_venda_formatado: `R$ ${data.preco_minimo_venda.toFixed(2)}`,
    preco_revenda_formatado: `R$ ${data.preco_revenda.toFixed(2)}`,
  };
});

export type ProdutoFormData = z.infer<typeof produtoSchema>;
export type UpdateProdutoFormData = z.infer<typeof updateProdutoSchema>;
export type ProdutoBackendData = z.infer<typeof produtoBackendSchema>;
export type UpdateProdutoBackendData = z.infer<
  typeof updateProdutoBackendSchema
>;
export type ProdutoComPrecoFinalData = z.infer<
  typeof produtoComPrecoFinalSchema
>;
export type ProdutoDisplayData = z.infer<typeof produtoDisplaySchema>;
