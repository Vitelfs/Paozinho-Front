import { useState } from "react";
import { Edit, Trash2, DollarSign, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { precosPersonalizadosService } from "@/services/precos-personalizados.service";
import type { clientesPrecosPersonalizados } from "@/models/precos_personalizados.entity";

interface ProdutosPrecosPersonalizadosProps {
  cliente: clientesPrecosPersonalizados;
  onUpdate: () => void;
}

export function ProdutosPrecosPersonalizados({
  cliente,
  onUpdate,
}: ProdutosPrecosPersonalizadosProps) {
  const [editingPreco, setEditingPreco] = useState<string | null>(null);
  const [novoPreco, setNovoPreco] = useState<string>("");
  const [novoPrecoRevenda, setNovoPrecoRevenda] = useState<string>("");

  const handleEditPreco = (
    produtoId: string,
    precoVenda: number,
    precoRevenda: number
  ) => {
    setEditingPreco(produtoId);
    setNovoPreco(precoVenda.toFixed(2).replace(".", ","));
    setNovoPrecoRevenda(precoRevenda.toFixed(2).replace(".", ","));
  };

  console.log("Cliente", cliente);
  const handleSavePreco = async (precoPersonalizadoId: string) => {
    try {
      const precoVendaNumerico = parseFloat(novoPreco.replace(",", "."));
      const precoRevendaNumerico = parseFloat(
        novoPrecoRevenda.replace(",", ".")
      );

      if (isNaN(precoVendaNumerico) || precoVendaNumerico < 0) {
        toast.error("Preço de venda inválido");
        return;
      }

      if (isNaN(precoRevendaNumerico) || precoRevendaNumerico < 0) {
        toast.error("Preço de revenda inválido");
        return;
      }

      await precosPersonalizadosService.updatePrecoPersonalizado(
        precoPersonalizadoId,
        precoVendaNumerico,
        precoRevendaNumerico  
      );

      setEditingPreco(null);
      setNovoPreco("");
      setNovoPrecoRevenda("");
      onUpdate();
      toast.success("Preços atualizados com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar preços:", error);
      toast.error("Erro ao atualizar preços");
    }
  };

  const handleDeletePreco = async (precoPersonalizadoId: string) => {
    try {
      await precosPersonalizadosService.deletePrecoPersonalizado(
        precoPersonalizadoId
      );
      onUpdate();
      toast.success("Preço personalizado removido com sucesso");
    } catch (error) {
      console.error("Erro ao remover preço:", error);
      toast.error("Erro ao remover preço personalizado");
    }
  };

  const handleCancelEdit = () => {
    setEditingPreco(null);
    setNovoPreco("");
    setNovoPrecoRevenda("");
  };

  if (!cliente.precoPersonalizado || cliente.precoPersonalizado.length === 0) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Este cliente não possui preços personalizados configurados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Preços Personalizados - {cliente.nome}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cliente.precoPersonalizado.map((precoPersonalizado) => {
              const produto = precoPersonalizado.produto;

              return (
                <div
                  key={precoPersonalizado.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">{produto.nome}</h4>
                      <Badge variant="outline">{produto.categoria.nome}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {editingPreco === precoPersonalizado.id ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="preco-venda" className="text-sm">
                            Venda R$
                          </Label>
                          <Input
                            id="preco-venda"
                            type="text"
                            value={novoPreco}
                            onChange={(e) => setNovoPreco(e.target.value)}
                            className="w-24 h-8"
                            placeholder="0,00"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="preco-revenda" className="text-sm">
                            Revenda R$
                          </Label>
                          <Input
                            id="preco-revenda"
                            type="text"
                            value={novoPrecoRevenda}
                            onChange={(e) =>
                              setNovoPrecoRevenda(e.target.value)
                            }
                            className="w-24 h-8"
                            placeholder="0,00"
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSavePreco(precoPersonalizado.id)}
                          className="h-8"
                        >
                          Salvar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="h-8"
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="font-medium">
                            Venda: R${" "}
                            {precoPersonalizado.preco_venda
                              .toFixed(2)
                              .replace(".", ",")}
                          </div>
                          <div className="font-medium">
                            Revenda: R${" "}
                            {precoPersonalizado.preco_revenda
                              .toFixed(2)
                              .replace(".", ",")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Preços personalizados
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleEditPreco(
                              precoPersonalizado.id,
                              precoPersonalizado.preco_venda,
                              precoPersonalizado.preco_revenda
                            )
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDeletePreco(precoPersonalizado.id)
                          }
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
