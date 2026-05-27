const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seeding do banco de dados multi-tenant...');

  // 1. Limpar banco existente
  await prisma.clickLog.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.propertyImage.deleteMany({});
  await prisma.config.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.promoBanner.deleteMany({});
  await prisma.fAQ.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.amenity.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.tenant.deleteMany({});
  
  console.log('Banco de dados limpo.');

  // 2. Criar Tenants
  const tenantTatui = await prisma.tenant.create({
    data: {
      id: 'tatui',
      name: 'Tatuí',
      subdomain: 'tatui',
      status: 'ACTIVE',
      monthlyFee: 500.00,
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 10), // dia 10 do próximo mês
    }
  });
  console.log(`Inquilino Tatuí criado (ID: ${tenantTatui.id})`);

  const tenantBoutique = await prisma.tenant.create({
    data: {
      id: 'boutique',
      name: 'Pousada Boutique',
      subdomain: 'boutique',
      status: 'ACTIVE',
      monthlyFee: 750.00,
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 15),
    }
  });
  console.log(`Inquilino Boutique criado (ID: ${tenantBoutique.id})`);

  // 3. Criar Usuários
  const passwordHash = bcrypt.hashSync('admin123', 10);
  
  // Super Admin (Dono da plataforma)
  const superadmin = await prisma.user.create({
    data: {
      username: 'superadmin',
      passwordHash,
      role: 'SUPER_ADMIN',
      tenantId: null, // Super Admins não pertencem a inquilinos específicos
    },
  });
  console.log(`Super Admin criado: ${superadmin.username}`);

  // Tenant Admin (Administrador da pousada Tatuí)
  const tenantAdmin = await prisma.user.create({
    data: {
      username: 'admin',
      passwordHash,
      role: 'TENANT_ADMIN',
      tenantId: 'tatui',
    },
  });
  console.log(`Tenant Admin criado para Tatuí: ${tenantAdmin.username}`);

  // 4. Criar Configurações para Tatuí
  const config = await prisma.config.create({
    data: {
      brandName: 'Tatuí',
      heroTitle: 'Encontre o refúgio ideal para sua próxima temporada.',
      heroTitleEn: 'Find the perfect retreat for your next vacation.',
      heroTitleEs: 'Encuentre el refugio ideal para su próxima temporada.',
      heroSubtitle: 'Imóveis exclusivos selecionados para quem busca sofisticação, conforto e memórias inesquecíveis.',
      heroSubtitleEn: 'Exclusive properties selected for those seeking sophistication, comfort, and unforgettable memories.',
      heroSubtitleEs: 'Propiedades exclusivas seleccionadas para quienes buscan sofisticación, confort y recuerdos inolvidables.',
      whatsappNumber: '5511999999999',
      contactEmail: 'contato@tatui.com.br',
      instagramUrl: 'https://instagram.com/tatuitTemporada',
      facebookUrl: 'https://facebook.com/tatuiTemporada',
      tiktokUrl: 'https://tiktok.com/@tatuiTemporada',
      footerText: '© 2026 Tatuí. Todos os direitos reservados. As reservas são concluídas em plataformas parceiras.',
      footerTextEn: '© 2026 Tatuí. All rights reserved. Bookings are completed on partner platforms.',
      footerTextEs: '© 2026 Tatuí. Todos los direitos reservados. Las reservas se realizan en plataformas asociadas.',
      tenantId: 'tatui',
    },
  });
  console.log('Configurações do inquilino Tatuí criadas.');

  // 5. Criar Comodidades para Tatuí
  const amenitiesData = [
    { name: 'Wi-Fi de Alta Velocidade', nameEn: 'High-Speed Wi-Fi', nameEs: 'Wi-Fi de Alta Velocidad', icon: 'Wifi', tenantId: 'tatui' },
    { name: 'Piscina Privativa', nameEn: 'Private Pool', nameEs: 'Piscina Privada', icon: 'Waves', tenantId: 'tatui' },
    { name: 'Churrasqueira Gourmet', nameEn: 'Gourmet Grill', nameEs: 'Parrilla Gourmet', icon: 'Flame', tenantId: 'tatui' },
    { name: 'Ar-condicionado', nameEn: 'Air Conditioning', nameEs: 'Aire Acondicionado', icon: 'Wind', tenantId: 'tatui' },
    { name: 'Vista para o Mar', nameEn: 'Ocean View', nameEs: 'Vista al Mar', icon: 'Compass', tenantId: 'tatui' },
    { name: 'Garagem Coberta', nameEn: 'Covered Garage', nameEs: 'Garaje Cubierto', icon: 'Car', tenantId: 'tatui' },
    { name: 'Pet Friendly', nameEn: 'Pet Friendly', nameEs: 'Apto para Mascotas', icon: 'Dog', tenantId: 'tatui' },
    { name: 'Cozinha Completa', nameEn: 'Full Kitchen', nameEs: 'Cocina Completa', icon: 'Utensils', tenantId: 'tatui' },
    { name: 'Próximo à Praia', nameEn: 'Near the Beach', nameEs: 'Cerca de la Playa', icon: 'Sun', tenantId: 'tatui' },
    { name: 'Roupa de Cama Premium', nameEn: 'Premium Bed Linens', nameEs: 'Ropa de Cama Premium', icon: 'Bed', tenantId: 'tatui' },
    { name: 'Smart TV 4K', nameEn: '4K Smart TV', nameEs: 'Smart TV 4K', icon: 'Tv', tenantId: 'tatui' },
    { name: 'Área Gourmet', nameEn: 'Gourmet Area', nameEs: 'Área Gourmet', icon: 'ChefHat', tenantId: 'tatui' },
  ];

  const amenities = [];
  for (const item of amenitiesData) {
    const am = await prisma.amenity.create({
      data: item,
    });
    amenities.push(am);
  }
  console.log(`${amenities.length} comodidades criadas.`);

  const getAmenityIdsByNames = (names) => {
    return amenities
      .filter((am) => names.includes(am.name))
      .map((am) => ({ id: am.id }));
  };

  // 6. Criar Imóveis para Tatuí
  const propertiesData = [
    {
      title: 'Villa Oceanfront Trancoso',
      titleEn: 'Villa Oceanfront Trancoso',
      titleEs: 'Villa Oceanfront Trancoso',
      slug: 'villa-oceanfront-trancoso',
      shortDescription: 'Espetacular refúgio pé na areia com piscina de borda infinita e serviço de concierge.',
      shortDescriptionEn: 'Spectacular beachfront retreat with infinity pool and concierge service.',
      shortDescriptionEs: 'Espectacular refugio frente al mar con piscina infinita y servicio de conserjería.',
      fullDescription: 'Localizada no topo de uma falésia com acesso direto à praia, a Villa Oceanfront Trancoso combina o charme rústico baiano com o máximo luxo contemporâneo. A propriedade dispõe de amplas suítes com varanda, sala de estar em conceito aberto com pé direito duplo e uma área externa magnífica com piscina de borda infinita de frente para o mar. Perfeita para quem busca privacidade absoluta e paisagens inesquecíveis.',
      fullDescriptionEn: 'Located on top of a cliff with direct access to the beach, Villa Oceanfront Trancoso combines rustic Bahian charm with the ultimate contemporary luxury. The property features spacious suites with balconies, an open-concept living room with double height ceilings, and a magnificent outdoor area with an infinity pool facing the sea. Perfect for those seeking absolute privacy and unforgettable landscapes.',
      fullDescriptionEs: 'Situada en lo alto de un acantilado con acceso directo a la playa, Villa Oceanfront Trancoso combina el encanto rústico de Bahía con el máximo lujo contemporáneo. La propiedad cuenta con amplias suites con balcón, sala de estar de concepto abierto con techos de doble altura y una magnífica zona al aire libre con piscina infinita frente al mar. Perfecta para quienes buscan absoluta privacidad y paisajes inolvidables.',
      location: 'Trancoso, Porto Seguro',
      locationEn: 'Trancoso, Porto Seguro',
      locationEs: 'Trancoso, Porto Seguro',
      city: 'Trancoso',
      neighborhood: 'Praia dos Nativos',
      state: 'BA',
      propertyType: 'Villa',
      guests: 10,
      bedrooms: 5,
      beds: 7,
      bathrooms: 6,
      area: 450,
      priceFrom: 3500.00,
      externalBookingUrl: 'https://airbnb.com',
      whatsappUrl: 'https://wa.me/5511999999999?text=Olá,%20tenho%20interesse%20na%20Villa%20Oceanfront%20Trancoso',
      featured: true,
      active: true,
      coverImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80',
      ],
      amenityNames: ['Wi-Fi de Alta Velocidade', 'Piscina Privativa', 'Vista para o Mar', 'Pet Friendly', 'Cozinha Completa', 'Próximo à Praia', 'Roupa de Cama Premium'],
      tenantId: 'tatui',
    },
    {
      title: 'Chalé Alpino Boutique',
      titleEn: 'Boutique Alpine Chalet',
      titleEs: 'Chalé Alpino Boutique',
      slug: 'chale-alpino-boutique',
      shortDescription: 'Charme europeu nas montanhas de Gramado com lareira e jacuzzi ao ar livre.',
      shortDescriptionEn: 'European charm in the mountains of Gramado with fireplace and outdoor jacuzzi.',
      shortDescriptionEs: 'Encanto europeo en la sierra de Gramado con chimenea y jacuzzi al aire libre.',
      fullDescription: 'Um autêntico chalé de alto padrão no coração da Serra Gaúcha. Projetado para casais ou pequenas famílias, o Chalé Alpino Boutique conta com lareira a lenha na sala de estar, calefação em todos os ambientes e uma banheira de hidromassagem aquecida na varanda externa, cercada por araucárias. A apenas 5 minutos da Rua Coberta de Gramado, oferece o equilíbrio perfeito entre tranquilidade e acesso fácil à gastronomia local.',
      fullDescriptionEn: 'An authentic high-end chalet in the heart of Serra Gaúcha. Designed for couples or small families, the Boutique Alpine Chalet features a wood-burning fireplace in the living room, heating in all rooms, and a heated hot tub on the outdoor balcony, surrounded by araucarias. Just 5 minutes from Gramado\'s Rua Coberta, it offers the perfect balance between tranquility and easy access to local gastronomy.',
      fullDescriptionEs: 'Un auténtico chalé de alto standing en el corazón de la Serra Gaúcha. Diseñado para parejas o familias pequeñas, el Chalé Alpino Boutique cuenta con chimenea de leña en el salón, calefacción en todas las estancias y una bañera de hidromasaje climatizada en la terraza exterior, rodeada de araucarias. A sólo 5 minutos de la Rua Coberta de Gramado, ofrece el equilibrio perfeito entre tranquilidad y fácil acceso a la gastronomía local.',
      location: 'Gramado',
      locationEn: 'Gramado',
      locationEs: 'Gramado',
      city: 'Gramado',
      neighborhood: 'Planalto',
      state: 'RS',
      propertyType: 'Chalé',
      guests: 4,
      bedrooms: 2,
      beds: 3,
      bathrooms: 2,
      area: 120,
      priceFrom: 850.00,
      externalBookingUrl: 'https://booking.com',
      whatsappUrl: 'https://wa.me/5511999999999?text=Olá,%20tenho%20interesse%20no%20Chalé%20Alpino%20Boutique',
      featured: true,
      active: true,
      coverImage: 'https://images.unsplash.com/photo-1585543805890-6051f7829f98?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80',
      ],
      amenityNames: ['Wi-Fi de Alta Velocidade', 'Ar-condicionado', 'Garagem Coberta', 'Cozinha Completa', 'Roupa de Cama Premium', 'Smart TV 4K'],
      tenantId: 'tatui',
    },
    {
      title: 'Cobertura Triplex Vista Mar Ipanema',
      titleEn: 'Ipanema Ocean View Triplex Penthouse',
      titleEs: 'Penthouse Triplex Vista Mar Ipanema',
      slug: 'cobertura-triplex-ipanema',
      shortDescription: 'Cobertura de design com piscina privativa e vista espetacular para a praia de Ipanema.',
      shortDescriptionEn: 'Design penthouse with private pool and spectacular view of Ipanema beach.',
      shortDescriptionEs: 'Penthouse de diseño con piscina privada y vista espectacular de la playa de Ipanema.',
      fullDescription: 'Esta cobertura de luxo assinada por arquitetos renomados oferece uma experiência cinematográfica no Rio de Janeiro. No primeiro piso, amplas salas e cozinha gourmet. No segundo piso, suítes sofisticadas. No terceiro piso, um terraço espetacular com piscina de vidro, churrasqueira e lounge, tudo com vista panorâmica para o mar de Ipanema e o Morro Dois Irmãos. Exclusividade, conforto e segurança 24h.',
      fullDescriptionEn: 'This luxury penthouse, designed by renowned architects, offers a cinematic experience in Rio de Janeiro. On the first floor, large living areas and a gourmet kitchen. On the second floor, sophisticated suites. On the third floor, a spectacular terrace with a glass-walled pool, barbecue, and lounge, all with panoramic views of the Ipanema sea and the Dois Irmãos Mountain. Exclusivity, comfort, and 24-hour security.',
      fullDescriptionEs: 'Este penthouse de lujo diseñado por arquitectos de renombre ofrece una experiencia cinematográfica en Río de Janeiro. En el primer piso, amplios salones y cocina gourmet. En el segundo piso, sofisticadas suites. En el tercer piso, una espectacular terraza con piscina de cristal, parrilla y sala de estar, todo con vistas panorámicas al mar de Ipanema y al Morro Dois Irmãos. Exclusividad, confort y seguridad las 24 horas.',
      location: 'Ipanema, Rio de Janeiro',
      locationEn: 'Ipanema, Rio de Janeiro',
      locationEs: 'Ipanema, Río de Janeiro',
      city: 'Rio de Janeiro',
      neighborhood: 'Ipanema',
      state: 'RJ',
      propertyType: 'Cobertura',
      guests: 8,
      bedrooms: 4,
      beds: 5,
      bathrooms: 5,
      area: 320,
      priceFrom: 2800.00,
      externalBookingUrl: 'https://airbnb.com',
      whatsappUrl: 'https://wa.me/5511999999999?text=Olá,%20tenho%20interesse%20na%20Cobertura%20Triplex%20Ipanema',
      featured: true,
      active: true,
      coverImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
      ],
      amenityNames: ['Wi-Fi de Alta Velocidade', 'Piscina Privativa', 'Ar-condicionado', 'Vista para o Mar', 'Garagem Coberta', 'Cozinha Completa', 'Próximo à Praia', 'Smart TV 4K', 'Churrasqueira Gourmet'],
      tenantId: 'tatui',
    },
    {
      title: 'Casa de Praia Designer São Sebastião',
      titleEn: 'Designer Beach House São Sebastião',
      titleEs: 'Casa de Playa Designer São Sebastião',
      slug: 'casa-praia-designer-sao-sebastiao',
      shortDescription: 'Refúgio moderno integrado à mata e a poucos metros da areia da Praia da Baleia.',
      shortDescriptionEn: 'Modern retreat integrated with the forest and a few meters from Baleia Beach.',
      shortDescriptionEs: 'Refugio moderno integrado al bosque y a pocos metros de la arena de la Playa de Baleia.',
      fullDescription: 'Com projeto arquitetônico premiado, esta casa espetacular na Praia da Baleia combina painéis de vidro e madeira em perfeita harmonia com a Mata Atlântica. Dispõe de varanda gourmet integrada, piscina aquecida com raia e lounge externo com lareira. Uma escolha sublime para quem aprecia arquitetura e contato puro com a natureza.',
      fullDescriptionEn: 'With an award-winning architectural design, this spectacular house in Praia da Baleia combines glass and wood panels in perfect harmony with the Atlantic Forest. It features an integrated gourmet balcony, heated lap pool, and outdoor lounge with a fireplace. A sublime choice for architecture lovers.',
      fullDescriptionEs: 'Con un diseño arquitectónico galardonado, esta espectacular casa en Praia da Baleia combina paneles de vidrio y madera en perfecta armonía con el Bosque Atlántico. Cuenta con balcón gourmet integrado, piscina climatizada con carril de nado y salón al aire libre con chimenea.',
      location: 'São Sebastião, São Paulo',
      locationEn: 'São Sebastião, São Paulo',
      locationEs: 'São Sebastião, São Paulo',
      city: 'São Sebastião',
      neighborhood: 'Praia da Baleia',
      state: 'SP',
      propertyType: 'Casa',
      guests: 8,
      bedrooms: 4,
      beds: 6,
      bathrooms: 5,
      area: 380,
      priceFrom: 1800.00,
      externalBookingUrl: 'https://booking.com',
      whatsappUrl: 'https://wa.me/5511999999999?text=Olá,%20tenho%20interesse%20na%20Casa%20de%20Praia%20Designer',
      featured: true,
      active: true,
      coverImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=800&q=80',
      ],
      amenityNames: ['Wi-Fi de Alta Velocidade', 'Piscina Privativa', 'Ar-condicionado', 'Churrasqueira Gourmet', 'Cozinha Completa', 'Próximo à Praia'],
      tenantId: 'tatui',
    },
    {
      title: 'Cabana na Floresta São Francisco de Paula',
      titleEn: 'Forest Cabin São Francisco de Paula',
      titleEs: 'Cabaña en el Bosque São Francisco de Paula',
      slug: 'cabana-floresta-sao-francisco',
      shortDescription: 'Experiência única de imersão no silêncio e na beleza do bosque de araucárias.',
      shortDescriptionEn: 'Unique experience of immersion in the silence and beauty of the araucaria forest.',
      shortDescriptionEs: 'Experiencia única de inmersión en el silencio y la belleza del bosque de araucarias.',
      fullDescription: 'Projetada sob o conceito de arquitetura minimalista de impacto mínimo, esta cabana em meio à floresta de São Francisco de Paula é um santuário de paz. Equipada com lareira calefatora, vidros térmicos do chão ao teto e banheira de imersão de design com vista panorâmica para o lago privativo.',
      fullDescriptionEn: 'Designed under the concept of low-impact minimalist architecture, this cabin in the forest is a sanctuary of peace. Equipped with a heating fireplace, floor-to-ceiling thermal glass, and a design soaking tub with panoramic views of the private lake.',
      fullDescriptionEs: 'Diseñada bajo el concepto de arquitectura minimalista de mínimo impacto, esta cabaña en el bosque es un santuario de paz. Equipada con chimenea de calefacción, vidrios térmicos de piso a techo y bañera de inmersión de diseño.',
      location: 'São Francisco de Paula',
      locationEn: 'São Francisco de Paula',
      locationEs: 'São Francisco de Paula',
      city: 'São Francisco de Paula',
      neighborhood: 'Rincão',
      state: 'RS',
      propertyType: 'Cabana',
      guests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      area: 65,
      priceFrom: 650.00,
      externalBookingUrl: 'https://airbnb.com',
      whatsappUrl: 'https://wa.me/5511999999999?text=Olá,%20tenho%20interesse%20na%20Cabana%20na%20Floresta',
      featured: true,
      active: true,
      coverImage: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=800&q=80',
      ],
      amenityNames: ['Wi-Fi de Alta Velocidade', 'Ar-condicionado', 'Pet Friendly', 'Roupa de Cama Premium'],
      tenantId: 'tatui',
    },
    {
      title: 'Resort Duplex Barra da Tijuca',
      titleEn: 'Duplex Resort Barra da Tijuca',
      titleEs: 'Resort Duplex Barra da Tijuca',
      slug: 'resort-duplex-barra',
      shortDescription: 'Conforto e sofisticação a passos da praia com infraestrutura completa de lazer.',
      shortDescriptionEn: 'Comfort and sophistication steps from the beach with complete leisure infrastructure.',
      shortDescriptionEs: 'Confort y sofisticación a pasos de la playa con infraestructura completa de ocio.',
      fullDescription: 'Apartamento duplex moderno na Barra da Tijuca de frente para o canal marinho. Oferece suítes planejadas, ampla sala com varanda envidraçada e cozinha equipada. Condomínio dispõe de segurança armada 24h, academia de última geração, saunas e piscina semi-olímpica.',
      fullDescriptionEn: 'Modern duplex apartment in Barra da Tijuca facing the marine canal. It offers planned suites, a large living room with a glazed balcony, and an equipped kitchen. Condominium features 24h armed security, state-of-the-art gym, saunas, and semi-olympic pool.',
      fullDescriptionEs: 'Apartamento dúplex moderno en Barra da Tijuca frente al canal marino. Ofrece suites planificadas, amplio salón con balcón acristalado y cocina equipada. Condominio cuenta con seguridad armada las 24 horas.',
      location: 'Rio de Janeiro, Rio de Janeiro',
      locationEn: 'Rio de Janeiro, Rio de Janeiro',
      locationEs: 'Río de Janeiro, Río de Janeiro',
      city: 'Rio de Janeiro',
      neighborhood: 'Barra da Tijuca',
      state: 'RJ',
      propertyType: 'Apartamento',
      guests: 6,
      bedrooms: 3,
      beds: 4,
      bathrooms: 3,
      area: 160,
      priceFrom: 1100.00,
      externalBookingUrl: 'https://airbnb.com',
      whatsappUrl: 'https://wa.me/5511999999999?text=Olá,%20tenho%20interesse%20no%20Resort%20Duplex%20Barra',
      featured: true,
      active: true,
      coverImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      ],
      amenityNames: ['Wi-Fi de Alta Velocidade', 'Ar-condicionado', 'Garagem Coberta', 'Smart TV 4K', 'Piscina Privativa'],
      tenantId: 'tatui',
    },
  ];

  for (const propData of propertiesData) {
    const { images, amenityNames, ...propFields } = propData;
    const property = await prisma.property.create({
      data: {
        ...propFields,
        amenities: {
          connect: getAmenityIdsByNames(amenityNames),
        },
      },
    });

    console.log(`Imóvel criado: ${property.title}`);

    for (let i = 0; i < images.length; i++) {
      await prisma.propertyImage.create({
        data: {
          url: images[i],
          order: i,
          propertyId: property.id,
        },
      });
    }
  }

  // 7. Criar Banners Promocionais para Tatuí
  console.log('Criando banners promocionais...');
  const bannersData = [
    {
      title: 'Explore o Paraíso em Trancoso',
      titleEn: 'Explore Paradise in Trancoso',
      titleEs: 'Explore el Paraíso en Trancoso',
      subtitle: 'Até 15% OFF em estadias de mais de 7 dias na Villa Oceanfront',
      subtitleEn: 'Up to 15% OFF on stays longer than 7 days at Villa Oceanfront',
      subtitleEs: 'Hasta 15% de descuento en estancias de más de 7 días en Villa Oceanfront',
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      linkUrl: '/imoveis/villa-oceanfront-trancoso',
      active: true,
      order: 1,
      tenantId: 'tatui',
    },
    {
      title: 'Inverno Aconchegante em Gramado',
      titleEn: 'Cozy Winter in Gramado',
      titleEs: 'Invierno Acogedor en Gramado',
      subtitle: 'Reserve sua estadia de chalé boutique com taxas reduzidas em até 20%',
      subtitleEn: 'Book your boutique chalet stay with rates reduced up to 20%',
      subtitleEs: 'Reserve su estancia en un chalet boutique con tarifas reducidas hasta un 20%',
      imageUrl: 'https://images.unsplash.com/photo-1585543805890-6051f7829f98?auto=format&fit=crop&w=1200&q=80',
      linkUrl: '/imoveis/chale-alpino-boutique',
      active: true,
      order: 2,
      tenantId: 'tatui',
    },
  ];

  for (const banner of bannersData) {
    await prisma.promoBanner.create({
      data: banner,
    });
  }

  // 8. Criar FAQs para Tatuí
  console.log('Criando FAQs...');
  const faqsData = [
    {
      question: 'Como faço para reservar um imóvel?',
      questionEn: 'How do I book a property?',
      questionEs: '¿Cómo reservo una propiedad?',
      answer: 'Basta clicar no botão "Reservar Agora" na página do imóvel desejado. Você será redirecionado para a plataforma externa correspondente ou para nosso WhatsApp.',
      answerEn: 'Just click the "Book Now" button on the desired property page. You will be redirected to the corresponding external booking platform or directly to our WhatsApp service.',
      answerEs: 'Simplemente haga clic en el botón "Reservar ahora" en la página de la propiedad deseada. Será redirigido a la plataforma externa correspondiente o directamente a nuestro WhatsApp.',
      active: true,
      order: 1,
      tenantId: 'tatui',
    },
    {
      question: 'Quais são as formas de pagamento aceitas?',
      questionEn: 'What payment methods are accepted?',
      questionEs: '¿Qué métodos de pago se aceptan?',
      answer: 'Aceitamos PIX, cartões de crédito (Visa, Mastercard, American Express) e pagamentos móveis como Apple Pay e Google Pay através de nossos parceiros.',
      answerEn: 'We accept PIX, credit cards (Visa, Mastercard, American Express), and mobile payments such as Apple Pay and Google Pay through our partners.',
      answerEs: 'Aceptamos PIX, tarjetas de crédito (Visa, Mastercard, American Express) y pagos móviles como Apple Pay y Google Pay a través de nuestros socios.',
      active: true,
      order: 2,
      tenantId: 'tatui',
    },
    {
      question: 'Posso levar animais de estimação?',
      questionEn: 'Can I bring pets?',
      questionEs: '¿Puedo llevar mascotas?',
      answer: 'Algumas de nossas propriedades são Pet Friendly. Verifique as comodidades e a descrição do imóvel desejado ou entre em contato para confirmar.',
      answerEn: 'Some of our properties are Pet Friendly. Please check the amenities and description of the desired property or contact us to confirm.',
      answerEs: 'Algunas de nuestras propiedades son Pet Friendly. Verifique los servicios y la descripción de la propiedad deseada o contáctenos para confirmar.',
      active: true,
      order: 3,
      tenantId: 'tatui',
    },
    {
      question: 'Como funciona o check-in e check-out?',
      questionEn: 'How do check-in and check-out work?',
      questionEs: '¿Cómo funciona el check-in y check-out?',
      answer: 'As instruções de acesso ao imóvel são enviadas por WhatsApp 48 horas antes da sua chegada. O check-in padrão é às 14h e o check-out às 11h.',
      answerEn: 'Property access instructions are sent via WhatsApp 48 hours before your arrival. Standard check-in is at 2:00 PM and check-out is at 11:00 AM.',
      answerEs: 'Las instrucciones de acceso a la propiedad se envían por WhatsApp 48 horas antes de su llegada. El check-in estándar es a las 14:00 y el check-out a las 11:00.',
      active: true,
      order: 4,
      tenantId: 'tatui',
    },
  ];

  for (const faq of faqsData) {
    await prisma.fAQ.create({
      data: faq,
    });
  }

  // 9. Criar Faturas Históricas (Billing History) para Tatuí e Boutique
  console.log('Criando faturas históricas...');
  const invoicesData = [
    // Tatuí
    {
      tenantId: 'tatui',
      amount: 500.00,
      status: 'PAID',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 10),
      paidAt: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 8),
      referenceMonth: `${String(new Date().getMonth() - 1).padStart(2, '0')}/${new Date().getFullYear()}`
    },
    {
      tenantId: 'tatui',
      amount: 500.00,
      status: 'PAID',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 10),
      paidAt: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 9),
      referenceMonth: `${String(new Date().getMonth()).padStart(2, '0')}/${new Date().getFullYear()}`
    },
    {
      tenantId: 'tatui',
      amount: 500.00,
      status: 'PAID',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 10),
      paidAt: new Date(new Date().getFullYear(), new Date().getMonth(), 10),
      referenceMonth: `${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`
    },
    {
      tenantId: 'tatui',
      amount: 500.00,
      status: 'PENDING',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 10),
      referenceMonth: `${String(new Date().getMonth() + 2).padStart(2, '0')}/${new Date().getFullYear()}`
    },
    // Boutique
    {
      tenantId: 'boutique',
      amount: 750.00,
      status: 'PAID',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 15),
      paidAt: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 14),
      referenceMonth: `${String(new Date().getMonth() - 1).padStart(2, '0')}/${new Date().getFullYear()}`
    },
    {
      tenantId: 'boutique',
      amount: 750.00,
      status: 'PAID',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 15),
      paidAt: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 15),
      referenceMonth: `${String(new Date().getMonth()).padStart(2, '0')}/${new Date().getFullYear()}`
    },
    {
      tenantId: 'boutique',
      amount: 750.00,
      status: 'PAID',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
      paidAt: new Date(new Date().getFullYear(), new Date().getMonth(), 12),
      referenceMonth: `${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`
    },
    {
      tenantId: 'boutique',
      amount: 750.00,
      status: 'PENDING',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 15),
      referenceMonth: `${String(new Date().getMonth() + 2).padStart(2, '0')}/${new Date().getFullYear()}`
    }
  ];

  for (const inv of invoicesData) {
    await prisma.invoice.create({
      data: inv,
    });
  }

  console.log('Seeding concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro durante o seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
