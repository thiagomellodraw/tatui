"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { loginAdmin } from "@/app/actions/auth";
import { Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";

const loginSchema = zod.object({
  username: zod.string().min(1, "O usuário é obrigatório."),
  password: zod.string().min(1, "A senha é obrigatória."),
});

type LoginFields = zod.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFields) => {
    setError(null);
    setLoading(true);
    
    try {
      const result = await loginAdmin(data.username, data.password);
      if (result.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(result.error || "Ocorreu um erro ao fazer login.");
      }
    } catch (err) {
      setError("Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12 relative overflow-hidden">
      {/* Decorações de fundo */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] aspect-square rounded-full bg-luxury-gold/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] aspect-square rounded-full bg-luxury-bronze/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md glass-card p-10 rounded-3xl shadow-xl border border-white bg-white/70 relative z-10 animate-fade-up">
        {/* Cabeçalho */}
        <div className="flex flex-col items-center text-center mb-8">
          <span className="font-display font-extrabold text-3xl tracking-wide text-gray-900 mb-2">
            Tatuí
          </span>
          <p className="text-xs font-semibold tracking-widest text-luxury-bronze uppercase">
            Painel Administrativo
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* Campo Usuário */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Usuário
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 pointer-events-none">
                <User size={18} />
              </span>
              <input
                type="text"
                {...register("username")}
                placeholder="Digite seu usuário"
                className="w-full pl-11 pr-4 py-3 bg-gray-50/50 focus:bg-white border border-gray-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all duration-300 placeholder:text-gray-400"
              />
            </div>
            {errors.username && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.username.message}</p>
            )}
          </div>

          {/* Campo Senha */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Senha
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 pointer-events-none">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Digite sua senha"
                className="w-full pl-11 pr-12 py-3 bg-gray-50/50 focus:bg-white border border-gray-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all duration-300 placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-luxury-bronze transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-luxury-charcoal text-white rounded-xl text-sm font-bold tracking-wider uppercase hover:bg-luxury-bronze transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Entrando...
              </>
            ) : (
              "Acessar Painel"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
