import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, DollarSign, Package } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { Button } from "@/components/ui/button";
import { Heading1, Paragraph } from "@/components/ui/typography";
import { DragDropProdutos } from "@/components/precos-personalizados/drag-drop-produtos";
import type { clientesPrecosPersonalizados } from "@/models/precos_personalizados.entity";
import { toast } from "react-toastify";
import { precosPersonalizadosService } from "@/services/precos-personalizados.service";

export function ClientePrecosPersonalizadosPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const cliente = state?.cliente as clientesPrecosPersonalizados;
  const [clienteData, setClienteData] =
    useState<clientesPrecosPersonalizados | null>(null);
  const [loading, setLoading] = useState(true);

  const loadClienteData = useCallback(async () => {
    if (!cliente?.id) {
      toast.error("Cliente não encontrado");
      navigate("/precos-personalizados");
      return;
    }

    try {
      setLoading(true);
      const data =
        await precosPersonalizadosService.getPrecosPersonalizadosPorCliente(
          cliente.id
        );
      console.log(data);
      setClienteData(data);
    } catch (error) {
      console.error("Erro ao carregar dados do cliente:", error);
      toast.error("Erro ao carregar dados do cliente");
      navigate("/precos-personalizados");
    } finally {
      setLoading(false);
    }
  }, [cliente?.id, navigate]);

  useEffect(() => {
    loadClienteData();
  }, [loadClienteData]);

  const handleUpdate = useCallback(() => {
    loadClienteData();
  }, [loadClienteData]);

  const handleBack = () => {
    navigate("/precos-personalizados");
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="w-full">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground">
                Carregando dados do cliente...
              </p>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!clienteData) {
    return (
      <DefaultLayout>
        <div className="w-full">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Cliente não encontrado</p>
              <Button onClick={handleBack} className="mt-4">
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="w-full">
        {/* Cabeçalho da página */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <Heading1 className="flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              Preços Personalizados - {clienteData.nome}
            </Heading1>
            <Paragraph className="text-muted-foreground mt-2">
              Gerencie os preços personalizados para este cliente
            </Paragraph>
          </div>
        </div>

        {/* Componente de drag & drop */}
        <DragDropProdutos cliente={clienteData} onUpdate={handleUpdate} />
      </div>
    </DefaultLayout>
  );
}
