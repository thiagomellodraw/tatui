"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import {
  createAmenity,
  updateAmenity,
  deleteAmenity,
} from "@/app/actions/amenities";
import * as Icons from "lucide-react";
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";

// Lista de ícones sugeridos com seus nomes
const SUGGESTED_ICONS = [
  { name: "Wifi", label: "Wi-Fi" },
  { name: "Waves", label: "Piscina / Ondas" },
  { name: "Flame", label: "Churrasqueira / Fogo" },
  { name: "Wind", label: "Ar-condicionado / Vento" },
  { name: "Compass", label: "Vista / Bússola" },
  { name: "Car", label: "Garagem / Carro" },
  { name: "Dog", label: "Pet Friendly / Cão" },
  { name: "Utensils", label: "Cozinha / Utensílios" },
  { name: "Sun", label: "Praia / Sol" },
  { name: "Bed", label: "Cama / Quarto" },
  { name: "Tv", label: "Smart TV" },
  { name: "ChefHat", label: "Área Gourmet" },
  { name: "Coffee", label: "Cafeteira / Café" },
  { name: "Shield", label: "Segurança / Escudo" },
  { name: "TreePine", label: "Natureza / Árvore" },
];

const amenitySchema = zod.object({
  name: zod.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  icon: zod.string().min(1, "Selecione ou insira um ícone."),
  active: zod.boolean().default(true),
});

type AmenityFields = zod.infer<typeof amenitySchema>;

interface AmenitiesManagerClientProps {
  initialAmenities: any[];
}

