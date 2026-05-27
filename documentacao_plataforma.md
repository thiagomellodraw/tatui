# 📋 Documentação da Plataforma — Aluguel por Temporada

> Plataforma web premium para divulgação e gestão de imóveis de temporada, com painel administrativo completo, suporte a múltiplos idiomas e integração com plataformas externas de reserva.

---

## 🌐 Visão Geral

| Item | Detalhe |
|------|---------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Linguagem** | TypeScript |
| **Banco de Dados** | SQLite via Prisma ORM |
| **Estilo** | Tailwind CSS + Glassmorphism customizado |
| **Animações** | Framer Motion |
| **Ícones** | Lucide React |
| **Idiomas** | Português 🇧🇷 · Inglês 🇺🇸 · Espanhol 🇪🇸 |

---

## 🏠 Site Público

### Páginas Disponíveis

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | **Home** | Página principal com hero, busca, imóveis e FAQ |
| `/imoveis` | **Catálogo** | Listagem completa com filtros avançados |
| `/imoveis/[slug]` | **Detalhe do Imóvel** | Galeria, descrição, comodidades e CTA de reserva |
| `/sobre` | **Sobre Nós** | Página institucional da empresa |
| `/contato` | **Contato** | Formulário de contato e link direto para WhatsApp |

---

### 🔎 Home Page (`/`)

#### Hero Principal
- Imagem de fundo em tela cheia com overlay gradiente
- Título e subtítulo configuráveis pelo painel admin (com tradução para EN/ES)
- Badge animado de curadoria exclusiva
- **Campo de busca rápida** por cidade, hóspedes e tipo de imóvel

#### Destinos Populares
- Links rápidos para as cidades com imóveis cadastrados
- Gerado automaticamente a partir do banco de dados

#### Imóveis em Destaque
- Exibe até **6 imóveis**: primeiro os marcados como "Destaque", depois os mais recentes
- Dois blocos de grid com 3 cards cada
- Botão "Explorar Todos os Imóveis" com link para o catálogo

#### Banners Promocionais
- Seção dinâmica com banners cadastrados no admin
- Cada banner pode ter imagem, título, subtítulo e link externo
- Totalmente traduzível (PT/EN/ES)
- Hover com efeito zoom e badge "Destaque/Offer/Oferta"

#### Por Que Escolher
- 3 blocos de diferenciais com ícone, título e descrição
- Conteúdo traduzível

#### Estilos de Hospedagem
- 4 cards visuais com foto de fundo: Pé na Areia, Montanha, Luxo, Home Office
- Hover com zoom suave

#### Depoimentos
- 2 avaliações de hóspedes com foto, nome, imóvel e comentário

#### Perguntas Frequentes (FAQ)
- Accordion animado (Framer Motion)
- FAQs cadastradas e gerenciadas no painel admin
- Totalmente traduzível (PT/EN/ES)

#### CTA Final
- Card com chamada para ação com dois botões: Ver Imóveis e Fale Conosco

---

### 🏘️ Catálogo de Imóveis (`/imoveis`)

#### Filtros de Busca
- **Cidade** — dropdown com cidades disponíveis no banco
- **Mínimo de Hóspedes** — seleção de capacidade
- **Tipo de Imóvel** — Casa, Apartamento, Chalé, Villa, Cobertura, etc.
- **Preço Máximo** — slider de valor
- **Comodidades** — checkboxes múltiplos (Wi-Fi, Piscina, etc.)
- Botão "Limpar Filtros"

#### Grade de Resultados
- Grid responsivo de cards com foto de capa, cidade, tipo, preço, hóspedes, quartos e banheiros
- Contador de imóveis encontrados
- **Ordenação** por: Destaques, Menor Preço, Maior Preço, Mais Recentes
- **Favoritos** — salvos no localStorage (sem login)

#### Card do Imóvel
- Foto de capa com hover zoom
- Badge de tipo e "Destaque"
- Informações resumidas (hóspedes, quartos, banheiros, área)
- Preço "a partir de"
- Botão de favoritar (coração)

---

### 🏡 Detalhe do Imóvel (`/imoveis/[slug]`)

#### Galeria de Fotos
- Grid estilo editorial com foto principal grande e miniaturas
- Modal de galeria em tela cheia com navegação por setas e teclado
- Suporte a múltiplas imagens com ordem configurável

