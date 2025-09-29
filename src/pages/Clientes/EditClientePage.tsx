import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, User, Phone, MapPin } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  updateClienteSchema,
  type UpdateClienteFormData,
} from "@/schemas/cliente.schema";
import { clienteService } from "@/services/cliente.service";
import { toast } from "react-toastify";

export function EditClientePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { state } = useLocation();
  const cliente = state?.cliente;

  const form = useForm<UpdateClienteFormData>({
    resolver: zodResolver(updateClienteSchema),
    defaultValues: {
      nome: cliente?.nome || "",
      contato: cliente?.contato || "",
      endereco: cliente?.endereco || "",
      ativo: cliente?.ativo ?? true,
    },
  });

  // Verificar se o cliente foi passado via state
  useEffect(() => {
    if (!cliente) {
      toast.error("Cliente não encontrado");
      navigate("/clientes");
    }
  }, [cliente, navigate]);

  const onSubmit = async (data: UpdateClienteFormData) => {
    setIsSubmitting(true);
    try {
      await clienteService.updateCliente(cliente.id, data);
      navigate("/clientes?edited=true");
    } catch (error) {
      console.error("Erro ao editar cliente:", error);
      toast.error("Erro ao editar cliente. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/clientes");
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
            <Heading1>Editar Cliente</Heading1>
            <Paragraph className="text-muted-foreground mt-2">
              Preencha os dados para editar um cliente
            </Paragraph>
          </div>
        </div>

        {/* Formulário */}
        <Card className="mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Cliente para edição
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
                        <User className="h-4 w-4" />
                        Nome Completo
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome completo do cliente para edição"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contato */}
                <FormField
                  control={form.control}
                  name="contato"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Contato
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Endereço */}
                <FormField
                  control={form.control}
                  name="endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Endereço
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Digite o endereço completo do cliente"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="ativo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Status do Cliente
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {field.value ? "Cliente ativo" : "Cliente inativo"}
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
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
                    {isSubmitting ? "Salvando..." : "Salvar Cliente"}
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