export default function AmenitiesManagerClient({ initialAmenities }: AmenitiesManagerClientProps) {
  const router = useRouter();
  const [amenities, setAmenities] = useState(initialAmenities);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(amenitySchema),
    defaultValues: {
      name: "",
      icon: "Wifi",
      active: true,
    },
  });

  const selectedIconName = watch("icon");

  // Renderizador dinâmico de ícones Lucide
  const IconRenderer = ({ name, size = 18, className = "" }: { name: string; size?: number; className?: string }) => {
    const LucideIcon = (Icons as any)[name];
    if (!LucideIcon) return <Icons.HelpCircle size={size} className={className} />;
    return <LucideIcon size={size} className={className} />;
  };

  // Carregar dados no formulário para edição
  const handleEdit = (amenity: any) => {
    setEditingId(amenity.id);
    setError(null);
    setValue("name", amenity.name);
    setValue("icon", amenity.icon);
    setValue("active", amenity.active);
  };

  // Cancelar edição
  const handleCancelEdit = () => {
    setEditingId(null);
    reset({
      name: "",
      icon: "Wifi",
      active: true,
    });
  };

  // Excluir comodidade
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir a comodidade "${name}"? Imóveis que a utilizam não a exibirão mais.`)) {
      startTransition(async () => {
        const res = await deleteAmenity(id);
        if (res.success) {
          setAmenities((prev) => prev.filter((a) => a.id !== id));
          router.refresh();
        } else {
          alert("Erro ao excluir: " + res.error);
        }
      });
    }
  };

  // Submit
  const onSubmit = async (data: AmenityFields) => {
    setLoading(true);
    setError(null);

    try {
      if (editingId) {
        // Atualizar
        const res = await updateAmenity(editingId, data);
        if (res.success && res.amenity) {
          setAmenities((prev) =>
            prev.map((a) => (a.id === editingId ? res.amenity : a))
          );
          handleCancelEdit();
          router.refresh();
        } else {
          setError(res.error || "Erro ao atualizar.");
        }
      } else {
        // Criar
        const res = await createAmenity(data);
        if (res.success && res.amenity) {
          setAmenities((prev) => [...prev, res.amenity!].sort((a, b) => a.name.localeCompare(b.name)));
          reset({
            name: "",
            icon: "Wifi",
            active: true,
          });
          router.refresh();
        } else {
          setError(res.error || "Erro ao criar.");
        }
      }
    } catch (err) {
      setError("Erro ao se conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar comodidades
  const filteredAmenities = amenities.filter((am) =>
    am.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Form de Cadastro / Edição */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
          {editingId ? "Editar Comodidade" : "Cadastrar Nova"}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-150">
              {error}
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Nome da Comodidade
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="Ex: Wi-Fi de Alta Velocidade"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{errors.name.message}</p>
            )}
          </div>

          {/* Seleção de Ícone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Selecione o Ícone
            </label>
            <div className="grid grid-cols-5 gap-2 border border-slate-100 bg-slate-50/50 p-3 rounded-xl max-h-36 overflow-y-auto mb-3">
              {SUGGESTED_ICONS.map((ico) => (
                <button
                  key={ico.name}
                  type="button"
                  onClick={() => setValue("icon", ico.name)}
                  className={`p-2 flex flex-col items-center justify-center rounded-lg border hover:bg-white hover:shadow-sm transition-all ${
                    selectedIconName === ico.name
                      ? "bg-white border-luxury-gold text-luxury-bronze shadow-sm"
                      : "border-transparent text-slate-400"
                  }`}
                  title={ico.label}
                >
                  <IconRenderer name={ico.name} size={18} />
                </button>
              ))}
            </div>

            {/* Ou input manual */}
            <input
              type="text"
              {...register("icon")}
              placeholder="Ou digite o nome do ícone Lucide (PascalCase)"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-xs transition-all"
            />
            {errors.icon && (
              <p className="text-xs text-red-500 mt-1 font-semibold">{errors.icon.message}</p>
            )}
          </div>

          {/* Visualização do Ícone Escolhido */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-10 h-10 flex items-center justify-center bg-white text-luxury-bronze rounded-lg border border-slate-200">
              <IconRenderer name={selectedIconName} size={20} />
            </div>
            <div className="text-xs font-semibold">
              <span className="text-slate-400 block font-normal">Ícone selecionado:</span>
              <span className="text-slate-800 font-bold">{selectedIconName}</span>
            </div>
          </div>

          {/* Ativo Checkbox */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("active")}
              className="w-4 h-4 accent-luxury-gold rounded cursor-pointer"
            />
            <div>
              <span className="text-sm font-semibold text-slate-850">Comodidade Ativa</span>
              <p className="text-[10px] text-slate-400">Ativa para seleção nos imóveis.</p>
            </div>
          </label>

          {/* Ações do Form */}
          <div className="flex items-center gap-3 pt-2">
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors uppercase tracking-wider cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-luxury-charcoal hover:bg-luxury-bronze text-white font-bold text-xs rounded-xl transition-all uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  {editingId ? <Check size={14} /> : <Plus size={14} />}
                  {editingId ? "Salvar" : "Cadastrar"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Grid/Lista do Lado Direito */}
      <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        {/* Filtro por Busca */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Filtrar comodidades pelo nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-luxury-gold rounded-xl outline-none text-sm transition-colors"
          />
        </div>

        {/* Tabela de Comodidades */}
        {filteredAmenities.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Nenhuma comodidade correspondente.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">Ícone</th>
                  <th className="py-3.5 px-4">Nome</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {filteredAmenities.map((am) => (
                  <tr key={am.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Ícone */}
                    <td className="py-3 px-4 text-center">
                      <div className="w-8 h-8 rounded bg-slate-100 text-luxury-bronze flex items-center justify-center mx-auto border border-slate-200">
                        <IconRenderer name={am.icon} size={16} />
                      </div>
                    </td>

                    {/* Nome */}
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {am.name}
                      <span className="text-[10px] text-slate-400 block font-normal mt-0.5">
                        Tag: `{am.icon}`
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      {am.active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                          Ativa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-150 text-slate-500 text-[10px] font-bold">
                          Inativa
                        </span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-4 text-right space-x-2 shrink-0">
                      <button
                        onClick={() => handleEdit(am)}
                        className="inline-flex p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                        title="Editar comodidade"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(am.id, am.name)}
                        disabled={isPending}
                        className="inline-flex p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        title="Excluir comodidade"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