#### Informações do Imóvel
- Título, localização, tipo, área (m²)
- Capacidade: hóspedes, quartos, camas, banheiros
- Descrição completa formatada
- Lista de comodidades com ícones Lucide

#### Botões de Ação (CTA)
- **"Reservar Agora"** — redireciona para o link externo cadastrado (Airbnb, Booking, etc.)
- **"Chamar no WhatsApp"** — abre WhatsApp com mensagem pré-formatada
- Clique nos botões de reserva é **registrado** automaticamente no banco (ClickLog)

#### Imóveis Recomendados
- Grid de até 3 imóveis da mesma cidade ou tipo
- Gerado automaticamente

#### Compartilhamento Social
- Botões para compartilhar via WhatsApp, copiar link

---

### 📞 Contato (`/contato`)

- Formulário com: Nome, E-mail, Telefone, Imóvel de Interesse (opcional), Mensagem
- Ao enviar, cria um **Lead** no banco de dados com status "NOVO"
- Link direto para WhatsApp
- Exibe o e-mail e número de contato configurados no admin

---

### ℹ️ Sobre Nós (`/sobre`)

- Apresentação institucional da empresa
- Diferenciais, missão e valores
- Chamada para contato

---

### 🌍 Multi-idioma

- Seletor de idioma na Navbar (PT · EN · ES)
- Idioma salvo em **cookie** para persistência entre páginas
- Todos os textos estáticos traduzidos via dicionário (`i18n.ts`)
- Conteúdos dinâmicos (imóveis, banners, FAQs, configs) têm campos traduzíveis cadastrados no admin
- Fallback automático para Português caso a tradução não esteja preenchida

---

### 🎨 Design e UX

- **Navbar inteligente**: transparente com logo branca no hero da home; glassmorphism com logo colorida nas demais páginas e após scroll
- **Footer** com: links, contato, redes sociais, formas de pagamento (Pix, Visa, Mastercard, Amex, Apple Pay, Google Pay)
- Responsivo para mobile, tablet e desktop
- Animações suaves com Framer Motion (fade-in, slide-up, accordion)
- Glassmorphism, gradientes e micro-interações nos hovers

---

## 🔒 Painel Administrativo (`/admin`)

### Acesso
- Rota protegida: `/admin/login`
- Autenticação via **sessão criptografada em cookie** (iron-session)
- Logout automático por expiração de sessão
- Sem cadastro público — apenas o administrador cadastrado no seed tem acesso

---

### 📊 Dashboard (`/admin`)

#### Métricas Gerais
| Métrica | Descrição |
|---------|-----------|
| Total de Imóveis | Quantidade de imóveis cadastrados |
| Imóveis Ativos | Imóveis visíveis no site |
| Total de Leads | Formulários de contato recebidos |
| Leads Novos | Leads com status "NOVO" |
| Cliques de Reserva | Total de cliques nos botões de reserva |
| Cliques Hoje | Cliques registrados no dia atual |

#### Gráfico de Cliques por Imóvel
- Lista os imóveis com mais cliques em botões de reserva
- Ranking com barra de progresso visual

#### Leads Recentes
- Tabela com os últimos 5 leads recebidos
- Nome, e-mail, imóvel de interesse, status e data

---

### 🏠 Gestão de Imóveis (`/admin/imoveis`)

#### Listagem
- Tabela com foto, nome, cidade, tipo, status (ativo/inativo), destaque e ações
- Busca por nome
- Filtro por status (ativo/inativo)
- Botão de ativar/desativar rápido
- Reordenação por drag-and-drop

#### Cadastro / Edição (`/admin/imoveis/novo` e `/admin/imoveis/[id]`)

**Abas de conteúdo por idioma:** PT · EN · ES

