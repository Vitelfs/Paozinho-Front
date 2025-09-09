import { z } from "zod";

export const clienteSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),

  contato: z
    .string()
    .min(10, "Contato deve ter pelo menos 10 caracteres")
    .max(20, "Contato deve ter no máximo 20 caracteres")
    .regex(
      /^[\d\s\(\)\-\+]+$/,
      "Contato deve conter apenas números, espaços, parênteses, hífens e +"
    ),

  endereco: z
    .string()
    .min(10, "Endereço deve ter pelo menos 10 caracteres")
    .max(200, "Endereço deve ter no máximo 200 caracteres"),

  ativo: z.boolean(),
});

export const updateClienteSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),

  contato: z
    .string()
    .min(10, "Contato deve ter pelo menos 10 caracteres")
    .max(20, "Contato deve ter no máximo 20 caracteres")
    .regex(
      /^[\d\s\(\)\-\+]+$/,
      "Contato deve conter apenas números, espaços, parênteses, hífens e +"
    ),

  endereco: z
    .string()
    .min(10, "Endereço deve ter pelo menos 10 caracteres")
    .max(200, "Endereço deve ter no máximo 200 caracteres"),

  ativo: z.boolean(),
});

export type ClienteFormData = z.infer<typeof clienteSchema>;
export type UpdateClienteFormData = z.infer<typeof updateClienteSchema>;
