import { z } from "zod";

export const pagamentoSchema = z.object({
  forma: z.enum(["PIX", "DINHEIRO", "CREDITO", "DEBITO"], {
    message: "Forma de pagamento é obrigatória",
  }),
  valor: z.number().min(0, "Valor deve ser maior ou igual a zero"),
});

export const devolucaoSchema = z.object({
  item_venda_id: z.string().min(1, "Item da venda é obrigatório"),
  quantidade: z.number().min(1, "Quantidade deve ser maior que zero"),
  motivo: z.string().optional(),
});

export const processarVendaSchema = z.object({
  data_pagamento: z.date({
    message: "Data de pagamento é obrigatória",
  }),
  pagamentos: z
    .array(pagamentoSchema)
    .min(1, "Pelo menos uma forma de pagamento é obrigatória")
    .refine(
      (pagamentos) => pagamentos.some((p) => p.valor >= 0),
      "Deve haver pelo menos um pagamento com valor válido"
    ),
  devolucoes: z.array(devolucaoSchema),
});

export type ProcessarVendaForm = z.infer<typeof processarVendaSchema>;
export type PagamentoForm = z.infer<typeof pagamentoSchema>;
export type DevolucaoForm = z.infer<typeof devolucaoSchema>;
