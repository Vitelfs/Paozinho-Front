import { CakeIcon } from "lucide-react";
import logo from "@/assets/Chef e Delícias da Padaria.png";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/login-form";
import type { LoginType } from "@/types/login.type";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (data: LoginType) => {
    try {
      setIsLoading(true);
      await login(data);
      toast.success("Login realizado com sucesso");
      navigate("/dashboard");
    } catch (error: any) {
      if (error.message === "Firebase: Error (auth/invalid-credential).") {
        toast.error("Email ou senha inválidos");
        return;
      }
      toast.error("Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <CakeIcon className="size-4" />
            </div>
            Pãozinho Delícia Gourmet.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src={logo}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          style={{ objectFit: "contain" }}
        />
      </div>
    </div>
  );
}
