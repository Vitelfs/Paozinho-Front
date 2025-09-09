import { HomeIcon, ArrowLeftIcon, AlertTriangleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/dashboard");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <Card className="text-center border-2 border-dashed border-muted-foreground/20">
          <CardHeader className="pb-6">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-destructive/10 to-destructive/20 dark:from-destructive/20 dark:to-destructive/30">
              <AlertTriangleIcon className="h-12 w-12 text-destructive" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold tracking-tight">
                404
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Página não encontrada
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              A página que você está procurando não existe ou foi movida para
              outro local.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleGoHome} className="flex-1" size="lg">
                <HomeIcon className="mr-2 h-4 w-4" />
                Ir para Dashboard
              </Button>
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Se você acredita que isso é um erro, entre em contato com o
                suporte técnico.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