| Campo | Tipo | Descrição |
|-------|------|-----------|
| Título | Texto | Nome do imóvel (PT/EN/ES) |
| Slug | Texto | URL amigável (gerado automaticamente) |
| Descrição Curta | Texto | Resumo para cards (PT/EN/ES) |
| Descrição Completa | Textarea | Texto completo da página de detalhe (PT/EN/ES) |
| Localização | Texto | Endereço exibido (PT/EN/ES) |
| Cidade | Texto | Usada nos filtros |
| Bairro | Texto | — |
| Estado | Texto | Sigla do estado |
| Endereço Opcional | Texto | Complemento interno |
| Latitude / Longitude | Número | Para integração com mapas |
| Tipo de Imóvel | Select | Casa, Apartamento, Chalé, Villa, Cobertura, etc. |
| Hóspedes | Número | Capacidade total |
| Quartos | Número | — |
| Camas | Número | — |
| Banheiros | Número | — |
| Área (m²) | Número | — |
| Preço "A partir de" | Número | Exibido nos cards |
| Link de Reserva Externo | URL | Airbnb, Booking, site próprio, etc. |
| Link WhatsApp | URL | Link direto do WhatsApp para esse imóvel |
| Imagem de Capa | URL | Foto principal |
| Galeria de Fotos | URLs | Múltiplas fotos com ordenação |
| Comodidades | Checkboxes | Seleção múltipla das comodidades cadastradas |
| Ativo | Toggle | Visível no site |
| Destaque | Toggle | Aparece na home e no topo do catálogo |

---

### 🏷️ Gestão de Comodidades (`/admin/comodidades`)

- Lista de comodidades disponíveis para associar aos imóveis
- Cadastro com: **Nome** (PT/EN/ES), **Ícone** (nome do ícone Lucide), **Ativo**
- Ícones pré-visualizados na listagem
- Ativar/desativar sem excluir

---

### 👥 Gestão de Leads (`/admin/leads`)

| Campo | Descrição |
|-------|-----------|
| Nome | Nome do visitante |
| E-mail | E-mail de contato |
| Telefone | Número de telefone |
| Imóvel de Interesse | Imóvel vinculado (se informado) |
| Mensagem | Texto da mensagem |
| Status | NOVO · EM_ATENDIMENTO · RESPONDIDO · ARQUIVADO |
| Data | Timestamp de envio |

- Filtro por status
- Alteração de status diretamente na listagem
- Visualização completa da mensagem

---

### 🖼️ Banners Promocionais (`/admin/banners`)

#### Listagem
- Tabela com foto em miniatura, título, status e ordenação
- Ativar/desativar sem excluir
- Botão de editar e excluir

#### Cadastro / Edição (`/admin/banners/novo` e `/admin/banners/[id]`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| Título | Texto | Título do banner (PT/EN/ES) |
| Subtítulo | Texto | Chamada secundária (PT/EN/ES) |
| URL da Imagem | URL | Foto do banner |
| Link de Destino | URL | Onde o banner redireciona ao clicar |
| Ordem | Número | Posição de exibição |
| Ativo | Toggle | Visível no site |

> Os banners ativos aparecem na **Home Page** em uma seção dedicada com cards visuais e hover animado.

---

### ❓ Perguntas Frequentes (`/admin/faqs`)

#### Listagem
- Tabela com pergunta, status e ordem
- Ativar/desativar sem excluir

#### Cadastro / Edição (`/admin/faqs/novo` e `/admin/faqs/[id]`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| Pergunta | Texto | Título da FAQ (PT/EN/ES) |
| Resposta | Textarea | Texto da resposta (PT/EN/ES) |
| Ordem | Número | Posição no accordion |
| Ativo | Toggle | Visível no site |

> As FAQs ativas aparecem na **Home Page** em um accordion animado com suporte a múltiplos idiomas.

---

### ⚙️ Configurações Gerais (`/admin/configuracoes`)

**Abas de conteúdo por idioma:** PT · EN · ES

| Campo | Descrição |
|-------|-----------|
| Nome da Marca | Nome exibido no site |
| URL da Logo | Imagem da logomarca |
| Título do Hero | Título principal da home (PT/EN/ES) |
| Subtítulo do Hero | Subtítulo da home (PT/EN/ES) |
| Número do WhatsApp | Usado em todos os botões de contato |
| E-mail de Contato | Exibido na página de contato |
| Instagram | Link para o perfil |
| Facebook | Link para o perfil |
| TikTok | Link para o perfil |
| Texto do Rodapé | Copyright e aviso de reservas (PT/EN/ES) |

---

## 🗄️ Banco de Dados — Modelos

