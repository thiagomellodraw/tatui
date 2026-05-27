"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { createProperty, updateProperty, uploadPropertyImagesAction } from "@/app/actions/properties";
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Loader2,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Zod Schema
const propertySchema = zod.object({
  title: zod.string().min(3, "O título deve ter pelo menos 3 caracteres."),
  titleEn: zod.string().optional(),
  titleEs: zod.string().optional(),
  slug: zod.string().optional(),
  propertyType: zod.string().min(1, "Selecione o tipo de imóvel."),
  shortDescription: zod.string().min(10, "A descrição curta deve ter pelo menos 10 caracteres.").max(180, "No máximo 180 caracteres."),
  shortDescriptionEn: zod.string().optional(),
  shortDescriptionEs: zod.string().optional(),
  fullDescription: zod.string().min(20, "A descrição completa deve ter pelo menos 20 caracteres."),
  fullDescriptionEn: zod.string().optional(),
  fullDescriptionEs: zod.string().optional(),
  location: zod.string().min(3, "A localização descritiva é obrigatória (ex: Trancoso, Porto Seguro)."),
  locationEn: zod.string().optional(),
  locationEs: zod.string().optional(),
  city: zod.string().min(1, "A cidade é obrigatória."),
  neighborhood: zod.string().min(1, "O bairro é obrigatório."),
  state: zod.string().min(2, "Estado obrigatório (ex: BA).").max(2),
  addressOptional: zod.string().optional(),
  guests: zod.number().min(1, "Capacidade mínima de 1 hóspede."),
  bedrooms: zod.number().min(0, "Mínimo de 0 quartos."),
  beds: zod.number().min(0, "Mínimo de 0 camas."),
  bathrooms: zod.number().min(0, "Mínimo de 0 banheiros."),
  area: zod.number().nullable().optional(),
  priceFrom: zod.number().nullable().optional(),
  externalBookingUrl: zod.string().url("Insira uma URL válida para a reserva externa."),
  whatsappUrl: zod.string().optional(),
  featured: zod.boolean().default(false),
  active: zod.boolean().default(true),
  coverImage: zod.string().min(1, "A foto de capa é obrigatória."),
});

type PropertyFormFields = zod.infer<typeof propertySchema>;

interface PropertyFormProps {
  initialData?: any;
  availableAmenities: any[];
}

