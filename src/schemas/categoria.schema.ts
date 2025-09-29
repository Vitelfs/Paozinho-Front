import { z } from "zod";

// Schema para criação de categoria
export const categoriaSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
});

// Schema para atualização de categoria
export const updateCategoriaSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
});

// Tipos TypeScript derivados dos schemas
export type CategoriaFormData = z.infer<typeof categoriaSchema>;
export type UpdateCategoriaFormData = z.infer<typeof updateCategoriaSchema>;