```
User           → Administrador do painel
Property       → Imóvel de temporada
PropertyImage  → Fotos da galeria do imóvel
Amenity        → Comodidades disponíveis
Lead           → Contatos recebidos pelo formulário
Config         → Configurações globais do site
ClickLog       → Registro de cliques nos botões de reserva
PromoBanner    → Banners promocionais da home
FAQ            → Perguntas frequentes
```

---

## 🔧 Arquitetura Técnica

### Server Actions (`/src/app/actions/`)

| Arquivo | Funções |
|---------|---------|
| `auth.ts` | `loginAdmin`, `logoutAdmin`, `getSession` |
| `properties.ts` | `getProperties`, `getPropertyBySlug`, `createProperty`, `updateProperty`, `deleteProperty`, `togglePropertyActive`, `togglePropertyFeatured`, `registerClick` |
| `amenities.ts` | `getAmenities`, `createAmenity`, `updateAmenity`, `deleteAmenity`, `toggleAmenityActive` |
| `leads.ts` | `createLead`, `getLeads`, `updateLeadStatus` |
| `config.ts` | `getConfig`, `updateConfig` |
| `banners.ts` | `getBanners`, `getAdminBanners`, `createBanner`, `updateBanner`, `deleteBanner` |
| `faqs.ts` | `getFaqs`, `getAdminFaqs`, `createFaq`, `updateFaq`, `deleteFaq` |

### Autenticação
- Sessão criptografada via cookie HTTP-only
- Middleware de proteção em todas as rotas `/admin/*` (exceto `/admin/login`)
- Sem dependência de serviços externos (tudo local)

### Performance
- Server Components para todas as páginas com dados (sem chamadas client-side desnecessárias)
- `force-dynamic` nas páginas admin para sempre buscar dados frescos
- Imagens otimizadas via `next/image` com `remotePatterns` configurados
- Fonte carregada via Google Fonts (Inter + Playfair Display)

---

## 📁 Estrutura de Diretórios

```
src/
├── app/
│   ├── (public)/          # Páginas do site público
│   │   ├── page.tsx       # Home
│   │   ├── imoveis/       # Catálogo e detalhe
│   │   ├── sobre/         # Sobre nós
│   │   └── contato/       # Formulário de contato
│   ├── admin/             # Painel administrativo
│   │   ├── login/
│   │   └── (dashboard)/
│   │       ├── page.tsx   # Dashboard com métricas
│   │       ├── imoveis/
│   │       ├── comodidades/
│   │       ├── leads/
│   │       ├── banners/
│   │       ├── faqs/
│   │       └── configuracoes/
│   └── actions/           # Server Actions (backend)
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── PropertyCard.tsx
│   ├── PromoBanners.tsx
│   ├── FAQAccordion.tsx
│   ├── ContactForm.tsx
│   └── admin/             # Componentes do painel
├── context/
│   └── LanguageContext.tsx # Context de idioma global
├── lib/
│   ├── db.ts              # Cliente Prisma singleton
│   ├── session.ts         # Gerenciamento de sessão
│   └── i18n.ts            # Dicionário de traduções
prisma/
├── schema.prisma          # Modelos do banco
├── seed.js                # Dados iniciais
└── dev.db                 # Banco SQLite local
```

---

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev        # http://localhost:3000

# Build de produção
npm run build
npm start

# Resetar e popular o banco com dados de exemplo
node prisma/seed.js
```

### Credenciais Padrão do Admin
> Configuradas no `prisma/seed.js`

| Campo | Valor |
|-------|-------|
| Usuário | `admin` |
| Senha | `admin123` |

> [!CAUTION]
> Altere a senha do administrador antes de publicar em produção.

---

## 🔗 Integrações de Reserva Suportadas

O site **não processa reservas diretamente**. Cada imóvel possui um link externo configurável:

| Plataforma | Suporte |
|------------|---------|
| Airbnb | ✅ Link direto para o anúncio |
| Booking.com | ✅ Link direto para o anúncio |
| WhatsApp | ✅ Link `wa.me` com mensagem pré-formatada |
| Site Próprio | ✅ Qualquer URL externa |
| Vrbo / HomeAway | ✅ Link direto |
| Outro | ✅ Qualquer link válido |

---

## 💳 Formas de Pagamento Exibidas no Rodapé

> Exibição informativa — o pagamento ocorre na plataforma parceira de reserva.

- Pix
- Visa
- Mastercard
- American Express (Amex)
- Apple Pay
- Google Pay