export default function PropertyForm({ initialData, availableAmenities }: PropertyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pt' | 'en' | 'es'>('pt');
  
  // Imagens da galeria (estado local)
  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialData?.images?.map((img: any) => img.url) || []
  );
  
  // IDs de comodidades selecionadas (estado local)
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>(
    initialData?.amenities?.map((am: any) => am.id) || []
  );

  // Uploading states
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          titleEn: initialData.titleEn || "",
          titleEs: initialData.titleEs || "",
          slug: initialData.slug,
          propertyType: initialData.propertyType,
          shortDescription: initialData.shortDescription,
          shortDescriptionEn: initialData.shortDescriptionEn || "",
          shortDescriptionEs: initialData.shortDescriptionEs || "",
          fullDescription: initialData.fullDescription,
          fullDescriptionEn: initialData.fullDescriptionEn || "",
          fullDescriptionEs: initialData.fullDescriptionEs || "",
          location: initialData.location,
          locationEn: initialData.locationEn || "",
          locationEs: initialData.locationEs || "",
          city: initialData.city,
          neighborhood: initialData.neighborhood,
          state: initialData.state,
          addressOptional: initialData.addressOptional || "",
          guests: initialData.guests,
          bedrooms: initialData.bedrooms,
          beds: initialData.beds,
          bathrooms: initialData.bathrooms,
          area: initialData.area || null,
          priceFrom: initialData.priceFrom || null,
          externalBookingUrl: initialData.externalBookingUrl,
          whatsappUrl: initialData.whatsappUrl || "",
          featured: initialData.featured,
          active: initialData.active,
          coverImage: initialData.coverImage,
        }
      : {
          title: "",
          titleEn: "",
          titleEs: "",
          slug: "",
          propertyType: "",
          shortDescription: "",
          shortDescriptionEn: "",
          shortDescriptionEs: "",
          fullDescription: "",
          fullDescriptionEn: "",
          fullDescriptionEs: "",
          location: "",
          locationEn: "",
          locationEs: "",
          city: "",
          neighborhood: "",
          state: "",
          addressOptional: "",
          featured: false,
          active: true,
          guests: 2,
          bedrooms: 1,
          beds: 2,
          bathrooms: 1,
          coverImage: "",
        },
  });

  const coverImageValue = watch("coverImage");

  // Handler Upload Capa
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    const formData = new FormData();
    formData.append("images", file);

    try {
      const res = await uploadPropertyImagesAction(formData);
      if (res.success && res.urls && res.urls.length > 0) {
        setValue("coverImage", res.urls[0]);
      } else {
        alert("Erro no upload da capa: " + res.error);
      }
    } catch (err) {
      alert("Erro de conexão no upload.");
    } finally {
      setUploadingCover(false);
    }
  };

  // Handler Upload Galeria
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    try {
      const res = await uploadPropertyImagesAction(formData);
      if (res.success && res.urls) {
        setGalleryImages((prev) => [...prev, ...res.urls!]);
      } else {
        alert("Erro no upload da galeria: " + res.error);
      }
    } catch (err) {
      alert("Erro de conexão no upload.");
    } finally {
      setUploadingGallery(false);
    }
  };

  // Adicionar URL de imagem manual na galeria
  const addManualGalleryUrl = () => {
    const url = prompt("Cole a URL direta da imagem:");
    if (url) {
      if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
        setGalleryImages((prev) => [...prev, url]);
      } else {
        alert("URL inválida.");
      }
    }
  };

  // Remover imagem da galeria
  const removeGalleryImage = (indexToRemove: number) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Alternar seleção de comodidade
  const toggleAmenity = (id: string) => {
    setSelectedAmenityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Submit do formulário
  const onSubmit = async (data: PropertyFormFields) => {
    setLoading(true);
    setError(null);

    const payload = {
      ...data,
      amenityIds: selectedAmenityIds,
      images: galleryImages,
    };

    try {
      let result;
      if (initialData) {
        result = await updateProperty(initialData.id, payload);
      } else {
        result = await createProperty(payload);
      }

      if (result.success) {
        router.push("/admin/imoveis");
        router.refresh();
      } else {
        setError(result.error || "Ocorreu um erro ao salvar o imóvel.");
      }
    } catch (err) {
      setError("Erro ao se conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  const propertyTypes = [
    "Casa",
    "Apartamento",
    "Cobertura",
    "Loft",
    "Chalé",
    "Bangalô",
    "Villa",
    "Studio",
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-fade-in max-w-4xl">
      {/* Botão voltar e título */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/imoveis"
          className="p-2.5 bg-white border border-slate-100 hover:border-slate-300 text-slate-600 rounded-xl transition-all"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900">
            {initialData ? "Editar Imóvel" : "Novo Imóvel"}
          </h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
            {initialData ? initialData.title : "Preencha a ficha técnica do imóvel"}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Seção 1: Dados Gerais (Sem Tradução) */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
          Configurações Gerais do Imóvel
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo de Imóvel */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Tipo de Imóvel
            </label>
            <select
              {...register("propertyType")}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all text-slate-600 font-semibold"
            >
              <option value="">Selecione o tipo</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.propertyType && (
              <p className="text-xs text-red-500 mt-1">{errors.propertyType.message}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
              Slug da URL (Opcional)
              <span title="Gerado automaticamente se deixado em branco">
                <HelpCircle size={14} className="text-slate-400" />
              </span>
            </label>
            <input
              type="text"
              {...register("slug")}
              placeholder="ex-villa-oceanfront-trancoso"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* Seção 2: Textos Traduzíveis (Abas) */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-display font-bold text-base text-slate-900">
            Conteúdo Traduzível (Textos)
          </h3>
          {/* Seletor de Abas */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            {(['pt', 'en', 'es'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-white text-luxury-bronze shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ABA PORTUGUÊS */}
        <div className={`space-y-6 ${activeTab === 'pt' ? '' : 'hidden'}`}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Título do Imóvel (PT)
            </label>
            <input
              type="text"
              {...register("title")}
              placeholder="Ex: Villa Oceanfront Pé na Areia Trancoso"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Descrição Curta - Vitrine (PT)
            </label>
            <input
              type="text"
              {...register("shortDescription")}
              placeholder="Breve resumo atraente exibido nos cards (máx 180 caracteres)"
              maxLength={180}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
            {errors.shortDescription && (
              <p className="text-xs text-red-500 mt-1">{errors.shortDescription.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Descrição Detalhada Completa (PT)
            </label>
            <textarea
              rows={6}
              {...register("fullDescription")}
              placeholder="Detalhes completos sobre o espaço, quartos, vizinhança e diferenciais."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all resize-y"
            />
            {errors.fullDescription && (
              <p className="text-xs text-red-500 mt-1">{errors.fullDescription.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Localização Exibida - Vitrine (PT)
            </label>
            <input
              type="text"
              {...register("location")}
              placeholder="Ex: Praia dos Nativos, Trancoso"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
            {errors.location && (
              <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>
            )}
          </div>
        </div>

        {/* ABA INGLÊS */}
        <div className={`space-y-6 ${activeTab === 'en' ? '' : 'hidden'}`}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Property Title (EN)
            </label>
            <input
              type="text"
              {...register("titleEn")}
              placeholder="Ex: Beachfront Oceanfront Villa Trancoso"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Short Description - Showcase (EN)
            </label>
            <input
              type="text"
              {...register("shortDescriptionEn")}
              placeholder="Brief attractive summary displayed on cards (max 180 characters)"
              maxLength={180}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Detailed Description (EN)
            </label>
            <textarea
              rows={6}
              {...register("fullDescriptionEn")}
              placeholder="Full details about the property, rooms, neighborhood, and amenities in English."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Displayed Location - Showcase (EN)
            </label>
            <input
              type="text"
              {...register("locationEn")}
              placeholder="Ex: Nativos Beach, Trancoso"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* ABA ESPANHOL */}
        <div className={`space-y-6 ${activeTab === 'es' ? '' : 'hidden'}`}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Título de la Propiedad (ES)
            </label>
            <input
              type="text"
              {...register("titleEs")}
              placeholder="Ex: Villa Frente al Mar en Trancoso"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Descripción Corta - Vitrina (ES)
            </label>
            <input
              type="text"
              {...register("shortDescriptionEs")}
              placeholder="Breve resumen atractivo que se muestra en las tarjetas (máx. 180 caracteres)"
              maxLength={180}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Descripción Detallada Completa (ES)
            </label>
            <textarea
              rows={6}
              {...register("fullDescriptionEs")}
              placeholder="Detalles completos sobre la propiedad, habitaciones, vecindario y servicios en español."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Ubicación Mostrada - Vitrina (ES)
            </label>
            <input
              type="text"
              {...register("locationEs")}
              placeholder="Ex: Playa Nativos, Trancoso"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* Seção 3: Especificações e Preço */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
          Especificações e Valores
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Hóspedes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Máx Hóspedes
            </label>
            <input
              type="number"
              {...register("guests", { valueAsNumber: true })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
            {errors.guests && (
              <p className="text-xs text-red-500 mt-1">{errors.guests.message}</p>
            )}
          </div>

          {/* Quartos */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Quartos
            </label>
            <input
              type="number"
              {...register("bedrooms", { valueAsNumber: true })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
          </div>

          {/* Camas */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Camas
            </label>
            <input
              type="number"
              {...register("beds", { valueAsNumber: true })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
          </div>

          {/* Banheiros */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Banheiros
            </label>
            <input
              type="number"
              {...register("bathrooms", { valueAsNumber: true })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
          </div>

          {/* Área m² */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Área (m²)
            </label>
            <input
              type="number"
              {...register("area", {
                valueAsNumber: true,
                setValueAs: (v) => (v === "" ? null : Number(v)),
              })}
              placeholder="Opcional"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
          </div>

          {/* Preço Mínimo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Preço Diária (a partir de)
            </label>
            <input
              type="number"
              step="any"
              {...register("priceFrom", {
                valueAsNumber: true,
                setValueAs: (v) => (v === "" ? null : Number(v)),
              })}
              placeholder="Ex: 1200"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* Seção 4: Localização Geográfica (Sem Tradução) */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
          Localização Geográfica (Banco/Filtros)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cidade */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Cidade
            </label>
            <input
              type="text"
              {...register("city")}
              placeholder="Ex: Porto Seguro"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
            {errors.city && (
              <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>
            )}
          </div>

          {/* Bairro */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Bairro
            </label>
            <input
              type="text"
              {...register("neighborhood")}
              placeholder="Ex: Centro Cívico"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
            {errors.neighborhood && (
              <p className="text-xs text-red-500 mt-1">{errors.neighborhood.message}</p>
            )}
          </div>

          {/* Estado */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Estado (UF)
            </label>
            <input
              type="text"
              maxLength={2}
              {...register("state")}
              placeholder="Ex: BA"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all uppercase"
            />
            {errors.state && (
              <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>
            )}
          </div>

          {/* Endereço Adicional (Opcional) */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Endereço Completo (Opcional - Interno)
            </label>
            <input
              type="text"
              {...register("addressOptional")}
              placeholder="Rua, número, complemento - Não é exibido publicamente"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* Seção 5: Links de Redirecionamento de Reserva */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
          Links de Reservas Externas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Link Booking/Airbnb */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Link de Reserva Principal (Airbnb, Booking ou Próprio)
            </label>
            <input
              type="text"
              {...register("externalBookingUrl")}
              placeholder="https://airbnb.com/rooms/..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
            {errors.externalBookingUrl && (
              <p className="text-xs text-red-500 mt-1">{errors.externalBookingUrl.message}</p>
            )}
          </div>

          {/* WhatsApp de Vendas */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              WhatsApp Específico para Dúvidas (Opcional)
            </label>
            <input
              type="text"
              {...register("whatsappUrl")}
              placeholder="https://wa.me/5511999999999?text=..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* Seção 6: Foto de Capa e Galeria de Fotos */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
          Mídia (Fotos do Imóvel)
        </h3>

        {/* Imagem de Capa */}
        <div className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Foto de Capa Principal
          </label>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="relative w-40 aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              {coverImageValue ? (
                <Image
                  src={coverImageValue}
                  alt="Capa do imóvel"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <ImageIcon size={24} className="mb-1" />
                  Sem capa
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-3 w-full">
              {/* Campo URL Direta */}
              <input
                type="text"
                {...register("coverImage")}
                placeholder="Insira a URL direta da imagem de capa"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold rounded-xl outline-none text-sm transition-all"
              />
              
              {/* Upload de Arquivo Local */}
              <div className="relative flex items-center justify-center border border-dashed border-slate-300 rounded-xl py-3 hover:bg-slate-50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingCover}
                />
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  {uploadingCover ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Enviando imagem...
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      Ou faça upload de um arquivo local
                    </>
                  )}
                </span>
              </div>
              {errors.coverImage && (
                <p className="text-xs text-red-500">{errors.coverImage.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Galeria de Fotos */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Galeria de Fotos (Múltiplas Imagens)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addManualGalleryUrl}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <Plus size={12} />
                Adicionar URL
              </button>
              <div className="relative inline-flex items-center gap-1 px-3 py-1.5 bg-luxury-charcoal hover:bg-luxury-bronze text-white text-xs font-bold rounded-lg transition-colors cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingGallery}
                />
                {uploadingGallery ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload size={12} />
                    Fazer Upload
                  </>
                )}
              </div>
            </div>
          </div>

          {galleryImages.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl text-center text-slate-400 text-xs">
              Nenhuma foto adicional adicionada na galeria.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {galleryImages.map((url, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200"
                >
                  <Image
                    src={url}
                    alt={`Galeria ${idx + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600 hover:bg-red-750 text-white flex items-center justify-center shadow shadow-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Seção 7: Comodidades do Imóvel */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
          Comodidades do Imóvel
        </h3>

        {availableAmenities.length === 0 ? (
          <p className="text-sm text-slate-400">
            Nenhuma comodidade ativa cadastrada no painel. Vá para "Comodidades" para cadastrá-las primeiro.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {availableAmenities.map((am) => (
              <label
                key={am.id}
                onClick={() => toggleAmenity(am.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold cursor-pointer transition-all duration-200 ${
                  selectedAmenityIds.includes(am.id)
                    ? "bg-luxury-gold/10 border-luxury-gold text-luxury-bronze"
                    : "border-slate-100 bg-slate-50/50 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedAmenityIds.includes(am.id)}
                  onChange={() => {}} // Estado controlado pelo click no label
                  className="sr-only"
                />
                <span>{am.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Seção 8: Configurações de Exibição */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
          Configurações de Exibição
        </h3>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Ativo */}
          <label className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl flex-1 cursor-pointer transition-colors">
            <input
              type="checkbox"
              {...register("active")}
              className="w-5 h-5 accent-luxury-gold rounded focus:ring-0 cursor-pointer"
            />
            <div>
              <span className="block text-sm font-bold text-slate-900">
                Imóvel Ativo (Visível no Site)
              </span>
              <span className="text-xs text-slate-500 font-normal mt-0.5 block leading-relaxed">
                Determina se o imóvel está disponível para visualização pública.
              </span>
            </div>
          </label>

          {/* Destaque */}
          <label className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl flex-1 cursor-pointer transition-colors">
            <input
              type="checkbox"
              {...register("featured")}
              className="w-5 h-5 accent-luxury-gold rounded focus:ring-0 cursor-pointer"
            />
            <div>
              <span className="block text-sm font-bold text-slate-900">
                Marcar como Destaque
              </span>
              <span className="text-xs text-slate-500 font-normal mt-0.5 block leading-relaxed">
                Será exibido nas primeiras posições e em seções de destaque da home.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Ações de Envio */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200">
        <Link
          href="/admin/imoveis"
          className="px-6 py-3.5 border border-slate-200 hover:border-slate-900 text-slate-700 rounded-xl text-sm font-bold tracking-wide transition-all"
        >
          Cancelar
        </Link>
        
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3.5 bg-luxury-charcoal hover:bg-luxury-bronze text-white rounded-xl text-sm font-bold tracking-wide uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Imóvel"
          )}
        </button>
      </div>
    </form>
  );
}
