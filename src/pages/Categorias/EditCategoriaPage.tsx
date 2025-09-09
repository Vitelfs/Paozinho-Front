import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Tag } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Heading1, Paragraph } from "@/components/ui/typography";
import {
  updateCategoriaSchema,
  type UpdateCategoriaFormData,
} from "../../schemas/categoria.schema";
import { toast } from "react-toastify";
import { categoriaService } from "@/services/categoria.service";

export function EditCategoriaPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { state } = useLocation();
  const categoria = state?.categoria;

  const form = useForm<UpdateCategoriaFormData>({
    resolver: zodResolver(updateCategoriaSchema),
    defaultValues: {
      nome: categoria?.nome || "",
    },
  });

  // Verificar se a categoria foi passada via state
  useEffect(() => {
    if (!categoria) {
      toast.error("Categoria não encontrada");
      navigate("/categorias");
    }
  }, [categoria, navigate]);

  const onSubmit = async (data: UpdateCategoriaFormData) => {
    setIsSubmitting(true);
    try {
      await categoriaService.updateCategoria(categoria.id, data);

      navigate("/categorias?edited=true");
    } catch (error) {
      console.error("Erro ao editar categoria:", error);
      toast.error("Erro ao editar categoria. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/categorias");
  };

  return (
    <DefaultLayout>
      <div className="w-full">
        {/* Cabeçalho da página */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <Heading1>Editar Categoria</Heading1>
            <Paragraph className="text-muted-foreground mt-2">
              Preencha os dados para editar a categoria
            </Paragraph>
          </div>
        </div>

        {/* Formulário */}
        <Card className="mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Informações da Categoria para edição
            </CardTitle>
            <CardDescription>
              Todos os campos são obrigatórios para a edição
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Nome */}
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Nome da Categoria
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome da categoria"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Botões de ação */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? "Salvando..." : "Salvar Categoria"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DefaultLayout>
  );
}
